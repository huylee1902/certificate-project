import React from 'react';
import SecuritySettings from '../../components/shared/Settings';

export default function AdminSettings() {
  return (
    <SecuritySettings 
       title="Cấu hình Bảo mật Admin Root"
       subtitle="Thay đổi email root và mật khẩu tối cao của tài khoản quản trị."
       apiProfileUrl="/admin/profile" 
       apiBaseUrl="/account"
       theme="indigo" // Màu xanh tím đặc trưng Admin
    />
  );
}