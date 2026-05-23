import React, { useState, useEffect, useRef } from 'react';
import { Search, FileSpreadsheet, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatePresence } from 'framer-motion';
import axiosClient from '../../api/axiosClient';

import StudentTable from '../../components/school/StudentTable';
import RevokeModal from '../../components/school/RevokeModal';
import ActionProgressModal from '../../components/school/ActionProgressModal';

export default function IssueCertificate() {
  const fileInputRef = useRef(null);

  // --- STATES QUẢN LÝ DỮ LIỆU VÀ PHÂN TRANG ---
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // ĐÃ SỬA: State cho số dòng hiển thị và Ngành học
  const [pageSize, setPageSize] = useState(50); 
  const [majorFilter, setMajorFilter] = useState(''); 

  const [openRevokeModal, setOpenRevokeModal] = useState(false);
  const [studentToRevoke, setStudentToRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  // --- STATE QUẢN LÝ THANH TIẾN TRÌNH % ---
  const [actionState, setActionState] = useState({
    isOpen: false,
    title: '',
    description: '',
    progress: 0,
    status: 'loading', 
    errorDetails: [] 
  });
  const intervalRef = useRef(null);

  // --- ENGINE MÔ PHỎNG % CHO MODAL ---
  const startFakeProgress = (title, description) => {
    setActionState({ isOpen: true, title, description, progress: 0, status: 'loading' });
    intervalRef.current = setInterval(() => {
      setActionState(prev => {
        if (prev.progress >= 90) return prev;
        const next = prev.progress + Math.floor(Math.random() * 10) + 5;
        return { ...prev, progress: Math.min(90, next) };
      });
    }, 500);
  };

  const stopProgress = (finalStatus, finalMessage, errorDetails = []) => {
    clearInterval(intervalRef.current);
    setActionState(prev => ({
        ...prev,
        progress: 100,
        status: finalStatus,
        title: finalStatus === 'success' ? 'Hoàn thành!' 
            : finalStatus === 'error'   ? 'Thất bại' 
            : prev.title,
        description: finalMessage || prev.description,
        errorDetails: errorDetails
    }));

    if (finalStatus === 'success') {
        setTimeout(() => setActionState(prev => ({ ...prev, isOpen: false })), 2000);
    }
  };

  // --- ACTIONS GỌI API ---
  // ĐÃ SỬA: Thêm majorFilter và pageSize vào dependency
  useEffect(() => { fetchStudents(); }, [currentPage, filter, majorFilter, pageSize]);
  
  useEffect(() => {
    const checkProfileStatus = async () => {
        try {
        const res = await axiosClient.get('/school/profile'); 
        if (res.data?.code === 200) {
           const profileData = res.data.data;
           const hasRectorName = profileData.rectorName && profileData.rectorName.trim() !== '';
           setIsProfileComplete(hasRectorName);
        }
        } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái hồ sơ:", error);
        }
    };
    checkProfileStatus();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(0);
      fetchStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/students', {
        // ĐÃ SỬA: Truyền major xuống API
        params: { page: currentPage, size: pageSize, search: searchTerm, status: filter, major: majorFilter }
      });
      if (response.data?.code === 200) {
        const pageData = response.data.data;
        setStudents(pageData?.content || []); 
        setTotalPages(pageData?.totalPages || 0);
        setTotalElements(pageData?.totalElements || 0);
      } else {
        setStudents([]);
      }
    } catch (e) { 
      console.error(e); 
      setStudents([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    startFakeProgress("Đang Import dữ liệu", "Hệ thống đang đọc file Excel và kiểm tra sinh viên...");
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await axiosClient.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.code === 200) {
        stopProgress('success', "Nhập dữ liệu thành công!");
        fetchStudents();
        } else {
        stopProgress('error', res.data?.message || "Import thất bại!");
        }
    } catch (err) {
        const responseData = err.response?.data;
        const errorList = (
        Array.isArray(responseData?.data?.rowErrors) ? responseData.data.rowErrors :
        Array.isArray(responseData?.rowErrors)        ? responseData.rowErrors :
        Array.isArray(responseData?.data)             ? responseData.data :
        Array.isArray(responseData?.errors)           ? responseData.errors :
        null
        );

        if (errorList && errorList.length > 0) {
        stopProgress('error', "Phát hiện dữ liệu không hợp lệ. Vui lòng sửa các dòng sau:", errorList);
        } else {
        const msg = responseData?.message 
            || responseData?.data?.message 
            || err.message 
            || "Import thất bại! Vui lòng kiểm tra lại file.";
        stopProgress('error', msg);
        }
    } finally {
        e.target.value = null;
    }
  };

  const handleIssue = async () => {
    if (selectedIds.length === 0) return;
    
    startFakeProgress("Ký cấp bằng Blockchain", `Đang ghi dữ liệu của ${selectedIds.length} sinh viên lên mạng lưới Blockchain...`);
    try {
      const res = await axiosClient.post('/certificates/issue', { studentIds: selectedIds });
      if (res.data?.code === 200) { 
        stopProgress('success', "Đã ghi nhận dữ liệu văn bằng lên Smart Contract thành công!");
        setSelectedIds([]); 
        fetchStudents(); 
      }
    } catch (e) { 
      stopProgress('error', "Có lỗi xảy ra khi giao tiếp với mạng Blockchain."); 
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim() || !studentToRevoke) return;
    try {
      setIsSubmittingRevoke(true);
      const res = await axiosClient.post(`/certificates/revoke/${studentToRevoke.id}`, { reason: revokeReason });
      if (res.data?.code === 200) { 
        setOpenRevokeModal(false); 
        setStudentToRevoke(null); 
        fetchStudents(); 
      }
    } catch (e) { console.error(e); } finally { setIsSubmittingRevoke(false); }
  };

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  
  // ĐÃ SỬA: Hàm chọn tất cả thông minh (Chỉ áp dụng cho trang hiện tại)
  const toggleSelectAll = () => {
    const currentPendingIds = (students || [])
      .filter(s => s.status === 'pending' || s.status === 0)
      .map(s => s.id);

    if (currentPendingIds.length === 0) return;

    const isAllCurrentPageSelected = currentPendingIds.every(id => selectedIds.includes(id));

    if (isAllCurrentPageSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPendingIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const newIds = currentPendingIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />

        {/* HÀNG RÀO CẢNH BÁO: CHƯA HOÀN THIỆN HỒ SƠ */}
        {!isProfileComplete && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-xl shadow-sm flex items-start gap-3 animate-pulse">
            <span className="text-orange-500 mt-0.5">⚠️</span>
            <div>
            <h3 className="text-orange-800 font-bold text-sm">Yêu cầu hoàn thiện hồ sơ!</h3>
            <p className="text-orange-700 text-sm mt-1">
                Tài khoản của bạn chưa cập nhật <strong>Tên Hiệu trưởng</strong>. Vui lòng vào trang Hồ sơ để bổ sung trước khi hệ thống mở khóa tính năng Import và Cấp bằng.
            </p>
            </div>
        </div>
        )}

      {/* SEARCH VÀ TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" placeholder="Tìm tên, mã sinh viên..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50"
            />
          </div>

          {/* ĐÃ SỬA: DROPDOWN CHỌN NGÀNH HỌC */}
          <select
            value={majorFilter}
            onChange={(e) => {
                setMajorFilter(e.target.value);
                setCurrentPage(0);
                setSelectedIds([]); 
            }}
            className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
          >
            <option value="">Tất cả ngành học</option>
            <option value="Khoa học Máy tính">Khoa học Máy tính</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
            <option value="Hệ thống thông tin">Hệ thống thông tin</option>
            <option value="Kinh tế Quốc tế">Kinh tế Quốc tế</option>
            <option value="Kỹ thuật Cơ điện tử">Kỹ thuật Cơ điện tử</option>
          </select>

          <div className="flex bg-slate-50 rounded-xl border border-slate-200 p-1 hidden lg:flex">
            {['all', 'pending', 'issued', 'revoked'].map((s) => (
              <button
                key={s} onClick={() => { setFilter(s); setCurrentPage(0); setSelectedIds([]); }}
                className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider", filter === s ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
              >
                {s === 'all' ? 'Tất cả' : s === 'issued' ? 'Đã cấp' : s === 'pending' ? 'Chờ cấp' : 'Thu hồi'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
        <button 
            onClick={() => fileInputRef.current.click()} 
            disabled={actionState.isOpen || !isProfileComplete} 
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
        </button>
        
        <button 
            onClick={handleIssue} 
            disabled={selectedIds.length === 0 || actionState.isOpen || !isProfileComplete} 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Send className="w-4 h-4" /> {selectedIds.length > 0 ? `Ký cấp ${selectedIds.length} bằng` : 'Cấp bằng'}
        </button>
        </div>
      </div>

      {/* KHU VỰC BẢNG & PHÂN TRANG */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[350px]">
        <StudentTable 
          students={students} loading={loading} filter={filter} selectedIds={selectedIds}
          toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll}
          onOpenRevoke={(s) => { setStudentToRevoke(s); setRevokeReason(''); setOpenRevokeModal(true); }}
        />
        
        {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 font-medium">
            <div>
              Hiển thị từ <span className="font-bold text-slate-800">{currentPage * pageSize + 1}</span> đến{' '}
              <span className="font-bold text-slate-800">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trên tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> mục dữ liệu.
            </div>
            
            <div className="flex items-center gap-6">
              {/* ĐÃ SỬA: DROPDOWN CHỌN SỐ DÒNG HIỂN THỊ */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Hiển thị:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0); 
                  }}
                  className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={cn(
                      "w-8 h-8 rounded-xl font-bold text-xs transition-all active:scale-95",
                      currentPage === idx 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        <RevokeModal 
          isOpen={openRevokeModal} student={studentToRevoke} reason={revokeReason} setReason={setRevokeReason}
          onClose={() => { setOpenRevokeModal(false); setStudentToRevoke(null); }} onConfirm={handleConfirmRevoke} isSubmitting={isSubmittingRevoke}
        />
        
        <ActionProgressModal 
          isOpen={actionState.isOpen} 
          title={actionState.title} 
          description={actionState.description} 
          progress={actionState.progress} 
          status={actionState.status} 
          errorDetails={actionState.errorDetails} 
          onClose={() => setActionState(p => ({ ...p, isOpen: false }))} 
        />
      </AnimatePresence>
    </div>
  );
}