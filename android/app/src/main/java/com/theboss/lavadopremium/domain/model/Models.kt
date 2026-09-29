package com.theboss.lavadopremium.domain.model

enum class EstadoTurno(val label: String) {
    PENDIENTE("Pendiente"),
    CONFIRMADO("Confirmado"),
    EN_PROCESO("En proceso"),
    FINALIZADO("Finalizado"),
    CANCELADO("Cancelado");

    companion object {
        fun fromString(value: String): EstadoTurno {
            return entries.firstOrNull { it.label.equals(value, ignoreCase = true) } ?: PENDIENTE
        }
    }
}

enum class EstadoSolicitud(val label: String) {
    PENDIENTE("Pendiente"),
    APROBADA("Aprobada"),
    RECHAZADA("Rechazada"),
    REPROGRAMADA("Reprogramada");

    companion object {
        fun fromString(value: String): EstadoSolicitud {
            return entries.firstOrNull { it.label.equals(value, ignoreCase = true) } ?: PENDIENTE
        }
    }
}

enum class TipoVehiculo(val label: String, val defaultPrice: Double) {
    AUTO("Auto", 20000.0),
    SUV("Suv", 25000.0),
    CAMIONETA("Camioneta", 30000.0);

    companion object {
        fun fromString(value: String): TipoVehiculo {
            return entries.firstOrNull { it.label.equals(value, ignoreCase = true) } ?: AUTO
        }
    }
}

data class Turno(
    val id: String = "",
    val cliente: String = "",
    val telefono: String = "",
    val vehiculo: String = "",
    val tipoVehiculo: TipoVehiculo = TipoVehiculo.AUTO,
    val precio: Double = 20000.0,
    val patente: String = "",
    val servicio: String = "",
    val fecha: String = "", // Format: YYYY-MM-DD
    val hora: String = "",  // Format: HH:mm
    val observaciones: String = "",
    val estado: EstadoTurno = EstadoTurno.PENDIENTE,
    val updatedBy: String = ""
)

data class Solicitud(
    val id: String = "",
    val cliente: String = "",
    val telefono: String = "",
    val vehiculo: String = "",
    val tipoVehiculo: TipoVehiculo = TipoVehiculo.AUTO,
    val precio: Double = 20000.0,
    val patente: String = "",
    val servicio: String = "",
    val fecha: String = "",
    val hora: String = "",
    val observaciones: String = "",
    val estado: EstadoSolicitud = EstadoSolicitud.PENDIENTE,
    val sugerenciaHorario: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

data class Cliente(
    val id: String = "",
    val nombre: String = "",
    val telefono: String = "",
    val vehiculo: String = "",
    val patente: String = "",
    val visitasCount: Int = 1,
    val ultimaVisita: String = ""
)

data class Servicio(
    val id: String = "",
    val nombre: String = "",
    val precio: Double = 0.0,
    val duracion: String = ""
)

data class Actividad(
    val id: String = "",
    val usuario: String = "", // "Lucas" o "Franco"
    val accion: String = "",
    val timestamp: Long = System.currentTimeMillis()
)
