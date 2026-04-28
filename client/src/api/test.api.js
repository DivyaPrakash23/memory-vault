import api from "./axios";
export const testAPI = {
  submit:    (data)   => api.post("/tests/submit", data),
  getTrends: (userId) => api.get(`/tests/${userId}/trends`),
};