import api from './api'

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password })
      const token = response.data
      
      // Decode token to get user info (simplified)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const user = {
        username: payload.sub,
        role: payload.role?.replace('ROLE_', '') || 'ADMIN'
      }
      
      return { token, user }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  async getCurrentUser() {
    try {
      // Since we don't have a specific endpoint, we'll use the token payload
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No token found')
      
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        username: payload.sub,
        role: payload.role?.replace('ROLE_', '') || 'ADMIN'
      }
    } catch (error) {
      throw new Error('Failed to get current user')
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}
