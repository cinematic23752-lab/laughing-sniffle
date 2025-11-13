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

interface BalanceItem {
    currency: string;
    amount: number;
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
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`فشل في جلب الرد من AI: ${errorMessage}`); 
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
        // ⚠️ ملاحظة: يجب إضافة الـ JWT Token في الـ Header هنا بعد إعداد الـ Interceptors
        const response = await axios.post(endpoint, settings);
        return response.data.message; 
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(`فشل في حفظ إعدادات البوت: ${errorMessage}`);
        }
        throw new Error('حدث خطأ غير معروف أثناء حفظ الإعدادات.');
    }
}

// ------------------------------------------------------------------
// دوال المصادقة (Authentication Functions)
// ------------------------------------------------------------------

/**
 * دالة لتسجيل مستخدم جديد في MongoDB.
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
 * دالة لتسجيل دخول المستخدم والتحقق من المصادقة.
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

// ------------------------------------------------------------------
// دالة جلب البيانات الحية (Real Data Fetching)
// ------------------------------------------------------------------

/**
 * دالة لجلب رصيد المستخدم من المنصة الحقيقية.
 */
export async function fetchBalance(): Promise<BalanceItem[]> {
    try {
        const endpoint = `${API_BASE_URL}/user/balance`;
        // ⚠️ ملاحظة: يجب إرسال الـ JWT Token في الـ Header لاحقاً
        const response = await axios.get<BalanceItem[]>(endpoint); 
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(`Failed to fetch balance: ${errorMessage}`);
        }
        throw new Error('An unknown error occurred while fetching balance.');
    }
}