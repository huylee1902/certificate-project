import axios from 'axios';

const axiosClient = axios.create({
  baseURL: window.location.origin + '/api',  // Điện thoại truy cập qua ngrok
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// BLOCK 1: ĐÍNH KÈM ACCESS TOKEN VÀO REQUEST (ĐÃ SỬA LỖI)
// ==========================================
axiosClient.interceptors.request.use((config) => {
  const url = config.url ?? '';

  // Danh sách các route công khai KHÔNG ĐƯỢC đính kèm token cũ
  const isPublicRoute =
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/resend-activation') ||
    url.includes('/auth/activate');

  // Chỉ đính kèm token nếu KHÔNG PHẢI là route công khai
  if (!isPublicRoute) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ==========================================
// BLOCK 2: BIẾN QUẢN LÝ HÀNG ĐỢI REFRESH (Giữ nguyên)
// ==========================================
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

// ==========================================
// BLOCK 3: XỬ LÝ RESPONSE / LỖI 401 (Giữ nguyên)
// ==========================================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';

    // --- CASE 1: Các route Auth thuần túy (login, register, OTP, quên mật khẩu...) ---
    const isPublicAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/resend-activation') ||
      url.includes('/auth/activate');

    if (isPublicAuthRoute) {
      return Promise.reject(error);
    }

    // --- CASE 2: Chính API /auth/refresh bị lỗi ---
    if (url.includes('/auth/refresh')) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // --- CASE 3: API /auth/logout bị lỗi ---
    if (url.includes('/auth/logout')) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // --- CASE 4: Các API nghiệp vụ bị 401 (Access Token hết hạn) ---
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rs = await axios.post(
          'http://localhost:8080/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = rs.data.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);

      } catch (_error) {
        processQueue(_error, null);
        localStorage.removeItem('accessToken');
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