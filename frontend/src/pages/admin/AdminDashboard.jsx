import React, { useState, useEffect } from 'react';
import { FileText, Building, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../../api/axiosClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ pendingSchools: 0, approvedSchools: 0, totalCerts: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosClient.get('/admin/dashboard-stats'); 
        if (response.data && response.data.code === 200) {
            setStats(response.data.data.stats);
            setChartData(response.data.data.chart);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard", error);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="bg-yellow-50 p-4 rounded-2xl"><FileText className="h-8 w-8 text-yellow-600" /></div>
          <div>
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Trường chờ duyệt</div>
            <div className="text-4xl font-black text-slate-800">{stats.pendingSchools}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="bg-blue-50 p-4 rounded-2xl"><Building className="h-8 w-8 text-blue-600" /></div>
          <div>
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Trường đang hoạt động</div>
            <div className="text-4xl font-black text-slate-800">{stats.approvedSchools}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="bg-emerald-50 p-4 rounded-2xl"><Activity className="h-8 w-8 text-emerald-600" /></div>
          <div>
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Tổng bằng đã cấp</div>
            <div className="text-4xl font-black text-slate-800">{stats.totalCerts}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-8">Biểu đồ yêu cầu cấp phát (6 tháng qua)</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
              {/* ĐÃ SỬA dataKey="month" */}
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600, fontSize: 14}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dx={-10}/>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} itemStyle={{color: '#2563eb'}}/>
              {/* ĐÃ SỬA dataKey="totalCert" */}
              <Line type="monotone" dataKey="totalCert" name="Số lượng văn bằng" stroke="#2563eb" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff', stroke: '#2563eb'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;