package com.theboss.lavadopremium.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.theboss.lavadopremium.domain.model.EstadoTurno
import com.theboss.lavadopremium.domain.model.Turno
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(
    viewModel: MainViewModel,
    onNavigateToTurnos: () -> Unit,
    onNavigateToSolicitudes: () -> Unit,
    onNavigateToClientes: () -> Unit,
    onNavigateToEstadisticas: () -> Unit,
    onOpenCreateTurno: () -> Unit
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val metrics by viewModel.dashboardMetrics.collectAsState()
    val turnos by viewModel.turnos.collectAsState()

    val todayFormatted = SimpleDateFormat("EEEE, d 'de' MMMM", Locale("es", "AR")).format(Date())
        .replaceFirstChar { it.uppercase() }

    val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    val todayTurnos = turnos.filter { it.fecha == todayStr }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BossBlack)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
    ) {
        // App Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "THE BOSS",
                        color = BossYellow,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "LAVADO PREMIUM · DETAILING",
                        color = BossWhite.copy(alpha = 0.8f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }

                // Operator Pill
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = BossPurpleContainer,
                    border = BorderStroke(1.dp, BossPurple)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(BossGreen)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Op: $currentUser",
                            color = BossWhite,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = todayFormatted,
                color = BossTextMuted,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(20.dp))
        }

        // Metrics 2x2 Grid
        item {
            Text(
                text = "Métricas del Día",
                color = BossWhite,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                MetricCard(
                    title = "Turnos de hoy",
                    count = metrics.turnosHoyCount.toString(),
                    icon = Icons.Default.CalendarToday,
                    accentColor = BossYellow,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToTurnos
                )
                Spacer(modifier = Modifier.width(10.dp))
                MetricCard(
                    title = "Solicitudes pendientes",
                    count = metrics.solicitudesPendientesCount.toString(),
                    icon = Icons.Default.Inbox,
                    accentColor = BossPurpleLight,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToSolicitudes
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                MetricCard(
                    title = "Vehículos en proceso",
                    count = metrics.enProcesoCount.toString(),
                    icon = Icons.Default.DirectionsCar,
                    accentColor = BossBlue,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToTurnos
                )
                Spacer(modifier = Modifier.width(10.dp))
                MetricCard(
                    title = "Vehículos finalizados",
                    count = metrics.finalizadosCount.toString(),
                    icon = Icons.Default.CheckCircle,
                    accentColor = BossGreen,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToTurnos
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Quick Actions Grid
        item {
            Text(
                text = "Accesos Rápidos",
                color = BossWhite,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                QuickActionButton(
                    title = "Nuevo Turno",
                    icon = Icons.Default.AddCircle,
                    accentColor = BossYellow,
                    modifier = Modifier.weight(1f),
                    onClick = onOpenCreateTurno
                )
                QuickActionButton(
                    title = "Solicitudes",
                    icon = Icons.Default.NotificationsActive,
                    accentColor = BossPurpleLight,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToSolicitudes
                )
                QuickActionButton(
                    title = "Servicios",
                    icon = Icons.Default.Star,
                    accentColor = BossYellow,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToClientes
                )
                QuickActionButton(
                    title = "Métricas",
                    icon = Icons.Default.BarChart,
                    accentColor = BossPurple,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToEstadisticas
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Today's Turnos Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Agenda de Hoy (${todayTurnos.size})",
                    color = BossWhite,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "Ver todos →",
                    color = BossYellow,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigateToTurnos() }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
        }

        if (todayTurnos.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = BossSurfaceDark,
                    border = BorderStroke(1.dp, BossBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No hay turnos agendados para hoy.",
                            color = BossTextMuted,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        } else {
            items(todayTurnos) { turno ->
                DashboardTurnoRow(
                    turno = turno,
                    onStatusChange = { newStatus ->
                        viewModel.updateTurnoEstado(turno, newStatus)
                    }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun MetricCard(
    title: String,
    count: String,
    icon: ImageVector,
    accentColor: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = modifier.clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    color = BossTextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1
                )
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = count,
                color = BossWhite,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun QuickActionButton(
    title: String,
    icon: ImageVector,
    accentColor: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = modifier.clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(accentColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = accentColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = title,
                color = BossWhite,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1
            )
        }
    }
}

@Composable
private fun DashboardTurnoRow(
    turno: Turno,
    onStatusChange: (EstadoTurno) -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Time box
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(BossYellowContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = turno.hora,
                    color = BossYellow,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = turno.cliente,
                    color = BossWhite,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${turno.vehiculo} · ${turno.patente}",
                    color = BossTextMuted,
                    fontSize = 12.sp
                )
                Text(
                    text = turno.servicio,
                    color = BossYellow,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            // Status chip
            val (badgeBg, badgeText) = when (turno.estado) {
                EstadoTurno.CONFIRMADO -> BossPurpleContainer to BossPurpleLight
                EstadoTurno.EN_PROCESO -> BossBlue.copy(alpha = 0.2f) to BossBlue
                EstadoTurno.FINALIZADO -> BossGreen.copy(alpha = 0.2f) to BossGreen
                EstadoTurno.CANCELADO -> BossRed.copy(alpha = 0.2f) to BossRed
                EstadoTurno.PENDIENTE -> BossSurfaceLightDark to BossTextMuted
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = badgeBg,
                border = BorderStroke(1.dp, badgeText.copy(alpha = 0.4f))
            ) {
                Text(
                    text = turno.estado.label,
                    color = badgeText,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}
