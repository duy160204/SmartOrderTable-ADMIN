import api from './api'

export const menuService = {
  async getAll() {
    const res = await api.get('/admin/menu-items')
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/admin/menu-items`, { params: { id } })
    return res.data
  },

  async create(data) {
    const res = await api.post('/admin/menu-items', data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`/admin/menu-items/${id}`, data)
    return res.data
  },

  async remove(id) {
    await api.delete(`/admin/menu-items/${id}`)
  },

  async toggleStatus(id, isActive) {
    const res = await api.patch(`/admin/menu-items/${id}/status`, null, { params: { isActive } })
    return res.data
  }
}
