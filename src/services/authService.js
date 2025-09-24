// src/services/authService.js
import api from './api'

const authService = {
  // 🔑 Đăng nhập
  login: async (username, password) => {
    try {
      await api.post('/auth/login', { username, password }, { withCredentials: true })
      console.log('[authService] ✅ Login success (cookies set)')
      return true // ✅ backend đã set cookie, FE không cần giữ token
    } catch (err) {
      console.error('[authService] ❌ Login failed:', err.response?.data || err.message)
      return false
    }
  },

  // 🔄 Refresh token
  refreshToken: async () => {
    try {
      await api.post('/auth/refresh-token', {}, { withCredentials: true })
      console.log('[authService] 🔄 Refresh token success')
      return true
    } catch (err) {
      console.warn('[authService] ⚠️ Refresh token failed:', err.response?.data || err.message)
      return false
    }
  },

  // 🚪 Logout
  logout: async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true })
      console.log('[authService] 🚪 Logout success')
      return true
    } catch (err) {
      console.warn('[authService] ⚠️ Logout API error:', err.response?.data || err.message)
      return false
    }
  },

  // 👤 Lấy user hiện tại
  me: async () => {
    try {
      const res = await api.get('/auth/me', { withCredentials: true })
      console.log('[authService] 👤 Current user:', res.data)
      return res.data // { username, email, role }
    } catch (err) {
      console.warn('[authService] ⚠️ Get current user failed:', err.response?.data || err.message)
      return null
    }
  },
}

export default authService
