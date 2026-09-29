package com.theboss.lavadopremium.ui.viewmodels

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.theboss.lavadopremium.data.local.UserPreferencesRepository
import com.theboss.lavadopremium.data.repository.TheBossRepository
import com.theboss.lavadopremium.domain.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.*

data class DashboardMetrics(
    val turnosHoyCount: Int = 0,
    val solicitudesPendientesCount: Int = 0,
    val enProcesoCount: Int = 0,
    val finalizadosCount: Int = 0
)

class MainViewModel(
    private val repository: TheBossRepository,
    private val userPrefs: UserPreferencesRepository
) : ViewModel() {

    val currentUser: StateFlow<String> = userPrefs.currentUser

    val turnos: StateFlow<List<Turno>> = repository.getTurnos()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val solicitudes: StateFlow<List<Solicitud>> = repository.getSolicitudes()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val clientes: StateFlow<List<Cliente>> = repository.getClientes()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val servicios: StateFlow<List<Servicio>> = repository.getServicios()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val actividades: StateFlow<List<Actividad>> = repository.getActividades()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // UI Message Channel for Error & Success feedback
    private val _uiEvent = MutableSharedFlow<String>()
    val uiEvent = _uiEvent.asSharedFlow()

    // Calculated Dashboard Metrics
    val dashboardMetrics: StateFlow<DashboardMetrics> = combine(turnos, solicitudes) { turnosList, solList ->
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        DashboardMetrics(
            turnosHoyCount = turnosList.count { it.fecha == todayStr && it.estado != EstadoTurno.CANCELADO },
            solicitudesPendientesCount = solList.count { it.estado == EstadoSolicitud.PENDIENTE },
            enProcesoCount = turnosList.count { it.estado == EstadoTurno.EN_PROCESO },
            finalizadosCount = turnosList.count { it.estado == EstadoTurno.FINALIZADO && it.fecha == todayStr }
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DashboardMetrics())

    fun selectUser(user: String) {
        userPrefs.saveUser(user)
    }

    fun isUserSelected(): Boolean = userPrefs.isUserConfigured()

    /**
     * Save/Create/Update Turno with collision check
     */
    fun saveTurno(turno: Turno, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            val result = repository.saveTurno(turno)
            result.onSuccess {
                _uiEvent.emit("Turno guardado exitosamente para ${turno.cliente}")
                onSuccess()
            }.onFailure { ex ->
                _uiEvent.emit(ex.message ?: "Error al guardar turno")
            }
        }
    }

    /**
     * Update Turno Status (e.g. En proceso, Finalizado)
     */
    fun updateTurnoEstado(turno: Turno, nuevoEstado: EstadoTurno) {
        viewModelScope.launch {
            repository.saveTurno(turno.copy(estado = nuevoEstado))
        }
    }

    /**
     * Approve incoming Solicitud and move it into Turnos
     */
    fun aprobarSolicitud(solicitud: Solicitud) {
        viewModelScope.launch {
            val result = repository.aprobarSolicitud(solicitud)
            result.onSuccess {
                _uiEvent.emit("Solicitud aprobada e incorporada a Turnos")
            }.onFailure { ex ->
                _uiEvent.emit(ex.message ?: "No se pudo aprobar la solicitud")
            }
        }
    }

    /**
     * Reject Solicitud
     */
    fun rechazarSolicitud(solicitud: Solicitud) {
        viewModelScope.launch {
            repository.rechazarSolicitud(solicitud)
            _uiEvent.emit("Solicitud de ${solicitud.cliente} rechazada")
        }
    }

    /**
     * Reschedule Solicitud with suggested alternative time
     */
    fun reprogramarSolicitud(solicitud: Solicitud, horarioSugerido: String) {
        viewModelScope.launch {
            repository.reprogramarSolicitud(solicitud, horarioSugerido)
            _uiEvent.emit("Horario alternativo ($horarioSugerido) enviado a ${solicitud.cliente}")
        }
    }

    /**
     * Enviar por WhatsApp con el mensaje estructurado requerido:
     * "Hola [Cliente]. Tu turno en THE BOSS Lavado Premium fue confirmado para el día [Fecha] a las [Hora]. Servicio: [Servicio]. Muchas gracias."
     */
    fun sendWhatsAppConfirmation(context: Context, turno: Turno) {
        try {
            val rawMessage = "Hola ${turno.cliente}. Tu turno en THE BOSS Lavado Premium fue confirmado para el día ${turno.fecha} a las ${turno.hora}. Servicio: ${turno.servicio}. Muchas gracias."
            val encodedMessage = URLEncoder.encode(rawMessage, "UTF-8")

            // Format phone number (remove spaces, symbols)
            val cleanPhone = turno.telefono.replace("[^0-9+]".toRegex(), "")
            val uri = Uri.parse("https://api.whatsapp.com/send?phone=$cleanPhone&text=$encodedMessage")

            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "No se pudo abrir WhatsApp: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    class Factory(
        private val repository: TheBossRepository,
        private val userPrefs: UserPreferencesRepository
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return MainViewModel(repository, userPrefs) as T
        }
    }
}
