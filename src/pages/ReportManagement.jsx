import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportService } from '../services/reportService'

const ReportManagement = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [top, setTop] = useState(5)
  const [loading, setLoading] = useState(false)

  // set mặc định: 7 ngày trước -> hôm nay
  useEffect(() => {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)

    setDateRange({
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })
  }, [])

  const handleExport = async (e) => {
    e.preventDefault()

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select start and end date')
      return
    }

    try {
      setLoading(true)
      const data = await reportService.export(
        dateRange.startDate,
        dateRange.endDate,
        top
      )

      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Report exported successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reports & Analytics</h2>

      <form onSubmit={handleExport} className="card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="input w-full"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              className="input w-full"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Top</label>
            <input
              type="number"
              min="1"
              className="input w-full"
              value={top}
              onChange={(e) => setTop(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={loading || !dateRange.startDate || !dateRange.endDate}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReportManagement
