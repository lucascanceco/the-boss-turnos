package com.theboss.lavadopremium.ui.screens

import android.app.DatePickerDialog
import android.app.TimePickerDialog
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.theboss.lavadopremium.domain.model.EstadoTurno
import com.theboss.lavadopremium.domain.model.Turno
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel
import java.util.*

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

    LaunchedEffect(initialCreateDialogOpen) {
        showCreateDialog = initialCreateDialogOpen
    }

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
        Spacer(modifier = Modifier.height(16.dp))

        // Title and Add Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Gestión de Turnos",
                    color = BossWhite,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${filteredTurnos.size} reservas registradas",
                    color = BossTextMuted,
                    fontSize = 12.sp
                )
            }

            Button(
                onClick = {
                    turnoToEdit = null
                    showCreateDialog = true
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = BossYellow,
                    contentColor = BossBlack
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(text = "Nuevo Turno", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Filter chips row
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterTab(
                    label = "Todos",
                    selected = selectedFilter == null,
                    onClick = { selectedFilter = null }
                )
            }
            items(EstadoTurno.entries) { estado ->
                FilterTab(
                    label = estado.label,
                    selected = selectedFilter == estado,
                    onClick = { selectedFilter = estado }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Turnos List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (filteredTurnos.isEmpty()) {
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
                                imageVector = Icons.Default.EventBusy,
                                contentDescription = null,
                                tint = BossTextMuted,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No hay turnos para este filtro",
                                color = BossTextMuted,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            } else {
                items(filteredTurnos, key = { it.id }) { turno ->
                    TurnoCard(
                        turno = turno,
                        onSendWhatsApp = {
                            viewModel.sendWhatsAppConfirmation(context, turno)
                        },
                        onEdit = {
                            turnoToEdit = turno
                            showCreateDialog = true
                        },
                        onStatusChange = { newStatus ->
                            viewModel.updateTurnoEstado(turno, newStatus)
                        }
                    )
                }
            }
        }
    }

    // Modal Create / Edit Turno
    if (showCreateDialog) {
        TurnoFormDialog(
            turno = turnoToEdit,
            existingTurnos = turnos,
            services = servicios.map { it.nombre },
            onDismiss = {
                showCreateDialog = false
                turnoToEdit = null
                onDialogClosed()
            },
            onSave = { updatedTurno ->
                viewModel.saveTurno(updatedTurno) {
                    showCreateDialog = false
                    turnoToEdit = null
                    onDialogClosed()
                }
            }
        )
    }
}

@Composable
private fun FilterTab(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = if (selected) BossYellow else BossSurfaceDark,
        border = BorderStroke(1.dp, if (selected) BossYellow else BossBorder),
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Text(
            text = label,
            color = if (selected) BossBlack else BossWhite,
            fontSize = 12.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

@Composable
fun TurnoCard(
    turno: Turno,
    onSendWhatsApp: () -> Unit,
    onEdit: () -> Unit,
    onStatusChange: (EstadoTurno) -> Unit
) {
    var expandedStatusMenu by remember { mutableStateOf(false) }

    Surface(
        shape = RoundedCornerShape(14.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header: Date, Time & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(BossYellowContainer)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${turno.fecha} · ${turno.hora} hs",
                            color = BossYellow,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Status Badge with clickable dropdown
                Box {
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
                        border = BorderStroke(1.dp, badgeText.copy(alpha = 0.4f)),
                        modifier = Modifier.clickable { expandedStatusMenu = true }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = turno.estado.label,
                                color = badgeText,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(
                                Icons.Default.ArrowDropDown,
                                contentDescription = null,
                                tint = badgeText,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = expandedStatusMenu,
                        onDismissRequest = { expandedStatusMenu = false },
                        modifier = Modifier.background(BossSurfaceDarker)
                    ) {
                        EstadoTurno.entries.forEach { status ->
                            DropdownMenuItem(
                                text = { Text(text = status.label, color = BossWhite) },
                                onClick = {
                                    onStatusChange(status)
                                    expandedStatusMenu = false
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Client and Vehicle
            Text(
                text = turno.cliente,
                color = BossWhite,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "${turno.vehiculo} · Patente: ${turno.patente}",
                color = BossTextMuted,
                fontSize = 13.sp
            )

            Text(
                text = "Servicio: ${turno.servicio}",
                color = BossYellow,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 2.dp)
            )

            if (turno.observaciones.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Obs: ${turno.observaciones}",
                    color = BossTextMuted.copy(alpha = 0.8f),
                    fontSize = 12.sp,
                    maxLines = 2
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons: WhatsApp Intent & Edit
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // WhatsApp Button
                Button(
                    onClick = onSendWhatsApp,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = BossGreen,
                        contentColor = BossWhite
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(
                        Icons.Default.Send,
                        contentDescription = "WhatsApp",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Enviar WhatsApp",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Edit Button
                OutlinedButton(
                    onClick = onEdit,
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, BossBorder),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = BossWhite),
                    modifier = Modifier.weight(0.6f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = "Editar",
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Editar", fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
fun TurnoFormDialog(
    turno: Turno?,
    existingTurnos: List<Turno>,
    services: List<String>,
    onDismiss: () -> Unit,
    onSave: (Turno) -> Unit
) {
    val context = LocalContext.current
    var cliente by remember { mutableStateOf(turno?.cliente ?: "") }
    var telefono by remember { mutableStateOf(turno?.telefono ?: "") }
    var vehiculo by remember { mutableStateOf(turno?.vehiculo ?: "") }
    var tipoVehiculo by remember { mutableStateOf(turno?.tipoVehiculo ?: com.theboss.lavadopremium.domain.model.TipoVehiculo.AUTO) }
    var fecha by remember { mutableStateOf(turno?.fecha ?: "2026-09-29") }
    var hora by remember { mutableStateOf(turno?.hora ?: "10:00") }
    var observaciones by remember { mutableStateOf(turno?.observaciones ?: "") }
    var estado by remember { mutableStateOf(turno?.estado ?: EstadoTurno.CONFIRMADO) }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var expandedTipoDropdown by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = BossSurfaceDark,
            border = BorderStroke(1.5.dp, BossYellow),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                item {
                    Text(
                        text = if (turno == null) "Nuevo Turno" else "Editar Turno",
                        color = BossWhite,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Error / Collision Alert Banner
                if (errorMessage != null) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = BossRed.copy(alpha = 0.2f),
                            border = BorderStroke(1.dp, BossRed),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = errorMessage ?: "",
                                color = BossRed,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }

                item {
                    OutlinedTextField(
                        value = cliente,
                        onValueChange = { cliente = it },
                        label = { Text("Nombre del Cliente") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = bossTextFieldColors()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                item {
                    OutlinedTextField(
                        value = telefono,
                        onValueChange = { telefono = it },
                        label = { Text("Teléfono (+54...)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = bossTextFieldColors()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = vehiculo,
                            onValueChange = { vehiculo = it },
                            label = { Text("Vehículo (Modelo)") },
                            modifier = Modifier.weight(1f),
                            colors = bossTextFieldColors()
                        )

                        Box(modifier = Modifier.weight(1f)) {
                            OutlinedTextField(
                                value = "${tipoVehiculo.label} ($${tipoVehiculo.defaultPrice.toInt()})",
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Tipo Vehículo") },
                                trailingIcon = {
                                    IconButton(onClick = { expandedTipoDropdown = !expandedTipoDropdown }) {
                                        Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = BossYellow)
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = bossTextFieldColors()
                            )

                            DropdownMenu(
                                expanded = expandedTipoDropdown,
                                onDismissRequest = { expandedTipoDropdown = false },
                                modifier = Modifier.background(BossSurfaceDarker)
                            ) {
                                com.theboss.lavadopremium.domain.model.TipoVehiculo.entries.forEach { tipo ->
                                    DropdownMenuItem(
                                        text = { Text("${tipo.label} - $${tipo.defaultPrice.toInt()}", color = BossWhite) },
                                        onClick = {
                                            tipoVehiculo = tipo
                                            expandedTipoDropdown = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Date & Time pickers
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = fecha,
                            onValueChange = { fecha = it },
                            label = { Text("Fecha (YYYY-MM-DD)") },
                            modifier = Modifier.weight(1f),
                            colors = bossTextFieldColors()
                        )
                        OutlinedTextField(
                            value = hora,
                            onValueChange = { hora = it },
                            label = { Text("Hora (HH:mm)") },
                            modifier = Modifier.weight(1f),
                            colors = bossTextFieldColors()
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }

                item {
                    OutlinedTextField(
                        value = observaciones,
                        onValueChange = { observaciones = it },
                        label = { Text("Observaciones") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = bossTextFieldColors(),
                        maxLines = 3
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Dialog Buttons
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = onDismiss) {
                            Text("Cancelar", color = BossTextMuted)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                // Validation
                                if (cliente.isBlank() || telefono.isBlank() || vehiculo.isBlank()) {
                                    errorMessage = "Por favor completa cliente, teléfono y vehículo."
                                    return@Button
                                }

                                // Collision check: verify if date & time is already reserved
                                val hasCollision = existingTurnos.any {
                                    it.id != turno?.id &&
                                    it.fecha == fecha.trim() &&
                                    it.hora == hora.trim() &&
                                    it.estado != EstadoTurno.CANCELADO
                                }

                                if (hasCollision) {
                                    errorMessage = "⚠️ Horario bloqueado: Ya existe un turno reservado para $fecha a las $hora hs. Por favor selecciona otro horario."
                                    return@Button
                                }

                                onSave(
                                    Turno(
                                        id = turno?.id ?: "",
                                        cliente = cliente.trim(),
                                        telefono = telefono.trim(),
                                        vehiculo = vehiculo.trim(),
                                        tipoVehiculo = tipoVehiculo,
                                        precio = tipoVehiculo.defaultPrice,
                                        patente = "",
                                        servicio = "Lavado ${tipoVehiculo.label}",
                                        fecha = fecha.trim(),
                                        hora = hora.trim(),
                                        observaciones = observaciones.trim(),
                                        estado = estado
                                    )
                                )
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = BossYellow,
                                contentColor = BossBlack
                            )
                        ) {
                            Text("Guardar Turno", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun bossTextFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = BossWhite,
    unfocusedTextColor = BossWhite,
    focusedBorderColor = BossYellow,
    unfocusedBorderColor = BossBorder,
    focusedLabelColor = BossYellow,
    unfocusedLabelColor = BossTextMuted,
    cursorColor = BossYellow
)
