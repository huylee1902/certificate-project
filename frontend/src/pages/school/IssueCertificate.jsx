import React, { useState, useEffect, useRef } from 'react';
import { Search, FileSpreadsheet, Send, ChevronLeft, ChevronRight,CheckCircle2,X,AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatePresence } from 'framer-motion';
import axiosClient from '../../api/axiosClient';

import StudentTable from '../../components/school/StudentTable';
import RevokeModal from '../../components/school/RevokeModal';
import ActionProgressModal from '../../components/school/ActionProgressModal';
// 1. IMPORT COMPONENT MỚI VÀO ĐÂY
import StudentDetailModal from '../../components/school/StudentDetailModal'; 

export default function IssueCertificate() {
  const fileInputRef = useRef(null);

  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [pageSize, setPageSize] = useState(50); 
  const [majorFilter, setMajorFilter] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [openRevokeModal, setOpenRevokeModal] = useState(false);
  const [studentToRevoke, setStudentToRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  // 2. KHAI BÁO STATE QUẢN LÝ MODAL CHI TIẾT
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [studentForDetail, setStudentForDetail] = useState(null);

  const [actionState, setActionState] = useState({
    isOpen: false,
    title: '',
    description: '',
    progress: 0,
    status: 'loading', 
    errorDetails: [] 
  });
  const intervalRef = useRef(null);

  // ... (Giữ nguyên các hàm Fake Progress và Gọi API của bạn) ...
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

  useEffect(() => {
      if (toast.show) {
        const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
        return () => clearTimeout(timer);
      }
    }, [toast.show]);
  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim() || !studentToRevoke) return;
    try {
      setIsSubmittingRevoke(true);
      const res = await axiosClient.post(`/certificates/revoke/${studentToRevoke.id}`, { reason: revokeReason });
      
      if (res.data?.code === 200) { 
        setOpenRevokeModal(false); 
        
        // 1. Hiển thị thông báo thành công ngọt ngào
        setToast({
          show: true,
          message: `Đã thu hồi văn bằng của sinh viên ${studentToRevoke.fullName || studentToRevoke.name} thành công!`,
          type: 'success'
        });

        setStudentToRevoke(null); 
        setRevokeReason(''); // Làm sạch ô nhập lý do để lần sau không bị dính chữ cũ
        fetchStudents(); 
      } else {
        // 2. Hiển thị lỗi từ phía Backend trả về dạng nghiệp vụ công việc
        setToast({
          show: true,
          message: res.data?.message || "Thu hồi văn bằng thất bại!",
          type: 'error'
        });
      }
    } catch (e) { 
      console.error(e); 
      // 3. Hiển thị lỗi hệ thống, kết nối mạng
      setToast({
        show: true,
        message: e.response?.data?.message || "Có lỗi xảy ra khi kết nối tới máy chủ!",
        type: 'error'
      });
    } finally { 
      setIsSubmittingRevoke(false); 
    }
  };

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[350px]">
        <StudentTable 
          students={students} loading={loading} filter={filter} selectedIds={selectedIds}
          toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll}
          onOpenRevoke={(s) => { setStudentToRevoke(s); setRevokeReason(''); setOpenRevokeModal(true); }}
          // 3. TRUYỀN HÀM MỞ MODAL XUỐNG BẢNG
          onOpenDetail={(s) => { setStudentForDetail(s); setDetailModalOpen(true); }}
        />
        
        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 font-medium">
            <div>
              Hiển thị từ <span className="font-bold text-slate-800">{currentPage * pageSize + 1}</span> đến{' '}
              <span className="font-bold text-slate-800">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trên tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> mục dữ liệu.
            </div>
            
            <div className="flex items-center gap-6">
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

      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`flex items-start gap-5 px-8 py-6 rounded-2xl shadow-2xl border bg-white max-w-lg w-full mx-4 transform animate-in zoom-in-95 duration-300 ${
            toast.type === 'success' 
              ? 'border-emerald-200 shadow-emerald-500/10' 
              : 'border-rose-200 shadow-rose-500/10'
          }`}>
            {/* Icon được phóng to lên size 24 và bọc trong khung đổ bóng đổ góc tròn */}
            {toast.type === 'success' ? (
              <div className="p-3 bg-emerald-500 text-white rounded-xl shrink-0 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="p-3 bg-rose-500 text-white rounded-xl shrink-0 shadow-lg shadow-rose-500/30">
                <AlertCircle size={24} />
              </div>
            )}
            
            {/* Nội dung thông báo được tăng kích thước chữ */}
            <div className="flex-1 pt-0.5">
              <p className={`text-xs font-bold uppercase tracking-widest ${
                toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {toast.type === 'success' ? 'Hệ thống thông báo' : 'Hệ thống cảnh báo'}
              </p>
              <p className="text-base font-extrabold text-slate-800 mt-1.5 leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Nút đóng thông báo được tăng khoảng cách click */}
            <button 
              type="button"
              onClick={() => setToast({ ...toast, show: false })}
              className="text-slate-400 hover:text-slate-600 p-1.5 transition rounded-xl hover:bg-slate-100 shrink-0 -mt-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

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

        {/* 4. NHÚNG MODAL CHI TIẾT VÀO ĐÂY */}
        <StudentDetailModal 
          isOpen={detailModalOpen}
          student={studentForDetail}
          onClose={() => { setDetailModalOpen(false); setTimeout(() => setStudentForDetail(null), 200); }} 
        />
      </AnimatePresence>
    </div>
  );
}