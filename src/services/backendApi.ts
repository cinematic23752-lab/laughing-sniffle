import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1'; 

// ------------------------------------------------------------------
// تعريف أنواع البيانات المشتركة
// ------------------------------------------------------------------
interface AIResponse {
  aiResult: string;
}

interface BotSettings {
    pair: string;
    amount: number;
    strategy: 'DCA' | 'Grid Trading' | 'Scalping' | 'Arbitrage';
}

interface UserCredentials {
    email: string;
    password: string;
}

interface UserRegistration extends UserCredentials {
    username: string;
}

interface UserLoginResponse {
    message: string;
    userId: string;
    email: string;
    token?: string; 
}
// ------------------------------------------------------------------


/**
 * دالة لطلب رد Gemini AI عبر الخادم الخلفي الآمن (Proxy)
 */
export async function getAiResponseFromBackend(prompt: string): Promise<string> {
  try {
    const endpoint = `${API_BASE_URL}/gemini-query`;
    const response = await axios.post<AIResponse>(endpoint, { userPrompt: prompt });
    return response.data.aiResult;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('AI Proxy Error:', error.response?.data || error.message);
        throw new Error('فشل في جلب الرد من الخادم الخلفي. الرجاء التأكد من تشغيل الخادم.'); 
    }
    throw new Error('حدث خطأ غير معروف أثناء طلب AI.');
  }
}

/**
 * دالة لحفظ إعدادات البوت في MongoDB عبر الخادم الخلفي.
 */
export async function saveBotSettings(settings: BotSettings): Promise<string> {
    try {
        const endpoint = `${API_BASE_URL}/bots/settings`;
        const response = await axios.post(endpoint, settings);
        return response.data.message; 
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error || error.message;
            console.error('Bot Save Error:', errorMessage);
            throw new Error(`فشل في حفظ إعدادات البوت: ${errorMessage}`);
        }
        throw new Error('حدث خطأ غير معروف أثناء حفظ الإعدادات.');
    }
}

// ------------------------------------------------------------------
// دوال المصادقة (Authentication Functions)
// ------------------------------------------------------------------

/**
 * دالة جديدة لتسجيل مستخدم جديد في MongoDB.
 */
export async function registerUser(userData: UserRegistration): Promise<string> {
    try {
        const endpoint = `${API_BASE_URL}/users/register`;
        const response = await axios.post(endpoint, userData);
        return response.data.message; 
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(`فشل التسجيل: ${errorMessage}`);
        }
        throw new Error('حدث خطأ غير معروف أثناء التسجيل.');
    }
}


/**
 * دالة جديدة لتسجيل دخول المستخدم والتحقق من المصادقة.
 */
export async function loginUser(credentials: UserCredentials): Promise<UserLoginResponse> {
    try {
        const endpoint = `${API_BASE_URL}/users/login`;
        const response = await axios.post<UserLoginResponse>(endpoint, credentials);
            return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(`فشل تسجيل الدخول: ${errorMessage}`);
        }
        throw new Error('حدث خطأ غير معروف أثناء تسجيل الدخول.');
    }
}
// لا يوجد شيء آخر بعد هذا السطر