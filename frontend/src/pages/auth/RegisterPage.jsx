import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Mail, Lock, User, Building, ShieldCheck, Loader2, Hash, MapPin } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const RegisterPage = () => {
  const navigate = useNavigate();
  // Khởi tạo state khớp 100% với RegisterRequest.java
  const [formData, setFormData] = useState({
    schoolCode: '',
    schoolName: '',
    schoolAddress: '',
    schoolEmail: '',
    username: '',
    password: ''
  });
  
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản ở Frontend (Backend cũng đã có @Size và @NotBlank)
    if (formData.username.length < 3 || formData.username.length > 20) {
      setStatus('error');
      setMessage('Username phải có từ 3 đến 20 ký tự.');
      return;
    }
    if (formData.password.length < 8) {
      setStatus('error');
      setMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setStatus('loading');
    try {
      // Gửi request POST với body là formData
      const response = await axiosClient.post('/auth/register', formData);
      
      if (response.data && response.data.code === 200) {
        setStatus('success');
        setMessage('Đăng ký thành công! Vui lòng chờ Admin phê duyệt để có thể đăng nhập.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Đăng ký thất bại. Thông tin có thể đã tồn tại.');
      }
    } catch (error) {
      setStatus('error');
      // Bắt lỗi từ backend trả về (ví dụ: validation errors)
      setMessage(error.response?.data?.message || 'Có lỗi kết nối đến server hoặc dữ liệu không hợp lệ.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in-up">
        <Link to="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="bg-blue-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
            <Award className="h-7 w-7 text-white" />
          </div>
          <span className="font-extrabold text-3xl text-slate-900 tracking-tight">CertiChain</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900">Đăng ký Tổ chức</h2>
        <p className="mt-2 text-slate-500">Tham gia mạng lưới xác thực văn bằng Blockchain</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Mã Trường */}
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Mã trường</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="schoolCode" required value={formData.schoolCode} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="VD: HUST" />
                </div>
              </div>

              {/* Tên Trường */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên trường / Tổ chức</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="schoolName" required value={formData.schoolName} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="VD: Đại học Bách Khoa Hà Nội" />
                </div>
              </div>
            </div>

            {/* Địa chỉ trường */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ trụ sở</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" name="schoolAddress" required value={formData.schoolAddress} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="VD: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tên đăng nhập */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="username" required minLength="3" maxLength="20" value={formData.username} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="school_admin" />
                </div>
              </div>
              
              {/* Email trường (schoolEmail) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email liên hệ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="email" name="schoolEmail" required value={formData.schoolEmail} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="admin@hust.edu.vn" />
                </div>
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" name="password" required minLength="8" value={formData.password} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="Ít nhất 8 ký tự" />
              </div>
            </div>

            {/* Hiển thị thông báo Lỗi / Thành công */}
            {status === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium text-center">
                {message}
              </div>
            )}
            
            {status === 'success' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium text-center flex flex-col items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
                {message}
              </div>
            )}

            {/* Nút Submit */}
            <button type="submit" disabled={status === 'loading' || status === 'success'} className="w-full mt-2 flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">
              {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng Ký'} 
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Tổ chức của bạn đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition-all">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;