import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { userService } from '../services/userService'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ username: '', role: 'STAFF' })
  const [loading, setLoading] = useState(false)

  // Bộ lọc
  const [filterRole, setFilterRole] = useState('ALL')
  const [searchName, setSearchName] = useState('')

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
    setFormData({ username: '', role: 'STAFF' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await userService.update(editing.id, formData)
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

  // Lọc người dùng theo role + tên
  const filteredUsers = users.filter((u) => {
    const matchRole = filterRole === 'ALL' || u.role?.name === filterRole
    const matchName = !searchName || u.username.toLowerCase().includes(searchName.toLowerCase())
    return matchRole && matchName
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
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

      {/* User List */}
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
              filteredUsers.map((u) => (
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? 'Edit User' : 'Add User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
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
      )}
    </div>
  )
}

export default UserManagement
