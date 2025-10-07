// src/services/shiftService.js
import api from "./api"

// =============================
// 🕓 Quản lý Ca làm
// =============================

// 🔹 Lấy tất cả ca làm
const getAllShifts = async () => {
  const res = await api.get("/shifts/all")
  return res.data
}

// 🔹 Tạo ca làm mới
const createShift = async (payload) => {
  // payload: { name, startTime, endTime }
  const res = await api.post("/shifts", payload)
  return res.data
}

// 🔹 Cập nhật ca làm
const updateShift = async (id, payload) => {
  const res = await api.put(`/shifts/${id}`, payload)
  return res.data
}

// 🔹 Xóa ca làm
const deleteShift = async (id) => {
  const res = await api.delete(`/shifts/${id}`)
  return res.data
}

// =============================
// 👥 Phân công nhân viên
// =============================

// 🔹 Gán ca cho nhân viên
const assignShift = async (payload) => {
  // payload: { userId, shiftId, date }
  const res = await api.post("/shifts/assign", payload)
  return res.data
}

// 🔹 Hủy gán ca
const unassignShift = async (assignmentId) => {
  const res = await api.delete(`/shifts/assignments/${assignmentId}`)
  return res.data
}

// 🔹 Lấy tất cả phân công (admin)
const getAllAssignments = async () => {
  const res = await api.get("/shifts/assignments")
  return res.data
}

// 🔹 Lấy phân công theo user
const getAssignmentsByUser = async (userId) => {
  const res = await api.get(`/shifts/assignments/user/${userId}`)
  return res.data
}

// =============================
// 🕐 Chấm công (Check-in / Check-out)
// =============================

const checkIn = async () => {
  const res = await api.post("/shifts/checkin")
  return res.data
}

const checkOut = async () => {
  const res = await api.post("/shifts/checkout")
  return res.data
}

// 🔹 Lấy ca hiện tại của nhân viên (dựa theo token đăng nhập)
const getActiveShift = async () => {
  const res = await api.get("/shifts/active")
  return res.data
}

// =============================
// 📊 Thống kê hiệu suất
// =============================

const getAllStats = async () => {
  const res = await api.get("/shifts/stats")
  return res.data
}

const getUserStats = async (userId) => {
  const res = await api.get(`/shifts/stats/${userId}`)
  return res.data
}

// 🔹 Lấy thống kê theo khoảng thời gian
const getStatsByDateRange = async (startDate, endDate) => {
  const res = await api.get(
    `/shifts/stats/filter?startDate=${startDate}&endDate=${endDate}`
  )
  return res.data
}

// ⚡ Alias tương thích FE
const getStatsByRange = getStatsByDateRange

// =============================
// 🧩 Export toàn bộ hàm
// =============================
export default {
  // Shifts
  getAllShifts,
  createShift,
  updateShift,
  deleteShift,

  // Assignments
  assignShift,
  unassignShift,
  getAllAssignments,
  getAssignmentsByUser,

  // Attendance
  checkIn,
  checkOut,
  getActiveShift,

  // Stats
  getAllStats,
  getUserStats,
  getStatsByDateRange,
  getStatsByRange, // ⚡ thêm alias để đảm bảo FE hoạt động đúng
}
