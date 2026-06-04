import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Rectangle, Sector } from 'recharts';
import { Users, CheckCircle, XOctagon, Clock, ShieldCheck, Activity, Loader2, AlertTriangle, Zap, CreditCard, X, Check, QrCode } from 'lucide-react';
import StatCard from '../../components/school/StatCard';
import axiosClient from '../../api/axiosClient';

// --- CẤU HÌNH GÓI CƯỚC & NGÂN HÀNG ---
const PACKAGES = [
  { id: 'BASIC', name: 'Gói Tiêu chuẩn', price: '599.000', numericPrice: 599000, limit: 10000, color: 'blue', desc: 'Phù hợp trường quy mô nhỏ' },
  { id: 'PREMIUM', name: 'Gói Chuyên nghiệp', price: '999.000', numericPrice: 999000, limit: 20000, color: 'indigo', desc: 'Tiết kiệm nhất, ưu tiên xử lý' }
];
const BANK_CONFIG = { bankId: 'MB', accountNo: '0123456789', accountName: 'NGUYEN VAN ADMIN' };

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // 1. STATE LƯU DỮ LIỆU
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. STATE CHO MỤC THANH TOÁN (TRỰC TIẾP TRÊN TRANG)
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [uniqueQrKey, setUniqueQrKey] = useState('');

  // 3. GỌI API KHI RENDER
  const fetchDashboardData = async () => {
    try {
      const response = await axiosClient.get('/school/dashboard'); 
      if (response.data && response.data.code === 200) {
        setStats(response.data.data); 
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // DỮ LIỆU MẪU - Để test, tôi set limit = 0
      setStats({
        schoolCode: 'BKA_01', 
        certificateLimit: 0, // 0 bằng => Buộc phải mua
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
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, []);

  // 4. LẮNG NGHE THANH TOÁN (POLLING MỖI 3 GIÂY)
  useEffect(() => {
    let intervalId;
    if (selectedPackage && !paymentSuccess) {
      intervalId = setInterval(async () => {
        try {
          const response = await axiosClient.get('/school/dashboard');
          const data = response.data?.data;
          
          if (data && data.certificateLimit > (stats?.certificateLimit || 0)) {
            setPaymentSuccess(true);
            setStats(data);
            clearInterval(intervalId);
            setTimeout(() => { setSelectedPackage(null); setPaymentSuccess(false); }, 4000);
          }
        } catch (error) {
          /* CHỈ DÙNG ĐỂ TEST GIAO DIỆN NẾU CHƯA CÓ API THẬT: */
          // setTimeout(() => {
          //   setPaymentSuccess(true);
          //   setStats(prev => ({...prev, certificateLimit: prev.certificateLimit + selectedPackage.limit}));
          //   setTimeout(() => { setSelectedPackage(null); setPaymentSuccess(false); }, 4000);
          // }, 6000); // Tự động thành công sau 6 giây
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [selectedPackage, paymentSuccess, stats]);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setUniqueQrKey(Date.now().toString().slice(-6)); // Tạo mã 6 số ngẫu nhiên cuối mỗi lần click
    setPaymentSuccess(false);
  };

  // --- CẤU HÌNH RECHARTS ---
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
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill}
        style={{ transform: `translate(${dx}px, ${dy}px)`, transition: 'transform 0.4s ease, filter 0.4s ease', filter: isActive ? `drop-shadow(0px 8px 16px ${fill}60)` : 'none', cursor: 'pointer' }}
      />
    );
  };
  const CustomTooltip = ({ active, payload, label }) => { 
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-sm">
          {payload.map((pld, idx) => ( <p key={idx} style={{ color: pld.color || pld.payload.fill }} className="font-semibold flex justify-between gap-6 mb-1"> {pld.name}: <span className="text-white">{pld.value}</span> </p> ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Đang đồng bộ dữ liệu từ Blockchain...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 relative">
      
      {/* 1. THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
        <StatCard title="Tổng số sinh viên" value={stats.totalStudents.toLocaleString()} icon={Users} colorClass="text-blue-600" bgClass="bg-blue-100" />
        <StatCard title="Bằng Blockchain" value={stats.issuedCertificates.toLocaleString()} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-100" />
        <StatCard title="Đã thu hồi" value={stats.revokedCertificates} icon={XOctagon} colorClass="text-rose-600" bgClass="bg-rose-100" />
        <StatCard title="Hồ sơ chờ xử lý" value={stats.pendingStudents} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-100" />
      </div>

      {/* 2. SECTION: QUẢN LÝ HẠN MỨC & THANH TOÁN (TÍCH HỢP TRỰC TIẾP) */}
      <div className={`bg-white rounded-2xl shadow-sm border p-6 lg:p-8 transition-colors ${stats.certificateLimit === 0 ? 'border-rose-300 shadow-rose-100' : 'border-slate-200'}`}>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Trái: Thông tin hạn mức */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${stats.certificateLimit > 0 ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                <Zap size={24} fill="currentColor"/>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Hạn mức cấp bằng</h2>
            </div>
            
            <div className="mt-6">
              <p className="text-slate-500 text-sm font-medium mb-1">Số dư văn bằng hiện tại</p>
              <div className={`text-5xl font-black ${stats.certificateLimit > 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                {stats.certificateLimit.toLocaleString()}
              </div>
            </div>

            {stats.certificateLimit === 0 && (
              <div className="mt-6 flex items-start gap-2 bg-rose-50 text-rose-700 p-4 rounded-xl text-sm border border-rose-100">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>Hệ thống cấp phát đã bị khóa do hết hạn mức. Vui lòng nạp thêm gói cước để tiếp tục sử dụng.</p>
              </div>
            )}
            {stats.certificateLimit > 0 && stats.certificateLimit < 100 && (
              <div className="mt-6 flex items-start gap-2 bg-amber-50 text-amber-700 p-4 rounded-xl text-sm border border-amber-100">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>Hạn mức sắp hết. Hãy chuẩn bị gia hạn để không làm gián đoạn việc cấp bằng.</p>
              </div>
            )}
          </div>

          {/* Phải: Chọn gói cước HOẶC Hiển thị mã QR */}
          <div className="w-full lg:w-2/3">
            {!selectedPackage ? (
              // BƯỚC 1: HIỂN THỊ BẢNG GIÁ
              <div>
                <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2"><CreditCard size={18}/> Chọn mua gói cước mới</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="border-2 border-slate-100 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all group relative cursor-pointer" onClick={() => handleSelectPackage(pkg)}>
                      {pkg.id === 'PREMIUM' && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Khuyên dùng</div>}
                      <h4 className="text-lg font-bold text-slate-800">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.desc}</p>
                      <div className="my-3 text-2xl font-extrabold text-slate-900">{pkg.price}<span className="text-sm font-medium text-slate-500 ml-1">VNĐ</span></div>
                      <div className="bg-slate-50 text-slate-600 text-sm font-semibold p-3 rounded-xl flex justify-between items-center group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                        <span>+{pkg.limit.toLocaleString()} bằng</span>
                        <Zap size={16} fill="currentColor"/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // BƯỚC 2: THANH TOÁN QR INLINE (Không hiện Modal popup)
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                {!paymentSuccess ? (
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <div className="bg-white border-2 border-dashed border-blue-300 p-3 rounded-2xl relative shrink-0">
                      <img 
                        src={`https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${selectedPackage.numericPrice}&addInfo=UPGRADE ${stats.schoolCode} ${selectedPackage.id} ${uniqueQrKey}&accountName=${BANK_CONFIG.accountName}`}
                        alt="VietQR" className="w-48 h-48 object-contain"
                      />
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">Thanh toán {selectedPackage.name}</h3>
                      <p className="text-slate-600 text-sm mb-4">Sử dụng App ngân hàng để quét mã QR.</p>
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-500">Số tiền:</span>
                          <span className="font-bold text-rose-600 text-base">{selectedPackage.price} VNĐ</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 shrink-0">Nội dung CK:</span>
                          <span className="font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold text-right ml-2">
                            UPGRADE {stats.schoolCode} {selectedPackage.id} {uniqueQrKey}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-600 text-sm font-semibold mb-4">
                        <Loader2 size={16} className="animate-spin" /> Hệ thống đang chờ nhận tiền...
                      </div>

                      <button onClick={() => setSelectedPackage(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center sm:justify-start gap-1 w-full sm:w-auto">
                        <X size={16}/> Hủy & Chọn gói khác
                      </button>
                    </div>
                  </div>
                ) : (
                  // BƯỚC 3: THÀNH CÔNG NẰM LUÔN TẠI CHỖ
                  <div className="flex items-center gap-6 animate-fade-in-up py-4 px-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                      <Check size={32} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800 mb-1">Thanh toán thành công!</h3>
                      <p className="text-emerald-600 text-sm font-medium">Bạn vừa được cộng thêm <strong>{selectedPackage.limit.toLocaleString()}</strong> văn bằng vào hạn mức.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC BIỂU ĐỒ (Dưới mục thanh toán) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biểu đồ Cột */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tình hình Cấp phát theo tháng</h2>
              <p className="text-xs text-slate-500 font-medium">So sánh tương quan giữa số lượng cấp mới và thu hồi</p>
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

        {/* Biểu đồ Tròn */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-slate-800">Cơ cấu Chuyên ngành</h2>
          </div>
          <div className="flex-1 h-60 relative mt-4">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="transition-all duration-300 transform flex flex-col items-center justify-center">
                {activeIndex >= 0 ? (
                  <>
                    <span className="text-sm font-extrabold text-slate-800 text-center px-2">{stats.majorChart[activeIndex].name}</span>
                    <span className="text-xs font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-full">{stats.majorChart[activeIndex].value} bằng</span>
                  </>
                ) : ( <span className="text-sm font-bold text-slate-400">Chuyên ngành</span> )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Pie data={stats.majorChart} innerRadius={68} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none" shape={renderShape} onMouseEnter={(_, index) => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(-1)}>
                  {stats.majorChart.map((entry, index) => ( <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="outline-none" /> ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. NHẬT KÝ GIAO DỊCH BLOCKCHAIN */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={18} strokeWidth={2.5} /></div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Giao dịch Blockchain gần đây</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Mã giao dịch</th><th className="p-4">Thời gian</th><th className="p-4">Loại hành động</th>
                <th className="p-4">Sinh viên thụ hưởng</th><th className="p-4">Trạng thái</th><th className="p-4 text-center">TxHash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600 bg-white">
              {stats.recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 text-slate-900 font-bold text-xs">{act.id}</td>
                  <td className="p-4 text-xs text-slate-500">{act.time}</td>
                  <td className="p-4"><span className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${act.status === 'SUCCESS' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>{act.action}</span></td>
                  <td className="p-4 font-bold text-slate-700">{act.student}</td>
                  <td className="p-4"><div className={`flex items-center gap-1.5 text-xs font-bold ${act.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}><ShieldCheck size={16} /> {act.status === 'SUCCESS' ? 'Đã xác thực' : 'Đã thu hồi'}</div></td>
                  <td className="p-4 text-center"><span className="font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">{act.hash}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}