import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { userService } from '../services/userService'

// Default form structure
const defaultForm = { 
  username: '', 
  password: '', 
  email: '', 
  phoneNumber: '', 
  role: 'STAFF' 
}

// Modal component
const UserModal = ({ show, onClose, onSave, editing, formData, setFormData }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">
          {editing ? 'Edit User' : 'Add User'}
        </h3>
        <form
          onSubmit={onSave}
          className="space-y-4"
        >
          {/* Username */}
          <div>
            <label className="block text-sm">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="input w-full"
              required
            />
          </div>

          {/* Password only for create */}
          {!editing && (
            <div>
              <label className="block text-sm">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input w-full"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input w-full"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm">Phone</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="input w-full"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="input w-full"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
              <option value="KITCHEN">KITCHEN</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [filterRole, setFilterRole] = useState('ALL')
  const [searchName, setSearchName] = useState('')

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      console.error('[UserManagement] Fetch error:', err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData(defaultForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        // Prepare payload without password
        const { password, ...payload } = formData
        await userService.update(editing.id, payload)
        toast.success('User updated')
      } else {
        await userService.create(formData)
        toast.success('User created')
      }
      fetchUsers()
      setShowModal(false)
      resetForm()
    } catch (err) {
      console.error('[UserManagement] Save error:', err)
      toast.error('Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await userService.remove(id)
      toast.success('Deleted successfully!')
      fetchUsers()
    } catch (err) {
      console.error('[UserManagement] Delete error:', err)
      toast.error('Delete failed')
    }
  }

  // Filter users
  const filteredUsers = users.filter(u => {
    const roleMatch = filterRole === 'ALL' || u.role?.name === filterRole
    const nameMatch = u.username.toLowerCase().includes(searchName.toLowerCase())
    return roleMatch && nameMatch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Add User
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search username..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="input px-3 py-2 border rounded flex-1 min-w-[200px]"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input px-3 py-2 border rounded"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="STAFF">STAFF</option>
          <option value="KITCHEN">KITCHEN</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-sm font-medium text-gray-600">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 align-middle">{u.id}</td>
                  <td className="px-4 py-3 align-middle">{u.username}</td>
                  <td className="px-4 py-3 align-middle">{u.role?.name || '-'}</td>
                  <td className="px-4 py-3 align-middle space-x-2">
                    <button
                      onClick={() => {
                        setEditing(u)
                        setFormData({
                          username: u.username,
                          email: u.email || '',
                          phoneNumber: u.phoneNumber || '',
                          role: u.role?.name || 'STAFF'
                        })
                        setShowModal(true)
                      }}
                      className="btn btn-sm btn-outline"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn btn-sm btn-outline text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      <UserModal
        show={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        onSave={handleSubmit}
        editing={editing}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  )
}

export default UserManagement
