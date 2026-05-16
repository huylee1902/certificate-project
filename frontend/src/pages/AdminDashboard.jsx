import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building, UserCircle, LogOut, 
  CheckCircle, XCircle, Search, Key, Mail, ShieldCheck, FileText, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import axiosClient from '../api/axiosClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dữ liệu Tổng quan Dashboard (Sẽ lấy từ API sau)
  const [stats, setStats] = useState({
    pendingSchools: 0,
    approvedSchools: 0,
    totalCerts: 0
  });

  const [chartData, setChartData] = useState([
    { name: 'T1', requests: 120 }, { name: 'T2', requests: 300 },
    { name: 'T3', requests: 200 }, { name: 'T4', requests: 450 },
    { name: 'T5', requests: 380 }, { name: 'T6', requests: 600 }
  ]);
  
  // Quản lý trường học
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  // Hồ sơ Admin
  const [profileForm, setProfileForm] = useState({ 
    email: 'admin@certichain.vn', oldPassword: '', newPassword: '', confirmPassword: '' 
  });
  const [profileMessage, setProfileMessage] = useState('');

  // Fetch dữ liệu khi chuyển tab
  useEffect(() => {
    if (activeTab === 'schools') {
      fetchSchools();
    } else if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Gọi API lấy Thống kê Dashboard (Bạn cần viết API này ở Backend)
  const fetchDashboardStats = async () => {
    try {
      const response = await axiosClient.get('/schools/dashboard-stats'); 
      if (response.data && response.data.code === 200) {
          setStats(response.data.data.stats);
          setChartData(response.data.data.chart);
        }
      
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard", error);
    }
  };

  // GỌI API THẬT: Lấy danh sách trường học từ SchoolController
  const fetchSchools = async () => {
    setLoadingSchools(true);
    try {
      const response = await axiosClient.get('/schools');
      if (response.data && response.data.code === 200) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách trường", error);
      // Fallback mock data nếu API chưa sẵn sàng
      setSchools([
        { id: 1, schoolCode: 'HUST', schoolName: 'Đại học Bách Khoa Hà Nội', schoolEmail: 'admin@hust.edu.vn', schoolAddress: 'Số 1 Đại Cồ Việt', status: 'PENDING' }
      ]);
    } finally {
      setLoadingSchools(false);
    }
  };

  // GỌI API THẬT: Duyệt hoặc Từ chối trường
  const handleUpdateSchoolStatus = async (schoolId, newStatus) => {
    const actionName = newStatus === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI';
    if (!window.confirm(`Bạn có chắc muốn ${actionName} tổ chức này?`)) return;
    
    try {
      // Dựa vào newStatus để quyết định gọi /approve hay /reject
      const endpoint = newStatus === 'APPROVED' 
            ? `/schools/${schoolId}/approve` 
            : `/schools/${schoolId}/reject`;

      await axiosClient.put(endpoint);
      
      setSchools(schools.map(s => s.id === schoolId ? { ...s, status: newStatus } : s));
      setShowSchoolModal(false);
      alert(`Đã cập nhật trạng thái thành: ${newStatus}`);
      fetchDashboardStats(); 
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại!");
    }
  };

  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setShowSchoolModal(true);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileMessage('Mật khẩu mới không khớp!');
      return;
    }
    setProfileMessage('Tính năng cập nhật hồ sơ đang được hoàn thiện!');
    setProfileForm({ ...profileForm, oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch token
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold border border-yellow-200">Chờ duyệt</span>;
      case 'APPROVED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold border border-emerald-200">Đã duyệt</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-bold border border-rose-200">Từ chối</span>;
      case 'SUSPENDED': return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-bold border border-slate-200">Đình chỉ</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">{status}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
          <ShieldCheck className="h-9 w-9 text-blue-500" />
          <div>
            <span className="font-extrabold text-2xl tracking-tight block">Admin Portal</span>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">CertiChain System</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-3">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <LayoutDashboard className="h-5 w-5" /> Tổng quan
          </button>
          <button onClick={() => setActiveTab('schools')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'schools' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <Building className="h-5 w-5" /> Quản lý Tổ chức
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
            <UserCircle className="h-5 w-5" /> Hồ sơ cá nhân
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition-all">
            <LogOut className="h-5 w-5" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto relative">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md px-10 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-extrabold text-slate-800">
            {activeTab === 'dashboard' && 'Tổng quan Hệ thống'}
            {activeTab === 'schools' && 'Quản lý Tổ chức & Trường Đại học'}
            {activeTab === 'profile' && 'Cài đặt Hồ sơ'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">Super Admin</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Trực tuyến
              </div>
            </div>
            <div className="h-11 w-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
              AD
            </div>
          </div>
        </div>

        <div className="p-10">
          
          {/* ================= TAB 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
                  <div className="bg-yellow-50 p-4 rounded-2xl"><FileText className="h-8 w-8 text-yellow-600" /></div>
                  <div>
                    <div className="text-slate-500 text-sm font-bold uppercase mb-1">Trường chờ duyệt</div>
                    <div className="text-4xl font-black text-slate-800">{stats.pendingSchools}</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
                  <div className="bg-blue-50 p-4 rounded-2xl"><Building className="h-8 w-8 text-blue-600" /></div>
                  <div>
                    <div className="text-slate-500 text-sm font-bold uppercase mb-1">Trường đang hoạt động</div>
                    <div className="text-4xl font-black text-slate-800">{stats.approvedSchools}</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
                  <div className="bg-emerald-50 p-4 rounded-2xl"><Activity className="h-8 w-8 text-emerald-600" /></div>
                  <div>
                    <div className="text-slate-500 text-sm font-bold uppercase mb-1">Tổng bằng đã cấp</div>
                    <div className="text-4xl font-black text-slate-800">{stats.totalCerts}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-8">Biểu đồ yêu cầu cấp phát (6 tháng qua)</h3>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600, fontSize: 14}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dx={-10}/>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                        itemStyle={{color: '#2563eb'}}
                      />
                      <Line type="monotone" dataKey="requests" name="Số lượng văn bằng" stroke="#2563eb" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff', stroke: '#2563eb'}} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: QUẢN LÝ TRƯỜNG ================= */}
          {activeTab === 'schools' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="relative w-96">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input type="text" placeholder="Tìm kiếm theo mã, tên trường..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-semibold transition-all shadow-sm" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-200">
                      <th className="p-5 pl-8">Mã Trường</th>
                      <th className="p-5">Tên Tổ chức / Trường</th>
                      <th className="p-5">Email Liên hệ</th>
                      <th className="p-5">Trạng thái</th>
                      <th className="p-5 text-center pr-8">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingSchools ? (
                      <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-bold flex items-center justify-center gap-2"><Activity className="animate-spin h-5 w-5"/> Đang tải dữ liệu...</td></tr>
                    ) : schools.map((school) => (
                      <tr key={school.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-5 pl-8 font-black text-slate-800">{school.schoolCode}</td>
                        <td className="p-5 font-bold text-slate-700">{school.schoolName}</td>
                        <td className="p-5 text-slate-500 font-medium">{school.schoolEmail}</td>
                        <td className="p-5">{getStatusBadge(school.status)}</td>
                        <td className="p-5 text-center pr-8">
                          <button 
                            onClick={() => handleViewDetails(school)} 
                            className="px-5 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                    {schools.length === 0 && !loadingSchools && (
                      <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-medium">Chưa có tổ chức nào đăng ký.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: HỒ SƠ ================= */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-10 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg rotate-3">
                      AD
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-800 mb-1">Quản trị viên Hệ thống</h2>
                      <p className="text-slate-500 font-medium flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500"/> Toàn quyền kiểm soát và phê duyệt
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-10 space-y-6">
                  {profileMessage && (
                    <div className="p-4 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5"/> {profileMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Quản trị (Dùng để nhận thông báo)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-700" />
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Key className="w-6 h-6 text-blue-500" /> Đổi mật khẩu bảo mật
                    </h3>
                    
                    <div className="space-y-5">
                      <input type="password" name="oldPassword" placeholder="Mật khẩu hiện tại" value={profileForm.oldPassword} onChange={handleProfileChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 font-medium text-slate-700" />
                      <div className="grid grid-cols-2 gap-5">
                        <input type="password" name="newPassword" placeholder="Mật khẩu mới" value={profileForm.newPassword} onChange={handleProfileChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 font-medium text-slate-700" />
                        <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu mới" value={profileForm.confirmPassword} onChange={handleProfileChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 font-medium text-slate-700" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 text-lg mt-4">
                    Lưu Thay Đổi
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL HIỂN THỊ CHI TIẾT TRƯỜNG ================= */}
      {showSchoolModal && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          {/* Thêm hiệu ứng trượt lên cho Modal */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600"/> Chi tiết Hồ sơ Tổ chức
              </h3>
              <button onClick={() => setShowSchoolModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-1 rounded-full shadow-sm">
                <XCircle className="w-7 h-7" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mã Tổ chức</p>
                  <p className="text-xl font-black text-slate-800">{selectedSchool.schoolCode}</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái hiện tại</p>
                  <div className="mt-1">{getStatusBadge(selectedSchool.status)}</div>
                </div>

                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tên Trường / Tổ chức</p>
                  <p className="text-xl font-bold text-slate-800">{selectedSchool.schoolName}</p>
                </div>
                
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Địa chỉ trụ sở</p>
                  <p className="text-lg font-medium text-slate-800">{selectedSchool.schoolAddress || 'Chưa cập nhật'}</p>
                </div>
                
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><Mail className="w-5 h-5 text-blue-500"/></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email liên hệ</p>
                    <p className="text-lg font-bold text-slate-800">{selectedSchool.schoolEmail}</p>
                  </div>
                </div>
              </div>

              {/* Khu vực thống kê nhanh (chỉ hiện khi đã được duyệt) */}
              {selectedSchool.status === 'APPROVED' && (
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
                   <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100">
                     <p className="text-emerald-700 font-bold uppercase text-xs tracking-wider mb-2">Văn bằng đã cấp</p>
                     <p className="text-4xl font-black text-emerald-600">{selectedSchool.totalIssued || 0}</p>
                   </div>
                   <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-5 rounded-2xl border border-rose-100">
                     <p className="text-rose-700 font-bold uppercase text-xs tracking-wider mb-2">Văn bằng bị thu hồi</p>
                     <p className="text-4xl font-black text-rose-600">{selectedSchool.totalRevoked || 0}</p>
                   </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Các nút hành động) */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button 
                onClick={() => setShowSchoolModal(false)} 
                className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
              >
                Đóng
              </button>
              
              {/* Chỉ hiển thị nút Duyệt/Từ chối nếu trường đang ở trạng thái PENDING */}
              {selectedSchool.status === 'PENDING' && (
                <>
                  <button 
                    onClick={() => handleUpdateSchoolStatus(selectedSchool.id, 'REJECTED')} 
                    className="px-6 py-3 font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                  >
                    <XCircle className="w-5 h-5"/> Từ chối
                  </button>
                  <button 
                    onClick={() => handleUpdateSchoolStatus(selectedSchool.id, 'APPROVED')} 
                    className="px-6 py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 border border-emerald-600 rounded-xl transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5"/> Phê duyệt Hồ sơ
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;