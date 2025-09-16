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

  async create(data) {
    const res = await api.post('/admin/users', data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`/admin/users/${id}`, data)
    return res.data
  },

  async remove(id) {
    await api.delete(`/admin/users/${id}`)
  }
}
