package com.theboss.lavadopremium.data.remote

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*
import com.theboss.lavadopremium.domain.model.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FirebaseDataSource {
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
    private val database: FirebaseDatabase = FirebaseDatabase.getInstance(
    "https://theboss-96244-default-rtdb.firebaseio.com/"
)
    private val turnosRef: DatabaseReference = database.getReference("turnos")
    private val solicitudesRef: DatabaseReference = database.getReference("solicitudes")
    private val clientesRef: DatabaseReference = database.getReference("clientes")
    private val serviciosRef: DatabaseReference = database.getReference("servicios")
    private val actividadRef: DatabaseReference = database.getReference("actividad")
    private val notificationsRef: DatabaseReference = database.getReference("notifications_signals")

    init {
        // Enable offline disk persistence on Firebase RTDB
        try {
           // database.setPersistenceEnabled(true)
        } catch (e: Exception) {
            Log.d("FirebaseDataSource", "Persistence already initialized: ${e.message}")
        }
    }

    suspend fun ensureAnonymousAuth() {
        if (auth.currentUser == null) {
            try {
                auth.signInAnonymously().await()
                Log.d("FirebaseDataSource", "Signed in anonymously: ${auth.currentUser?.uid}")
            } catch (e: Exception) {
                Log.e("FirebaseDataSource", "Error in anonymous auth", e)
            }
        }
    }

    // Realtime stream of Turnos from Firebase
    fun streamTurnos(): Flow<List<Turno>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<Turno>()
                for (child in snapshot.children) {
                    val id = child.key ?: ""
                    val map = child.value as? Map<*, *> ?: continue
                    list.add(
                        Turno(
                            id = id,
                            cliente = map["cliente"]?.toString() ?: "",
                            telefono = map["telefono"]?.toString() ?: "",
                            vehiculo = map["vehiculo"]?.toString() ?: "",
                            patente = map["patente"]?.toString() ?: "",
                            servicio = map["servicio"]?.toString() ?: "",
                            fecha = map["fecha"]?.toString() ?: "",
                            hora = map["hora"]?.toString() ?: "",
                            observaciones = map["observaciones"]?.toString() ?: "",
                            estado = EstadoTurno.fromString(map["estado"]?.toString() ?: "Pendiente"),
                            updatedBy = map["updatedBy"]?.toString() ?: ""
                        )
                    )
                }
                trySend(list)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        turnosRef.addValueEventListener(listener)
        awaitClose { turnosRef.removeEventListener(listener) }
    }

    // Realtime stream of Solicitudes
    fun streamSolicitudes(): Flow<List<Solicitud>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<Solicitud>()
                for (child in snapshot.children) {
                    val id = child.key ?: ""
                    val map = child.value as? Map<*, *> ?: continue
                    list.add(
                        Solicitud(
                            id = id,
                            cliente = map["cliente"]?.toString() ?: "",
                            telefono = map["telefono"]?.toString() ?: "",
                            vehiculo = map["vehiculo"]?.toString() ?: "",
                            patente = map["patente"]?.toString() ?: "",
                            servicio = map["servicio"]?.toString() ?: "",
                            fecha = map["fecha"]?.toString() ?: "",
                            hora = map["hora"]?.toString() ?: "",
                            observaciones = map["observaciones"]?.toString() ?: "",
                            estado = EstadoSolicitud.fromString(map["estado"]?.toString() ?: "Pendiente"),
                            sugerenciaHorario = map["sugerenciaHorario"]?.toString() ?: "",
                            createdAt = (map["createdAt"] as? Long) ?: System.currentTimeMillis()
                        )
                    )
                }
                trySend(list)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        solicitudesRef.addValueEventListener(listener)
        awaitClose { solicitudesRef.removeEventListener(listener) }
    }

    // Write Turno
    suspend fun saveTurno(turno: Turno) {
        val id = if (turno.id.isNotBlank()) turno.id else turnosRef.push().key ?: System.currentTimeMillis().toString()
        val turnoMap = mapOf(
            "id" to id,
            "cliente" to turno.cliente,
            "telefono" to turno.telefono,
            "vehiculo" to turno.vehiculo,
            "patente" to turno.patente,
            "servicio" to turno.servicio,
            "fecha" to turno.fecha,
            "hora" to turno.hora,
            "observaciones" to turno.observaciones,
            "estado" to turno.estado.label,
            "updatedBy" to turno.updatedBy
        )
        turnosRef.child(id).setValue(turnoMap).await()
    }

    // Update Solicitud
    suspend fun updateSolicitud(solicitud: Solicitud) {
        val map = mapOf(
            "id" to solicitud.id,
            "cliente" to solicitud.cliente,
            "telefono" to solicitud.telefono,
            "vehiculo" to solicitud.vehiculo,
            "patente" to solicitud.patente,
            "servicio" to solicitud.servicio,
            "fecha" to solicitud.fecha,
            "hora" to solicitud.hora,
            "observaciones" to solicitud.observaciones,
            "estado" to solicitud.estado.label,
            "sugerenciaHorario" to solicitud.sugerenciaHorario,
            "createdAt" to solicitud.createdAt
        )
        solicitudesRef.child(solicitud.id).setValue(map).await()
    }

    // Register Activity log
    suspend fun logActividad(actividad: Actividad) {
        val id = actividadRef.push().key ?: System.currentTimeMillis().toString()
        val map = mapOf(
            "id" to id,
            "usuario" to actividad.usuario,
            "accion" to actividad.accion,
            "timestamp" to actividad.timestamp
        )
        actividadRef.child(id).setValue(map).await()
    }

    // Send Cross-User Push Signal (Lucas -> Franco, Franco -> Lucas)
    suspend fun sendCrossNotificationSignal(sender: String, recipient: String, actionTitle: String, detail: String) {
        val signalRef = notificationsRef.push()
        val data = mapOf(
            "sender" to sender,
            "recipient" to recipient,
            "title" to actionTitle,
            "body" to detail,
            "timestamp" to System.currentTimeMillis(),
            "delivered" to false
        )
        signalRef.setValue(data).await()
    }
}
