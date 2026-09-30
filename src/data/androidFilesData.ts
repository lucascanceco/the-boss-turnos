export interface CodeFileRecord {
  path: string;
  name: string;
  category: 'ui' | 'data' | 'domain' | 'config' | 'service';
  language: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: CodeFileRecord[] = [
  {
    path: "android/app/src/main/java/com/theboss/lavadopremium/MainActivity.kt",
    name: "MainActivity.kt",
    category: "ui",
    language: "kotlin",
    description: "Activity principal con Scaffold Material 3, NavigationBar y diálogo de inicio",
    content: `package com.theboss.lavadopremium

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.theboss.lavadopremium.domain.model.EstadoSolicitud
import com.theboss.lavadopremium.ui.components.UserSelectionDialog
import com.theboss.lavadopremium.ui.screens.*
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel
import kotlinx.coroutines.flow.collectLatest

enum class Screen(val title: String, val icon: ImageVector) {
    DASHBOARD("Inicio", Icons.Default.Home),
    TURNOS("Turnos", Icons.Default.CalendarMonth),
    SOLICITUDES("Solicitudes", Icons.Default.Inbox),
    CATALOGO("Catálogo", Icons.Default.Category),
    METRICAS("Métricas", Icons.Default.Analytics)
}

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        val app = application as TheBossApplication
        MainViewModel.Factory(app.repository, app.userPreferences)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            TheBossTheme {
                val snackbarHostState = remember { SnackbarHostState() }
                val currentUser by viewModel.currentUser.collectAsState()
                val solicitudes by viewModel.solicitudes.collectAsState()
                val pendingRequestsCount = solicitudes.count { it.estado == EstadoSolicitud.PENDIENTE }

                var currentScreen by remember { mutableStateOf(Screen.DASHBOARD) }
                var triggerCreateTurnoDialog by remember { mutableStateOf(false) }

                LaunchedEffect(Unit) {
                    viewModel.uiEvent.collectLatest { message ->
                        snackbarHostState.showSnackbar(message)
                    }
                }

                // Diálogo Inicial: "¿Quién está utilizando este dispositivo?" (Lucas o Franco)
                if (currentUser.isBlank()) {
                    UserSelectionDialog(
                        onSelectUser = { chosenUser ->
                            viewModel.selectUser(chosenUser)
                        }
                    )
                } else {
                    Scaffold(
                        snackbarHost = { SnackbarHost(snackbarHostState) },
                        bottomBar = {
                            NavigationBar(
                                containerColor = BossSurfaceDarker,
                                contentColor = BossWhite
                            ) {
                                Screen.entries.forEach { screen ->
                                    val isSelected = currentScreen == screen
                                    NavigationBarItem(
                                        selected = isSelected,
                                        onClick = { currentScreen = screen },
                                        icon = {
                                            if (screen == Screen.SOLICITUDES && pendingRequestsCount > 0) {
                                                BadgedBox(
                                                    badge = {
                                                        Badge(
                                                            containerColor = BossYellow,
                                                            contentColor = BossBlack
                                                        ) {
                                                            Text("$pendingRequestsCount")
                                                        }
                                                    }
                                                ) {
                                                    Icon(screen.icon, contentDescription = screen.title)
                                                }
                                            } else {
                                                Icon(screen.icon, contentDescription = screen.title)
                                            }
                                        },
                                        label = { Text(screen.title) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = BossBlack,
                                            selectedTextColor = BossYellow,
                                            indicatorColor = BossYellow,
                                            unselectedIconColor = BossTextMuted,
                                            unselectedTextColor = BossTextMuted
                                        )
                                    )
                                }
                            }
                        },
                        floatingActionButton = {
                            if (currentScreen == Screen.TURNOS || currentScreen == Screen.DASHBOARD) {
                                FloatingActionButton(
                                    onClick = {
                                        if (currentScreen != Screen.TURNOS) {
                                            currentScreen = Screen.TURNOS
                                        }
                                        triggerCreateTurnoDialog = true
                                    },
                                    containerColor = BossYellow,
                                    contentColor = BossBlack
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Nuevo Turno")
                                }
                            }
                        }
                    ) { innerPadding ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(BossBlack)
                                .padding(innerPadding)
                        ) {
                            when (currentScreen) {
                                Screen.DASHBOARD -> DashboardScreen(
                                    viewModel = viewModel,
                                    onNavigateToTurnos = { currentScreen = Screen.TURNOS },
                                    onNavigateToSolicitudes = { currentScreen = Screen.SOLICITUDES },
                                    onNavigateToClientes = { currentScreen = Screen.CATALOGO },
                                    onNavigateToEstadisticas = { currentScreen = Screen.METRICAS },
                                    onOpenCreateTurno = {
                                        currentScreen = Screen.TURNOS
                                        triggerCreateTurnoDialog = true
                                    }
                                )
                                Screen.TURNOS -> TurnosScreen(
                                    viewModel = viewModel,
                                    initialCreateDialogOpen = triggerCreateTurnoDialog,
                                    onDialogClosed = { triggerCreateTurnoDialog = false }
                                )
                                Screen.SOLICITUDES -> SolicitudesScreen(viewModel = viewModel)
                                Screen.CATALOGO -> ClientesServiciosScreen(viewModel = viewModel)
                                Screen.METRICAS -> EstadisticasActividadScreen(viewModel = viewModel)
                            }
                        }
                    }
                }
            }
        }
    }
}`
  },
  {
    path: "android/app/src/main/java/com/theboss/lavadopremium/data/repository/TheBossRepository.kt",
    name: "TheBossRepository.kt",
    category: "data",
    language: "kotlin",
    description: "Repositorio Clean Architecture con sincronización Room (offline) y Firebase RTDB",
    content: `package com.theboss.lavadopremium.data.repository

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
        repositoryScope.launch {
            try {
                firebaseDataSource.ensureAnonymousAuth()
                syncFromRemote()
            } catch (e: Exception) {
                Log.e("TheBossRepository", "Init sync error", e)
            }
        }
    }

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
     * Valida que no exista colisión de reservas en la misma fecha y hora
     */
    suspend fun isTimeSlotOccupied(fecha: String, hora: String, excludeTurnoId: String? = null): Boolean {
        return withContext(Dispatchers.IO) {
            val conflicting = turnoDao.getConflictingTurno(fecha, hora)
            conflicting != null && conflicting.id != excludeTurnoId
        }
    }

    /**
     * Guarda turno en Room local e impacta en Firebase RTDB con señal push a Franco/Lucas
     */
    suspend fun saveTurno(turno: Turno): Result<Turno> = withContext(Dispatchers.IO) {
        if (isTimeSlotOccupied(turno.fecha, turno.hora, turno.id)) {
            return@withContext Result.failure(
                IllegalStateException("Ya existe un turno agendado para el día \${turno.fecha} a las \${turno.hora}. Por favor elige otro horario.")
            )
        }

        val currentUser = userPrefs.getCurrentUser()
        val turnoId = if (turno.id.isNotBlank()) turno.id else "tur-\${System.currentTimeMillis()}"
        val finalTurno = turno.copy(id = turnoId, updatedBy = currentUser)

        val isOnline = isNetworkAvailable()
        turnoDao.insertTurno(TurnoEntity.fromDomain(finalTurno, isSynced = isOnline))

        val actionText = if (turno.id.isBlank()) {
            "$currentUser creó un nuevo turno para \${finalTurno.cliente} (\${finalTurno.vehiculo})"
        } else {
            "$currentUser actualizó turno de \${finalTurno.cliente} a estado '\${finalTurno.estado.label}'"
        }
        val actividad = Actividad(
            id = "act-\${System.currentTimeMillis()}",
            usuario = currentUser,
            accion = actionText,
            timestamp = System.currentTimeMillis()
        )
        actividadDao.insertActividad(ActividadEntity.fromDomain(actividad))

        if (isOnline) {
            try {
                firebaseDataSource.saveTurno(finalTurno)
                firebaseDataSource.logActividad(actividad)

                val otherUser = userPrefs.getOtherUser()
                firebaseDataSource.sendCrossNotificationSignal(
                    sender = currentUser,
                    recipient = otherUser,
                    actionTitle = "Turno: \${finalTurno.cliente}",
                    detail = "$currentUser: \${finalTurno.servicio} agendado para \${finalTurno.fecha} \${finalTurno.hora}"
                )
            } catch (e: Exception) {
                Log.e("TheBossRepository", "Firebase sync delayed", e)
            }
        }

        Result.success(finalTurno)
    }

    suspend fun aprobarSolicitud(solicitud: Solicitud): Result<Turno> = withContext(Dispatchers.IO) {
        val currentUser = userPrefs.getCurrentUser()

        if (isTimeSlotOccupied(solicitud.fecha, solicitud.hora)) {
            return@withContext Result.failure(
                IllegalStateException("No se puede aprobar directamente: el horario \${solicitud.fecha} \${solicitud.hora} ya está ocupado. Utiliza la opción 'Reprogramar'.")
            )
        }

        val updatedSol = solicitud.copy(estado = EstadoSolicitud.APROBADA)
        solicitudDao.updateSolicitud(SolicitudEntity.fromDomain(updatedSol))

        val nuevoTurno = Turno(
            id = "tur-\${System.currentTimeMillis()}",
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

        val actividad = Actividad(
            id = "act-\${System.currentTimeMillis()}",
            usuario = currentUser,
            accion = "$currentUser aprobó la solicitud de \${solicitud.cliente} (\${solicitud.vehiculo})",
            timestamp = System.currentTimeMillis()
        )
        actividadDao.insertActividad(ActividadEntity.fromDomain(actividad))

        if (isNetworkAvailable()) {
            firebaseDataSource.updateSolicitud(updatedSol)
            firebaseDataSource.saveTurno(nuevoTurno)
            firebaseDataSource.logActividad(actividad)

            firebaseDataSource.sendCrossNotificationSignal(
                sender = currentUser,
                recipient = userPrefs.getOtherUser(),
                actionTitle = "Solicitud Aprobada",
                detail = "$currentUser aprobó el turno de \${solicitud.cliente} (\${solicitud.servicio})"
            )
        }

        Result.success(nuevoTurno)
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val activeNetwork = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}`
  },
  {
    path: "android/app/src/main/java/com/theboss/lavadopremium/ui/screens/TurnosScreen.kt",
    name: "TurnosScreen.kt",
    category: "ui",
    language: "kotlin",
    description: "Pantalla de Turnos con filtro por estados, validación de bloqueo de horario y botón WhatsApp",
    content: `package com.theboss.lavadopremium.ui.screens

import android.content.Context
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.theboss.lavadopremium.domain.model.EstadoTurno
import com.theboss.lavadopremium.domain.model.Turno
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel

@Composable
fun TurnosScreen(
    viewModel: MainViewModel,
    initialCreateDialogOpen: Boolean = false,
    onDialogClosed: () -> Unit = {}
) {
    val context = LocalContext.current
    val turnos by viewModel.turnos.collectAsState()
    val servicios by viewModel.servicios.collectAsState()

    var selectedFilter by remember { mutableStateOf<EstadoTurno?>(null) }
    var showCreateDialog by remember { mutableStateOf(initialCreateDialogOpen) }
    var turnoToEdit by remember { mutableStateOf<Turno?>(null) }

    val filteredTurnos = if (selectedFilter == null) {
        turnos
    } else {
        turnos.filter { it.estado == selectedFilter }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BossBlack)
            .padding(horizontal = 16.dp)
    ) {
        // Encabezado
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Gestión de Turnos", color = BossWhite, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("\${filteredTurnos.size} reservas", color = BossTextMuted, fontSize = 12.sp)
            }
            Button(
                onClick = { turnoToEdit = null; showCreateDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = BossYellow, contentColor = BossBlack),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Nuevo Turno", fontWeight = FontWeight.Bold)
            }
        }

        // Filtros por Estado
        LazyRow(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                FilterChipCustom("Todos", selectedFilter == null) { selectedFilter = null }
            }
            items(EstadoTurno.entries) { estado ->
                FilterChipCustom(estado.label, selectedFilter == estado) { selectedFilter = estado }
            }
        }

        // Listado de Tarjetas
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(filteredTurnos, key = { it.id }) { turno ->
                TurnoCardItem(
                    turno = turno,
                    onSendWhatsApp = { viewModel.sendWhatsAppConfirmation(context, turno) },
                    onEdit = { turnoToEdit = turno; showCreateDialog = true }
                )
            }
        }
    }
}`
  },
  {
    path: "android/app/src/main/java/com/theboss/lavadopremium/data/remote/BossFirebaseMessagingService.kt",
    name: "BossFirebaseMessagingService.kt",
    category: "service",
    language: "kotlin",
    description: "Servicio de notificaciones FCM push para avisar a Franco o Lucas de acciones CRUD",
    content: `package com.theboss.lavadopremium.data.remote

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.theboss.lavadopremium.MainActivity
import com.theboss.lavadopremium.data.local.UserPreferencesRepository

class BossFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val userPrefs = UserPreferencesRepository(applicationContext)
        val currentUser = userPrefs.getCurrentUser()

        val recipient = remoteMessage.data["recipient"] ?: ""
        val sender = remoteMessage.data["sender"] ?: "THE BOSS"

        // Evitar que el usuario reciba push de su propia acción
        if (sender.equals(currentUser, ignoreCase = true)) return

        val title = remoteMessage.data["title"] ?: "THE BOSS Lavado Premium"
        val body = remoteMessage.data["body"] ?: "Nueva actualización de turnos"

        showNotification(title, body)
    }

    private fun showNotification(title: String, body: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)

        val channelId = "the_boss_turnos_channel"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Turnos - THE BOSS", NotificationManager.IMPORTANCE_HIGH)
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
}`
  },
  {
    path: "android/app/src/main/java/com/theboss/lavadopremium/ui/theme/Color.kt",
    name: "Color.kt",
    category: "ui",
    language: "kotlin",
    description: "Paleta oficial Detailing Premium: #121212, #1E1E1E, #F4B400, #7B1FA2, #FFFFFF",
    content: `package com.theboss.lavadopremium.ui.theme

import androidx.compose.ui.graphics.Color

val BossBlack = Color(0xFF121212)
val BossSurfaceDark = Color(0xFF1E1E1E)
val BossSurfaceDarker = Color(0xFF161616)
val BossSurfaceLightDark = Color(0xFF282828)

val BossYellow = Color(0xFFF4B400)
val BossYellowHover = Color(0xFFFFC107)
val BossYellowContainer = Color(0xFF3E3100)

val BossPurple = Color(0xFF7B1FA2)
val BossPurpleLight = Color(0xFF9C27B0)
val BossPurpleContainer = Color(0xFF2E0854)

val BossWhite = Color(0xFFFFFFFF)
val BossTextMuted = Color(0xFF9E9E9E)
val BossBorder = Color(0xFF333333)

val BossGreen = Color(0xFF00C853)
val BossRed = Color(0xFFD50000)
val BossBlue = Color(0xFF2979FF)`
  },
  {
    path: "android/app/src/main/java/com/theboss/lavadopremium/domain/model/Models.kt",
    name: "Models.kt",
    category: "domain",
    language: "kotlin",
    description: "Modelos de datos Kotlin: Turno, Solicitud, Cliente, Servicio, Actividad",
    content: `package com.theboss.lavadopremium.domain.model

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

data class Turno(
    val id: String = "",
    val cliente: String = "",
    val telefono: String = "",
    val vehiculo: String = "",
    val patente: String = "",
    val servicio: String = "",
    val fecha: String = "", // YYYY-MM-DD
    val hora: String = "",  // HH:mm
    val observaciones: String = "",
    val estado: EstadoTurno = EstadoTurno.PENDIENTE,
    val updatedBy: String = ""
)

data class Solicitud(
    val id: String = "",
    val cliente: String = "",
    val telefono: String = "",
    val vehiculo: String = "",
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
    val usuario: String = "",
    val accion: String = "",
    val timestamp: Long = System.currentTimeMillis()
)`
  },
  {
    path: "android/app/build.gradle.kts",
    name: "build.gradle.kts (App)",
    category: "config",
    language: "kotlin",
    description: "Configuración Gradle con Room, Firebase BOM, Compose Material 3 y DataStore",
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.theboss.lavadopremium"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.theboss.lavadopremium"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.10.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Firebase BOM
    implementation(platform("com.google.firebase:firebase-bom:33.5.1"))
    implementation("com.google.firebase:firebase-database-ktx")
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-messaging-ktx")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.1.1")
}`
  },
  {
    path: "android/app/src/main/AndroidManifest.xml",
    name: "AndroidManifest.xml",
    category: "config",
    language: "xml",
    description: "Permisos de red, consulta de paquetes de WhatsApp y servicio FCM",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
    </queries>

    <application
        android:name=".TheBossApplication"
        android:label="@string/app_name"
        android:theme="@style/Theme.TheBossLavadoPremium">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".data.remote.BossFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>`
  }
];
