import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Award, Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, KeyRound, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // QUẢN LÝ VIEW: 'LOGIN' | '2FA_OTP' | 'FORGOT_EMAIL' | 'FORGOT_OTP' | 'RESET_PASSWORD'
  const [view, setView] = useState('LOGIN'); 

  // STATES DỮ LIỆU
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [twoFaOtp, setTwoFaOtp] = useState(''); 
  
  // STATES QUÊN MẬT KHẨU
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [countdown, setCountdown] = useState(0);

  // STATES TRẠNG THÁI
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // Bắt thông báo từ route
  useEffect(() => {
    if (location.state && location.state.alertMessage) {
      setAlertMsg(location.state.alertMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // EFFECT ĐẾM NGƯỢC 
  useEffect(() => {
    let timer;
    if (countdown > 0 && (view === 'FORGOT_OTP' || view === '2FA_OTP')) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, view]);

  const switchView = (newView) => {
      setView(newView);
      setStatus('idle');
      setErrorMessage('');
      setAlertMsg('');
  };

  const processSuccessfulLogin = (authInfo) => {
    setStatus('success');
    const token = authInfo.accessToken || authInfo.token;
    localStorage.setItem('accessToken', token);
    
    const rawRole = authInfo.role || authInfo.roles?.[0]; 
    const userRole = rawRole && rawRole.startsWith('ROLE_') ? rawRole.replace('ROLE_', '') : rawRole;
    localStorage.setItem('userRole', userRole);
    if (authInfo.username) localStorage.setItem('username', authInfo.username);
    
    setTimeout(() => {
        if (userRole === 'ADMIN') navigate('/admin'); 
        else if (userRole === 'SCHOOL') navigate('/school/dashboard'); 
        else navigate('/'); 
    }, 500);
  };

  // ==================== LUỒNG 1: ĐĂNG NHẬP ====================
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setStatus('loading'); setErrorMessage(''); setAlertMsg('');
    
    try {
      const loginPayload = {
          username: formData.email, 
          password: formData.password
      };

      const response = await axiosClient.post('/auth/login', loginPayload);
      
      if (response.data && response.data.code === 200) {
          const resData = response.data.data;
          const resMsg = response.data.message;

          if (resMsg === 'OTP_REQUIRED' || resData === 'OTP_REQUIRED' || (!resData?.accessToken && !resData?.token)) {
              switchView('2FA_OTP'); 
              setCountdown(60);
              setAlertMsg('Mã xác thực 2 yếu tố đã được gửi đến email.');
          } else {
              processSuccessfulLogin(resData);
          }
      } 
      else if (response.data && response.data.message === 'OTP_REQUIRED') {
          switchView('2FA_OTP');
          setCountdown(60);
          setAlertMsg('Mã xác thực 2 yếu tố đã được gửi đến email.');
      }
      else if (response.data && response.data.code !== 200) {
          setStatus('error');
          setErrorMessage(response.data.message || 'Tài khoản hoặc mật khẩu không đúng.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data;
      
      if (errorMsg === 'OTP_REQUIRED') {
          switchView('2FA_OTP');
          setCountdown(60);
          setAlertMsg('Mã xác thực 2 yếu tố đã được gửi đến email.');
          return; 
      }

      if (typeof errorMsg === 'string' && (errorMsg.includes('quá nhanh') || errorMsg.includes('đợi'))) {
          switchView('2FA_OTP');
          const seconds = errorMsg.match(/\d+/);
          setCountdown(seconds ? parseInt(seconds[0]) : 60);
          setAlertMsg('Mã OTP cũ vẫn còn hiệu lực. Vui lòng kiểm tra email của bạn!');
          return;
      }

      setStatus('error');
      setErrorMessage(typeof errorMsg === 'string' ? errorMsg : 'Tài khoản hoặc mật khẩu không đúng.');
    }
  };

  const handle2FAOtpChange = async (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setTwoFaOtp(val);

    if (val.length === 6) {
        setStatus('loading'); setErrorMessage('');
        try {
            const response = await axiosClient.post('/auth/verify-otp', { 
                email: formData.email, 
                otp: val 
            });

            if (response.data && response.data.code === 200) {
                const authInfo = response.data.data || response.data.result;
                processSuccessfulLogin(authInfo); 
            } else {
                setStatus('error');
                setErrorMessage(response.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
                setTwoFaOtp('');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data;
            setStatus('error');
            setErrorMessage(typeof errorMsg === 'string' ? errorMsg : 'Mã OTP không chính xác.');
            setTwoFaOtp(''); 
        }
    } else {
        if (status === 'error') setErrorMessage('');
    }
  };

  // ==================== LUỒNG 2: QUÊN MẬT KHẨU ====================
  const handleRequestResetOtp = async (e) => {
    if(e) e.preventDefault();
    setStatus('loading'); setErrorMessage('');
    try {
        const response = await axiosClient.post('/auth/forgot-password', { email: forgotData.email });
        
        if (response.data && response.data.code !== 200 && response.data.code) {
            setStatus('error');
            setErrorMessage(response.data.message || 'Lỗi gửi yêu cầu.');
            return;
        }

        switchView('FORGOT_OTP');
        setCountdown(60); 
        setAlertMsg('Mã xác thực đã được gửi đến email của bạn.');
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data;

        if (typeof errorMsg === 'string' && (errorMsg.includes('quá nhanh') || errorMsg.includes('đợi'))) {
            switchView('FORGOT_OTP');
            const seconds = errorMsg.match(/\d+/);
            setCountdown(seconds ? parseInt(seconds[0]) : 60);
            setAlertMsg('Mã OTP cũ vẫn còn hiệu lực. Vui lòng kiểm tra email của bạn!');
            return;
        }

        setStatus('error');
        setErrorMessage(typeof errorMsg === 'string' ? errorMsg : 'Email không tồn tại hoặc lỗi hệ thống.');
    }
  };

  const handleOtpChange = async (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForgotData({ ...forgotData, otp: val });

    if (val.length === 6) {
        setStatus('loading'); setErrorMessage('');
        try {
            const response = await axiosClient.post('/auth/forgot-password/verify', { 
                email: forgotData.email, 
                otp: val 
            });
            
            if (response.data && response.data.code === 200) {
                switchView('RESET_PASSWORD'); 
            } else {
                setStatus('error');
                setErrorMessage(response.data?.message || 'Mã OTP không hợp lệ.');
                setForgotData(prev => ({ ...prev, otp: '' })); 
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data;
            setStatus('error');
            setErrorMessage(typeof errorMsg === 'string' ? errorMsg : 'Mã OTP không chính xác hoặc đã hết hạn.');
            setForgotData(prev => ({ ...prev, otp: '' })); 
        }
    } else {
        if (status === 'error') setErrorMessage('');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmPassword) {
        setStatus('error');
        setErrorMessage('Mật khẩu xác nhận không trùng khớp!');
        return;
    }

    setStatus('loading'); setErrorMessage('');
    try {
        const response = await axiosClient.post('/auth/forgot-password/reset', { 
            email: forgotData.email, 
            otp: forgotData.otp, 
            newPassword: forgotData.newPassword,
            confirmPassword: forgotData.confirmPassword
        });
        
        if (response.data && response.data.code !== 200 && response.data.code) {
            setStatus('error');
            setErrorMessage(response.data.message || 'Lỗi cập nhật mật khẩu.');
            return;
        }

        setStatus('success');
        setAlertMsg('Đổi mật khẩu thành công! Đang quay lại trang đăng nhập...');
        setTimeout(() => {
            setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
            switchView('LOGIN');
        }, 3000);
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data;
        setStatus('error');
        setErrorMessage(typeof errorMsg === 'string' ? errorMsg : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200 relative">
      
      {/* NÚT QUAY VỀ TRANG CHỦ QUICK-LINK */}
      <div className="absolute top-6 left-6 hidden sm:block">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 hover:text-slate-950 transition-all">
          <Home className="w-4 h-4" /> Quay lại Trang chủ
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in-up">
        {/* CLICK VÀO LOGO CŨNG QUAY VỀ HOME-PAGE */}
        <Link to="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="bg-blue-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-blue-600/20">
            <Award className="h-7 w-7 text-white" />
          </div>
          <span className="font-extrabold text-3xl text-slate-900 tracking-tight">CertiChain</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {view === 'LOGIN' && 'Đăng nhập hệ thống'}
            {view === '2FA_OTP' && 'Xác thực 2 yếu tố'}
            {view === 'FORGOT_EMAIL' && 'Khôi phục mật khẩu'}
            {view === 'FORGOT_OTP' && 'Nhập mã xác thực'}
            {view === 'RESET_PASSWORD' && 'Tạo mật khẩu mới'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Thông báo chung */}
          {alertMsg && (
            <div className={`mb-6 border px-4 py-3.5 rounded-xl flex items-start gap-3 text-sm font-medium ${status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> <span>{alertMsg}</span>
            </div>
          )}

          {/* VIEW ĐĂNG NHẬP */}
          {view === 'LOGIN' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                  <input type="text" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 outline-none" placeholder="Nhập email..." required />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Mật khẩu</label>
                    <button type="button" onClick={() => switchView('FORGOT_EMAIL')} className="text-sm font-bold text-blue-600 hover:underline">Quên mật khẩu?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 outline-none" placeholder="••••••••" required />
                </div>
              </div>
              
              {status === 'error' && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-medium">{errorMessage}</div>}
              
              <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center items-center py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/10 active:scale-[0.99] transition-transform">
                {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'} 
              </button>

              {/* 🛠️ THÊM ĐOẠN NÀY: NÚT ĐĂNG KÝ CHUYỂN TRANG */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600 font-medium">
                  Chưa có tài khoản hệ thống?{' '}
                  <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* VIEW XÁC THỰC 2 YẾU TỐ */}
          {view === '2FA_OTP' && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">
                  Mã 6 số đã được gửi đến email của bạn
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={6} 
                    autoFocus
                    required 
                    value={twoFaOtp} 
                    onChange={handle2FAOtpChange} 
                    disabled={status === 'loading'}
                    className={`block w-full py-4 bg-slate-50 border rounded-xl outline-none text-center text-2xl font-bold tracking-[0.75em] transition-colors ${status === 'error' ? 'border-rose-500 text-rose-600' : 'border-slate-200 text-slate-700'}`} 
                    placeholder="------" 
                  />
                </div>
              </div>
              
              <div className="min-h-[40px] flex justify-center items-center">
                {status === 'loading' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
                {status === 'error' && <p className="text-sm font-medium text-rose-600 animate-fade-in-up">{errorMessage}</p>}
              </div>
              
              <div className="text-center mt-2 text-sm font-medium">
                {countdown > 0 ? (
                  <span className="text-slate-500">Gửi lại mã sau {countdown}s</span>
                    ) : (
                      <button type="button" onClick={handleLogin} className="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto">
                        <RefreshCw className="w-4 h-4" /> Gửi lại mã OTP
                      </button>
                    )}
              </div>

              <div className="mt-4 flex justify-between items-center text-sm font-medium">
                <button type="button" onClick={() => { switchView('LOGIN'); setTwoFaOtp(''); }} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                </button>
              </div>
            </div>
          )}

          {/* VIEW: QUÊN MẬT KHẨU - NHẬP EMAIL */}
          {view === 'FORGOT_EMAIL' && (
            <form className="space-y-6" onSubmit={handleRequestResetOtp}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email tài khoản</label>
                <input type="email" required value={forgotData.email} onChange={(e) => setForgotData({...forgotData, email: e.target.value})} className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="school@edu.vn" />
              </div>
              {status === 'error' && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-medium">{errorMessage}</div>}
              <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center items-center py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Gửi mã xác thực'} 
              </button>
              <button type="button" onClick={() => switchView('LOGIN')} className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium mt-4">Quay lại đăng nhập</button>
            </form>
          )}

          {/* VIEW: QUÊN MẬT KHẨU - NHẬP OTP */}
          {view === 'FORGOT_OTP' && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">
                    Mã 6 số đã gửi tới {forgotData.email}
                </label>
                <input type="text" maxLength={6} autoFocus value={forgotData.otp} onChange={handleOtpChange} disabled={status === 'loading'} className={`block w-full py-4 bg-slate-50 border rounded-xl outline-none text-center text-2xl font-bold tracking-[0.75em] transition-colors ${status === 'error' ? 'border-rose-500 text-rose-600' : 'border-slate-200 text-slate-700'}`} placeholder="------" />
              </div>
              
              <div className="min-h-[40px] flex justify-center items-center">
                  {status === 'loading' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
                  {status === 'error' && <p className="text-sm font-medium text-rose-600 animate-fade-in-up">{errorMessage}</p>}
              </div>
              
              <div className="text-center mt-2 text-sm font-medium">
                  {countdown > 0 ? (
                      <span className="text-slate-500">Gửi lại mã sau {countdown}s</span>
                  ) : (
                      <button type="button" onClick={handleRequestResetOtp} className="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto">
                          <RefreshCw className="w-4 h-4" /> Gửi lại mã
                      </button>
                  )}
              </div>
              <button type="button" onClick={() => switchView('LOGIN')} className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium mt-4">Hủy</button>
            </div>
          )}

          {/* VIEW: QUÊN MẬT KHẨU - NHẬP MẬT KHẨU MỚI */}
          {view === 'RESET_PASSWORD' && (
            <form className="space-y-6 animate-fade-in-up" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-400" /></div>
                    <input type="password" required minLength={6} value={forgotData.newPassword} onChange={(e) => setForgotData({...forgotData, newPassword: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập mật khẩu mới" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ShieldCheck className="h-5 w-5 text-slate-400" /></div>
                    <input type="password" required minLength={6} value={forgotData.confirmPassword} onChange={(e) => setForgotData({...forgotData, confirmPassword: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập lại mật khẩu" />
                </div>
              </div>
              
              {status === 'error' && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-medium animate-fade-in-up">{errorMessage}</div>}
              
              <button type="submit" disabled={status === 'loading' || status === 'success'} className="w-full flex justify-center py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all">
                 {status === 'loading' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Đổi mật khẩu'} 
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
export default LoginPage;