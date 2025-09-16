import { useState, useEffect } from 'react'
import {
  Users,
  Table,
  Menu,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { reportService } from '../services/reportService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { connectSocket, subscribe } from '../services/socket'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    loadStats()
    loadRecentOrders()
    connectSocket()
    const unsub = subscribe((msg) => {
      if (!msg) return
      if (typeof msg === 'object' && (msg.type?.includes('ORDER') || msg.event?.includes('ORDER'))) {
        loadRecentOrders()
      }
    })
    return () => unsub()
  }, [])

  const loadStats = async () => {
    try {
      const data = await reportService.getAll()
      setStats(data)
    } catch {
      toast.error('Failed to load dashboard stats')
    }
  }

  const loadRecentOrders = async () => {
    try {
      const res = await api.get('/orders')
      setRecentOrders(res.data.slice(0, 5))
    } catch {
      toast.error('Failed to load recent orders')
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING': return 'text-blue-600 bg-blue-100'
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!stats) return <p>Loading dashboard...</p>

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Tables', value: stats.totalTables, icon: Table, color: 'bg-green-500' },
    { title: 'Menu Items', value: stats.totalMenuItems, icon: Menu, color: 'bg-purple-500' },
    { title: 'Today Revenue', value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: 'bg-yellow-500' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Pending Orders</span>
              <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Orders</span>
              <span className="font-bold text-green-600">{stats.completedOrders}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between border-b py-2">
                <div>
                  <p className="font-medium">{order.table?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
