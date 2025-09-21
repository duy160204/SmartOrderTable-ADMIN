import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { menuService } from '../services/menuService'
import { categoryService } from '../services/categoryService'
import { fileService } from '../services/fileService'

const MenuManagement = () => {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    descriptionVi: '',
    descriptionEn: '',
    price: 0,
    imageUrl: '',
    isActive: true,
    categoryId: null,
    newCategoryName: ''
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const fetchItems = async () => {
    try {
      const data = await menuService.getAll()
      setItems(data)
    } catch {
      toast.error('Failed to load menu items')
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch {
      toast.error('Failed to load categories')
    }
  }

  const filteredItems = items.filter(item => {
    const matchName = !filterName ||
      item.nameEn.toLowerCase().includes(filterName.toLowerCase()) ||
      item.nameVi.toLowerCase().includes(filterName.toLowerCase())
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive)
    return matchName && matchStatus
  })

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Select an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Max file size 5MB')

    setUploading(true)
    try {
      const res = await fileService.uploadFile(file)
      setFormData({ ...formData, imageUrl: res.url })
      setPreviewImage(res.url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' })
    setPreviewImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (uploading) return toast.error('Please wait for image upload')

    try {
      // Lấy categoryName: ưu tiên nhập mới, nếu không thì lấy từ dropdown
      const categoryName =
        formData.newCategoryName?.trim() ||
        categories.find(c => c.id === formData.categoryId)?.name

      if (!categoryName) return toast.error('Select or add a category')

      const payload = {
        nameVi: formData.nameVi.trim(),
        nameEn: formData.nameEn.trim(),
        descriptionVi: formData.descriptionVi.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        price: Number(formData.price) || 0,
        imageUrl: formData.imageUrl || '',
        isActive: !!formData.isActive,
        categoryName // ✅ backend cần tên category
      }

      if (editing) {
        await menuService.update(editing.id, payload)
        toast.success('Menu updated')
      } else {
        await menuService.create(payload)
        toast.success('Menu created')
      }

      fetchItems()
      setShowModal(false)
      setEditing(null)
      setPreviewImage(null)
      setFormData({
        nameVi: '',
        nameEn: '',
        descriptionVi: '',
        descriptionEn: '',
        price: 0,
        imageUrl: '',
        isActive: true,
        categoryId: null,
        newCategoryName: ''
      })
    } catch (err) {
      console.error('Save failed:', err.response?.data || err.message)
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

  const toggleStatus = async (item) => {
    try {
      await menuService.toggleStatus(item.id, !item.isActive)
      fetchItems()
    } catch {
      toast.error('Status update failed')
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="Search name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="input-field flex-1 min-w-[200px]"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className="btn btn-primary flex items-center ml-auto"
          onClick={() => {
            setEditing(null)
            setFormData({
              nameVi: '',
              nameEn: '',
              descriptionVi: '',
              descriptionEn: '',
              price: 0,
              imageUrl: '',
              isActive: true,
              categoryId: null,
              newCategoryName: ''
            })
            setPreviewImage(null)
            setShowModal(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name (VI)</th>
              <th className="px-4 py-3">Name (EN)</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length ? filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{item.nameVi || '-'}</td>
                <td className="px-4 py-2">{item.nameEn || '-'}</td>
                <td className="px-4 py-2">${item.price || 0}</td>
                <td className="px-4 py-2">{item.categoryName || '-'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleStatus(item)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditing(item)
                      setFormData({
                        nameVi: item.nameVi || '',
                        nameEn: item.nameEn || '',
                        descriptionVi: item.descriptionVi || '',
                        descriptionEn: item.descriptionEn || '',
                        price: item.price || 0,
                        imageUrl: item.imageUrl || '',
                        isActive: item.isActive !== false,
                        categoryId: item.categoryId || null,
                        newCategoryName: ''
                      })
                      setPreviewImage(item.imageUrl || null)
                      setShowModal(true)
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <div className="flex items-center space-x-3">
                  {previewImage && (
                    <div className="relative inline-block">
                      <img src={previewImage} alt="" className="h-32 w-32 rounded-lg object-cover border" />
                      <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name (VI)"
                  value={formData.nameVi}
                  onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Name (EN)"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Description (VI)"
                  value={formData.descriptionVi}
                  onChange={(e) => setFormData({ ...formData, descriptionVi: e.target.value })}
                  className="input-field"
                  rows="3"
                />
                <textarea
                  placeholder="Description (EN)"
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              {/* Price / Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="input-field"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Category */}
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="input-field flex-1"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or add new category"
                  value={formData.newCategoryName}
                  onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                  className="input-field flex-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); setPreviewImage(null) }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement
