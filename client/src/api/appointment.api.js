import api from "./axios";
export const appointmentAPI = {
  getAll:   (userId) => api.get(`/appointments/${userId}`),
  getToday: (userId) => api.get(`/appointments/${userId}/today`),
  create:   (data)   => api.post("/appointments", data),
  update:   (id, data) => api.put(`/appointments/${id}`, data),
  remove:   (id)     => api.delete(`/appointments/${id}`),
};