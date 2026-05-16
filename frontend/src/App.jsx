import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ActivatePage from './pages/ActivatePage';

// Hàm kiểm tra quyền (Giả lập dựa vào localStorage)
const ProtectedRoute = ({ children, requireRole }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" />;
  if (requireRole && role !== requireRole) return <Navigate to="/" />; // Nếu không phải admin đẩy về trang chủ
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate" element={<ActivatePage />} />
        
        {/* Route dành riêng cho Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;