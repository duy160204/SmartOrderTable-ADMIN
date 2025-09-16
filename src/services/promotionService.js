import api from './api'

export const promotionService = {
  async getAll() {
    const res = await api.get('/promotions')
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/promotions/${id}`)
    return res.data
  },

  async create(data) {
    const res = await api.post('/promotions', data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`/promotions/${id}`, data)
    return res.data
  },

  async remove(id) {
    await api.delete(`/promotions/${id}`)
  }
}

