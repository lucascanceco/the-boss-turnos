# 🚗 THE BOSS Lavado Premium — Proyecto Nativo Android (Kotlin + Jetpack Compose)

Aplicación nativa completa desarrollada con **Kotlin**, **Jetpack Compose (Material 3)**, **Room Database**, **Firebase Realtime Database**, **Firebase Auth (Anónimo)** y **Firebase Cloud Messaging (FCM)**.

Diseñada con identidad visual Detailing Premium en tema oscuro:
- **Negro principal (Fondo)**: `#121212`
- **Gris oscuro (Tarjetas)**: `#1E1E1E`
- **Amarillo (Detalles y acciones principales)**: `#F4B400`
- **Violeta (Acentos secundarios y estados)**: `#7B1FA2`
- **Blanco (Textos y títulos)**: `#FFFFFF`

---

## 📁 Estructura del Proyecto

```text
android/
├── build.gradle.kts
├── settings.gradle.kts
└── app/
    ├── build.gradle.kts
    └── src/
        └── main/
            ├── AndroidManifest.xml
            ├── java/com/theboss/lavadopremium/
            │   ├── TheBossApplication.kt
            │   ├── MainActivity.kt
            │   ├── domain/model/
            │   │   └── Models.kt (Turno, Solicitud, Cliente, Servicio, Actividad)
            │   ├── data/
            │   │   ├── local/
            │   │   │   ├── RoomEntities.kt
            │   │   │   ├── TheBossDatabase.kt (TurnoDao, SolicitudDao, ClienteDao, etc.)
            │   │   │   └── UserPreferencesRepository.kt (DataStore/SharedPreferences para Lucas/Franco)
            │   │   ├── remote/
            │   │   │   ├── FirebaseDataSource.kt (Realtime Database y Auth Anónimo)
            │   │   │   └── BossFirebaseMessagingService.kt (FCM y notificaciones push)
            │   │   └── repository/
            │   │       └── TheBossRepository.kt (Offline-First Room + Firebase Sync)
            │   └── ui/
            │       ├── theme/
            │       │   ├── Color.kt
            │       │   ├── Theme.kt
            │       │   └── Type.kt
            │       ├── viewmodels/
            │       │   └── MainViewModel.kt
            │       ├── components/
            │       │   └── UserSelectionDialog.kt
            │       └── screens/
            │           ├── DashboardScreen.kt
            │           ├── TurnosScreen.kt (con bloqueo de colisión y WhatsApp)
            │           ├── SolicitudesScreen.kt (Aprobar, Rechazar, Reprogramar)
            │           ├── ClientesServiciosScreen.kt
            │           └── EstadisticasActividadScreen.kt (Canvas Nativo)
            └── res/
                └── values/
                    ├── strings.xml
                    └── colors.xml
```

---

## ⚡ Características Principales Implementadas

1. **Configuración Inicial de Operador**:
   - Diálogo modal inicial: *"¿Quién está utilizando este dispositivo?"* (Lucas o Franco).
   - Guarda la preferencia en almacenamiento local persistente para firmar las acciones y enviar notificaciones FCM dirigidas al otro operador.

2. **Gestión de Turnos (CRUD)**:
   - Filtros por estado: `Todos`, `Pendiente`, `Confirmado`, `En proceso`, `Finalizado`, `Cancelado`.
   - **Validación de Bloqueo de Horarios**: Verifica en tiempo de guardado que no exista otra reserva en la misma fecha y hora (evita superposición).
   - **Botón "Enviar por WhatsApp"**: Dispara el intent oficial con el texto:
     `"Hola [Cliente]. Tu turno en THE BOSS Lavado Premium fue confirmado para el día [Fecha] a las [Hora]. Servicio: [Servicio]. Muchas gracias."`

3. **Gestión de Solicitudes Web**:
   - Sincronización en tiempo real de las solicitudes entrantes desde la web o redes sociales.
   - Acciones inmediatas:
     - **Aprobar**: Convierte la solicitud en turno confirmado, valida disponibilidad y actualiza la agenda.
     - **Rechazar**: Marca la solicitud como rechazada y lo registra en auditoría.
     - **Reprogramar**: Permite ingresar un horario sugerido para reenviárselo al cliente.

4. **Catálogo de Servicios y Clientes**:
   - Catálogo base: Lavado básico ($18.000), Lavado premium ($28.000), Motor ($22.000), Tapizados ($35.000) y Detailing Completo ($85.000).
   - Historial de clientes habituales con conteo de visitas y última fecha atendida.

5. **Estadísticas y Centro de Actividad**:
   - Gráfico de barras mensual renderizado de forma nativa con **Jetpack Compose Canvas**.
   - Registro de actividad en vivo ("Franco creó un turno", "Lucas aprobó una solicitud").

6. **Sincronización Offline y Notificaciones FCM**:
   - Room almacena todos los datos en el dispositivo. Si se pierde la conexión, la app sigue funcionando al 100%. Al reconectar, sube los cambios pendientes a Firebase Realtime Database.
   - Cada acción de Lucas o Franco envía una señal FCM al otro dispositivo mostrando una notificación push en la barra de estado.

---

## 🚀 Cómo Ejecutar en Android Studio

1. Abre **Android Studio** (Hedgehog o superior).
2. Selecciona **Open** y navega a la carpeta `/android`.
3. Descarga tu archivo `google-services.json` desde la consola de Firebase y colócalo en `android/app/google-services.json`.
4. En Firebase Console, habilita:
   - **Authentication**: Proveedor *Anónimo*.
   - **Realtime Database**: Crear base de datos en modo prueba o con reglas de lectura/escritura autenticada.
   - **Cloud Messaging**: Configura las notificaciones push.
5. Sincroniza Gradle (`Sync Project with Gradle Files`).
6. Conecta tu teléfono Android o inicia un emulador con API 26+ y presiona **Run 'app'**.
