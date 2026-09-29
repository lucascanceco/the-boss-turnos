package com.theboss.lavadopremium.data.remote

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.theboss.lavadopremium.MainActivity
import com.theboss.lavadopremium.data.local.UserPreferencesRepository

class BossFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("BossFCM", "New FCM token generated: $token")
        // Register token in Firebase Database under user profile / operators/{Lucas|Franco}/fcmToken
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val userPrefs = UserPreferencesRepository(applicationContext)
        val currentUser = userPrefs.getCurrentUser()

        // Check if the notification target is the current user on this device
        val recipient = remoteMessage.data["recipient"] ?: remoteMessage.notification?.title
        val sender = remoteMessage.data["sender"] ?: "THE BOSS"

        // Do not notify if the current user generated the action themselves
        if (sender.equals(currentUser, ignoreCase = true)) {
            return
        }

        val title = remoteMessage.data["title"] ?: remoteMessage.notification?.title ?: "THE BOSS Lavado Premium"
        val body = remoteMessage.data["body"] ?: remoteMessage.notification?.body ?: "Nueva actualización de turnos"

        showNotification(title, body)
    }

    private fun showNotification(title: String, body: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

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
            val channel = NotificationChannel(
                channelId,
                "Turnos y Solicitudes - THE BOSS",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notificaciones en tiempo real entre Lucas y Franco"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
}
