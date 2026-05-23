import React from 'react';
import { 
  MapPin, Mail, Wallet, Cpu, Calendar, UserCheck, 
  CheckCircle2, Clock, Building2, Users, Award, FileX, Percent 
} from 'lucide-react';

const GeneralInfoTab = ({ info, stats }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* PHẦN TRÊN: CHIA 2 KHỐI GRID (THÔNG TIN CHUNG VÀ TRẠNG THÁI TÀI KHOẢN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KHỐI CARD 1: THÔNG TIN CHUNG */}
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
            <Building2 className="w-4 h-4 text-blue-500" /> THÔNG TIN CHUNG
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                <MapPin className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Địa chỉ trụ sở</p>
                <p className="text-slate-800 font-semibold mt-0.5">{info?.schoolAddress || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                <Mail className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email tổ chức</p>
                <p className="text-slate-800 font-semibold mt-0.5">{info?.schoolEmail || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                <Wallet className="w-5 h-5 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Địa chỉ Ví Blockchain</p>
                <code className="text-sm text-blue-600 font-mono block mt-0.5 bg-white px-2 py-1 rounded border border-blue-100 truncate">
                  {info?.walletAddress || '0x0000000000000000000000000000000000000000'}
                </code>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                <Cpu className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Trạng thái trên Blockchain</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-sm font-bold text-emerald-600">{info?.blockchainStatus || 'Đang hoạt động (Đã kết nối Node)'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI CARD 2: TRẠNG THÁI TÀI KHOẢN */}
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
            <UserCheck className="w-4 h-4 text-blue-500" /> TRẠNG THÁI TÀI KHOẢN
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Ngày đăng ký
              </p>
              <p className="text-slate-800 font-bold text-base">{info?.createdAt || 'Chưa cập nhật'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                <UserCheck className="w-3.5 h-3.5" /> Người duyệt
              </p>
              <p className="text-slate-800 font-bold text-base text-blue-600">{info?.approvedBy || 'Chưa có'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ngày duyệt
              </p>
              <p className="text-slate-800 font-bold text-base">{info?.approvedAt || 'Chưa có'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" /> Lần đăng nhập cuối
              </p>
              <p className="text-slate-800 font-bold text-base">{info?.lastLogin || 'Chưa có'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN DƯỚI: KHỐI CARD THỐNG KÊ VĂN BẰNG (MỚI BỔ SUNG THEO YÊU CẦU) */}
      <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
          <Award className="w-4 h-4 text-blue-500" /> THỐNG KÊ VĂN BẰNG TỔ CHỨC
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Users className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng sinh viên</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalStudents || '0'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><Award className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Văn bằng đã cấp</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalIssued || '0'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0"><FileX className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã thu hồi</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalRevoked || '0'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Percent className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỉ lệ thu hồi</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{stats?.revocationRate || '0%'}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GeneralInfoTab;