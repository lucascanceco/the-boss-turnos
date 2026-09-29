package com.theboss.lavadopremium.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.theboss.lavadopremium.domain.model.*

@Entity(tableName = "turnos")
data class TurnoEntity(
    @PrimaryKey val id: String,
    val cliente: String,
    val telefono: String,
    val vehiculo: String,
    val patente: String,
    val servicio: String,
    val fecha: String,
    val hora: String,
    val observaciones: String,
    val estado: String,
    val updatedBy: String,
    val isSynced: Boolean = true
) {
    fun toDomain(): Turno = Turno(
        id = id,
        cliente = cliente,
        telefono = telefono,
        vehiculo = vehiculo,
        patente = patente,
        servicio = servicio,
        fecha = fecha,
        hora = hora,
        observaciones = observaciones,
        estado = EstadoTurno.fromString(estado),
        updatedBy = updatedBy
    )

    companion object {
        fun fromDomain(turno: Turno, isSynced: Boolean = true): TurnoEntity = TurnoEntity(
            id = turno.id,
            cliente = turno.cliente,
            telefono = turno.telefono,
            vehiculo = turno.vehiculo,
            patente = turno.patente,
            servicio = turno.servicio,
            fecha = turno.fecha,
            hora = turno.hora,
            observaciones = turno.observaciones,
            estado = turno.estado.label,
            updatedBy = turno.updatedBy,
            isSynced = isSynced
        )
    }
}

@Entity(tableName = "solicitudes")
data class SolicitudEntity(
    @PrimaryKey val id: String,
    val cliente: String,
    val telefono: String,
    val vehiculo: String,
    val patente: String,
    val servicio: String,
    val fecha: String,
    val hora: String,
    val observaciones: String,
    val estado: String,
    val sugerenciaHorario: String,
    val createdAt: Long,
    val isSynced: Boolean = true
) {
    fun toDomain(): Solicitud = Solicitud(
        id = id,
        cliente = cliente,
        telefono = telefono,
        vehiculo = vehiculo,
        patente = patente,
        servicio = servicio,
        fecha = fecha,
        hora = hora,
        observaciones = observaciones,
        estado = EstadoSolicitud.fromString(estado),
        sugerenciaHorario = sugerenciaHorario,
        createdAt = createdAt
    )

    companion object {
        fun fromDomain(solicitud: Solicitud, isSynced: Boolean = true): SolicitudEntity = SolicitudEntity(
            id = solicitud.id,
            cliente = solicitud.cliente,
            telefono = solicitud.telefono,
            vehiculo = solicitud.vehiculo,
            patente = solicitud.patente,
            servicio = solicitud.servicio,
            fecha = solicitud.fecha,
            hora = solicitud.hora,
            observaciones = solicitud.observaciones,
            estado = solicitud.estado.label,
            sugerenciaHorario = solicitud.sugerenciaHorario,
            createdAt = solicitud.createdAt,
            isSynced = isSynced
        )
    }
}

@Entity(tableName = "clientes")
data class ClienteEntity(
    @PrimaryKey val id: String,
    val nombre: String,
    val telefono: String,
    val vehiculo: String,
    val patente: String,
    val visitasCount: Int,
    val ultimaVisita: String
) {
    fun toDomain(): Cliente = Cliente(
        id = id,
        nombre = nombre,
        telefono = telefono,
        vehiculo = vehiculo,
        patente = patente,
        visitasCount = visitasCount,
        ultimaVisita = ultimaVisita
    )

    companion object {
        fun fromDomain(c: Cliente): ClienteEntity = ClienteEntity(
            id = c.id,
            nombre = c.nombre,
            telefono = c.telefono,
            vehiculo = c.vehiculo,
            patente = c.patente,
            visitasCount = c.visitasCount,
            ultimaVisita = c.ultimaVisita
        )
    }
}

@Entity(tableName = "servicios")
data class ServicioEntity(
    @PrimaryKey val id: String,
    val nombre: String,
    val precio: Double,
    val duracion: String
) {
    fun toDomain(): Servicio = Servicio(
        id = id,
        nombre = nombre,
        precio = precio,
        duracion = duracion
    )

    companion object {
        fun fromDomain(s: Servicio): ServicioEntity = ServicioEntity(
            id = s.id,
            nombre = s.nombre,
            precio = s.precio,
            duracion = s.duracion
        )
    }
}

@Entity(tableName = "actividad")
data class ActividadEntity(
    @PrimaryKey val id: String,
    val usuario: String,
    val accion: String,
    val timestamp: Long
) {
    fun toDomain(): Actividad = Actividad(
        id = id,
        usuario = usuario,
        accion = accion,
        timestamp = timestamp
    )

    companion object {
        fun fromDomain(a: Actividad): ActividadEntity = ActividadEntity(
            id = a.id,
            usuario = a.usuario,
            accion = a.accion,
            timestamp = a.timestamp
        )
    }
}
