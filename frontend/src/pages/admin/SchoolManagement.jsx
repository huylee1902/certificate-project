import React, { useState, useEffect } from 'react';
import { 
  Search, Activity, Building, XCircle, CheckCircle, Mail, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const SchoolManagement = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  // --- THAM SỐ TRẠNG THÁI CHO LOGIC BACKEND PAGINATION ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Đặt cấu hình hiển thị cố định 10 dòng trên mỗi trang
  const itemsPerPage = 10; 

  // --- EFFECT THEO DÕI SỰ THAY ĐỔI ĐỂ CALL API (KÈM DEBOUNCE CHO TÌM KIẾM) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSchoolsFromBackend();
    }, 400); // Trễ 400ms sau khi người dùng dừng nhập chữ mới gửi request

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStatus, currentPage]);

  // Tự động quay về trang đầu tiên nếu thay đổi từ khóa hoặc bộ lọc trạng thái
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchSchoolsFromBackend = async () => {
    setLoadingSchools(true);
    try {
      // Gửi request kèm theo Query Parameters chuẩn hóa xuống Server-side
      const response = await axiosClient.get('/admin/schools', {
        params: {
          keyword: searchTerm,
          status: filterStatus,
          page: currentPage,
          size: itemsPerPage
        }
      });

      if (response.data && response.data.code === 200) {
        // Ánh xạ dữ liệu tương thích từ cấu trúc đối tượng PageResponse phía Backend
        const pageData = response.data.data;
        setSchools(pageData.items || []);
        setTotalPages(pageData.totalPages || 1);
        setTotalItems(pageData.totalItems || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách trường học từ server", error);
      setSchools([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleOpenDetailModal = (school) => {
    if (school.status === 'PENDING') {
      setSelectedSchool(school);
      setShowSchoolModal(true);
    } else {
      navigate(`/admin/schools/${school.id}`);
    }
  };

  const handleAction = async (schoolId, actionName, targetStatus) => {
    if (!window.confirm(`Xác nhận thực hiện hành động này?`)) return;
    try {
      await axiosClient.put(`/schools/${schoolId}/${actionName}`);
      
      // Cập nhật nhanh trạng thái bản ghi trên UI hiện tại
      setSchools(schools.map(s => s.id === schoolId ? { ...s, status: targetStatus } : s));
      setShowSchoolModal(false); 
      alert("Cập nhật thành công!");

      if (targetStatus === 'APPROVED') {
        navigate(`/admin/schools/${schoolId}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span className="whitespace-nowrap px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">Chờ duyệt</span>;
      case 'APPROVED': 
        return <span className="whitespace-nowrap px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">Đang hoạt động</span>;
      case 'SUSPENDED': 
        return <span className="whitespace-nowrap px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-200">Bị khóa</span>;
      case 'REJECTED': 
        return <span className="whitespace-nowrap px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold border border-slate-200">Bị từ chối</span>;
      default: 
        return <span className="whitespace-nowrap px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <>
      {/* 1. KHU VỰC THANH ĐIỀU HƯỚNG TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-1 min-w-[300px] gap-4">
            {/* Thanh Tìm Kiếm */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm mã, tên, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all" 
              />
            </div>
            
            {/* Bộ Lọc Trạng Thái */}
            <div className="relative">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold shadow-sm focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer transition-all"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đang hoạt động</option>
                <option value="SUSPENDED">Bị khóa</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm font-bold text-slate-500 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
            Tổng số kết quả: <span className="text-blue-600">{totalItems}</span> Tổ chức
          </div>
        </div>
        
        {/* 2. KHU VỰC BẢNG DỮ LIỆU CHÍNH */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-200">
                <th className="p-5 pl-8 whitespace-nowrap">Mã</th>
                <th className="p-5 whitespace-nowrap">Tên Tổ chức / Trường</th>
                <th className="p-5 whitespace-nowrap">Email</th>
                <th className="p-5 whitespace-nowrap">Trạng thái</th>
                <th className="p-5 text-center pr-8 whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingSchools ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 font-bold">
                    <Activity className="animate-spin inline mr-2 text-blue-500"/> Đang tải dữ liệu thực tế từ máy chủ...
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                    Không tìm thấy dữ liệu tổ chức nào tương thích!
                  </td>
                </tr>
              ) : schools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 pl-8 font-black text-slate-800 whitespace-nowrap">{school.schoolCode}</td>
                  <td className="p-5 font-bold text-slate-700">{school.schoolName}</td>
                  <td className="p-5 text-slate-500 font-medium">{school.schoolEmail}</td>
                  <td className="p-5">{getStatusBadge(school.status)}</td>
                  <td className="p-5 text-center pr-8">
                    <button onClick={() => handleOpenDetailModal(school)} className="whitespace-nowrap px-5 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white shadow-sm transition-all text-sm">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. ĐIỀU KHIỂN PHÂN TRANG (DỰA TRÊN STATE BACKEND) */}
        {!loadingSchools && totalPages > 1 && (
          <div className="p-5 border-t border-slate-200 bg-white flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">
              Hiển thị từ <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong số{' '}
              <span className="font-bold text-slate-800">{totalItems}</span> tổ chức toàn hệ thống
            </div>
            
            <div className="flex gap-2">
              {/* Nút lùi trang */}
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Sinh động danh sách nút số thứ tự trang */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Nút tiến trang */}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. POPUP MODAL DUYỆT TRƯỜNG NHANH */}
      {showSchoolModal && selectedSchool && selectedSchool.status === 'PENDING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <Building className="w-6 h-6 text-yellow-600"/> Đơn đăng ký chờ duyệt
              </h3>
              <button onClick={() => setShowSchoolModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-7 h-7" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Mã Tổ chức</p>
                  <p className="text-xl font-black text-slate-800">{selectedSchool.schoolCode}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Trạng thái</p>
                  <div>{getStatusBadge(selectedSchool.status)}</div>
                </div>
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tên Trường</p>
                  <p className="text-xl font-bold text-slate-700">{selectedSchool.schoolName}</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500"/>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Email liên hệ</p>
                    <p className="text-lg font-bold text-slate-800">{selectedSchool.schoolEmail}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setShowSchoolModal(false)} className="px-6 py-3 font-bold text-slate-600 bg-white border rounded-xl hover:bg-slate-100 transition-colors">
                Đóng
              </button>
              <button onClick={() => handleAction(selectedSchool.id, 'reject', 'REJECTED')} className="px-6 py-3 font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 rounded-xl flex items-center gap-2 transition-all">
                <XCircle className="w-5 h-5"/> Từ chối
              </button>
              <button onClick={() => handleAction(selectedSchool.id, 'approve', 'APPROVED')} className="px-6 py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center gap-2 shadow-md transition-all">
                <CheckCircle className="w-5 h-5"/> Duyệt Trường
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchoolManagement;