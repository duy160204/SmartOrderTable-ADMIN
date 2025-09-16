// src/services/authService.js
import api from './api'
import {jwtDecode} from 'jwt-decode'

const authService = {
  async login(username, password) {
    console.log('[authService.login] attempt with:', { username, password })
    let response
    try {
      response = await api.post('/auth/login', { username, password })
    } catch (err) {
      console.error('[authService.login] request error:', err)
      throw new Error('Login request failed')
    }
    console.log('[authService.login] response status:', response.status, 'data:', response.data)

    let token = null

    if (response.status === 200) {
      const data = response.data
      if (typeof data === 'string') {
        token = data
      } else if (data?.token && typeof data.token === 'string') {
        token = data.token
      } else if (data?.accessToken && typeof data.accessToken === 'string') {
        token = data.accessToken
      } else {
        console.error('[authService.login] Token not found in 200 response:', data)
        throw new Error('Token missing in login response')
      }
      console.log('[authService.login] Saving token to localStorage:', token)
      localStorage.setItem('token', token)
      return token
    }

    // Nếu server trả 304
    if (response.status === 304) {
      console.log('[authService.login] Received 304 Not Modified')
      const existing = localStorage.getItem('token')
      console.log('[authService.login] existing token in localStorage:', existing)
      if (existing) {
        return existing
      } else {
        throw new Error('Received 304 but no existing token available')
      }
    }

    // Tất cả status khác
    throw new Error(`Login failed with status ${response.status}`)
  },

  decodeToken(token) {
    if (!token || typeof token !== 'string') {
      console.warn('[authService.decodeToken] Invalid token input:', token)
      return null
    }
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[authService.decodeToken] Token format invalid:', token)
      return null
    }
    try {
      const decoded = jwtDecode(token)
      console.log('[authService.decodeToken] Decoded token:', decoded)
      return decoded
    } catch (err) {
      console.error('[authService.decodeToken] Error decoding token:', err, token)
      return null
    }
  }
}

export default authService
