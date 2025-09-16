import api from './api'

export const reportService = {
  async getAll() {
    // Aggregate basic stats from existing endpoints without backend changes
    const [ordersRes, tablesRes, menuRes] = await Promise.all([
      api.get('/orders'),
      api.get('/admin/tables'),
      api.get('/admin/menu-items')
    ])
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : []
    const totalUsers = 0 // Not available without a users endpoint
    const completedOrders = orders.filter(o => String(o.status).toUpperCase() === 'DONE' || String(o.status).toUpperCase() === 'COMPLETED').length
    const pendingOrders = orders.filter(o => String(o.status).toUpperCase() === 'PENDING').length
    const today = new Date().toDateString()
    const todayRevenue = orders
      .filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + (typeof o.totalAmount === 'number' ? o.totalAmount : Number(o.totalAmount || 0)), 0)

    return {
      totalUsers,
      totalTables: Array.isArray(tablesRes.data) ? tablesRes.data.length : 0,
      totalMenuItems: Array.isArray(menuRes.data) ? menuRes.data.length : 0,
      todayRevenue,
      completedOrders,
      pendingOrders,
    }
  },

  async export(startDate, endDate, top = 5) {
    const res = await api.get('/report/export', {
      params: { startDate, endDate, top },
      responseType: 'blob' // để nhận file Excel
    })
    return res.data
  }
}
