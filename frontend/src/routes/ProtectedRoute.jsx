import React from 'react';
import { Navigate } from 'react-router-dom';
import ForbiddenPage from '../pages/error/ForbiddenPage'; 

const ProtectedRoute = ({ children, requireRole }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('userRole');

  // Chuẩn hóa role từ LocalStorage để so sánh chính xác
  const formattedRole = role ? String(role).replace('ROLE_', '').trim().toUpperCase() : '';
  const formattedRequireRole = requireRole ? String(requireRole).replace('ROLE_', '').trim().toUpperCase() : '';

  console.log("=== KIỂM TRA BẢO VỆ ROUTE ===");
  console.log("1. Token đang có:", token);
  console.log("2. Role thực tế:", formattedRole);
  console.log("3. Role yêu cầu:", formattedRequireRole);

  // TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP (Thiếu token hoặc token không hợp lệ)
  if (!token || token === 'undefined' || token === 'null') {
    console.warn("❌ Lỗi Token! Đang đá văng về lại trang Login...");
    
    // Tạo thông báo động dựa theo quyền mà Route đó đang yêu cầu
    let customMessage = "Vui lòng đăng nhập để tiếp tục!";

    return <Navigate 
      to="/login" 
      replace 
      state={{ alertMessage: customMessage }} 
    />;
  }

  // TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP NHƯNG SAI QUYỀN (ROLE TRONG TOKEN KHÁC ROLE YÊU CẦU)
  if (formattedRequireRole && formattedRole !== formattedRequireRole) {
    console.warn(`❌ Sai quyền! Yêu cầu: [${formattedRequireRole}] - Thực tế có: [${formattedRole}] -> Chặn bằng giao diện 403`);
    
    return (
      <div className="fixed inset-0 z-[9999] bg-white">
        <ForbiddenPage />
      </div>
    );
  }

  // TRƯỜNG HỢP 3: HỢP LỆ VÀ ĐỦ QUYỀN TRUY CẬP
  console.log("✅ Hợp lệ! Cho phép truy cập vào giao diện.");
  return children;
};

export default ProtectedRoute;