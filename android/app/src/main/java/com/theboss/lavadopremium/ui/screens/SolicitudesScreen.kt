package com.theboss.lavadopremium.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.theboss.lavadopremium.domain.model.EstadoSolicitud
import com.theboss.lavadopremium.domain.model.Solicitud
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SolicitudesScreen(
    viewModel: MainViewModel
) {
    val solicitudes by viewModel.solicitudes.collectAsState()
    var solicitudToReschedule by remember { mutableStateOf<Solicitud?>(null) }

    val pendingCount = solicitudes.count { it.estado == EstadoSolicitud.PENDIENTE }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BossBlack)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Solicitudes Web",
                    color = BossWhite,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "$pendingCount pendientes de revisión",
                    color = BossYellow,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (solicitudes.isEmpty()) {
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = BossSurfaceDark,
                        border = BorderStroke(1.dp, BossBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Inbox,
                                contentDescription = null,
                                tint = BossTextMuted,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No hay solicitudes entrantes por el momento",
                                color = BossTextMuted,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            } else {
                items(solicitudes, key = { it.id }) { solicitud ->
                    SolicitudCard(
                        solicitud = solicitud,
                        onAprobar = { viewModel.aprobarSolicitud(solicitud) },
                        onRechazar = { viewModel.rechazarSolicitud(solicitud) },
                        onReprogramar = { solicitudToReschedule = solicitud }
                    )
                }
            }
        }
    }

    if (solicitudToReschedule != null) {
        ReprogramarDialog(
            solicitud = solicitudToReschedule!!,
            onDismiss = { solicitudToReschedule = null },
            onConfirm = { nuevoHorario ->
                viewModel.reprogramarSolicitud(solicitudToReschedule!!, nuevoHorario)
                solicitudToReschedule = null
            }
        )
    }
}

@Composable
private fun SolicitudCard(
    solicitud: Solicitud,
    onAprobar: () -> Unit,
    onRechazar: () -> Unit,
    onReprogramar: () -> Unit
) {
    val dateFormatted = try {
        val sdf = SimpleDateFormat("dd/MM HH:mm", Locale.getDefault())
        sdf.format(Date(solicitud.createdAt))
    } catch (e: Exception) {
        ""
    }

    Surface(
        shape = RoundedCornerShape(14.dp),
        color = BossSurfaceDark,
        border = BorderStroke(
            1.dp,
            if (solicitud.estado == EstadoSolicitud.PENDIENTE) BossPurple else BossBorder
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header: requested slot & arrival time
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = BossYellowContainer
                ) {
                    Text(
                        text = "Turno deseado: ${solicitud.fecha} · ${solicitud.hora} hs",
                        color = BossYellow,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = "Recibido: $dateFormatted",
                    color = BossTextMuted,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = solicitud.cliente,
                color = BossWhite,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "${solicitud.vehiculo} · Patente: ${solicitud.patente}",
                color = BossTextMuted,
                fontSize = 13.sp
            )

            Text(
                text = "Teléfono: ${solicitud.telefono}",
                color = BossTextMuted,
                fontSize = 12.sp
            )

            Text(
                text = "Servicio pedido: ${solicitud.servicio}",
                color = BossYellow,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 2.dp)
            )

            if (solicitud.observaciones.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "\"${solicitud.observaciones}\"",
                    color = BossTextMuted.copy(alpha = 0.9f),
                    fontSize = 12.sp
                )
            }

            if (solicitud.estado == EstadoSolicitud.REPROGRAMADA && solicitud.sugerenciaHorario.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = BossPurpleContainer
                ) {
                    Text(
                        text = "Sugerencia enviada: ${solicitud.sugerenciaHorario}",
                        color = BossPurpleLight,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            if (solicitud.estado == EstadoSolicitud.PENDIENTE) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onAprobar,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BossYellow,
                            contentColor = BossBlack
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Aprobar", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = onReprogramar,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, BossPurple),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = BossPurpleLight),
                        modifier = Modifier.weight(1.1f),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        Icon(Icons.Default.Schedule, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Reprogramar", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = onRechazar,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, BossRed.copy(alpha = 0.6f)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = BossRed),
                        modifier = Modifier.weight(0.9f),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        Text("Rechazar", fontSize = 12.sp)
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = BossSurfaceDarker,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Estado: ${solicitud.estado.label}",
                        color = BossTextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ReprogramarDialog(
    solicitud: Solicitud,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit
) {
    var nuevoHorario by remember { mutableStateOf("Mismo día a las 17:00 hs") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = BossSurfaceDark,
            border = BorderStroke(1.5.dp, BossPurple),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "Sugerir Horario Alternativo",
                    color = BossWhite,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Cliente: ${solicitud.cliente} solicitó ${solicitud.fecha} a las ${solicitud.hora}.",
                    color = BossTextMuted,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = nuevoHorario,
                    onValueChange = { nuevoHorario = it },
                    label = { Text("Nuevo día u horario sugerido") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = bossTextFieldColors()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancelar", color = BossTextMuted)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onConfirm(nuevoHorario) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BossPurple,
                            contentColor = BossWhite
                        )
                    ) {
                        Text("Enviar Sugerencia", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
