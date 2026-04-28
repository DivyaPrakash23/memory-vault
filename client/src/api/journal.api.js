import api from "./axios";
export const journalAPI = {
  getAll: (userId)    => api.get(`/journal/${userId}`),
  upload: (formData)  => api.post("/journal/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  remove: (id) => api.delete(`/journal/${id}`),
};