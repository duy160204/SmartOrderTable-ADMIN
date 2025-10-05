import api from "./api"

const shiftService = {
  getAllShifts: () => api.get("/shifts/all").then((res) => res.data),
  createShift: (data) => api.post("/shifts", data).then((res) => res.data),
  assignShift: (data) => api.post("/shifts/assign", data).then((res) => res.data),
  getAllAssignments: () => api.get("/shifts/assignments").then((res) => res.data),
  getAllStats: () => api.get("/shifts/stats").then((res) => res.data),
}

export default shiftService
