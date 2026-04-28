import api from "./axios";
export const alertAPI = {
  getAll:  (userId) => api.get(`/alerts/${userId}`),
  resolve: (id)     => api.post(`/alerts/resolve/${id}`),
};