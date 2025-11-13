import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // سنستخدم axios مباشرة هنا لتمرير الـ JWT Token لاحقاً
import { useAuth } from '../context/AuthContext'; // لمعرفة حالة المستخدم

// ⚠️ يجب استخدام هذا المسار (الذي أنشأناه في server.js)
const API_URL = 'http://localhost:3000/api/v1/user/exchange-keys'; 

const ExchangeSetup: React.FC = () => {
    const [exchangeName, setExchangeName] = useState('binance');
    const [apiKey, setApiKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth(); // نتحقق من تسجيل الدخول

    // ⚠️ ملاحظة: في التطبيق الحقيقي، يجب الحصول على userId من الـ JWT Token
    // نستخدم قيمة وهمية مؤقتاً للتجربة، ولكن يجب استبدالها لاحقاً
    const MOCK_USER_ID = "66b03957242c1626f22e847c"; 
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!isLoggedIn) {
            setMessage('❌ يجب أن تكون مسجلاً دخولك لحفظ المفاتيح.');
            setLoading(false);
            return;
        }
        
        try {
            const token = localStorage.getItem('userToken');

            // إرسال البيانات إلى الخادم الخلفي (Backend Route)
            const response = await axios.post(
                API_URL, 
                { apiKey, secretKey, exchangeName, userId: MOCK_USER_ID }, // نرسل الـ MOCK_USER_ID
                {
                    headers: {
                        // 🔑 إرسال الـ JWT Token في الـ Header (لتأمين المسار لاحقاً)
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            setMessage(`✅ ${response.data.message} سيتم استخدام هذه المفاتيح لتشغيل الروبوت.`);
            setTimeout(() => navigate('/dashboard'), 3000); 

        } catch (error) {
            const errorMessage = axios.isAxiosError(error) ? (error.response?.data?.error || error.message) : 'فشل غير معروف.';
            setMessage(`❌ فشل الحفظ: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8 mt-10 bg-white shadow-2xl rounded-xl border-t-4 border-orange-500">
            <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">إعداد مفاتيح منصة التداول</h1>
            <p className="text-sm text-gray-600 mb-6">يرجى إدخال مفاتيح API الخاصة بك من منصة التداول (لن يتم تخزينها في ملفات عامة).</p>
            
            <form onSubmit={handleSubmit}>
                
                {/* اسم المنصة */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="exchangeName">المنصة (Exchange)</label>
                    <select
                        id="exchangeName"
                        value={exchangeName}
                        onChange={(e) => setExchangeName(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white"
                    >
                        <option value="binance">Binance</option>
                        <option value="kucoin">KuCoin</option>
                        <option value="bybit">Bybit</option>
                    </select>
                </div>

                {/* مفتاح API العام */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="apiKey">API Key (المفتاح العام)</label>
                    <input
                        type="text"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                {/* المفتاح السري */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="secretKey">Secret Key (المفتاح السري)</label>
                    <input
                        type="password"
                        id="secretKey"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full bg-orange-600 text-white text-lg py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-300 disabled:opacity-50"
                >
                    {loading ? 'جاري الحفظ...' : 'حفظ المفاتيح وتفعيل الاتصال'}
                </button>
            </form>
        </div>
    );
};

export default ExchangeSetup;