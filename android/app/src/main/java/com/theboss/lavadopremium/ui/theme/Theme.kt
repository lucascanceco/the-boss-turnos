package com.theboss.lavadopremium.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = BossYellow,
    onPrimary = BossBlack,
    primaryContainer = BossYellowContainer,
    onPrimaryContainer = BossYellow,
    secondary = BossPurple,
    onSecondary = BossWhite,
    secondaryContainer = BossPurpleContainer,
    onSecondaryContainer = BossPurpleLight,
    background = BossBlack,
    onBackground = BossWhite,
    surface = BossSurfaceDark,
    onSurface = BossWhite,
    surfaceVariant = BossSurfaceDarker,
    onSurfaceVariant = BossTextMuted,
    outline = BossBorder
)

@Composable
fun TheBossTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = BossBlack.toArgb()
                window.navigationBarColor = BossBlack.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = BossTypography,
        content = content
    )
}
