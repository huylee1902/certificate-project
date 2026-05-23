import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ShieldCheck, ShieldAlert } from 'lucide-react';

const AnalyticsTab = ({ analytics, stats }) => {
  const { monthlyData = [], majorData = [] } = analytics || {};
  
  // Xử lý số liệu cho thanh tiến trình (Progress Bar)
  const totalIssued = parseInt(stats?.totalIssued?.replace(/\./g, '') || '0');
  const totalRevoked = parseInt(stats?.totalRevoked?.replace(/\./g, '') || '0');
  const totalActive = totalIssued - totalRevoked;
  const activePercent = totalIssued > 0 ? (totalActive / totalIssued) * 100 : 100;

  // Bảng màu chuẩn Web3 cho Biểu đồ tròn
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. KHỐI TRẠNG THÁI VĂN BẰNG (THANH TIẾN TRÌNH) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Tình trạng hiệu lực văn bằng
        </h3>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-md text-emerald-600 bg-emerald-100">
                Còn hiệu lực ({totalActive.toLocaleString('vi-VN')})
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-md text-rose-600 bg-rose-100">
                Đã thu hồi ({totalRevoked.toLocaleString('vi-VN')})
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-rose-500">
            <div style={{ width: `${activePercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. BIỂU ĐỒ CỘT (CẤP PHÁT THEO THÁNG) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600"/> Số lượng cấp phát (Theo tháng)
          </h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                <Bar dataKey="issued" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Văn bằng cấp mới" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. BIỂU ĐỒ TRÒN (CƠ CẤU NGÀNH ĐÀO TẠO) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-600"/> Phân bổ theo Ngành đào tạo
          </h4>
          <div className="h-72 w-full flex items-center justify-center">
            {majorData.length === 0 ? (
              <p className="text-slate-400 italic text-sm">Chưa có dữ liệu ngành học</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={majorData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" >
                    {majorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 600, color: '#475569'}}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;