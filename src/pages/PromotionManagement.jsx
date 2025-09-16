import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { promotionService } from '../services/promotionService'

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT', // or 'FIXED'
    discountValue: '',
    startDate: '',
    endDate: '',
    active: true
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const data = await promotionService.getAll()
      setPromotions(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load promotions')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        startDate: formData.startDate,
        endDate: formData.endDate,
        active: !!formData.active
      }

      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, payload)
        toast.success('Promotion updated')
      } else {
        await promotionService.create(payload)
        toast.success('Promotion created')
      }

      await fetchPromotions()
      setShowModal(false)
      setEditingPromotion(null)
      setFormData({
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        startDate: '',
        endDate: '',
        active: true
      })
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    }
  }

  const handleEdit = (promo) => {
    setEditingPromotion(promo)
    setFormData({
      code: promo.code || '',
      discountType: promo.discountType || 'PERCENT',
      discountValue: promo.discountValue?.toString() || '',
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : '',
      active: !!promo.active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return
    try {
      await promotionService.remove(id)
      toast.success('Promotion deleted')
      fetchPromotions()
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    }
  }

  const formatDiscount = (type, value) => {
    if (type === 'PERCENT') return `${value}%`
    return new Intl.NumberFormat('vi-VN').format(value) + ' VND'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Promotion Management</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Promotion
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Discount</th>
                <th className="px-4 py-2 text-left">Period</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{p.code}</td>
                  <td className="px-4 py-3">{formatDiscount(p.discountType, p.discountValue)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      to {p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleEdit(p)} className="btn btn-sm btn-outline">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-outline text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">No promotions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">{editingPromotion ? 'Edit Promotion' : 'Add Promotion'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Promotion Code</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Discount Type</label>
                <select
                  className="input w-full"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="PERCENT">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Discount Value</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Start Date</label>
                  <input type="date" className="input w-full" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium">End Date</label>
                  <input type="date" className="input w-full" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>

              <div className="flex items-center">
                <input id="active" type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="h-4 w-4" />
                <label htmlFor="active" className="ml-2 text-sm">Active</label>
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingPromotion(null) }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromotionManagement
