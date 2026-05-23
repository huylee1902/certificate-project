import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileBadge, Building, LogOut, GraduationCap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import axiosClient from '../../api/axiosClient';

const SchoolLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error("Lỗi đăng xuất", error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;
  const schoolName = localStorage.getItem('username') || 'Trường Đại học';

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-200 overflow-hidden">
      
      {/* SIDEBAR CỐ ĐỊNH */}
      <div className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
          <GraduationCap className="h-10 w-10 text-blue-500" />
          <div>
            <span className="font-extrabold text-2xl tracking-tight block">School Portal</span>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">CertiChain System</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-3">
          <Link to="/school/dashboard" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/school/dashboard') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <LayoutDashboard className="h-5 w-5" /> Tổng quan
          </Link>
          <Link to="/school/issue" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/school/issue') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <FileBadge className="h-5 w-5" /> Quản lý Văn bằng
          </Link>
          <Link to="/school/profile" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/school/profile') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <Building className="h-5 w-5" /> Hồ sơ Nhà trường
          </Link>
          <Link to="/school/settings" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/school/settings') ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <Settings className="h-5 w-5" /> Cài đặt hệ thống
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
      <div className="flex-1 flex flex-col relative bg-slate-50">
        
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-md px-10 py-5 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-800">
            {isActive('/school/dashboard') && 'Tổng quan Hoạt động'}
            {isActive('/school/issue') && 'Cấp phát & Quản lý Sinh viên'}
            {isActive('/school/profile') && 'Thông tin Đơn vị cấp phát'}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">{schoolName}</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Đang hoạt động
              </div>
            </div>
            <div className="h-11 w-11 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
              <Building className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* NƠI HIỂN THỊ CÁC TRANG CON - ĐÃ FIX HIỆU ỨNG TRƯỢT */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-10 relative">
          {/* Bỏ mode="wait" để trang không bị blank 1 nhịp */}
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 15 }}      
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}              
              transition={{ duration: 0.25, ease: "easeOut" }} 
              className="min-h-full"
            >
              <Outlet /> 
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default SchoolLayout;