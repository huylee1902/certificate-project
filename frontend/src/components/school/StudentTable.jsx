import React from 'react';
import { Mail, CheckCircle2, FileX, AlertCircle, Loader2, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StudentTable({ 
  students, 
  loading, 
  filter, 
  selectedIds, 
  toggleSelect, 
  toggleSelectAll, 
  onOpenRevoke 
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Đang tải dữ liệu sinh viên...</p>
      </div>
    );
  }

  // 1. TÍNH TOÁN SINH VIÊN HỢP LỆ CỦA TRANG HIỆN TẠI
  // Hỗ trợ cả 'pending' (chuỗi) và 0 (số) đề phòng backend trả về số
  const currentPendingStudents = (students || []).filter(s => s.status === 'pending' || s.status === 0);
  
  // 2. TÍNH TOÁN XEM TOÀN BỘ TRANG NÀY ĐÃ ĐƯỢC CHỌN CHƯA
  const isAllCurrentPageSelected = 
      currentPendingStudents.length > 0 && 
      currentPendingStudents.every(s => selectedIds.includes(s.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 w-12">
              <input 
                type="checkbox" 
                onChange={toggleSelectAll}
                // ĐÃ SỬA: Sử dụng biến vừa tính toán ở trên
                checked={isAllCurrentPageSelected}
                // ĐÃ SỬA: Làm mờ đi nếu trang này không có sinh viên nào chờ cấp
                disabled={currentPendingStudents.length === 0}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã SV / Khóa</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngành học</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {(students || []).map((s) => (
            <tr 
              key={`student-${s.id}-${s.studentId}`} 
              className={cn(
                "hover:bg-slate-50 transition-colors group",
                selectedIds.includes(s.id) && "bg-blue-50/50"
              )}
            >
              <td className="px-6 py-4">
                <input 
                  type="checkbox" 
                  // Hỗ trợ cả string và số
                  disabled={s.status !== 'pending' && s.status !== 0}
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggleSelect(s.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 disabled:opacity-30 cursor-pointer focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    {s.name?.split(' ').pop()?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Mail className="w-2.5 h-2.5" /> {s.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-slate-700">{s.studentId}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{s.batch}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-slate-600">{s.major}</span>
              </td>
              <td className="px-6 py-4">
                {s.status === 'issued' || s.status === 1 ? (
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 text-[10px] font-bold rounded-lg flex items-center gap-1 w-fit uppercase">
                    <CheckCircle2 className="w-3 h-3" /> Đã cấp
                  </span>
                ) : s.status === 'revoked' || s.status === 2 ? (
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold rounded-lg flex items-center gap-1 w-fit uppercase">
                    <FileX className="w-3 h-3" /> Thu hồi
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold rounded-lg flex items-center gap-1 w-fit uppercase">
                    <AlertCircle className="w-3 h-3" /> Chờ cấp
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {s.status === 'issued' || s.status === 1 ? (
                  <button 
                    onClick={() => onOpenRevoke(s)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto border border-red-100 active:scale-95"
                  >
                    <FileX className="w-3.5 h-3.5" /> Thu hồi bằng
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic font-medium pr-2">
                    {s.status === 'pending' || s.status === 0 ? 'Chờ cấp' : 'Bị tước quyền'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {(students || []).length === 0 && (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Search className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Không tìm thấy kết quả phù hợp!</p>
        </div>
      )}
    </div>
  );
}