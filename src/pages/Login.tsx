import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/backendApi'; 
import { useAuth } from '../context/AuthContext'; // <--- استيراد خطاف السياق

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // استخدام دالة تسجيل الدخول من السياق

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // 1. استدعاء دالة تسجيل الدخول للحصول على بيانات المستخدم والـ Token
      const userData = await loginUser({ email, password });
      
      // ⚠️ الخطوة الحاسمة: تمرير الـ Token (وليس userId) إلى دالة السياق
      if (userData.token) {
        login(userData.token); // حفظ الـ JWT Token في localStorage
      }
      
      setMessage(`✅ تسجيل دخول ناجح. مرحباً بك يا ${userData.email}!`);
      
      // التوجيه إلى لوحة التحكم (Dashboard) بعد النجاح
      setTimeout(() => navigate('/dashboard'), 2000); 
    } catch (error) {
      // عرض رسالة الخطأ الواردة من الخادم (مثل: Invalid email or password)
      setMessage(`❌ ${error instanceof Error ? error.message : 'فشل تسجيل الدخول.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-16 bg-white shadow-2xl rounded-xl border-t-4 border-green-600">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">تسجيل الدخول</h1>
      
      <form onSubmit={handleSubmit}>
        
        {/* حقل البريد الإلكتروني */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* حقل كلمة المرور */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {message && (
          <p className={`mb-4 p-3 rounded-lg text-center font-semibold ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        ليس لديك حساب؟ {' '}
        <Link to="/register" className="text-green-600 hover:underline">سجّل الآن</Link>
      </p>
    </div>
  );
};

export default Login;