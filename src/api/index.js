import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend-api.com/api', // Thay bằng URL API thực tế
  timeout: 10000, // Thời gian timeout (ms)
  headers: {
    'Content-Type': 'application/json',
    // Nếu cần auth token, thêm vào đây
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});

// Xử lý lỗi toàn cục (tùy chọn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;