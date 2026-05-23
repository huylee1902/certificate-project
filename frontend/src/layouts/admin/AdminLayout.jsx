import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, UserCircle, LogOut, ShieldCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy URL hiện tại để highlight menu bài bản

  const handleLogout = async () => {
    try {
      // 1. Gọi API xuống Backend để nó xóa HttpOnly Cookie và dọn token trong Redis/DB
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error("Có lỗi xảy ra khi gọi API đăng xuất", error);
    } finally {
      // 2. Dù API thành công hay lỗi, vẫn phải dọn sạch ví ở Frontend và đá ra ngoài
      localStorage.clear();
      navigate('/login');
    }
  };

  // Hàm check xem link có đang active hay không dựa trên URL thực tế
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* SIDEBAR CỐ ĐỊNH */}
      <div className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
          <ShieldCheck className="h-9 w-9 text-blue-500" />
          <div>
            <span className="font-extrabold text-2xl tracking-tight block">Admin Portal</span>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">CertiChain System</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-3">
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <LayoutDashboard className="h-5 w-5" /> Tổng quan
          </Link>
          <Link to="/admin/schools" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/schools') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <Building className="h-5 w-5" /> Quản lý Tổ chức
          </Link>
          <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/settings') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <UserCircle className="h-5 w-5" /> Cài đặt
          </Link>
        </div>

       <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium group">
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          Đăng xuất
        </button>
      </div>
      </div>

      {/* KHU VỰC NỘI DUNG RUỘT BÊN PHẢI */}
      <div className="flex-1 overflow-auto relative">
        {/* Header dùng chung */}
        <div className="bg-white/80 backdrop-blur-md px-10 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-extrabold text-slate-800">
            {isActive('/admin') && 'Tổng quan Hệ thống'}
            {isActive('/admin/schools') && 'Quản lý Tổ chức & Trường Đại học'}
            {isActive('/admin/profile') && 'Cài đặt Hồ sơ'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">Super Admin</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Đang hoạt động
              </div>
            </div>
            <div className="h-11 w-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              AD
            </div>
          </div>
        </div>

        {/* NƠI HIỂN THỊ CÁC TRANG CON BIẾN ĐỘNG */}
        <div className="p-10">
          <Outlet /> 
        </div>
      </div>

    </div>
  );
};

export default AdminLayout;