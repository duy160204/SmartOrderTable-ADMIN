import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import TableManagement from './pages/TableManagement'
import UserManagement from './pages/UserManagement'
import ReportManagement from './pages/ReportManagement'
import PromotionManagement from './pages/PromotionManagement'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <Routes>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="menu" element={<MenuManagement />} />
                    <Route path="tables" element={<TableManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="reports" element={<ReportManagement />} />
                    <Route path="promotions" element={<PromotionManagement />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
