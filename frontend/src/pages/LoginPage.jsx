import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Gọi API AuthController
      const response = await axiosClient.post('/auth/login', formData);
      
      if (response.data && response.data.code === 200) {
        setStatus('success');
        // Lưu AuthInfoModel (accessToken, refreshToken, role) vào localStorage
        const authInfo = response.data.data;
        localStorage.setItem('accessToken', authInfo.accessToken);
        localStorage.setItem('refreshToken', authInfo.refreshToken);
        localStorage.setItem('userRole', authInfo.role);
        
        // Chuyển hướng về trang chủ hoặc dashboard
        setTimeout(() => {
    // Nếu role là ADMIN (hoặc ROLE_ADMIN tùy Spring Boot sinh ra)
            if (authInfo.role === 'ADMIN') {
            navigate('/admin'); // Đẩy vào trang quản trị
            } else {
            navigate('/'); // Nếu là trường đại học thì đẩy về trang chủ (hoặc trang quản lý của trường)
            }
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage(response.data.message || 'Đăng nhập thất bại.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác.');
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
        <h2 className="text-3xl font-extrabold text-slate-900">Đăng nhập hệ thống</h2>
        <p className="mt-2 text-slate-500">Dành riêng cho Tổ chức và Trường Đại học</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập hoặc Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="Nhập username hoặc email..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium" placeholder="••••••••" />
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium text-center">
                {errorMessage}
              </div>
            )}
            
            {status === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium text-center">
                Đăng nhập thành công! Đang chuyển hướng...
              </div>
            )}

            <button type="submit" disabled={status === 'loading' || status === 'success'} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed">
              {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'} 
              {status !== 'loading' && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Tổ chức của bạn chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition-all">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;