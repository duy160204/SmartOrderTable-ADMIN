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
    const res = await api.put(`/admin/tables/${id}`, data)
    return res.data
  },

  async remove(id) {
    await api.delete(`/admin/tables/${id}`)
  },

  async regenerateQRCode(id) {
    const res = await api.post(`/admin/tables/${id}/qr-code`)
    return res.data
  },

  // Cập nhật endpoint QR code Base64
  async getQRCodeBase64(id) {
    const res = await api.get(`/admin/tables/${id}/qr-code/base64`)
    return res.data
  }
}
