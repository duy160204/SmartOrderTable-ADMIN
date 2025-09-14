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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTables: 0,
    totalMenuItems: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  })

  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalUsers: 25,
      totalTables: 12,
      totalMenuItems: 45,
      todayRevenue: 2500000,
      pendingOrders: 8,
      completedOrders: 32
    })

    setRecentOrders([
      { id: 1, table: 'Table 5', amount: 450000, status: 'PENDING', time: '10:30 AM' },
      { id: 2, table: 'Table 2', amount: 320000, status: 'COMPLETED', time: '10:15 AM' },
      { id: 3, table: 'Table 8', amount: 280000, status: 'PROCESSING', time: '10:00 AM' },
      { id: 4, table: 'Table 1', amount: 150000, status: 'COMPLETED', time: '9:45 AM' },
    ])
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING': return 'text-blue-600 bg-blue-100'
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Tables',
      value: stats.totalTables,
      icon: Table,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: Menu,
      color: 'bg-purple-500',
      change: '+3%'
    },
    {
      title: 'Today Revenue',
      value: formatCurrency(stats.todayRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+18%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Pending Orders</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Processing Orders</span>
              </div>
              <span className="text-lg font-bold text-blue-600">5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Completed Orders</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.completedOrders}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.table}</p>
                  <p className="text-xs text-gray-500">{order.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(order.amount)}</p>
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
