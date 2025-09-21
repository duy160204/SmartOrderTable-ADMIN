import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { setupInterceptors } from './services/api'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import TableManagement from './pages/TableManagement'
import UserManagement from './pages/UserManagement'
import ReportManagement from './pages/ReportManagement'
import PromotionManagement from './pages/PromotionManagement'
import Layout from './components/Layout'

function AppRoutes() {
  const auth = useAuth()

  React.useEffect(() => {
    setupInterceptors(auth)
  }, [auth])

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="tables" element={<TableManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="promotions" element={<PromotionManagement />} />
      </Route>

      {/* Fallback cho mọi route không tồn tại */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
