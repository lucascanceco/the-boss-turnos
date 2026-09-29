package com.theboss.lavadopremium.data.repository

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.theboss.lavadopremium.data.local.*
import com.theboss.lavadopremium.data.remote.FirebaseDataSource
import com.theboss.lavadopremium.domain.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class TheBossRepository(
    private val context: Context,
    private val database: TheBossDatabase,
    private val firebaseDataSource: FirebaseDataSource,
    private val userPrefs: UserPreferencesRepository
) {
    private val turnoDao = database.turnoDao()
    private val solicitudDao = database.solicitudDao()
    private val clienteDao = database.clienteDao()
    private val servicioDao = database.servicioDao()
    private val actividadDao = database.actividadDao()

    private val repositoryScope = CoroutineScope(Dispatchers.IO)

    init {
        // Authenticate anonymously and start remote realtime sync
        repositoryScope.launch {
            try {
                firebaseDataSource.ensureAnonymousAuth()
                syncFromRemote()
            } catch (e: Exception) {
                Log.e("TheBossRepository", "Init sync error", e)
            }
        }
    }

    // Local stream with Room offline support
    fun getTurnos(): Flow<List<Turno>> = turnoDao.getAllTurnos().map { entities ->
        entities.map { it.toDomain() }
    }

    fun getSolicitudes(): Flow<List<Solicitud>> = solicitudDao.getAllSolicitudes().map { entities ->
        entities.map { it.toDomain() }
    }

    fun getClientes(): Flow<List<Cliente>> = clienteDao.getAllClientes().map { entities ->
        entities.map { it.toDomain() }
    }

    fun getServicios(): Flow<List<Servicio>> = servicioDao.getAllServicios().map { entities ->
        entities.map { it.toDomain() }
    }

    fun getActividades(): Flow<List<Actividad>> = actividadDao.getRecentActividad().map { entities ->
        entities.map { it.toDomain() }
    }

    /**
     * Check if a time slot is already taken by another active turno.
     * Prevents duplicate bookings at the same date and time.
     */
    suspend fun isTimeSlotOccupied(fecha: String, hora: String, excludeTurnoId: String? = null): Boolean {
        return withContext(Dispatchers.IO) {
            val conflicting = turnoDao.getConflictingTurno(fecha, hora)
            conflicting != null && conflicting.id != excludeTurnoId
        }
    }

    /**
     * Save or update a Turno with offline-first Room persistence and Firebase sync
     */
    suspend fun saveTurno(turno: Turno): Result<Turno> = withContext(Dispatchers.IO) {
        // Collision validation check
        if (isTimeSlotOccupied(turno.fecha, turno.hora, turno.id)) {
            return@withContext Result.failure(
                IllegalStateException("Ya existe un turno agendado para el día ${turno.fecha} a las ${turno.hora}. Por favor elige otro horario.")
            )
        }

        val currentUser = userPrefs.getCurrentUser()
        val turnoId = if (turno.id.isNotBlank()) turno.id else "tur-${System.currentTimeMillis()}"
        val finalTurno = turno.copy(id = turnoId, updatedBy = currentUser)

        val isOnline = isNetworkAvailable()
        // Save to Room immediately
        turnoDao.insertTurno(TurnoEntity.fromDomain(finalTurno, isSynced = isOnline))

        // Log audit activity
        val actionText = if (turno.id.isBlank()) {
            "$currentUser creó un nuevo turno para ${finalTurno.cliente} (${finalTurno.vehiculo})"
        } else {
            "$currentUser actualizó turno de ${finalTurno.cliente} a estado '${finalTurno.estado.label}'"
        }
        val actividad = Actividad(
            id = "act-${System.currentTimeMillis()}",
            usuario = currentUser,
            accion = actionText,
            timestamp = System.currentTimeMillis()
        )
        actividadDao.insertActividad(ActividadEntity.fromDomain(actividad))

        // Sync with Firebase & fire FCM push to other operator if connected
        if (isOnline) {
            try {
                firebaseDataSource.saveTurno(finalTurno)
                firebaseDataSource.logActividad(actividad)

                // Trigger push notification to other user
                val otherUser = userPrefs.getOtherUser()
                firebaseDataSource.sendCrossNotificationSignal(
                    sender = currentUser,
                    recipient = otherUser,
                    actionTitle = "Turno: ${finalTurno.cliente}",
                    detail = "$currentUser: ${finalTurno.servicio} agendado para ${finalTurno.fecha} ${finalTurno.hora}"
                )
            } catch (e: Exception) {
                Log.e("TheBossRepository", "Firebase sync delayed", e)
            }
        }

        Result.success(finalTurno)
    }

    /**
     * Approve incoming Solicitud and automatically promote it to a Turno
     */
    suspend fun aprobarSolicitud(solicitud: Solicitud): Result<Turno> = withContext(Dispatchers.IO) {
        val currentUser = userPrefs.getCurrentUser()

        // Verify collision before approving
        if (isTimeSlotOccupied(solicitud.fecha, solicitud.hora)) {
            return@withContext Result.failure(
                IllegalStateException("No se puede aprobar directamente: el horario ${solicitud.fecha} ${solicitud.hora} ya está ocupado. Utiliza la opción 'Reprogramar'.")
            )
        }

        // 1. Update Solicitud status
        val updatedSol = solicitud.copy(estado = EstadoSolicitud.APROBADA)
        solicitudDao.updateSolicitud(SolicitudEntity.fromDomain(updatedSol))

        // 2. Create corresponding Turno
        val nuevoTurno = Turno(
            id = "tur-${System.currentTimeMillis()}",
            cliente = solicitud.cliente,
            telefono = solicitud.telefono,
            vehiculo = solicitud.vehiculo,
            patente = solicitud.patente,
            servicio = solicitud.servicio,
            fecha = solicitud.fecha,
            hora = solicitud.hora,
            observaciones = solicitud.observaciones,
            estado = EstadoTurno.CONFIRMADO,
            updatedBy = currentUser
        )
        turnoDao.insertTurno(TurnoEntity.fromDomain(nuevoTurno))

        // 3. Activity log
        val actividad = Actividad(
            id = "act-${System.currentTimeMillis()}",
            usuario = currentUser,
            accion = "$currentUser aprobó la solicitud de ${solicitud.cliente} (${solicitud.vehiculo})",
            timestamp = System.currentTimeMillis()
        )
        actividadDao.insertActividad(ActividadEntity.fromDomain(actividad))

        // 4. Firebase sync
        if (isNetworkAvailable()) {
            try {
                firebaseDataSource.updateSolicitud(updatedSol)
                firebaseDataSource.saveTurno(nuevoTurno)
                firebaseDataSource.logActividad(actividad)

                firebaseDataSource.sendCrossNotificationSignal(
                    sender = currentUser,
                    recipient = userPrefs.getOtherUser(),
                    actionTitle = "Solicitud Aprobada",
                    detail = "$currentUser aprobó el turno de ${solicitud.cliente} (${solicitud.servicio})"
                )
            } catch (e: Exception) {
                Log.e("TheBossRepository", "Remote sync error on approve", e)
            }
        }

        Result.success(nuevoTurno)
    }

    /**
     * Reject incoming Solicitud
     */
    suspend fun rechazarSolicitud(solicitud: Solicitud) = withContext(Dispatchers.IO) {
        val currentUser = userPrefs.getCurrentUser()
        val updated = solicitud.copy(estado = EstadoSolicitud.RECHAZADA)
        solicitudDao.updateSolicitud(SolicitudEntity.fromDomain(updated))

        val actividad = Actividad(
            id = "act-${System.currentTimeMillis()}",
            usuario = currentUser,
            accion = "$currentUser rechazó la solicitud de ${solicitud.cliente}",
            timestamp = System.currentTimeMillis()
        )
        actividadDao.insertActividad(ActividadEntity.fromDomain(actividad))

        if (isNetworkAvailable()) {
            firebaseDataSource.updateSolicitud(updated)
            firebaseDataSource.logActividad(actividad)
        }
    }

    /**
     * Reschedule incoming Solicitud with suggested alternative time
     */
    suspend fun reprogramarSolicitud(solicitud: Solicitud, nuevoHorarioSugerido: String) = withContext(Dispatchers.IO) {
        val currentUser = userPrefs.getCurrentUser()
        val updated = solicitud.copy(
            estado = EstadoSolicitud.REPROGRAMADA,
            sugerenciaHorario = nuevoHorarioSugerido
        )
        solicitudDao.updateSolicitud(SolicitudEntity.fromDomain(updated))

        val actividad = Actividad(
            id = "act-${System.currentTimeMillis()}",
            usuario = currentUser,
            accion = "$currentUser sugirió reprogramar a $nuevoHorarioSugerido para ${solicitud.cliente}",
            timestamp = System.currentTimeMillis()
        )
        actividadDao.insertActividad(ActividadEntity.fromDomain(actividad))

        if (isNetworkAvailable()) {
            firebaseDataSource.updateSolicitud(updated)
            firebaseDataSource.logActividad(actividad)
        }
    }

    /**
     * Start background listening from Firebase Realtime Database
     */
    private fun syncFromRemote() {
        repositoryScope.launch {
            firebaseDataSource.streamTurnos().collect { remoteTurnos ->
                val entities = remoteTurnos.map { TurnoEntity.fromDomain(it, isSynced = true) }
                turnoDao.insertAll(entities)
            }
        }

        repositoryScope.launch {
            firebaseDataSource.streamSolicitudes().collect { remoteSolicitudes ->
                val entities = remoteSolicitudes.map { SolicitudEntity.fromDomain(it, isSynced = true) }
                solicitudDao.insertAll(entities)
            }
        }
    }

    /**
     * Push any offline unsynced local Room items up to Firebase
     */
    suspend fun syncPendingLocalChanges() = withContext(Dispatchers.IO) {
        if (!isNetworkAvailable()) return@withContext

        val unsynced = turnoDao.getUnsyncedTurnos()
        for (item in unsynced) {
            try {
                firebaseDataSource.saveTurno(item.toDomain())
                turnoDao.updateTurno(item.copy(isSynced = true))
            } catch (e: Exception) {
                Log.e("TheBossRepository", "Error syncing local item ${item.id}", e)
            }
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val activeNetwork = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
