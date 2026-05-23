import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100"
      >
        {/* Icon Cảnh báo chuyển động */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 rounded-2xl text-red-500 relative">
            <ShieldAlert className="h-16 w-16" />
            <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        </div>

        {/* Tiêu đề mã lỗi */}
        <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-2">403</h1>
        <h2 className="text-xl font-extrabold text-slate-800 mb-3">Truy cập bị từ chối!</h2>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Tài khoản của bạn không có đủ đặc quyền để xem nội dung trang này. Vui lòng liên hệ Quản trị viên hệ thống nếu bạn nghĩ đây là một sự nhầm lẫn.
        </p>

        {/* Các nút xử lý nhanh */}
        <div className="space-y-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md active:scale-98"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại trang trước
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all active:scale-98"
          >
            <Home className="h-4 w-4" /> Về trang chủ công khai
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForbiddenPage;