package com.theboss.lavadopremium.data.local

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TurnoDao {
    @Query("SELECT * FROM turnos ORDER BY fecha ASC, hora ASC")
    fun getAllTurnos(): Flow<List<TurnoEntity>>

    @Query("SELECT * FROM turnos WHERE fecha = :fecha AND estado != 'Cancelado' ORDER BY hora ASC")
    fun getTurnosByFecha(fecha: String): Flow<List<TurnoEntity>>

    @Query("SELECT * FROM turnos WHERE fecha = :fecha AND hora = :hora AND estado != 'Cancelado' LIMIT 1")
    suspend fun getConflictingTurno(fecha: String, hora: String): TurnoEntity?

    @Query("SELECT * FROM turnos WHERE id = :id LIMIT 1")
    suspend fun getTurnoById(id: String): TurnoEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTurno(turno: TurnoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(turnos: List<TurnoEntity>)

    @Update
    suspend fun updateTurno(turno: TurnoEntity)

    @Delete
    suspend fun deleteTurno(turno: TurnoEntity)

    @Query("SELECT * FROM turnos WHERE isSynced = 0")
    suspend fun getUnsyncedTurnos(): List<TurnoEntity>
}

@Dao
interface SolicitudDao {
    @Query("SELECT * FROM solicitudes ORDER BY createdAt DESC")
    fun getAllSolicitudes(): Flow<List<SolicitudEntity>>

    @Query("SELECT * FROM solicitudes WHERE estado = 'Pendiente' ORDER BY createdAt DESC")
    fun getPendingSolicitudes(): Flow<List<SolicitudEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSolicitud(solicitud: SolicitudEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(solicitudes: List<SolicitudEntity>)

    @Update
    suspend fun updateSolicitud(solicitud: SolicitudEntity)

    @Delete
    suspend fun deleteSolicitud(solicitud: SolicitudEntity)
}

@Dao
interface ClienteDao {
    @Query("SELECT * FROM clientes ORDER BY visitasCount DESC, nombre ASC")
    fun getAllClientes(): Flow<List<ClienteEntity>>

    @Query("SELECT * FROM clientes WHERE patente = :patente LIMIT 1")
    suspend fun getClienteByPatente(patente: String): ClienteEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCliente(cliente: ClienteEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(clientes: List<ClienteEntity>)
}

@Dao
interface ServicioDao {
    @Query("SELECT * FROM servicios ORDER BY precio ASC")
    fun getAllServicios(): Flow<List<ServicioEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertServicio(servicio: ServicioEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(servicios: List<ServicioEntity>)
}

@Dao
interface ActividadDao {
    @Query("SELECT * FROM actividad ORDER BY timestamp DESC LIMIT 50")
    fun getRecentActividad(): Flow<List<ActividadEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertActividad(actividad: ActividadEntity)
}

@Database(
    entities = [
        TurnoEntity::class,
        SolicitudEntity::class,
        ClienteEntity::class,
        ServicioEntity::class,
        ActividadEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class TheBossDatabase : RoomDatabase() {
    abstract fun turnoDao(): TurnoDao
    abstract fun solicitudDao(): SolicitudDao
    abstract fun clienteDao(): ClienteDao
    abstract fun servicioDao(): ServicioDao
    abstract fun actividadDao(): ActividadDao

    companion object {
        @Volatile
        private var INSTANCE: TheBossDatabase? = null

        fun getDatabase(context: Context): TheBossDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TheBossDatabase::class.java,
                    "the_boss_detailing.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
