package com.theboss.lavadopremium

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
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

                // Initial Onboarding/Splash check for Operator selection (Lucas / Franco)
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
}
