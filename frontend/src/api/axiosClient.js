import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Đính kèm Access Token vào mỗi request gửi đi
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Các biến để khóa các request khác trong lúc đang gọi API refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Lắng nghe response trả về, nếu lỗi 401 thì tự động lấy Token mới
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 (Hết hạn JWT) và request này chưa từng được retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Nếu đang trong quá trình refresh token, đưa các request tiếp theo vào hàng đợi
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Đánh dấu request này đã được retry để tránh vòng lặp vô hạn
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      // Nếu không có refreshToken thì hết cứu -> đá ra màn hình login
      if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
      }

      try {
        // GỌI API REFRESH TOKEN XUỐNG BACKEND
        // LƯU Ý: Đổi '/auth/refresh' thành đúng endpoint của bạn trong AuthController nhé
        const rs = await axios.post('/api/auth/refresh', { 
            refreshToken: refreshToken 
        });

        // Lấy token mới từ response
        const { accessToken, refreshToken: newRefreshToken } = rs.data.data;

        // Lưu lại vào localStorage
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Cập nhật header cho request hiện tại và gọi lại nó
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return axiosClient(originalRequest);

      } catch (_error) {
        // Nếu API refresh token cũng lỗi (refreshToken hết hạn) -> Bắt đăng nhập lại
        processQueue(_error, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;