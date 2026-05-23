import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import các Trang thuộc nhóm Public và Auth
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ActivatePage from './pages/auth/ActivatePage';

// Import file Bảo vệ Quyền và file Khung Layout
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/admin/AdminLayout';

// Import các trang con độc lập của Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import SchoolManagement from './pages/admin/SchoolManagement';
import AdminSettings from './pages/admin/AdminSettings';
import SchoolDetailPage from './pages/admin/SchoolDetailPage';

import SchoolLayout from './layouts/school/SchoolLayout';
import SchoolDashboard from './pages/school/SchoolDashboard';
import IssueCertificate from './pages/school/IssueCertificate';
import SchoolProfile from './pages/school/SchoolProfile';
import SchoolSettings from './pages/school/SchoolSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. KHU VỰC CÔNG KHAI (AI CŨNG XEM ĐƯỢC) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate" element={<ActivatePage />} />

        {/* 2. KHU VỰC CỦA ADMIN (PHẢI BẢO VỆ NGHIÊM NGẶT) */}
        <Route 
          element={
            <ProtectedRoute requireRole="ADMIN">
              <AdminLayout /> {/* Bọc Layout Sidebar + Header bên ngoài */}
            </ProtectedRoute>
          }
        >
          {/* Định nghĩa các đường dẫn URL con bên trong hệ thống Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/schools" element={<SchoolManagement />} />
          <Route path="/admin/schools/:id" element={<SchoolDetailPage />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route 
          element={
            <ProtectedRoute requireRole="SCHOOL">
              <SchoolLayout /> {/* Khung Layout của Nhà trường */}
            </ProtectedRoute>
          }
        >
          {/* Định nghĩa các đường dẫn URL con của Nhà trường */}
          <Route path="/school/dashboard" element={<SchoolDashboard />} />
          <Route path="/school/issue" element={<IssueCertificate />} />
          <Route path="/school/profile" element={<SchoolProfile />} />
          <Route path="/school/settings" element={<SchoolSettings />} />
        </Route>

        {/* 3. ĐƯỜNG DẪN SAI -> TỰ ĐỘNG ĐẨY VỀ TRANG CHỦ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;