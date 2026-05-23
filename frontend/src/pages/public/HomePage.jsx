import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, FileText, Award, Menu, X, 
  Building, CheckCircle, UploadCloud, ArrowRight, Lock, 
  Link as LinkIcon, ChevronDown, ArrowLeft, AlertTriangle, ExternalLink, FileX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [searchForm, setSearchForm] = useState({ certId: '', fullName: '', dob: '' });
  const [pdfFile, setPdfFile] = useState(null);
  
  const [verifyStatus, setVerifyStatus] = useState('idle'); // idle, loading, success, error
  const [certData, setCertData] = useState(null);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const qrCertId = searchParams.get('certId');
    if (qrCertId) {
      // Điền mã vào ô input cho đẹp
      setSearchForm(prev => ({ ...prev, certId: qrCertId }));
      // Tự động gọi API quét QR
      handleAutoScanQR(qrCertId);
      
      // Cuộn màn hình xuống khu vực kết quả (tuỳ chọn)
      document.getElementById('tra-cuu')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);
  const handleAutoScanQR = async (qrCertId) => {
    setVerifyStatus('loading');
    try {
      // Gọi API GET /scan vừa tạo ở Backend
      const response = await axiosClient.get(`/certificates/scan?certId=${qrCertId}`);
      handleApiResponse(response); // Tái sử dụng hàm bóc tách dữ liệu cũ
    } catch (error) {
      setVerifyStatus('error');
      console.error("Lỗi khi quét QR:", error);
    }
  };

  const stats = [
    { id: 1, name: 'Văn Bằng Đã Cấp', value: '125,000+', icon: Award },
    { id: 2, name: 'Trường Liên Kết', value: '45+', icon: Building },
    { id: 3, name: 'Lượt Xác Thực', value: '2.5M+', icon: CheckCircle },
    { id: 4, name: 'Bảo Mật Tuyệt Đối', value: '100%', icon: ShieldCheck },
  ];

  const universities = [
    "ĐH Bách Khoa Hà Nội", "ĐH Quốc Gia TP.HCM", "ĐH Kinh Tế Quốc Dân", 
    "Học Viện BCVT", "Đại Học FPT", "ĐH Công Nghệ Thông Tin", "ĐH Ngoại Thương"
  ];

  const handleInputChange = (e) => setSearchForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]); };

  const handleBackToSearch = () => {
    setVerifyStatus('idle');
    setCertData(null);
    setPdfFile(null);
  };

  const formatIPFSUrl = (url) => {
    if (!url) return null; // Trả về null nếu không có url để dễ xử lý UI
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
    return `https://ipfs.io/ipfs/${url}`; 
  };

  const handleApiResponse = (response) => {
    const actualData = response.data?.data || response.data;
    if (actualData && actualData.studentName) {
      setCertData(actualData);
      setVerifyStatus('success');
    } else {
      setVerifyStatus('error');
    }
  };

  const handleTextSearch = async (e) => {
    e.preventDefault();
    setVerifyStatus('loading');
    try {
      const payload = {
        certId: searchForm.certId.trim(),
        fullName: searchForm.fullName.trim(),
        dob: searchForm.dob
      };
      const response = await axiosClient.post('/certificates/search', payload);
      handleApiResponse(response);
    } catch (error) { 
      setVerifyStatus('error'); 
      console.error(error);
    }
  };

  const handlePdfVerify = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setVerifyStatus('loading');
    
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const response = await axiosClient.post('/certificates/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleApiResponse(response);
    } catch (error) { 
      setVerifyStatus('error'); 
      console.error(error);
    }
  };

  // Logic kiểm tra trạng thái bằng (Revoked / Valid)
  const isRevoked = certData?.status?.toUpperCase() === 'REVOKED';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-20 items-center">
          <a href="#" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">CertiChain</span>
          </a>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#tra-cuu" className="text-gray-600 hover:text-blue-600 font-semibold transition">Tra cứu</a>
            <a href="#ve-chung-toi" className="text-gray-600 hover:text-blue-600 font-semibold transition">Giới thiệu</a>
            <a href="#doi-tac" className="text-gray-600 hover:text-blue-600 font-semibold transition">Đối tác</a>
            <div className="border-l-2 border-gray-200 h-6 mx-2"></div>
            <Link to="/login" className="text-gray-700 font-bold hover:text-blue-600 transition flex items-center gap-1">
              <Lock className="w-4 h-4"/> Đăng nhập
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              Đăng ký Tổ chức
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-24 pb-40 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 text-blue-200 text-sm font-semibold mb-6 border border-blue-700/50 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4"/> Hệ thống xác thực dữ liệu Smart Contract
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Minh Bạch Hóa Văn Bằng <br/> Với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Công Nghệ Web3</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-blue-100/80 mx-auto mb-12 leading-relaxed">
            Nền tảng kiểm chứng văn bằng đại học, chứng chỉ chuyên nghiệp chống làm giả tuyệt đối. Truy xuất dữ liệu gốc trên mạng lưới IPFS tức thì.
          </p>
          <a href="#tra-cuu" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors animate-bounce">
             <ChevronDown className="w-6 h-6"/>
          </a>
        </div>
      </section>

      {/* Verification Widget Section */}
      <section id="tra-cuu" className="max-w-4xl mx-auto px-4 relative -mt-24 z-20 mb-24 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">
          
          {/* DIỆN 1: FORM TÌM KIẾM */}
          {(verifyStatus === 'idle' || verifyStatus === 'loading') && (
            <>
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button 
                  disabled={verifyStatus === 'loading'}
                  onClick={() => setActiveTab('search')} 
                  className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-all ${activeTab === 'search' ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50'}`}
                >
                  <Search className="w-5 h-5"/> Nhập thông tin thủ công
                </button>
                <button 
                  disabled={verifyStatus === 'loading'}
                  onClick={() => setActiveTab('pdf')} 
                  className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-all ${activeTab === 'pdf' ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50'}`}
                >
                  <FileText className="w-5 h-5"/> Tải lên file văn bằng
                </button>
              </div>

              <div className="p-8 md:p-10 min-h-[380px] bg-white flex flex-col justify-center">
                {activeTab === 'search' && (
                  <form onSubmit={handleTextSearch} className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mã văn bằng (Certificate ID)</label>
                        <input type="text" name="certId" required disabled={verifyStatus === 'loading'} onChange={handleInputChange} placeholder="VD: CERT-2026-0001" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium disabled:opacity-60" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                        <input type="text" name="fullName" required disabled={verifyStatus === 'loading'} onChange={handleInputChange} placeholder="VD: Nguyễn Văn A" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium disabled:opacity-60" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                        <input type="date" name="dob" required disabled={verifyStatus === 'loading'} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium disabled:opacity-60" />
                      </div>
                    </div>
                    <button type="submit" disabled={verifyStatus === 'loading'} className="mt-8 w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                      {verifyStatus === 'loading' ? 'Đang truy xuất Blockchain...' : 'Bắt đầu tra cứu'} <ArrowRight className="w-5 h-5"/>
                    </button>
                  </form>
                )}

                {activeTab === 'pdf' && (
                  <form onSubmit={handlePdfVerify} className="animate-fade-in text-center">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-colors relative group cursor-pointer">
                      <input type="file" accept="application/pdf" disabled={verifyStatus === 'loading'} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="bg-white w-20 h-20 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-10 w-10 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{pdfFile ? pdfFile.name : "Kéo thả hoặc nhấn để chọn file PDF văn bằng"}</h3>
                      <p className="text-slate-500">Kích thước tối đa 10MB. File sẽ được trích xuất mã hóa mã Hash để đối chiếu.</p>
                    </div>
                    <button type="submit" disabled={!pdfFile || verifyStatus === 'loading'} className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                      {verifyStatus === 'loading' ? 'Đang bóc tách dữ liệu mật mã...' : 'Xác thực chữ ký điện tử'} <ShieldCheck className="w-5 h-5"/>
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* DIỆN 2: TÌM THẤY KẾT QUẢ - HIỂN THỊ DỮ LIỆU ĐỘNG */}
          {verifyStatus === 'success' && certData && (
            <div className={`p-8 md:p-12 bg-white animate-fade-in border-t-8 ${isRevoked ? 'border-rose-500' : 'border-emerald-500'}`}>
              <div className="text-center max-w-xl mx-auto mb-10">
                <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${isRevoked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isRevoked ? <AlertTriangle className="h-12 w-12" /> : <ShieldCheck className="h-12 w-12" />}
                </div>
                
                <h3 className={`text-2xl md:text-3xl font-black tracking-tight uppercase ${isRevoked ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {certData.status || "Văn Bằng Hợp Lệ"}
                </h3>
                <p className={`font-medium mt-2 ${isRevoked ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {isRevoked 
                    ? "Cảnh báo: Văn bằng này đã bị nhà trường thu hồi và không còn giá trị pháp lý." 
                    : "Dữ liệu ký số đã được đối chiếu trùng khớp hoàn toàn với hồ sơ gốc lưu trữ trên Blockchain."}
                </p>
              </div>

              {/* KHỐI HIỂN THỊ LÝ DO THU HỒI (CHỈ XUẤT HIỆN KHI BẰNG BỊ REVOKED) */}
              {isRevoked && (
                <div className="max-w-2xl mx-auto mb-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl flex gap-3 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm uppercase tracking-wide">Lý do thu hồi từ nhà trường:</h4>
                    <p className="text-rose-700 font-medium text-base mt-1 italic">
                      "{certData.reasonRevoked || "Không có lý do cụ thể được ghi nhận"}"
                    </p>
                  </div>
                </div>
              )}

              {/* Thông tin sinh viên */}
              <div className={`rounded-2xl border p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ${isRevoked ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Họ tên sinh viên</span>
                  <span className={`text-lg font-extrabold ${isRevoked ? 'text-rose-900 line-through opacity-70' : 'text-slate-800'}`}>{certData.studentName || "Không có dữ liệu"}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày sinh</span>
                  <span className={`text-lg font-extrabold ${isRevoked ? 'text-rose-900 opacity-70' : 'text-slate-800'}`}>{certData.dob || "Không có dữ liệu"}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Chuyên ngành học</span>
                  <span className={`text-lg font-extrabold ${isRevoked ? 'text-rose-900 opacity-70' : 'text-slate-800'}`}>{certData.major || "Không có dữ liệu"}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Xếp loại tốt nghiệp</span>
                  <span className={`text-lg font-extrabold ${isRevoked ? 'text-rose-900 opacity-70' : 'text-slate-800'}`}>{certData.classification || "Không có dữ liệu"}</span>
                </div>
                
                {/* Nút bấm xem file PDF Gốc - Động theo IPFS Url */}
                <div className={`md:col-span-2 pt-4 border-t ${isRevoked ? 'border-rose-200/50' : 'border-slate-200'}`}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Đường dẫn tệp gốc (IPFS)</span>
                  
                  {certData.ipfsUrl && !isRevoked ? (
                    <a 
                      href={formatIPFSUrl(certData.ipfsUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-2 w-full py-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                    >
                      <ExternalLink className="w-5 h-5"/> Nhấn để xem bản gốc trên mạng IPFS
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full py-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-bold shadow-sm cursor-not-allowed">
                      <div className="flex items-center gap-2">
                        <FileX className="w-5 h-5"/> 
                        <span>{isRevoked ? "Bản mềm PDF đã bị khóa do văn bằng bị thu hồi" : "Không tìm thấy liên kết bản gốc"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleBackToSearch} 
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại tra cứu
                </button>
              </div>
            </div>
          )}

          {/* DIỆN 3: LỖI / KHÔNG TÌM THẤY */}
          {verifyStatus === 'error' && (
            <div className="p-8 md:p-12 bg-white animate-fade-in text-center border-t-8 border-rose-500">
              <div className="max-w-xl mx-auto mb-8">
                <div className="inline-flex items-center justify-center bg-rose-100 p-4 rounded-full text-rose-600 mb-4 animate-bounce">
                  <AlertTriangle className="h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-rose-900 tracking-tight">Không Tìm Thấy Hoặc Bị Sai Lệch</h3>
                <p className="text-rose-700 font-medium mt-2">Hệ thống Blockchain từ chối xác thực thông tin này.</p>
              </div>
              
              <div className="flex justify-center mt-8">
                <button 
                  onClick={handleBackToSearch} 
                  className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-md transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại kiểm tra dữ liệu khác
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

       {/* 3. Statistics Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
          {stats.map(stat => (
            <div key={stat.id} className="text-center px-4 group">
              <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm"><stat.icon className="w-8 h-8"/></div>
              <dt className="text-4xl font-black text-gray-900 mb-2">{stat.value}</dt>
              <dd className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.name}</dd>
            </div>
          ))}
        </div>
      </section>

        <section id="ve-chung-toi" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Công Nghệ Cốt Lõi Của CertiChain</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Giải quyết bài toán muôn thuở về nạn làm giả văn bằng thông qua việc phân tán dữ liệu và tạo ra một chữ ký số duy nhất, không thể thay đổi cho mỗi sinh viên.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 flex items-center justify-center rounded-2xl mb-8">
                <ShieldCheck className="h-8 w-8 text-blue-600"/>
              </div>
              <h4 className="text-2xl font-extrabold text-gray-900 mb-4">Tính Bất Biến (Immutability)</h4>
              <p className="text-gray-500 text-lg leading-relaxed">Khi một trường đại học cấp phát bằng, toàn bộ thông tin được mã hóa thành một chuỗi Hash và ghi vĩnh viễn lên Blockchain. Dữ liệu này không thể bị sửa đổi hay xóa bỏ bởi bất kỳ ai.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 flex items-center justify-center rounded-2xl mb-8">
                <LinkIcon className="h-8 w-8 text-blue-600"/>
              </div>
              <h4 className="text-2xl font-extrabold text-gray-900 mb-4">Lưu Trữ Mạng IPFS</h4>
              <p className="text-gray-500 text-lg leading-relaxed">Bản sao điện tử (PDF) của văn bằng được cắt nhỏ và lưu trữ phi tập trung trên mạng lưới IPFS, đảm bảo file gốc luôn sẵn sàng 24/7 và không bao giờ bị mất do sập máy chủ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Partners Section */}
      <section id="doi-tac" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-sm font-black text-blue-600 tracking-[0.2em] uppercase mb-4">Mạng Lưới Đối Tác</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">Các Tổ Chức & Trường Đại Học Đồng Hành</h3>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {universities.map((uni, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 px-8 py-6 rounded-2xl flex items-center justify-center min-w-[240px] hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all cursor-pointer group">
                 <Building className="h-7 w-7 text-slate-400 mr-3 group-hover:text-blue-600 transition-colors" />
                 <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors text-lg">{uni}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-500" />
            <span className="font-extrabold text-2xl text-white">CertiChain</span>
          </div>
          <p className="text-slate-400 font-medium text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} Hệ thống xác thực văn bằng Blockchain.<br/>Bảo vệ danh tiếng học thuật và giá trị chất xám.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;