import api from './api'

export const dashboardService = {
  async getStats() {
    const orders = await api.get('/orders').then(res => res.data || [])
    const menuItems = await api.get('/menu/menu-items').then(res => res.data || [])

    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today))

    return {
      totalMenuItems: menuItems.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    }
  },

  async getRecentOrders(limit = 5) {
    const res = await api.get('/orders')
    return res.data?.slice(0, limit) || []
  },

  async getTopSellingItems(limit = 5) {
    const orders = await api.get('/orders').then(res => res.data || [])
    const itemCount = {}

    orders.forEach(order => {
      order.items?.forEach(item => {
        itemCount[item.menuItemId] = (itemCount[item.menuItemId] || 0) + item.quantity
      })
    })

    const menuItems = await api.get('/menu/menu-items').then(res => res.data || [])
    const topItems = Object.entries(itemCount)
      .map(([id, qty]) => ({ ...menuItems.find(m => m.id === id), quantitySold: qty }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit)

    return topItems
  },

  async getSalesChartData() {
    const orders = await api.get('/orders').then(res => res.data || [])
    const salesMap = {}

    orders.forEach(order => {
      const date = order.createdAt.slice(0, 10)
      salesMap[date] = (salesMap[date] || 0) + order.totalAmount
    })

    return Object.entries(salesMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}
