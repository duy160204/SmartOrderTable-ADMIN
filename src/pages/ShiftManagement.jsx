import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { Search, Filter, Printer, Edit, Trash2, XCircle } from "lucide-react"
import shiftService from "../services/shiftService"
import api from "../services/api"

export default function ShiftManagement() {
  const [tab, setTab] = useState("shifts")
  const [shifts, setShifts] = useState([])
  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(false)

  const [newShift, setNewShift] = useState({ name: "", startTime: "", endTime: "" })
  const [editingShift, setEditingShift] = useState(null)

  const [filterRole, setFilterRole] = useState("")
  const [search, setSearch] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const printRef = useRef(null)

  // =====================
  // 🔄 FETCH DATA
  // =====================
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [shiftRes, assignRes, userRes, statsRes] = await Promise.all([
        shiftService.getAllShifts(),
        shiftService.getAllAssignments(),
        api.get("/admin/users"),
        shiftService.getAllStats(),
      ])
      setShifts(shiftRes)
      setAssignments(assignRes)
      const filteredUsers = userRes.data.filter((u) => u.role?.name !== "ADMIN")
      setUsers(filteredUsers)
      setStats(statsRes)
    } catch {
      toast.error("⚠️ Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  // =====================
  // 🧱 CRUD SHIFT
  // =====================
  const handleCreateOrUpdateShift = async () => {
    const { name, startTime, endTime } = newShift
    if (!name || !startTime || !endTime) return toast.error("Nhập đầy đủ thông tin ca làm!")

    try {
      if (editingShift) {
        await shiftService.updateShift(editingShift.id, newShift)
        toast.success("✏️ Cập nhật ca thành công!")
      } else {
        await shiftService.createShift(newShift)
        toast.success("✅ Tạo ca thành công!")
      }

      setNewShift({ name: "", startTime: "", endTime: "" })
      setEditingShift(null)
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data || "❌ Lỗi khi lưu ca làm")
    }
  }

  const handleEditShift = (shift) => {
    setEditingShift(shift)
    setNewShift({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    })
  }

  const handleCancelEdit = () => {
    setEditingShift(null)
    setNewShift({ name: "", startTime: "", endTime: "" })
  }

  const handleDeleteShift = async (id) => {
    if (!window.confirm("Xác nhận xóa ca làm này?")) return
    try {
      await shiftService.deleteShift(id)
      toast.success("🗑️ Đã xóa ca làm!")
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data || "Không thể xóa ca làm")
    }
  }

  // =====================
  // 👷 GÁN / HỦY GÁN
  // =====================
  const handleAssign = async (userId, shiftId, date) => {
    if (!shiftId || !date) return toast.error("Chưa chọn ca hoặc ngày!")
    const today = new Date().toISOString().split("T")[0]
    if (date < today) return toast.error("❌ Không thể gán ca trong quá khứ!")

    try {
      await shiftService.assignShift({ userId, shiftId, date })
      toast.success("📅 Gán ca thành công!")
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data || "Lỗi khi gán ca")
    }
  }

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm("Xác nhận hủy gán ca này?")) return
    try {
      await shiftService.unassignShift(assignmentId)
      toast.success("🗑️ Hủy gán ca thành công!")
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data || "Không thể hủy gán ca")
    }
  }

  // =====================
  // 📊 LỌC THỐNG KÊ (BACKEND)
  // =====================
  const fetchStatsByRange = async () => {
    if (!startDate || !endDate) return toast.error("Chọn ngày bắt đầu và kết thúc!")
    setLoading(true)
    try {
      const res = await shiftService.getStatsByRange(startDate, endDate)
      setStats(res)
      toast.success("📆 Đã lọc thống kê theo thời gian!")
    } catch {
      toast.error("Không thể lấy dữ liệu thống kê!")
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = async () => {
    setSearch("")
    setFilterRole("")
    setStartDate("")
    setEndDate("")
    await fetchAllData()
  }

  // =====================
  // 🖨️ IN BÁO CÁO
  // =====================
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML
    const printWindow = window.open("", "", "width=1000,height=700")
    printWindow.document.write(`
      <html>
        <head>
          <title>Báo cáo hiệu suất nhân viên</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
            h1 { color: #e67e22; }
          </style>
        </head>
        <body>
          <h1>📊 Báo cáo hiệu suất nhân viên</h1>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // =====================
  // 🧱 GIAO DIỆN CHÍNH
  // =====================
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3 border-b pb-2">
        {[
          { key: "shifts", label: "Ca làm" },
          { key: "assignments", label: "Phân công" },
          { key: "stats", label: "Thống kê" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-semibold rounded-t-lg ${
              tab === t.key
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 italic">Đang tải dữ liệu...</p>}

      {tab === "shifts" && (
        <ShiftTab
          shifts={shifts}
          newShift={newShift}
          editingShift={editingShift}
          setNewShift={setNewShift}
          handleCreateOrUpdateShift={handleCreateOrUpdateShift}
          handleCancelEdit={handleCancelEdit}
          handleEditShift={handleEditShift}
          handleDeleteShift={handleDeleteShift}
        />
      )}

      {tab === "assignments" && (
        <AssignmentsTab
          users={users}
          shifts={shifts}
          assignments={assignments}
          filterRole={filterRole}
          search={search}
          filterDate={filterDate}
          setSearch={setSearch}
          setFilterRole={setFilterRole}
          setFilterDate={setFilterDate}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
        />
      )}

      {tab === "stats" && (
        <StatsTab
          users={users}
          stats={stats}
          search={search}
          filterRole={filterRole}
          startDate={startDate}
          endDate={endDate}
          setSearch={setSearch}
          setFilterRole={setFilterRole}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handlePrint={handlePrint}
          printRef={printRef}
          fetchStatsByRange={fetchStatsByRange}
          clearFilters={clearFilters}
        />
      )}
    </div>
  )
}

// =====================
// 🧩 COMPONENT: SHIFT TAB
// =====================
function ShiftTab({
  shifts,
  newShift,
  editingShift,
  setNewShift,
  handleCreateOrUpdateShift,
  handleCancelEdit,
  handleEditShift,
  handleDeleteShift,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        {editingShift ? "✏️ Chỉnh sửa ca làm" : "➕ Tạo ca làm mới"}
      </h2>

      <div className="grid sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Tên ca"
          className="border p-2 rounded"
          value={newShift.name}
          onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
        />
        <input
          type="time"
          className="border p-2 rounded"
          value={newShift.startTime}
          onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
        />
        <input
          type="time"
          className="border p-2 rounded"
          value={newShift.endTime}
          onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCreateOrUpdateShift}
          className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          {editingShift ? "Lưu thay đổi" : "➕ Thêm ca làm"}
        </button>
        {editingShift && (
          <button
            onClick={handleCancelEdit}
            className="px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        )}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shifts.map((s) => (
          <div key={s.id} className="p-3 bg-white rounded shadow">
            <h4 className="font-bold">{s.name}</h4>
            <p className="text-sm text-gray-500">
              {s.startTime} - {s.endTime}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEditShift(s)}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <Edit size={14} /> Sửa
              </button>
              <button
                onClick={() => handleDeleteShift(s.id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =====================
// 🧩 COMPONENT: ASSIGNMENTS TAB
// =====================
function AssignmentsTab({
  users,
  shifts,
  assignments,
  filterRole,
  search,
  filterDate,
  setSearch,
  setFilterRole,
  setFilterDate,
  onAssign,
  onUnassign,
}) {
  const filteredUsers = users.filter(
    (u) =>
      (!filterRole || u.role?.name === filterRole) &&
      (!search || u.username.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Phân công nhân viên</h2>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center border rounded px-2 bg-white">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            className="p-2 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border p-2 rounded bg-white"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          {[...new Set(users.map((u) => u.role?.name))].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            className="border p-2 rounded"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng nhân viên */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Tên</th>
              <th className="px-4 py-2">Vai trò</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">SĐT</th>
              <th className="px-4 py-2">Ca làm</th>
              <th className="px-4 py-2">Ngày</th>
              <th className="px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <UserRow key={u.id} user={u} shifts={shifts} onAssign={onAssign} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Lịch sử phân công */}
      <div>
        <h3 className="font-semibold mb-2">📋 Lịch sử phân công</h3>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Nhân viên</th>
                <th className="px-4 py-2">Ca</th>
                <th className="px-4 py-2">Ngày</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {assignments
                .filter((a) => (!filterDate ? true : a.date === filterDate))
                .map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{a.username}</td>
                    <td className="px-4 py-2">{a.shiftName}</td>
                    <td className="px-4 py-2">{a.date}</td>
                    <td className="px-4 py-2">{a.status}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => onUnassign(a.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        <Trash2 size={14} /> Hủy
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// =====================
// 🧩 COMPONENT: USER ROW
// =====================
function UserRow({ user, shifts, onAssign }) {
  const [selectedShift, setSelectedShift] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="px-4 py-2">{user.username}</td>
      <td className="px-4 py-2">{user.role?.name}</td>
      <td className="px-4 py-2">{user.email}</td>
      <td className="px-4 py-2">{user.phoneNumber}</td>
      <td className="px-4 py-2">
        <select
          className="border p-1 rounded"
          value={selectedShift}
          onChange={(e) => setSelectedShift(e.target.value)}
        >
          <option value="">Chọn ca</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="date"
          className="border p-1 rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </td>
      <td className="px-4 py-2">
        <button
          onClick={() => onAssign(user.id, selectedShift, selectedDate)}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
        >
          Gán
        </button>
      </td>
    </tr>
  )
}

// =====================
// 🧩 COMPONENT: STATS TAB
// =====================
function StatsTab({
  users,
  stats,
  search,
  filterRole,
  startDate,
  endDate,
  setSearch,
  setFilterRole,
  setStartDate,
  setEndDate,
  handlePrint,
  printRef,
  fetchStatsByRange,
  clearFilters,
}) {
  const filteredStats = stats.filter((s) => {
    const matchName =
      !search || s.username.toLowerCase().includes(search.toLowerCase())
    const matchRole =
      !filterRole ||
      users.find((u) => u.username === s.username)?.role?.name === filterRole
    return matchName && matchRole
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Thống kê hiệu suất nhân viên</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            <Printer className="h-5 w-5" /> In
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <XCircle className="h-5 w-5" /> Xóa lọc
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-2">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded bg-white"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          {[...new Set(users.map((u) => u.role?.name))].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={fetchStatsByRange}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Lọc
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow" ref={printRef}>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Tên</th>
              <th className="px-4 py-2">Tổng ca</th>
              <th className="px-4 py-2">Hoàn thành</th>
              <th className="px-4 py-2">Tổng phút</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map((s, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-semibold">{s.username}</td>
                <td className="px-4 py-2">{s.totalShifts}</td>
                <td className="px-4 py-2">{s.completedShifts}</td>
                <td className="px-4 py-2">{s.totalWorkMinutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
