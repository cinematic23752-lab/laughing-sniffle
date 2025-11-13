import React, { useState } from 'react';
// استيراد دالة الخدمة الآمنة التي تتصل بالـ Backend
import { getAiResponseFromBackend } from '../services/backendApi'; 
import { Link } from 'react-router-dom'; // يمكن استخدامها للتنقل

// تعريف نوع الحالة (State) للمكون
interface ResponseState {
  status: 'loading' | 'success' | 'error' | 'idle';
  message: string;
}

const Home: React.FC = () => {
  const [data, setData] = useState<ResponseState>({ 
    status: 'idle', 
    message: 'اضغط للبدء' 
  });
  const [testPrompt, setTestPrompt] = useState("Explain the concept of 'DCA' in crypto in one sentence.");

  // دالة التعامل مع إرسال الاستعلام
  const fetchInitialData = async () => {
    if (!testPrompt.trim()) {
        setData({ status: 'error', message: 'الرجاء إدخال استعلام.' });
        return;
    }
    setData({ status: 'loading', message: 'جاري جلب الرد من الخادم الخلفي (Proxy)...' });
    
    try {
      // **الربط الحقيقي**: الاتصال بالخادم الخلفي الآمن
      const response = await getAiResponseFromBackend(testPrompt); 
      
      setData({ status: 'success', message: response });
    } catch (error) {
      console.error("Error fetching AI data:", error);
      setData({ status: 'error', message: `فشل في الاتصال: ${error instanceof Error ? error.message : 'خطأ غير معروف.'}` });
    }
  };
  
  // دالة مساعدة لعرض المحتوى بناءً على حالة التحميل
  const renderContent = () => {
    switch (data.status) {
      case 'loading':
        return <p className="text-xl text-blue-500 font-semibold flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {data.message}
        </p>;
      case 'success':
        return (
          <div className="bg-white shadow-md border-r-4 border-green-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-green-600 mb-2">✅ رد Gemini AI الآمن:</h2>
            <p className="text-gray-700 leading-relaxed">{data.message}</p>
          </div>
        );
      case 'error':
        return <p className="text-xl text-red-600 font-semibold">❌ {data.message}</p>;
      default:
        return (
            <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600">{data.message}</p>
                <Link to="/dashboard" className="mt-2 inline-block text-purple-600 hover:text-purple-800 underline">
                    اذهب إلى لوحة التحكم
                </Link>
            </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
      <h1 className="text-4xl font-extrabold mb-4 text-purple-700">تطبيق التداول الآلي 🤖</h1>
      <p className="mb-8 text-lg text-gray-600">هذه الصفحة تختبر الاتصال الآمن بالخادم الخلفي (Backend) الذي يعمل كوسيط لـ Gemini AI.</p>
      
      <div className="mb-6">
        <label htmlFor="promptInput" className="block text-gray-700 font-medium mb-2">استعلام اختباري (Prompt):</label>
        <input
          id="promptInput"
          type="text"
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-150"
          placeholder="أدخل استعلامك هنا..."
          disabled={data.status === 'loading'}
        />
      </div>

      <button 
        onClick={fetchInitialData} 
        disabled={data.status === 'loading'}
        className="w-full bg-purple-600 text-white text-lg py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {data.status === 'loading' ? 'جاري الإرسال...' : 'إرسال الاستعلام واختبار الاتصال'}
      </button>

      <div className="mt-8 pt-6 border-t border-gray-200">
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;