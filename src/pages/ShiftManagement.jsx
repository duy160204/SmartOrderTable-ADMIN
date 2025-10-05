import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { Search, Filter, Printer } from "lucide-react"
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
  const [filterRole, setFilterRole] = useState("")
  const [search, setSearch] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const printRef = useRef(null)

  // ======================
  // 🔄 FETCH DỮ LIỆU
  // ======================
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
    } catch (err) {
      toast.error("⚠️ Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  // ======================
  // ➕ TẠO CA MỚI
  // ======================
  const handleCreateShift = async () => {
    const { name, startTime, endTime } = newShift
    if (!name || !startTime || !endTime) {
      toast.error("Nhập đầy đủ thông tin ca làm!")
      return
    }

    try {
      await shiftService.createShift(newShift)
      toast.success("✅ Tạo ca thành công!")
      setNewShift({ name: "", startTime: "", endTime: "" })
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data || "❌ Lỗi khi tạo ca làm")
    }
  }

  // ======================
  // 👷 GÁN CA CHO USER
  // ======================
  const handleAssign = async (userId, shiftId, date) => {
    if (!shiftId || !date) {
      toast.error("Chưa chọn ca hoặc ngày!")
      return
    }

    const today = new Date().toISOString().split("T")[0]
    if (date < today) {
      toast.error("❌ Không thể gán ca trong quá khứ!")
      return
    }

    try {
      await shiftService.assignShift({ userId, shiftId, date })
      toast.success("📅 Gán ca thành công!")
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data || "Lỗi khi gán ca")
    }
  }

  // ======================
  // 🔍 LỌC NHÂN VIÊN
  // ======================
  const filteredUsers = users.filter(
    (u) =>
      (!filterRole || u.role?.name === filterRole) &&
      (!search || u.username.toLowerCase().includes(search.toLowerCase()))
  )

  // ======================
  // 🔎 LỌC PHÂN CÔNG THEO NGÀY
  // ======================
  const filteredAssignments = assignments.filter((a) =>
    filterDate ? a.date === filterDate : true
  )

  // ======================
  // 🖨️ IN THỐNG KÊ
  // ======================
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

  // ======================
  // 🧱 GIAO DIỆN
  // ======================
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

      {/* ======================== */}
      {/* TAB 1: CA LÀM */}
      {/* ======================== */}
      {tab === "shifts" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Tạo ca làm mới</h2>

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

          <button
            onClick={handleCreateShift}
            className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            ➕ Thêm ca làm
          </button>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Danh sách ca làm</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shifts.map((s) => (
                <div key={s.id} className="p-3 bg-white rounded shadow">
                  <h4 className="font-bold text-gray-700">{s.name}</h4>
                  <p className="text-sm text-gray-500">
                    {s.startTime} - {s.endTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================== */}
      {/* TAB 2: PHÂN CÔNG */}
      {/* ======================== */}
      {tab === "assignments" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Phân công nhân viên</h2>

          {/* Bộ lọc */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
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
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase">
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
                  <UserRow key={u.id} user={u} shifts={shifts} onAssign={handleAssign} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Lịch sử phân công */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">📋 Lịch sử phân công</h3>
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase">
                  <tr>
                    <th className="px-4 py-2">Nhân viên</th>
                    <th className="px-4 py-2">Ca</th>
                    <th className="px-4 py-2">Ngày</th>
                    <th className="px-4 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a) => (
                    <tr key={a.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{a.username}</td>
                      <td className="px-4 py-2">{a.shiftName}</td>
                      <td className="px-4 py-2">{a.date}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            a.status === "COMPLETED"
                              ? "bg-green-100 text-green-600"
                              : a.status === "WORKING"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================== */}
      {/* TAB 3: THỐNG KÊ */}
      {/* ======================== */}
      {tab === "stats" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Thống kê hiệu suất nhân viên</h2>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              <Printer className="h-5 w-5" /> In thống kê
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded shadow" ref={printRef}>
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-2">Tên</th>
                  <th className="px-4 py-2">Tổng ca</th>
                  <th className="px-4 py-2">Hoàn thành</th>
                  <th className="px-4 py-2">Tổng phút</th>
                  <th className="px-4 py-2">Tuần này</th>
                  <th className="px-4 py-2">Tháng này</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{s.username}</td>
                    <td className="px-4 py-2">{s.totalShifts}</td>
                    <td className="px-4 py-2">{s.completedShifts}</td>
                    <td className="px-4 py-2">{s.totalWorkMinutes}</td>
                    <td className="px-4 py-2">{s.weekWorkMinutes}</td>
                    <td className="px-4 py-2">{s.monthWorkMinutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ===============================
// 🧩 COMPONENT CON: UserRow
// ===============================
function UserRow({ user, shifts, onAssign }) {
  const [selectedShift, setSelectedShift] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="px-4 py-2 font-semibold">{user.username}</td>
      <td className="px-4 py-2">{user.role?.name}</td>
      <td className="px-4 py-2">{user.email}</td>
      <td className="px-4 py-2">{user.phoneNumber}</td>
      <td className="px-4 py-2">
        <select
          className="border p-1 rounded bg-white"
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
