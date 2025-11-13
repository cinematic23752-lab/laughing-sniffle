import axios from 'axios';
// يمكنك استخدام هذا لتحديد أي Types (أنواع) للبيانات المتوقعة، إذا كان لديك ملف Types موجود.
// import { UserData, AIResponse } from '../types'; 

// 1. تعريف مسار الواجهة الخلفية (Backend Base URL)
// يجب عليك تغيير هذا إلى عنوان الخادم الخلفي الحقيقي الخاص بك (مثال: http://api.yourdomain.com)
const API_BASE_URL = 'http://localhost:3000/api/v1'; 

// 2. دالة لطلب البيانات العامة (مثال: جلب قائمة مستخدمين)
export async function fetchAllUsers() {
  try {
    const endpoint = `${API_BASE_URL}/users`;
    console.log(`Fetching data from: ${endpoint}`);
    
    // استخدام axios لإجراء طلب GET إلى الخادم الخلفي
    const response = await axios.get(endpoint);
    
    // القيمة المعادة هي البيانات التي أرسلها الخادم (عادةً JSON)
    return response.data;
  } catch (error) {
    // معالجة الأخطاء
    if (axios.isAxiosError(error)) {
        console.error('Backend Error:', error.response?.data || error.message);
        throw new Error(`Failed to fetch users: ${error.response?.statusText || 'Network error'}`);
    }
    throw new Error('An unknown error occurred while fetching users.');
  }
}

// 3. دالة بديلة لاستدعاء Gemini API (حيث يتصرف Backend كوسيط)
// بدلاً من استدعاء Gemini مباشرة من الواجهة الأمامية، نطلب من الخادم الخلفي (Backend) القيام بذلك
export async function getAiResponseFromBackend(prompt: string) {
  try {
    const endpoint = `${API_BASE_URL}/gemini-query`;
    
    // استخدام axios لإجراء طلب POST وإرسال الـ prompt إلى الخادم
    const response = await axios.post(endpoint, {
      userPrompt: prompt
    });
    
    // الخادم الخلفي هو الذي سيعيد استجابة Gemini بعد معالجتها
    return response.data.aiResult;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('AI Proxy Error:', error.response?.data || error.message);
        throw new Error('Failed to get AI response through backend.');
    }
    throw new Error('An unknown error occurred during AI request.');
  }
}