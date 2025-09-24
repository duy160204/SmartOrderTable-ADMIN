// src/services/userService.js
import api from './api'

export const userService = {
  async getAll() {
    const res = await api.get('/admin/users')
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/admin/users/${id}`)
    return res.data
  },

  // 🔹 Tạo mới user bằng cách gọi signup
  async create(data) {
    const payload = {
      username: data.username,
      password: data.password,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: { name: data.role } // ✅ gửi object role
    }
    const res = await api.post('/auth/signup', payload)
    return res.data
  },

  async update(id, data) {
    const payload = {
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: { name: data.role } // ✅ gửi object role
    }
    const res = await api.put(`/admin/users/${id}`, payload)
    return res.data
  },

  async remove(id) {
    await api.delete(`/admin/users/${id}`)
  }
}
