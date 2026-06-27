import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Info, BarChart3, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

// 🌟 IMPORT 3 FILE TABS ĐÃ TÁCH
import GeneralInfoTab from '../../components/admin/GeneralInfoTab';
import AnalyticsTab from '../../components/admin/AnalyticsTab';
import AuditLogTab from '../../components/admin/AuditLogTab';

const SchoolDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState(null);

  const tabs = [
    { id: 'info', label: 'Thông tin trường', icon: Info },
    { id: 'analytics', label: 'Biểu đồ cấp phát', icon: BarChart3 },
    { id: 'history', label: 'Lịch sử hoạt động', icon: Clock },
  ];

  useEffect(() => {
    fetchSchoolDetail();
  }, [id]);

  const fetchSchoolDetail = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/admin/schools/${id}/analytics`);
      if (response.data && response.data.code === 200) {
        setSchoolData(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu chi tiết trường", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN XUỐNG BACKEND ---
  const handleAction = async (actionName, targetStatus) => {
    const actionText = targetStatus === 'SUSPENDED' ? 'KHÓA' : 'MỞ KHÓA';
    if (!window.confirm(`Xác nhận thực hiện hành động ${actionText} tài khoản này?`)) return;

    try {
      // Gọi API PUT xuống backend (Thay đổi URL /schools hoặc /admin/schools tùy thiết kế API của bạn nhé)
      await axiosClient.put(`/admin/${id}/${actionName}`);
      
      // Cập nhật state cục bộ ngay lập tức để UI thay đổi Badge và Nút bấm theo thời gian thực
      setSchoolData(prev => ({
        ...prev,
        info: {
          ...prev.info,
          status: targetStatus
        }
      }));
      
      alert(`${actionText} tài khoản thành công!`);
      fetchSchoolDetail();
    } catch (error) {
      alert(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Đang tải dữ liệu hệ thống...</div>;
  if (!schoolData) return <div className="text-center text-rose-500 p-10">Không tìm thấy tổ chức trường học này!</div>;

  // Lấy data đã gom nhóm từ API Backend
  const { info, stats } = schoolData;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Nút quay lại */}
      <button onClick={() => navigate('/admin/schools')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold">
        <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* CARD KHUNG CHÍNH LỚN */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* HEADER BANNER */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{info?.schoolName}</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider whitespace-nowrap border ${
                  info?.status === 'APPROVED' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-100 text-rose-700 border-rose-200'
                }`}>
                  {info?.status === 'APPROVED' ? 'Đang hoạt động' : 'Bị khóa'}
                </span>
              </div>
              <p className="text-slate-400 font-medium text-sm mt-1">
                Mã trường: <span className="font-bold text-slate-600">{info?.schoolCode}</span>
                <span className="mx-2">·</span>
                Duyệt ngày {info?.approvedAt || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
          
          {/* NÚT KHÓA / MỞ KHÓA THÔNG MINH THEO TRẠNG THÁI THỰC TẾ */}
          {info?.status === 'APPROVED' ? (
            <button 
              onClick={() => handleAction('suspend', 'SUSPENDED')} // Endpoint PUT: /schools/{id}/suspend
              className="self-start md:self-auto px-5 py-3 font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4"/> Khóa tài khoản
            </button>
          ) : (
            <button 
              onClick={() => handleAction('reinstate', 'REINSTATED')} // Endpoint PUT: /schools/{id}/activate
              className="self-start md:self-auto px-5 py-3 font-bold text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4"/> Mở khóa tài khoản
            </button>
          )}
        </div>

        {/* THANH ĐIỀU HƯỚNG TABS MENU */}
        <div className="border-b border-slate-100 px-8 flex gap-8 bg-slate-50/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-all relative ${
                activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* KHU VỰC HIỂN THỊ NỘI DUNG TỪNG TAB */}
        <div className="p-8">
          {activeTab === 'info' && <GeneralInfoTab info={info} stats={stats} />}
          {activeTab === 'analytics' && <AnalyticsTab analytics={schoolData.analytics} stats={stats} />}
          {activeTab === 'history' && <AuditLogTab logs={schoolData.logs} />}
        </div>

      </div>
    </div>
  );
};

export default SchoolDetailPage;