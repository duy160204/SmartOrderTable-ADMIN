// src/services/authService.js
import api from './api'
import {jwtDecode} from 'jwt-decode'

const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    console.log('[authService] ✅ Login response:', res.data)
    return res.data.accessToken
  },

  refreshToken: async () => {
    try {
      const res = await api.post('/auth/refresh-token')
      console.log('[authService] 🔄 Refresh token success')
      return res.data.accessToken
    } catch (err) {
      console.warn('[authService] ⚠️ Refresh token failed:', err.message)
      return null
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
      console.log('[authService] 🚪 Logout success')
    } catch (err) {
      console.warn('[authService] ⚠️ Logout API error:', err.message)
    }
  },

  decodeToken: (token) => {
    try {
      return jwtDecode(token)
    } catch (err) {
      console.error('[authService] ❌ Decode error:', err.message)
      return null
    }
  },
}

export default authService
