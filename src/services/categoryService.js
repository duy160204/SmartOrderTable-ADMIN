import api from './api'

export const categoryService = {
  async getAll() {
    const res = await api.get('/admin/categories')
    return res.data
  },
  async create(data) {
    const res = await api.post('/admin/categories', data)
    return res.data
  }
}
