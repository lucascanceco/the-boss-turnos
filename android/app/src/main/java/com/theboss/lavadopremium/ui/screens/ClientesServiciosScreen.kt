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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.theboss.lavadopremium.domain.model.Cliente
import com.theboss.lavadopremium.domain.model.Servicio
import com.theboss.lavadopremium.ui.theme.*
import com.theboss.lavadopremium.ui.viewmodels.MainViewModel

@Composable
fun ClientesServiciosScreen(
    viewModel: MainViewModel
) {
    val servicios by viewModel.servicios.collectAsState()
    val clientes by viewModel.clientes.collectAsState()

    var selectedSection by remember { mutableIntStateOf(0) } // 0: Servicios, 1: Clientes

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BossBlack)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Catálogo & Clientes",
            color = BossWhite,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Tabs
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = if (selectedSection == 0) BossYellow else BossSurfaceDark,
                modifier = Modifier
                    .weight(1f)
                    .clickable { selectedSection = 0 }
            ) {
                Box(
                    modifier = Modifier.padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Servicios (${servicios.size})",
                        color = if (selectedSection == 0) BossBlack else BossWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Surface(
                shape = RoundedCornerShape(10.dp),
                color = if (selectedSection == 1) BossPurple else BossSurfaceDark,
                modifier = Modifier
                    .weight(1f)
                    .clickable { selectedSection = 1 }
            ) {
                Box(
                    modifier = Modifier.padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Clientes (${clientes.size})",
                        color = BossWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (selectedSection == 0) {
            // Tarifas Oficiales por Tipo de Vehículo
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(
                        text = "Tarifas Oficiales de Lavados",
                        color = BossTextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                items(com.theboss.lavadopremium.domain.model.TipoVehiculo.entries) { tipo ->
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = BossSurfaceDark,
                        border = BorderStroke(1.dp, BossBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(BossYellow.copy(alpha = 0.15f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.DirectionsCar,
                                        contentDescription = null,
                                        tint = BossYellow,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = "Lavado ${tipo.label}",
                                        color = BossWhite,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = when(tipo) {
                                            com.theboss.lavadopremium.domain.model.TipoVehiculo.AUTO -> "Sedán / Hatchback compacto"
                                            com.theboss.lavadopremium.domain.model.TipoVehiculo.SUV -> "Crossover / SUV mediano"
                                            com.theboss.lavadopremium.domain.model.TipoVehiculo.CAMIONETA -> "Pick-up / Gran porte"
                                        },
                                        color = BossTextMuted,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                            Text(
                                text = "$${tipo.defaultPrice.toInt()}",
                                color = BossYellow,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        } else {
            // Clientes List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(clientes, key = { it.id }) { cliente ->
                    ClienteCard(cliente = cliente)
                }
            }
        }
    }
}

@Composable
private fun ServicioCard(servicio: Servicio) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(BossYellowContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.DirectionsCar,
                    contentDescription = null,
                    tint = BossYellow,
                    modifier = Modifier.size(26.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = servicio.nombre,
                    color = BossWhite,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "Duración estimada: ${servicio.duracion}",
                    color = BossTextMuted,
                    fontSize = 12.sp
                )
            }

            Text(
                text = "$ ${String.format("%,d", servicio.precio.toInt()).replace(',', '.')}",
                color = BossYellow,
                fontSize = 17.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

@Composable
private fun ClienteCard(cliente: Cliente) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = BossSurfaceDark,
        border = BorderStroke(1.dp, BossBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(BossPurpleContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = cliente.nombre.take(1),
                    color = BossYellow,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = cliente.nombre,
                    color = BossWhite,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "${cliente.vehiculo} · ${cliente.patente}",
                    color = BossTextMuted,
                    fontSize = 12.sp
                )

                Text(
                    text = "Última visita: ${cliente.ultimaVisita}",
                    color = BossTextMuted.copy(alpha = 0.7f),
                    fontSize = 11.sp
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = BossSurfaceDarker,
                border = BorderStroke(1.dp, BossYellow.copy(alpha = 0.5f))
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "${cliente.visitasCount}",
                        color = BossYellow,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "visitas",
                        color = BossTextMuted,
                        fontSize = 10.sp
                    )
                }
            }
        }
    }
}
