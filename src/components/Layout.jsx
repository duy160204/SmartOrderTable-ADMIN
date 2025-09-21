import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Menu,
  Users,
  Table,
  BarChart3,
  Tag,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu Management', href: '/menu', icon: Menu },
    { name: 'Table Management', href: '/tables', icon: Table },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Promotions', href: '/promotions', icon: Tag },
  ]

  const roleLabels = {
    ADMIN: 'Manager',
    STAFF: 'Staff',
    KITCHEN: 'Kitchen',
    CASHIER: 'Cashier',
  }

  const isActive = (href) => location.pathname === href

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } flex flex-col justify-between transition-all duration-300 bg-white shadow-lg`}
      >
        {/* Top */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {sidebarOpen && (
              <h1 className="text-3xl font-extrabold text-orange-600">Restaurant</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 space-y-3">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-4 text-lg font-semibold rounded-lg mx-2
                    transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  <Icon className="h-6 w-6" />
                  {sidebarOpen && <span className="ml-4">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom: User info + Logout */}
        <div className="p-4 border-t bg-gray-50">
          {/* User info */}
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-base font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-base font-medium text-gray-800">{user?.username}</p>
                <p className="text-sm text-gray-500">
                  {roleLabels[user?.role?.toUpperCase()] || 'User'}
                </p>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                       bg-orange-600 text-white rounded-lg font-semibold 
                       hover:bg-orange-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {navigation.find((item) => isActive(item.href))?.name || 'Dashboard'}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
