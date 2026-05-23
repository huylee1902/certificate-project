import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Award, ArrowRight, Mail, Send, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const ActivatePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // Dùng useRef để ngăn React StrictMode gọi API 2 lần
  const isApiCalled = useRef(false);
  
  // Trạng thái cho việc kích hoạt
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Đang xử lý yêu cầu xác thực...');

  // Trạng thái cho việc Gửi lại email
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    // Nếu không có token hoặc API đã được gọi rồi thì dừng lại
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác thực trong đường dẫn.');
      return;
    }
    
    if (isApiCalled.current) return;
    isApiCalled.current = true; // Đánh dấu là đã gọi API

    const verifyToken = async () => {
      try {
        const response = await axiosClient.get(`/auth/activate?token=${token}`);
        if (response.data && response.data.code === 200) {
          setStatus('success');
          setMessage('Xác thực thành công! Tài khoản của Tổ chức đã được kích hoạt.');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Đường dẫn không hợp lệ hoặc đã hết hạn.');
        }
      } catch (error) {
        setStatus('error');
        // Bắt lỗi từ Backend (Lần 2 bấm vào hoặc quá hạn 24h)
        setMessage(error.response?.data?.message || 'Đường dẫn xác thực đã hết hạn hoặc được sử dụng.');
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendStatus('loading');
    setResendMessage('');
    
    try {
      const response = await axiosClient.post('/auth/resend-activation', { email });
      if (response.data && response.data.code === 200) {
        setResendStatus('success');
        setResendMessage(response.data.message || 'Đã gửi liên kết mới vào email của bạn!');
      } else {
        setResendStatus('error');
        setResendMessage(response.data.message || 'Không thể gửi lại email.');
      }
    } catch (error) {
      setResendStatus('error');
      setResendMessage(error.response?.data?.message || 'Không tìm thấy tài khoản hoặc đã kích hoạt từ trước.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="bg-blue-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
            <Award className="h-7 w-7 text-white" />
          </div>
          <span className="font-extrabold text-3xl text-slate-900 tracking-tight">CertiChain</span>
        </Link>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="bg-white py-12 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* ================= 1. TRẠNG THÁI: ĐANG XỬ LÝ ================= */}
          {status === 'loading' && (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-6" />
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Đang xác minh...</h2>
              <p className="text-slate-500 font-medium">{message}</p>
            </div>
          )}

          {/* ================= 2. TRẠNG THÁI: THÀNH CÔNG ================= */}
          {status === 'success' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Kích hoạt thành công!</h2>
              <p className="text-slate-500 font-medium mb-8">{message}</p>
              
              <Link to="/login" className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                Đến trang Đăng nhập <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* ================= 3. TRẠNG THÁI: LỖI (KÈM FORM GỬI LẠI EMAIL) ================= */}
          {status === 'error' && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-rose-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2 text-center">Kích hoạt thất bại</h2>
              <p className="text-rose-600 font-bold mb-8 text-center px-4 bg-rose-50 py-2 rounded-lg">{message}</p>
              
              <div className="w-full border-t border-slate-100 pt-8">
                {resendStatus === 'success' ? (
                  <div className="flex flex-col items-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                    <p className="text-emerald-700 font-bold text-center px-4">{resendMessage}</p>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-slate-800">Yêu cầu liên kết mới</h3>
                      <p className="text-sm text-slate-500 mt-1">Vui lòng nhập email đăng ký của trường để nhận lại liên kết (có hiệu lực 24 giờ).</p>
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input 
                        type="email" required 
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" 
                        placeholder="Nhập email của trường..." 
                      />
                    </div>

                    {resendStatus === 'error' && (
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" /> {resendMessage}
                      </div>
                    )}

                    <button 
                      type="submit" disabled={resendStatus === 'loading'} 
                      className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 transition-all"
                    >
                      {resendStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Gửi đường dẫn mới'} 
                      {!resendStatus && <Send className="w-4 h-4"/>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ActivatePage;