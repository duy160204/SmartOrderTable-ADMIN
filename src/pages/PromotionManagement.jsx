import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    startDate: '',
    endDate: '',
    active: true
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    setPromotions([
      {
        id: 1,
        code: 'WELCOME10',
        discountType: 'PERCENT',
        discountValue: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        active: true
      },
      {
        id: 2,
        code: 'SAVE50K',
        discountType: 'FIXED',
        discountValue: 50000,
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        active: true
      }
    ])
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingPromotion) {
      setPromotions(prev => prev.map(promo => 
        promo.id === editingPromotion.id 
          ? { ...promo, ...formData }
          : promo
      ))
      toast.success('Promotion updated successfully!')
    } else {
      const newPromotion = {
        id: Date.now(),
        ...formData
      }
      setPromotions(prev => [...prev, newPromotion])
      toast.success('Promotion added successfully!')
    }
    
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
  }

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      code: promotion.code,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      active: promotion.active
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(prev => prev.filter(promo => promo.id !== id))
      toast.success('Promotion deleted successfully!')
    }
  }

  const formatDiscount = (type, value) => {
    return type === 'PERCENT' ? `${value}%` : `${new Intl.NumberFormat('vi-VN').format(value)} VND`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Promotion Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Promotion
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{promotion.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDiscount(promotion.discountType, promotion.discountValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(promotion.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(promotion.endDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      promotion.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {promotion.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(promotion)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Promotion Code</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Discount Type</label>
                  <select
                    className="input-field"
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    required
                  >
                    <option value="PERCENT">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="label">Discount Value</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingPromotion ? 'Update' : 'Add'} Promotion
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

export default PromotionManagement
