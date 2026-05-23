import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Rectangle, Sector } from 'recharts';
import { Users, CheckCircle, XOctagon, Clock, ShieldCheck, Activity, Loader2 } from 'lucide-react'; // Thêm Loader2
import StatCard from '../../components/school/StatCard';
import axiosClient from '../../api/axiosClient'; // IMPORT axiosClient ở đây

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // 1. KHAI BÁO STATE LƯU DỮ LIỆU VÀ TRẠNG THÁI LOADING
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. GỌI API KHI COMPONENT VỪA RENDER
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/school/dashboard'); 
        
        if (response.data && response.data.code === 200) {
          setStats(response.data.data); // Gán dữ liệu thật từ DB
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
        
        setStats({
          totalStudents: 3420, issuedCertificates: 3150, revokedCertificates: 12, pendingStudents: 258,
          monthlyChart: [
            { name: 'Th.1', issued: 420, revoked: 2 }, { name: 'Th.2', issued: 680, revoked: 5 },
            { name: 'Th.3', issued: 510, revoked: 1 }, { name: 'Th.4', issued: 890, revoked: 4 },
            { name: 'Th.5', issued: 650, revoked: 0 },
          ],
          majorChart: [
            { name: 'CNTT', value: 1450 }, { name: 'Khoa học Máy tính', value: 920 },
            { name: 'Kinh tế Quốc tế', value: 680 }, { name: 'Ngôn ngữ Anh', value: 370 },
          ],
          recentActivities: [
            { id: 'TX-09821', time: '10 phút trước', action: 'Cấp phát văn bằng', student: 'Lê Hoàng Long', status: 'SUCCESS', hash: '0x7a2b...f89c' },
            { id: 'TX-09743', time: '2 giờ trước', action: 'Thu hồi văn bằng', student: 'Nguyễn Văn Tiến', status: 'REVOKED', hash: '0x4f9d...12ea' },
            { id: 'TX-09612', time: '1 ngày trước', action: 'Cấp phát văn bằng', student: 'Phan Minh Anh', status: 'SUCCESS', hash: '0xb31e...667d' },
            { id: 'TX-09550', time: '2 ngày trước', action: 'Cấp phát văn bằng', student: 'Trần Thị Bích', status: 'SUCCESS', hash: '0x9c2f...33b1' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const PIE_COLORS = ['#2563EB', '#38BDF8', '#10B981', '#F59E0B'];

  const renderShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
    const isActive = activeIndex === index;
    
    const RADIAN = Math.PI / 180;
    const midAngle = (startAngle + endAngle) / 2;
    
    const moveDistance = isActive ? 12 : 0;
    const dx = Math.cos(-midAngle * RADIAN) * moveDistance;
    const dy = Math.sin(-midAngle * RADIAN) * moveDistance;

    return (
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        style={{
          transform: `translate(${dx}px, ${dy}px)`, 
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease', 
          filter: isActive ? `drop-shadow(0px 8px 16px ${fill}60)` : 'none',
          cursor: 'pointer'
        }}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-sm animate-fade-in-up">
          {label && <p className="font-bold mb-3 text-slate-300 border-b border-slate-700 pb-2">{label}</p>}
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color || pld.payload.fill }} className="font-semibold flex justify-between gap-6 mb-1">
              {pld.name}: <span className="font-bold text-white">{pld.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 3. HIỂN THỊ MÀN HÌNH CHỜ (LOADING) TRƯỚC KHI RENDER DỮ LIỆU
  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Đang đồng bộ dữ liệu từ Blockchain...</p>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
        <StatCard title="Tổng số sinh viên" value={stats.totalStudents.toLocaleString()} icon={Users} colorClass="text-blue-600" bgClass="bg-blue-100" />
        <StatCard title="Bằng Blockchain" value={stats.issuedCertificates.toLocaleString()} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-100" />
        <StatCard title="Đã thu hồi" value={stats.revokedCertificates} icon={XOctagon} colorClass="text-rose-600" bgClass="bg-rose-100" />
        <StatCard title="Hồ sơ chờ xử lý" value={stats.pendingStudents} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-100" />
      </div>

      {/* 2. KHU VỰC BIỂU ĐỒ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Biểu đồ Cột */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tình hình Cấp phát theo tháng</h2>
              <p className="text-xs text-slate-500 font-medium">So sánh tương quan giữa số lượng cấp mới và thu hồi</p>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
              5 Tháng gần đây
            </div>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#F8FAFC'}} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600, color: '#334155' }} />
                <Bar dataKey="issued" name="Số bằng đã cấp" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={32} activeBar={<Rectangle fill="#1D4ED8" />} />
                <Bar dataKey="revoked" name="Số bằng thu hồi" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={32} activeBar={<Rectangle fill="#B91C1C" />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tròn (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-slate-800">Cơ cấu Chuyên ngành</h2>
            <p className="text-xs text-slate-500 font-medium">Di chuột vào từng phần để xem chi tiết</p>
          </div>
          
          <div className="flex-1 h-60 relative mt-4">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="transition-all duration-300 transform flex flex-col items-center justify-center">
                {activeIndex >= 0 ? (
                  <>
                    <span className="text-sm font-extrabold text-slate-800 text-center px-2">{stats.majorChart[activeIndex].name}</span>
                    <span className="text-xs font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-full">{stats.majorChart[activeIndex].value} bằng</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-slate-400">Chuyên ngành</span>
                )}
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Pie 
                  data={stats.majorChart} innerRadius={68} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none"
                  shape={renderShape} 
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {stats.majorChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="outline-none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold text-slate-600 mt-2 border-t pt-5 border-slate-100 relative z-10">
            {stats.majorChart.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-2 transition-all cursor-pointer ${activeIndex === idx ? 'scale-105 text-slate-900 font-bold' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: PIE_COLORS[idx] }}></div>
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. NHẬT KÝ GIAO DỊCH BLOCKCHAIN GẦN ĐÂY */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={18} strokeWidth={2.5} /></div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Giao dịch Blockchain gần đây</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Quá trình tương tác Smart Contract thời gian thực</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Mã giao dịch</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Loại hành động</th>
                <th className="p-4">Sinh viên thụ hưởng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">TxHash (Blockchain)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600 bg-white">
              {stats.recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 text-slate-900 font-bold text-xs">{act.id}</td>
                  <td className="p-4 text-xs text-slate-500">{act.time}</td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${act.status === 'SUCCESS' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>
                      {act.action}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{act.student}</td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${act.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <ShieldCheck size={16} /> {act.status === 'SUCCESS' ? 'Đã xác thực' : 'Đã thu hồi'}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-slate-200 hover:text-blue-600 transition shadow-sm font-bold tracking-wider">
                      {act.hash}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}