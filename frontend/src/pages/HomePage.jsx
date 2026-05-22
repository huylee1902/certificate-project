import React, { useState } from 'react';
import { 
  Search, ShieldCheck, FileText, Award, Menu, X, 
  Building, CheckCircle, UploadCloud, ArrowRight, Lock, 
  Link as LinkIcon, ChevronDown, MessageSquare, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [searchForm, setSearchForm] = useState({ certId: '', fullName: '', dob: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('idle'); // idle, loading, success, error
  // State cho AI Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là AI Hỗ trợ của CertiChain. Tôi có thể giúp gì cho bạn?", isBot: true }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isBotTyping) return;

    const userText = chatInput;
    setChatInput('');

    // 1. Hiển thị tin nhắn của Người dùng lên màn hình ngay lập tức
    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    // 2. Bật trạng thái "Bot đang gõ..."
    setIsBotTyping(true);

    try {
      // 3. Gọi API sang Back-end Spring Boot
      const response = await axiosClient.post('/chat', { message: userText });
      
      console.log("Dữ liệu thực tế BE trả về:", response.data); // Dòng này để bạn F12 check log cho chuẩn

      // Kiểm tra cấu trúc trả về (Hỗ trợ cả trường hợp bọc qua response.data hoặc response.data.message)
      // Bạn mở file ChatResponse.java ở BE xem tên thuộc tính là gì để điền cho đúng nhé (ở đây tôi ví dụ là message hoặc reply)
      const aiResponseText = response.data?.message || response.data?.reply || response.data;

      if (aiResponseText) {
        const botMessage = { id: Date.now() + 1, text: aiResponseText, isBot: true };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = { id: Date.now() + 1, text: "Hệ thống không trả về nội dung, bạn thử lại sau nhé!", isBot: true };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Lỗi gọi API Chatbot:", error);
      
      // Đọc chi tiết lỗi từ Server trả về nếu có
      const serverErrorLog = error.response?.data?.message || "Không thể kết nối đến máy chủ AI.";
      
      const errorMessage = { 
        id: Date.now() + 1, 
        text: `Lỗi kết nối: ${serverErrorLog}`, 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // 4. Tắt trạng thái "Bot đang gõ..."
      setIsBotTyping(false);
    }
  };
  const stats = [
    { id: 1, name: 'Văn Bằng Đã Cấp', value: '125,000+', icon: Award },
    { id: 2, name: 'Trường Liên Kết', value: '45+', icon: Building },
    { id: 3, name: 'Lượt Xác Thực', value: '2.5M+', icon: CheckCircle },
    { id: 4, name: 'Bảo Mật', value: '100%', icon: ShieldCheck },
  ];

  const universities = [
    "ĐH Bách Khoa Hà Nội", "ĐH Quốc Gia TP.HCM", "ĐH Kinh Tế Quốc Dân", 
    "Học Viện BCVT", "Đại Học FPT", "ĐH Công Nghệ Thông Tin", "ĐH Ngoại Thương"
  ];

  const handleInputChange = (e) => setSearchForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]); };

  const handleTextSearch = async (e) => {
    e.preventDefault();
    setVerifyStatus('loading');
    try {
      const response = await axiosClient.post('/certificates/search', searchForm);
      if (response.data && response.data.code === 200) setVerifyStatus('success');
      else setVerifyStatus('error');
    } catch (error) { setVerifyStatus('error'); }
  };

  const handlePdfVerify = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setVerifyStatus('loading');
    setTimeout(() => setVerifyStatus('success'), 1500); // Giả lập API trả về thành công
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navigation - Cố định (Sticky) */}
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

      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-24 pb-40 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 text-blue-200 text-sm font-semibold mb-6 border border-blue-700/50 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4"/> Hệ thống xác thực sử dụng Smart Contract
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

      {/* 2. Verification Widget Section */}
      <section id="tra-cuu" className="max-w-4xl mx-auto px-4 relative -mt-24 z-20 mb-24 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button onClick={() => setActiveTab('search')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-all ${activeTab === 'search' ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              <Search className="w-5 h-5"/> Nhập thông tin
            </button>
            <button onClick={() => setActiveTab('pdf')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-all ${activeTab === 'pdf' ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              <FileText className="w-5 h-5"/> Tải lên bản mềm (PDF)
            </button>
          </div>

          {/* Form Area */}
          <div className="p-8 md:p-10 min-h-[380px] bg-white">
            {activeTab === 'search' && (
              <form onSubmit={handleTextSearch} className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mã văn bằng (Certificate ID)</label>
                    <input type="text" name="certId" required onChange={handleInputChange} placeholder="VD: CERT-2026-0001" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                    <input type="text" name="fullName" required onChange={handleInputChange} placeholder="VD: Nguyễn Văn A" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                    <input type="date" name="dob" required onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium" />
                  </div>
                </div>
                <button type="submit" disabled={verifyStatus === 'loading'} className="mt-8 w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                  {verifyStatus === 'loading' ? 'Đang truy xuất dữ liệu Blockchain...' : 'Bắt đầu tra cứu'} <ArrowRight className="w-5 h-5"/>
                </button>
              </form>
            )}

            {activeTab === 'pdf' && (
              <form onSubmit={handlePdfVerify} className="animate-fade-in text-center pt-2">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-colors relative group cursor-pointer">
                  <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="bg-white w-20 h-20 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{pdfFile ? pdfFile.name : "Kéo thả hoặc nhấn để chọn file PDF"}</h3>
                  <p className="text-slate-500">Kích thước tối đa 10MB. File sẽ được quét mã Hash ngay trên trình duyệt để đối chiếu.</p>
                </div>
                <button type="submit" disabled={!pdfFile || verifyStatus === 'loading'} className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                  {verifyStatus === 'loading' ? 'Đang bóc tách và đối chiếu Hash...' : 'Xác thực bản mềm'} <ShieldCheck className="w-5 h-5"/>
                </button>
              </form>
            )}

            {/* Results Display */}
            {verifyStatus === 'success' && (
              <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-5 animate-fade-in">
                <div className="bg-emerald-100 p-3 rounded-full shrink-0">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-emerald-900">Văn bằng hoàn toàn hợp lệ!</h3>
                  <p className="text-emerald-700 mt-2 leading-relaxed">Hệ thống xác nhận dữ liệu khớp 100% với Smart Contract trên mạng lưới Blockchain. Bản sao số đã được niêm phong.</p>
                </div>
              </div>
            )}
            {verifyStatus === 'error' && (
              <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-5 animate-fade-in">
                <div className="bg-rose-100 p-3 rounded-full shrink-0">
                  <X className="h-8 w-8 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-rose-900">Không tìm thấy hoặc dữ liệu sai lệch</h3>
                  <p className="text-rose-700 mt-2 leading-relaxed">Thông tin cung cấp không khớp với bất kỳ văn bằng nào, file có dấu hiệu bị chỉnh sửa hoặc văn bằng đã bị nhà trường thu hồi.</p>
                </div>
              </div>
            )}
          </div>
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

      {/* 4. About Section */}
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
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">Tổ Chức & Trường Đại Học Đồng Hành</h3>
          
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
        <div className="fixed bottom-6 right-6 z-50 font-sans">
        {/* 1. Nút bong bóng chat (Floating Button) */}
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-200 flex items-center justify-center group relative animate-bounce"
          >
            <MessageSquare className="w-7 h-7" />
            <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
              Bạn có khúc mắc gì thì đừng ngại hỏi tôi nhé!
            </span>
          </button>
        )}

        {/* 2. Khung giao diện cửa sổ Chatbox */}
        {isChatOpen && (
          <div className="bg-white w-[360px] md:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in-up">
            {/* Header của Chatbox */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm animate-pulse">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">AI chatbot</h4>
                  <p className="text-[11px] text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span> Đang trực tuyến
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vùng hiển thị nội dung tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3 flex flex-col">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-all ${
                    msg.isBot 
                      ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none self-start whitespace-pre-wrap'  
                      : 'bg-blue-600 text-white rounded-tr-none self-end'
                  }`}
                >
                  {msg.text ? msg.text.replace(/\*\*/g, '') : ''}
                </div>
              ))}

              {isBotTyping && (
                <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-tl-none text-slate-500 text-sm font-medium self-start shadow-sm flex items-center gap-1.5 animate-pulse">
                  <span>Trợ lý AI đang gõ</span>
                  <span className="flex gap-0.5 mt-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              )}
            </div>

            {/* Ô nhập dữ liệu đầu vào và gửi tin nhắn */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi về xác thực, Smart Contract..." 
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm text-slate-700 font-medium"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
      </footer>
    </div>
  );
};

export default HomePage;
