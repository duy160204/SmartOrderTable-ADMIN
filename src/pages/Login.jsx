import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast.error('Please enter both username and password')
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.username.trim(), formData.password.trim())
      console.log('[Login.jsx] ✅ Login result:', result)

      if (result.success) {
        toast.success('Welcome back!')
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 100)
      } else {
        toast.error(result.error || 'Login failed - please check your credentials')
      }
    } catch (err) {
      console.error('[Login.jsx] ❌ Unexpected error:', err)
      toast.error('An unexpected error occurred - please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-admin-50 to-admin-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-admin-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Smart Order Table Management System</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !formData.username || !formData.password}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
