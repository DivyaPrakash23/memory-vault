import api from "./axios";
export const medicationAPI = {
  getAll:    (userId) => api.get(`/medications/${userId}`),
  getLogs:   (userId) => api.get(`/medications/${userId}/logs`),
  create:    (data)   => api.post("/medications", data),
  update:    (id, data) => api.put(`/medications/${id}`, data),
  remove:    (id)     => api.delete(`/medications/${id}`),
  confirm:   (id, mode) => api.post(`/medications/${id}/confirm`, { mode }),
};