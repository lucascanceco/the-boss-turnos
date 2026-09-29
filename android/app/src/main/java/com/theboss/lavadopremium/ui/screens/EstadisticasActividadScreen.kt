package com.theboss.lavadopremium.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.theboss.lavadopremium.domain.model.Actividad
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun EstadisticasActividadScreen(
    viewModel: MainViewModel
) {
    val actividades by viewModel.actividades.collectAsState()
    val turnos by viewModel.turnos.collectAsState()

    // Monthly data for Canvas bar chart
    val monthlyData = listOf(
        Pair("May", 42),
        Pair("Jun", 56),
        Pair("Jul", 68),
        Pair("Ago", 84),
        Pair("Sep", 95)
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BossBlack)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
    ) {
        item {
            Text(
                text = "Estadísticas & Actividad",
                color = BossWhite,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Rendimiento del taller y registro de acciones de operadores",
                color = BossTextMuted,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(18.dp))
        }

        // Revenue & Detail Stats
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = BossSurfaceDark,
                    border = BorderStroke(1.dp, BossYellow.copy(alpha = 0.4f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "Facturación Estimada", color = BossTextMuted, fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "$ 2.450.000", color = BossYellow, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text(text = "+18% vs mes anterior", color = BossGreen, fontSize = 11.sp)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = BossSurfaceDark,
                    border = BorderStroke(1.dp, BossPurple.copy(alpha = 0.4f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "Vehículos Totales", color = BossTextMuted, fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "95 autos", color = BossWhite, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text(text = "Promedio: 3.2 / día", color = BossPurpleLight, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))
        }

        // Native Jetpack Compose Canvas Bar Chart
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = BossSurfaceDark,
                border = BorderStroke(1.dp, BossBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Vehículos por Mes (Canvas Nativo)",
                        color = BossWhite,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Evolución mensual de trabajos realizados",
                        color = BossTextMuted,
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // Compose Canvas Bar Chart
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val barCount = monthlyData.size
                            val barWidth = size.width / (barCount * 1.8f)
                            val spacing = (size.width - (barCount * barWidth)) / (barCount + 1)
                            val maxVal = 100f

                            // Baseline guideline
                            drawLine(
                                color = BossBorder,
                                start = Offset(0f, size.height - 30f),
                                end = Offset(size.width, size.height - 30f),
                                strokeWidth = 2f
                            )

                            monthlyData.forEachIndexed { index, pair ->
                                val x = spacing + index * (barWidth + spacing)
                                val barHeight = (pair.second / maxVal) * (size.height - 50f)
                                val y = (size.height - 30f) - barHeight

                                // Draw bar with rounded top corners
                                drawRoundRect(
                                    color = if (index == monthlyData.lastIndex) BossYellow else BossPurple,
                                    topLeft = Offset(x, y),
                                    size = Size(barWidth, barHeight),
                                    cornerRadius = CornerRadius(8f, 8f)
                                )
                            }
                        }

                        // Labels below bars
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .align(Alignment.BottomCenter)
                                .padding(horizontal = 8.dp),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            monthlyData.forEach { pair ->
                                Text(
                                    text = "${pair.first} (${pair.second})",
                                    color = BossTextMuted,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Real-time Activity Center Feed
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.History,
                    contentDescription = null,
                    tint = BossYellow,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Centro de Actividad en Tiempo Real",
                    color = BossWhite,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
        }

        if (actividades.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = BossSurfaceDark,
                    border = BorderStroke(1.dp, BossBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text(text = "Sin actividad reciente registrada.", color = BossTextMuted, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(actividades, key = { it.id }) { act ->
                ActividadRow(actividad = act)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun ActividadRow(actividad: Actividad) {
    val timeFormatted = try {
        val sdf = SimpleDateFormat("HH:mm · dd MMM", Locale.getDefault())
        sdf.format(Date(actividad.timestamp))
    } catch (e: Exception) {
        ""
    }

    Surface(
        shape = RoundedCornerShape(10.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(if (actividad.usuario == "Lucas") BossYellowContainer else BossPurpleContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = actividad.usuario.take(1),
                    color = if (actividad.usuario == "Lucas") BossYellow else BossPurpleLight,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = actividad.accion,
                    color = BossWhite,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "Por ${actividad.usuario} · $timeFormatted",
                    color = BossTextMuted,
                    fontSize = 11.sp
                )
            }
        }
    }
}
