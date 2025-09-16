import api from './api'

export const tableService = {
  async getAll() {
    const res = await api.get('/admin/tables')
    return res.data
  },

  async create(data) {
    const res = await api.post('/admin/tables', data)
    return res.data
  },

  async update(id, data) {
    // Backend exposes PATCH for status and no generic PUT; keep PUT for now if server supports
    const res = await api.put(`/admin/tables/${id}`, data)
    return res.data
  },

  async remove(id) {
    await api.delete(`/admin/tables/${id}`)
  }
}
