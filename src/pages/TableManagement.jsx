import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { tableService } from '../services/tableService'

const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formData, setFormData] = useState({ name: '', status: 'FREE' })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const data = await tableService.getAll()
      setTables(data)
    } catch {
      toast.error('Failed to load tables')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTable) {
        await tableService.update(editingTable.id, formData)
        toast.success('Table updated successfully!')
      } else {
        await tableService.create(formData)
        toast.success('Table created successfully!')
      }
      fetchTables()
      setShowModal(false)
      setEditingTable(null)
      setFormData({ name: '', status: 'FREE' })
    } catch {
      toast.error('Failed to save table')
    }
  }

  const handleEdit = (table) => {
    setEditingTable(table)
    setFormData({ name: table.name, status: table.status })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return
    try {
      await tableService.remove(id)
      toast.success('Deleted successfully!')
      fetchTables()
    } catch {
      toast.error('Delete failed')
    }
  }

  const getStatusColor = (status) => {
    return status === 'FREE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Table Management</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Table
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => handleEdit(t)} className="btn btn-sm btn-outline">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="btn btn-sm btn-outline text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => toast.success(`QR generated for ${t.name}`)} className="btn btn-sm btn-outline">
                    <QrCode className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">No tables found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">{editingTable ? 'Edit Table' : 'Add Table'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input w-full">
                  <option value="FREE">FREE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingTable(null) }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableManagement
