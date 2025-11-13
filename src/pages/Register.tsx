import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/backendApi'; // استخدام دالة الخدمة الجديدة

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // استدعاء دالة التسجيل التي تتصل بالمسار الآمن في Backend
      const responseMessage = await registerUser({ username, email, password });
      setMessage(`✅ ${responseMessage} يمكنك الآن تسجيل الدخول.`);
      // التوجيه إلى صفحة تسجيل الدخول بعد النجاح
      setTimeout(() => navigate('/login'), 2000); 
    } catch (error) {
      // عرض رسالة الخطأ الواردة من الخادم (مثل: المستخدم موجود بالفعل)
      setMessage(`❌ ${error instanceof Error ? error.message : 'فشل التسجيل.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-16 bg-white shadow-2xl rounded-xl border-t-4 border-purple-600">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">إنشاء حساب جديد</h1>
      
      <form onSubmit={handleSubmit}>
        
        {/* حقل اسم المستخدم */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="username">اسم المستخدم</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* حقل البريد الإلكتروني */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
            minLength={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
          className="w-full bg-purple-600 text-white text-lg py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        هل لديك حساب بالفعل؟ {' '}
        <Link to="/login" className="text-purple-600 hover:underline">سجّل الدخول</Link>
      </p>
    </div>
  );
};

export default Register;