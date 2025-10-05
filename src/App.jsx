// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { setupInterceptors } from './services/api'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import TableManagement from './pages/TableManagement'
import UserManagement from './pages/UserManagement'
import ReportManagement from './pages/ReportManagement'
import PromotionManagement from './pages/PromotionManagement'
import ShiftManagement from './pages/ShiftManagement' // 🟧 thêm mới

// Layout
import Layout from './components/Layout'

function AppRoutes() {
  const auth = useAuth()

  // Gắn axios interceptor một lần khi Auth context sẵn sàng
  React.useEffect(() => {
    setupInterceptors(auth)
  }, [auth])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Root → nếu login thì vào dashboard, chưa login thì về login */}
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected routes (ADMIN only) */}
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
        <Route path="shifts" element={<ShiftManagement />} /> {/* 🟧 thêm route này */}
        <Route path="reports" element={<ReportManagement />} />
        <Route path="promotions" element={<PromotionManagement />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
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