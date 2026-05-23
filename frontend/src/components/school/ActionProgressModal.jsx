import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function ActionProgressModal({ isOpen, title, description, progress, status, errorDetails, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 relative"
        >
          {/* Nút đóng (hiện khi có lỗi) */}
          {status === 'error' && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          )}

          {/* Icon Trạng thái */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {status === 'loading' && (
              <>
                <div className="absolute inset-0 border-4 border-blue-50 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
              </>
            )}
            {status === 'success' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-100 p-4 rounded-full text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-100 p-4 rounded-full text-red-600">
                <XCircle className="w-10 h-10" />
              </motion.div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-4 font-medium px-4">
            {description}
          </p>
          
          {/* KHUNG HIỂN THỊ CHI TIẾT TỪNG DÒNG LỖI (NEW) */}
          {status === 'error' && errorDetails && errorDetails.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto bg-red-50 p-4 rounded-2xl border border-red-100 text-left mb-6 custom-scrollbar">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Chi tiết lỗi:</p>
              <ul className="space-y-3">
                {errorDetails.map((err, idx) => (
                  <li key={idx} className="text-sm text-red-700 bg-white p-3 rounded-xl border border-red-50 shadow-sm">
                    <span className="font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-xs mr-2">
                      Dòng {err.rowNumber}
                    </span> 
                    <span className="font-semibold">{err.studentId}</span>
                    <ul className="mt-1.5 ml-1 space-y-1">
                      {err.errors?.map((msg, i) => (
                        <li key={i} className="text-xs flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-red-400" /> {msg}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Thanh Tiến trình */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative mb-2">
            <motion.div 
               className={`h-full rounded-full ${status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs font-bold">
            <span className={status === 'error' ? 'text-red-500' : status === 'success' ? 'text-green-600' : 'text-blue-600'}>
              {status === 'loading' ? 'Đang xử lý...' : status === 'success' ? 'Hoàn tất!' : 'Thất bại'}
            </span>
            <span className="text-slate-600">{progress}%</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}