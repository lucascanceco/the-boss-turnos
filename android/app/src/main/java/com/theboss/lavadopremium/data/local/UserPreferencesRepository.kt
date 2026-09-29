package com.theboss.lavadopremium.data.local

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class UserPreferencesRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "the_boss_user_prefs",
        Context.MODE_PRIVATE
    )

    private val _currentUser = MutableStateFlow(getCurrentUser())
    val currentUser: StateFlow<String> = _currentUser.asStateFlow()

    fun getCurrentUser(): String {
        return prefs.getString(KEY_USER, "") ?: ""
    }

    fun isUserConfigured(): Boolean {
        val user = getCurrentUser()
        return user == "Lucas" || user == "Franco"
    }

    fun saveUser(userName: String) {
        prefs.edit().putString(KEY_USER, userName).apply()
        _currentUser.value = userName
    }

    fun getOtherUser(): String {
        return when (getCurrentUser()) {
            "Lucas" -> "Franco"
            "Franco" -> "Lucas"
            else -> "Lucas"
        }
    }

    companion object {
        private const val KEY_USER = "active_operator_name"
    }
}
