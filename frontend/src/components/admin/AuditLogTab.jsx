import React, { useState } from 'react';
import { Clock, ShieldCheck, ShieldAlert, Activity, Filter, AlertTriangle } from 'lucide-react';

const AuditLogTab = ({ logs = [] }) => {
  const [filterType, setFilterType] = useState('ALL');

  // Logic lọc dữ liệu nội bộ
  const filteredLogs = logs.filter(log => {
    if (filterType === 'ALL') return true;
    const action = log.action ? log.action.toUpperCase() : '';
    
    switch(filterType) {
      case 'ISSUE': return action.includes('CẤP') || action.includes('ISSUE');
      case 'REVOKE': return action.includes('THU HỒI') || action.includes('REVOKE');
      case 'IMPORT': return action.includes('IMPORT') || action.includes('THÊM');
      case 'SYSTEM': return action.includes('HỆ THỐNG') || action.includes('KÍCH HOẠT') || action.includes('KHÓA');
      default: return true;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      
      {/* 1. KHUNG CẢNH BÁO (ALERT BANNER) */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Trạng thái giám sát An ninh Blockchain</h4>
          <p className="text-xs text-blue-700 mt-1">Hệ thống đang liên tục ghi nhận các giao dịch đúc và thu hồi văn bằng của tổ chức này trên mạng lưới. Mọi hành vi bất thường sẽ được cảnh báo đỏ bên dưới.</p>
        </div>
      </div>

      {/* 2. THANH BỘ LỌC (FILTER TOOLBAR) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" /> Nhật ký hoạt động
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border-slate-200 bg-white text-slate-700 font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none py-1.5 px-3 shadow-sm"
          >
            <option value="ALL">Tất cả hoạt động</option>
            <option value="ISSUE">Cấp phát văn bằng</option>
            <option value="REVOKE">Thu hồi văn bằng</option>
            <option value="IMPORT">Import sinh viên</option>
            <option value="SYSTEM">Tác vụ hệ thống</option>
          </select>
        </div>
      </div>

      {/* 3. DANH SÁCH TIMELINE LỊCH SỬ */}
      <div className="border-l-2 border-slate-200 pl-8 space-y-8 relative ml-4 py-4">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <Activity className="w-10 h-10 mb-2 text-slate-400" />
            <p className="text-sm text-slate-500 font-semibold">Không có lịch sử nào khớp với bộ lọc.</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            // Tự động gán màu dựa trên từ khóa hành động
            const actStr = log.action?.toUpperCase() || '';
            const isDanger = actStr.includes('THU HỒI') || actStr.includes('REVOKE') || actStr.includes('KHÓA') || actStr.includes('CẢNH BÁO');
            const isSuccess = actStr.includes('CẤP') || actStr.includes('DUYỆT') || actStr.includes('ISSUE');

            return (
              <div key={log.id || index} className="relative group">
                {/* Chấm Timeline */}
                <div className={`absolute -left-[41px] top-1 bg-white p-1 rounded-full border-2 
                  ${isDanger ? 'border-rose-500' : isSuccess ? 'border-emerald-500' : 'border-blue-500'}
                `}>
                  <div className={`w-2.5 h-2.5 rounded-full 
                    ${isDanger ? 'bg-rose-600' : isSuccess ? 'bg-emerald-600' : 'bg-blue-600'}
                  `} />
                </div>

                {/* Tiêu đề Log */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wider">{log.time}</span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase border flex items-center gap-1
                    ${isDanger ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                      isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      'bg-blue-50 text-blue-700 border-blue-200'}
                  `}>
                    {isDanger ? <AlertTriangle className="w-3 h-3"/> : isSuccess ? <ShieldCheck className="w-3 h-3"/> : <Activity className="w-3 h-3"/>}
                    {log.action}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                    Bởi: {log.user}
                  </span>
                </div>
                
                {/* Nội dung Log */}
                <p className="text-sm text-slate-700 font-medium bg-slate-50 border border-slate-100 p-3 rounded-xl inline-block mt-1 transition-colors group-hover:border-slate-300 shadow-sm">
                  {log.desc}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuditLogTab;