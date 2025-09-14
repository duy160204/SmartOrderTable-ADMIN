import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    status: 'FREE'
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTables([
      { id: 1, name: 'Table 1', status: 'FREE', qrCode: 'QR001' },
      { id: 2, name: 'Table 2', status: 'OCCUPIED', qrCode: 'QR002' },
      { id: 3, name: 'Table 3', status: 'FREE', qrCode: 'QR003' },
      { id: 4, name: 'Table 4', status: 'OCCUPIED', qrCode: 'QR004' },
      { id: 5, name: 'Table 5', status: 'FREE', qrCode: 'QR005' },
    ])
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingTable) {
      setTables(prev => prev.map(table => 
        table.id === editingTable.id 
          ? { ...table, ...formData }
          : table
      ))
      toast.success('Table updated successfully!')
    } else {
      const newTable = {
        id: Date.now(),
        ...formData,
        qrCode: `QR${String(Date.now()).slice(-3)}`
      }
      setTables(prev => [...prev, newTable])
      toast.success('Table added successfully!')
    }
    
    setShowModal(false)
    setEditingTable(null)
    setFormData({ name: '', status: 'FREE' })
  }

  const handleEdit = (table) => {
    setEditingTable(table)
    setFormData({
      name: table.name,
      status: table.status
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      setTables(prev => prev.filter(table => table.id !== id))
      toast.success('Table deleted successfully!')
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
        <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{table.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(table.status)}`}>
                {table.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">QR Code:</span> {table.qrCode}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button className="btn-secondary flex items-center text-sm">
                <QrCode className="h-4 w-4 mr-1" />
                View QR
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(table)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Table Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="FREE">Free</option>
                    <option value="OCCUPIED">Occupied</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingTable(null)
                      setFormData({ name: '', status: 'FREE' })
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTable ? 'Update' : 'Add'} Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableManagement
