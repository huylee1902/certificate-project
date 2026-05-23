import axios from 'axios';

const axiosClient = axios.create({
  baseURL: window.location.origin + '/api',  // Điện thoại truy cập qua ngrok
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// BLOCK 1: ĐÍNH KÈM ACCESS TOKEN VÀO REQUEST
// ==========================================
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// BLOCK 2: BIẾN QUẢN LÝ HÀNG ĐỢI REFRESH
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
// BLOCK 3: XỬ LÝ RESPONSE / LỖI 401
// ==========================================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';

    // --- CASE 1: Các route Auth thuần túy (login, register, OTP, quên mật khẩu...) ---
    // Những route này bị lỗi là do người dùng nhập sai → trả thẳng về cho trang đó tự hiển thị lỗi
    // KHÔNG được refresh token ở đây vì người dùng chưa đăng nhập
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
    // Nghĩa là Refresh Token trong Cookie đã hết hạn hoặc bị xóa
    // Không thể làm gì thêm → bắt đăng nhập lại
    if (url.includes('/auth/refresh')) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // --- CASE 3: API /auth/logout bị lỗi ---
    // Logout lỗi thì cũng không cần refresh, clear local rồi về trang login luôn
    if (url.includes('/auth/logout')) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // --- CASE 4: Các API nghiệp vụ bị 401 (Access Token hết hạn) ---
    // Đây là trường hợp chính → tiến hành refresh token tự động
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Nếu đang có request khác đang refresh rồi → đưa vào hàng đợi, chờ xong dùng token mới
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

      // Đánh dấu request này đã được retry để tránh vòng lặp vô hạn
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh — withCredentials tự mang Cookie refreshToken lên
        const rs = await axios.post(
          'http://localhost:8080/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = rs.data.data.accessToken;

        // Lưu Access Token mới vào localStorage
        localStorage.setItem('accessToken', newAccessToken);

        // Cập nhật default header cho tất cả request sau
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Cập nhật header cho request hiện tại đang chờ retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Giải phóng hàng đợi: các request đang chờ đều dùng token mới chạy lại
        processQueue(null, newAccessToken);

        // Chạy lại request bị lỗi ban đầu
        return axiosClient(originalRequest);

      } catch (_error) {
        // Refresh thất bại → clear hết, bắt đăng nhập lại
        processQueue(_error, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(_error);

      } finally {
        isRefreshing = false;
      }
    }

    // --- CASE 5: Các lỗi khác (403, 404, 500...) → trả về cho component tự xử lý ---
    return Promise.reject(error);
  }
);

export default axiosClient;