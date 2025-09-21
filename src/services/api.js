// src/services/api.js
import axios from 'axios'
import authService from './authService'

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // chỉnh theo backend
  withCredentials: true, // gửi cookie refreshToken
})

export const setupInterceptors = (auth) => {
  api.interceptors.request.use(
    (config) => {
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const newToken = await authService.refreshToken()
          if (newToken) {
            auth.setToken(newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (err) {
          console.error('[Axios] ❌ Refresh token failed:', err.message)
          auth.logout()
        }
      }
      return Promise.reject(error)
    }
  )
}

export default api
