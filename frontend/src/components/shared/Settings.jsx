import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldCheck, KeyRound, Timer, Send, CheckCircle2, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function Settings({
  title ,
  subtitle ,
  apiProfileUrl , 
  apiBaseUrl ,
  theme // Nhận 'blue' (School) hoặc 'indigo' (Admin)
}) {
  const [activeTab, setActiveTab] = useState('email'); 
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');

  const [emailData, setEmailData] = useState({ newEmail: '', otp: '' });
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // BỘ MÀU SẮC ĐỘNG THEO THEME
  const colorMap = {
    blue: {
      text: 'text-blue-600', bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-700',
      lightBg: 'bg-blue-50', border: 'border-blue-200', borderActive: 'border-blue-600',
      focusBorder: 'focus:border-blue-500', ring: 'focus:ring-blue-500/10',
      otpRing: 'focus:ring-blue-500/20', textDark: 'text-blue-900',
      shadow: 'shadow-blue-600/20', textInput: 'text-blue-700'
    },
    indigo: {
      text: 'text-indigo-600', bg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-700',
      lightBg: 'bg-indigo-50', border: 'border-indigo-200', borderActive: 'border-indigo-600',
      focusBorder: 'focus:border-indigo-500', ring: 'focus:ring-indigo-500/10',
      otpRing: 'focus:ring-indigo-500/20', textDark: 'text-indigo-900',
      shadow: 'shadow-indigo-600/20', textInput: 'text-indigo-700'
    }
  };
  const c = colorMap[theme] || colorMap.blue;

  useEffect(() => {
    const fetchCurrentEmail = async () => {
      try {
        setLoadingProfile(true);
        const response = await axiosClient.get(apiProfileUrl); 
        if (response.data && response.data.code === 200) {
          setCurrentEmail(response.data.data.email || response.data.data.schoolEmail);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin email:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchCurrentEmail();
  }, [apiProfileUrl]);

  const handleEmailChange = (e) => setEmailData({ ...emailData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  useEffect(() => {
    let timer;
    if (timeLeft > 0) timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!emailData.newEmail) { alert("Vui lòng nhập địa chỉ email mới trước khi lấy mã xác nhận!"); return; }
    if (emailData.newEmail === currentEmail) { alert("Email mới không được trùng với email hiện tại!"); return; }

    try {
      setIsSendingOtp(true);
      const response = await axiosClient.post(`${apiBaseUrl}/change-email/send-otp`);
      if (response.data && response.data.code === 200) {
        alert(`Mã bảo mật đã được gửi đến email HIỆN TẠI của bạn (${currentEmail}). Vui lòng kiểm tra hộp thư!`);
        setOtpSent(true);
        setTimeLeft(60); 
      } else alert(response.data.message || "Gửi OTP thất bại!");
    } catch (error) { alert(error.response?.data?.message || "Có lỗi xảy ra khi kết nối tới máy chủ!");
    } finally { setIsSendingOtp(false); }
  };

  const handleVerifyAndChangeEmail = async (e) => {
    e.preventDefault();
    if (!emailData.otp) { alert("Vui lòng nhập mã OTP gồm 6 số!"); return; }

    try {
      setIsVerifyingEmail(true);
      const response = await axiosClient.post(`${apiBaseUrl}/change-email/verify`, {
        newEmail: emailData.newEmail, otp: emailData.otp
      });
      if (response.data && response.data.code === 200) {
        alert("Xác thực thành công! Đã cập nhật sang địa chỉ Email mới.");
        setCurrentEmail(emailData.newEmail); 
        setOtpSent(false); setTimeLeft(0); setEmailData({ newEmail: '', otp: '' });
      } else alert(response.data.message || "Mã OTP không chính xác hoặc đã hết hạn!");
    } catch (error) { alert(error.response?.data?.message || "Xác thực không thành công. Vui lòng thử lại!");
    } finally { setIsVerifyingEmail(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Vui lòng điền đầy đủ các trường mật khẩu!"); return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận mới không trùng khớp!"); return;
    }

    try {
      setIsUpdatingPassword(true);
      const response = await axiosClient.post(`${apiBaseUrl}/change-password`, {
        oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword, confirmPassword: passwordData.confirmPassword
      });
      if (response.data && response.data.code === 200) {
        alert("Thay đổi mật khẩu thành công!");
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else alert(response.data.message || "Mật khẩu cũ không chính xác!");
    } catch (error) { alert(error.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại dữ liệu!");
    } finally { setIsUpdatingPassword(false); }
  };

  // ================= GIAO DIỆN CHÍNH (GIỮ NGUYÊN FORMAT 100%) =================
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className={`p-3 ${c.lightBg} ${c.text} rounded-xl`}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="flex border-b border-slate-100">
          <button 
            type="button" onClick={() => setActiveTab('email')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'email' ? `${c.text} border-b-2 ${c.borderActive} ${c.lightBg}/50` : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Mail size={18} /> Đổi Email
          </button>
          <button 
            type="button" onClick={() => setActiveTab('password')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'password' ? `${c.text} border-b-2 ${c.borderActive} ${c.lightBg}/50` : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <KeyRound size={18} /> Đổi Mật Khẩu
          </button>
        </div>

        {/* TAB ĐỔI EMAIL */}
        {activeTab === 'email' && (
          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="text-amber-500 mt-0.5" size={20} />
              <p className="text-sm text-amber-800 font-medium leading-relaxed">
                Để đảm bảo an toàn, mã xác nhận sẽ được gửi về <strong className="text-amber-900">Email hiện tại</strong> của bạn. Vui lòng kiểm tra hộp thư để lấy mã.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email hiện tại (Nhận mã OTP)</label>
              {loadingProfile ? (
                <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4">
                  <Loader2 className="animate-spin text-slate-400 mr-2" size={16} />
                  <span className="text-sm text-slate-400 font-medium">Đang tải dữ liệu...</span>
                </div>
              ) : (
                <div className="px-4 py-3 font-semibold rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed">
                  {currentEmail || "Chưa cập nhật email"}
                </div>
              )}
            </div>

            <form onSubmit={otpSent ? handleVerifyAndChangeEmail : handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email mới muốn đổi</label>
                <div className="flex gap-3">
                  <input 
                    name="newEmail" type="email" value={emailData.newEmail} onChange={handleEmailChange} 
                    disabled={otpSent || isSendingOtp} placeholder="Nhập địa chỉ email mới..."
                    className={`flex-1 px-4 py-3 font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white ${c.focusBorder} focus:ring-4 ${c.ring} transition-all outline-none text-slate-700 disabled:opacity-60`} 
                  />
                  {!otpSent ? (
                    <button 
                      type="submit" disabled={isSendingOtp}
                      className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95 whitespace-nowrap flex items-center gap-2 disabled:opacity-75"
                    >
                      {isSendingOtp ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Gửi OTP
                    </button>
                  ) : (
                    <button 
                      type="button" disabled={timeLeft > 0 || isSendingOtp} onClick={handleSendOTP}
                      className={`px-6 py-3 font-bold rounded-xl border transition-all whitespace-nowrap flex items-center gap-2 ${
                        timeLeft > 0 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : `bg-white ${c.text} ${c.border} hover:${c.lightBg} hover:shadow-md`
                      }`}
                    >
                      <Timer size={16} /> {timeLeft > 0 ? `Gửi lại sau (${timeLeft}s)` : 'Gửi lại mã'}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className={`p-5 ${c.lightBg}/50 border ${c.border} rounded-xl space-y-4 animate-in zoom-in-95 duration-300`}>
                  <label className={`block text-sm font-bold ${c.textDark} mb-2`}>
                    Nhập mã OTP đã gửi về Email cũ
                  </label>
                  <input 
                    name="otp" value={emailData.otp} onChange={handleEmailChange} maxLength={6} disabled={isVerifyingEmail} placeholder="VD: 123456"
                    className={`w-full px-4 py-3 font-bold tracking-widest text-center text-xl rounded-xl border ${c.border} ${c.focusBorder} focus:ring-4 ${c.otpRing} outline-none ${c.textInput} placeholder:text-slate-300 placeholder:font-normal`}
                  />
                  <button 
                    type="submit" disabled={isVerifyingEmail}
                    className={`w-full py-3 ${c.bg} text-white font-bold rounded-xl ${c.hoverBg} transition shadow-lg ${c.shadow} active:scale-95 flex items-center justify-center gap-2 disabled:opacity-75`}
                  >
                    {isVerifyingEmail ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Xác nhận đổi Email
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB ĐỔI MẬT KHẨU */}
        {activeTab === 'password' && (
           <form onSubmit={handleChangePassword} className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="space-y-6">
             <div>
               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                 <input 
                   type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} disabled={isUpdatingPassword} placeholder="Nhập mật khẩu hiện tại..." 
                   className={`w-full pl-11 pr-4 py-3 font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white ${c.focusBorder} focus:ring-4 ${c.ring} transition-all outline-none text-slate-700 disabled:opacity-60`} 
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                 <input 
                   type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} disabled={isUpdatingPassword} placeholder="Mật khẩu mới..." 
                   className={`w-full px-4 py-3 font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white ${c.focusBorder} focus:ring-4 ${c.ring} transition-all outline-none text-slate-700 disabled:opacity-60`} 
                 />
               </div>
               <div>
                 <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Xác nhận mật khẩu</label>
                 <input 
                   type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} disabled={isUpdatingPassword} placeholder="Nhập lại mật khẩu mới..." 
                   className={`w-full px-4 py-3 font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white ${c.focusBorder} focus:ring-4 ${c.ring} transition-all outline-none text-slate-700 disabled:opacity-60`} 
                 />
               </div>
             </div>
           </div>

           <div className="pt-6 border-t border-slate-100 flex justify-end">
             <button 
               type="submit" disabled={isUpdatingPassword}
               className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95 text-sm flex items-center gap-2 disabled:opacity-75"
             >
               {isUpdatingPassword ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />} Lưu mật khẩu mới
             </button>
           </div>
         </form>
        )}

      </div>
    </div>
  );
}