import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

export default function RevokeModal({ 
  isOpen, 
  student, 
  reason, 
  setReason, 
  onClose, 
  onConfirm, 
  isSubmitting 
}) {
  if (!isOpen || !student) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="p-2 bg-red-50 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Yêu cầu thu hồi văn bằng</h3>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs text-slate-600 space-y-1">
          <p><strong>Sinh viên:</strong> {student.name}</p>
          <p><strong>Mã số sinh viên:</strong> {student.studentId}</p>
          <p><strong>Ngành đào tạo:</strong> {student.major}</p>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Lý do thu hồi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập chi tiết lý do thu hồi..."
            className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!reason.trim() || isSubmitting}
            className="px-5 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-100"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Xác nhận thu hồi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}