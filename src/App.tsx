import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home'; 
import Dashboard from './pages/Dashboard'; 
import Register from './pages/Register'; 
import Login from './pages/Login';     
import ExchangeSetup from './pages/ExchangeSetup'; // استيراد صفحة إعداد المفاتيح
import ProtectedRoute from './components/ProtectedRoute'; // استيراد مكون الحماية
import { useAuth } from './context/AuthContext'; // استيراد خطاف السياق

// مكون مؤقت للصفحة غير الموجودة
const NotFound = () => <div className="text-center p-10 mt-10 text-2xl text-red-600">404 - 😟 الصفحة غير موجودة</div>;


function App() {
  const { isLoggedIn, logout } = useAuth(); // استخدام حالة المصادقة
  const navigate = useNavigate();

  const handleLogout = () => {
    // ⚠️ ملاحظة: دالة logout تتوقع أن يتم تمرير navigate إليها من AuthContext.tsx
    logout(navigate); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* شريط التنقل (Navigation Bar) */}
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold hover:text-purple-400 transition duration-300">
            Crypto Bot
          </Link>
          <div className="space-x-4 space-x-reverse"> 
            
            {/* رابط لوحة التحكم */}
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition duration-300 px-3 py-2 rounded-md text-md font-medium">
              لوحة التحكم
            </Link>

            {/* منطق الأزرار بناءً على حالة تسجيل الدخول */}
            {isLoggedIn ? (
              // إذا كان مسجلاً دخوله: اعرض زر تسجيل الخروج وإعداد المنصة
              <>
                <Link to="/setup-exchange" className="text-yellow-300 hover:text-white transition duration-300 px-3 py-2 rounded-md text-md font-medium">
                  إعداد المنصة
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white transition duration-300 px-3 py-2 rounded-md text-md font-medium hover:bg-red-700"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              // إذا لم يكن مسجلاً دخوله: اعرض أزرار التسجيل والدخول
              <>
                <Link to="/login" className="bg-blue-600 text-white transition duration-300 px-3 py-2 rounded-md text-md font-medium hover:bg-blue-700">
                  تسجيل الدخول
                </Link>
                <Link to="/register" className="text-gray-300 hover:text-white transition duration-300 px-3 py-2 rounded-md text-md font-medium">
                  تسجيل جديد
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* منطقة عرض المسارات */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/register" element={<Register />} /> 
          <Route path="/login" element={<Login />} /> 
          
          {/* مسار إعداد مفاتيح المنصة الجديدة (محمي) */}
          <Route 
            path="/setup-exchange" 
            element={
              <ProtectedRoute>
                <ExchangeSetup />
              </ProtectedRoute>
            } 
          />

          {/* ⚠️ حماية مسار Dashboard ⚠️ */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;