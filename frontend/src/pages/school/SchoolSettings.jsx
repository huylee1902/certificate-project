import React from 'react';
import SecuritySettings from '../../components/shared/Settings';

export default function SchoolSettings() {
  return (
    <SecuritySettings 
       title="Bảo mật & Đăng nhập Nhà trường"
       subtitle="Quản lý tài khoản, cập nhật email và thay đổi mật khẩu an toàn."
       apiProfileUrl="/school/profile" 
       apiBaseUrl="/account"
       theme="blue"
    />
  );
}