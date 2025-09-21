import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, QrCode, Download, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { tableService } from '../services/tableService'

const statusColors = {
  FREE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-red-100 text-red-800'
}

const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formData, setFormData] = useState({ name: '', status: 'FREE' })
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [loadingQR, setLoadingQR] = useState(false)

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

  const resetForm = () => {
    setEditingTable(null)
    setFormData({ name: '', status: 'FREE' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return toast.error('Table name is required')
    }

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
      resetForm()
    } catch (err) {
      console.error('Save failed:', err.response?.data || err.message)
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

  const handleShowQRCode = async (table) => {
    setSelectedTable(table)
    setLoadingQR(true)
    setShowQRModal(true)
    try {
      const qrData = await tableService.getQRCodeBase64(table.id)
      setQrCodeData(qrData)
    } catch (error) {
      toast.error('Failed to generate QR code')
      console.error('QR code error:', error)
    } finally {
      setLoadingQR(false)
    }
  }

  const handleRegenerateQRCode = async (tableId) => {
    setLoadingQR(true)
    try {
      await tableService.regenerateQRCode(tableId)
      toast.success('QR code regenerated successfully')
      fetchTables()

      if (selectedTable && selectedTable.id === tableId) {
        const qrData = await tableService.getQRCodeBase64(tableId)
        setQrCodeData(qrData)
      }
    } catch (error) {
      toast.error('Failed to regenerate QR code')
      console.error('Regenerate QR error:', error)
    } finally {
      setLoadingQR(false)
    }
  }

  const handleDownloadQRCode = () => {
    if (!qrCodeData) return
    const link = document.createElement('a')
    link.href = qrCodeData
    link.download = `qr-code-table-${selectedTable?.name || selectedTable?.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded')
  }

  const filteredTables = tables.filter((t) => {
    return filterStatus === 'ALL' || t.status === filterStatus
  })

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Table Management</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input px-3 py-2 border rounded"
          >
            <option value="ALL">All</option>
            <option value="FREE">FREE</option>
            <option value="OCCUPIED">OCCUPIED</option>
          </select>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Table
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-sm font-medium text-gray-600">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 align-middle">{t.id}</td>
                <td className="px-4 py-3 align-middle">{t.name}</td>
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statusColors[t.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle space-x-2">
                  <button
                    onClick={() => handleShowQRCode(t)}
                    className="btn btn-sm btn-outline text-blue-600 hover:text-blue-800"
                    title="View QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleEdit(t)} className="btn btn-sm btn-outline">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="btn btn-sm btn-outline text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTables.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No tables found
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
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="FREE">FREE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                QR Code - Table {selectedTable?.name}
              </h3>
              <button
                onClick={() => {
                  setShowQRModal(false)
                  setSelectedTable(null)
                  setQrCodeData(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center space-y-4">
              {loadingQR ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Generating QR Code...</span>
                </div>
              ) : qrCodeData ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={qrCodeData}
                      alt={`QR Code for Table ${selectedTable?.name}`}
                      className="border rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Customers can scan this QR code to access the menu for this table
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleRegenerateQRCode(selectedTable.id)}
                      className="btn btn-outline flex items-center"
                      disabled={loadingQR}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {loadingQR ? 'Refreshing...' : 'Regenerate'}
                    </button>
                    <button
                      onClick={handleDownloadQRCode}
                      className="btn btn-primary flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-gray-500">Failed to generate QR code</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableManagement
