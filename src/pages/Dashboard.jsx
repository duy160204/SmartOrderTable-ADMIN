import { useState, useEffect } from 'react'
import { Menu, DollarSign } from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import toast from 'react-hot-toast'
import { connectSocket, subscribe } from '../services/socket'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [salesData, setSalesData] = useState([])
  const [topItems, setTopItems] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    loadStats()
    loadRecentOrders()
    loadSalesData()
    loadTopItems()
    connectSocket()

    const unsub = subscribe((msg) => {
      if (!msg) return
      if (
        typeof msg === 'object' &&
        (msg.type?.includes('ORDER') || msg.event?.includes('ORDER'))
      ) {
        loadRecentOrders()
        loadSalesData()
        loadTopItems()
      }
    })
    return () => unsub()
  }, [])

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } catch {
      toast.error('Failed to load dashboard stats')
    }
  }

  const loadRecentOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await dashboardService.getRecentOrders(5)
      setRecentOrders(data)
    } catch {
      toast.error('Failed to load recent orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadSalesData = async () => {
    try {
      const data = await dashboardService.getSalesChartData()
      setSalesData(data)
    } catch {
      toast.error('Failed to load sales chart')
    }
  }

  const loadTopItems = async () => {
    try {
      const data = await dashboardService.getTopSellingItems(5)
      setTopItems(data)
    } catch {
      toast.error('Failed to load top-selling items')
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100'
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  const statCards = [
    { title: 'Menu Items', value: stats.totalMenuItems, icon: Menu, color: 'bg-purple-500' },
    { title: 'Today Revenue', value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: 'bg-yellow-500' }
  ]

  // Chart datasets
  const salesChart = {
    labels: salesData.map((d) => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map((d) => d.revenue),
        fill: false,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgb(34,197,94)'
      }
    ]
  }

  const topItemsChart = {
    labels: topItems.map((i) => i.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topItems.map((i) => i.quantitySold), // sửa khớp service
        backgroundColor: 'rgb(59,130,246)'
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="card p-6">
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

      {/* Recent orders */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {loadingOrders ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between border-b py-2">
                <div>
                  <p className="font-medium">{order.table?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No recent orders</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Chart (Last Days)</h3>
          {salesData.length > 0 ? <Line data={salesChart} /> : <p className="text-gray-500">No sales data</p>}
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
          {topItems.length > 0 ? <Bar data={topItemsChart} /> : <p className="text-gray-500">No top-selling data</p>}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
