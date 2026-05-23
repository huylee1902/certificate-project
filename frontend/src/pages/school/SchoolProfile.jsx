import React, { useState, useEffect } from 'react';
import { Building, Mail, MapPin, Edit3, Save, X, User, AlertTriangle, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient'; // Đảm bảo import đúng đường dẫn axiosClient của bạn

export default function Profile() {
  const [profile, setProfile] = useState({ 
    schoolCode: '', 
    schoolName: '', 
    email: '', 
    address: '',
    rectorName: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State để hiển thị loading

  // 1. GỌI API LẤY THÔNG TIN TRƯỜNG KHI VỪA VÀO TRANG
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Sửa lại endpoint '/api/school/profile' cho khớp với Backend của bạn
        const response = await axiosClient.get('/school/profile'); 
        
        if (response.data && response.data.code === 200) {
          setProfile(response.data.data); // Đổ dữ liệu từ CSDL vào Form
        }
      } catch (error) {
        console.error("Lỗi tải thông tin hồ sơ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => setProfile({...profile, [e.target.name]: e.target.value});
  
  // 2. GỌI API ĐỂ CẬP NHẬT THÔNG TIN LÊN CSDL
  const handleSave = async (e) => { 
    e.preventDefault(); 
    try {
      // Gọi API cập nhật - Chú ý chỉ gửi những trường cho phép sửa (address, principal)
      const response = await axiosClient.put('/school/profile', {
        address: profile.address,
        rectorName: profile.rectorName,
      });

      if (response.data && response.data.code === 200) {
        alert("Cập nhật hồ sơ thành công! Đã đủ điều kiện cấp phát văn bằng.");
        setIsEditing(false); 
      }
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      alert("Cập nhật thất bại. Vui lòng kiểm tra lại!");
    }
  };

  // Màn hình chờ khi đang call API
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-3xl relative">
        <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-md">
          <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-blue-600">
            <Building size={48} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="bg-white px-8 pt-16 pb-8 rounded-b-3xl shadow-sm border border-t-0 border-slate-100 mb-8">
        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{profile.schoolName || 'Đang cập nhật...'}</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1.5">
              Mã trường: <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold">{profile.schoolCode || 'N/A'}</span>
            </p>
          </div>
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95 text-sm">
              <Edit3 size={16} /> Cập nhật thông tin
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition text-sm">
                <X size={16} /> Hủy
              </button>
              <button type="button" onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 active:scale-95 text-sm">
                <Save size={16} /> Lưu thay đổi
              </button>
            </div>
          )}
        </div>

        <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tên trường - ĐÃ KHÓA */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tên Tổ chức / Trường học</label>
              <div className="relative">
                <Building className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  value={profile.schoolName || ''} 
                  readOnly 
                  className="w-full pl-11 pr-4 py-3 font-bold rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" 
                />
              </div>
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                <AlertTriangle size={14}/> Tên đơn vị không thể tự thay đổi. Vui lòng liên hệ Admin.
              </p>
            </div>
            
            {/* Tên Hiệu trưởng - CÓ THỂ SỬA */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tên Hiệu trưởng</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  name="rectorName" 
                  value={profile.rectorName || ''} 
                  onChange={handleChange} 
                  readOnly={!isEditing} 
                  placeholder="Nhập tên Hiệu trưởng..."
                  className={`w-full pl-11 pr-4 py-3 font-semibold rounded-xl border transition-all duration-300 outline-none ${isEditing ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white text-slate-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`} 
                />
              </div>
            </div>

            {/* Địa chỉ - CÓ THỂ SỬA */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ trụ sở</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  name="address" 
                  value={profile.address || ''} 
                  onChange={handleChange} 
                  readOnly={!isEditing} 
                  placeholder="Nhập địa chỉ trường..."
                  className={`w-full pl-11 pr-4 py-3 font-semibold rounded-xl border transition-all duration-300 outline-none ${isEditing ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white text-slate-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`} 
                />
              </div>
            </div>

            {/* Email - ĐÃ KHÓA */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email hệ thống</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  value={profile.email || ''} 
                  readOnly 
                  className="w-full pl-11 pr-4 py-3 font-bold rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" 
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Bạn có thể thay đổi Email và Mật khẩu tại mục <span className="font-bold text-slate-700">Cài đặt hệ thống</span>.</p>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}