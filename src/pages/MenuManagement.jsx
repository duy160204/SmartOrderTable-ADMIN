import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { menuService } from '../services/menuService'

const MenuManagement = () => {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', price: 0 })

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const data = await menuService.getAll()
      setItems(data)
    } catch {
      toast.error('Failed to load menu')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await menuService.update(editing.id, formData)
        toast.success('Menu updated')
      } else {
        await menuService.create(formData)
        toast.success('Menu created')
      }
      fetchItems()
      setShowModal(false)
      setEditing(null)
      setFormData({ name: '', price: 0 })
    } catch {
      toast.error('Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete item?')) return
    try {
      await menuService.remove(id)
      toast.success('Deleted')
      fetchItems()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Management</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="px-4 py-2">{it.id}</td>
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2">{it.price}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => { setEditing(it); setFormData({ name: it.name, price: it.price }); setShowModal(true) }} className="btn btn-sm btn-outline">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(it.id)} className="btn btn-sm btn-outline text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input w-full" required />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null) }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement
