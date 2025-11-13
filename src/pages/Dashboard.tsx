import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { saveBotSettings, fetchBalance } from '../services/backendApi'; 

// تعريف نوع البيانات الخاصة بالإحصائيات (Mock)
interface DashboardData {
  userCount: number;
  activeBots: number;
  totalTrades: number;
}

// تعريف نوع بيانات إعدادات البوت (لنموذج الإدخال)
interface BotSettings {
  pair: string;
  amount: number;
  strategy: 'DCA' | 'Grid Trading' | 'Scalping' | 'Arbitrage';
}

// تعريف نوع بيانات الرصيد الحقيقي
interface BalanceItem {
    currency: string;
    amount: number;
}

// دالة محاكاة لجلب الإحصائيات (Mock)
const fetchDashboardStatsMock = async (): Promise<DashboardData> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return {
        userCount: 1540,
        activeBots: 4,
        totalTrades: 9876,
    };
};

const Dashboard: React.FC = () => {
  // حالات الإحصائيات والأرصدة
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [balance, setBalance] = useState<BalanceItem[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  // حالات نموذج إعدادات البوت
  const [settings, setSettings] = useState<BotSettings>({
    pair: 'BTC/USDT',
    amount: 1000,
    strategy: 'DCA',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // 1. جلب الإحصائيات (Mock) عند تحميل المكون
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchDashboardStatsMock(); 
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // 2. جلب الرصيد الحقيقي (من المنصة عبر الخادم الخلفي)
  useEffect(() => {
    const getBalance = async () => {
        setLoadingBalance(true);
        try {
            // استخدام دالة fetchBalance الجديدة
            const balanceData = await fetchBalance();
            setBalance(balanceData);
        } catch (err) {
            console.error("Failed to fetch balance:", err);
            // عرض رسالة خطأ في الـ saveMessage لتنبيه المستخدم
            setSaveMessage(`❌ فشل الاتصال بالمنصة: ${err instanceof Error ? err.message : 'خطأ غير معروف.'}`);
        } finally {
            setLoadingBalance(false);
        }
    };
    getBalance();
  }, []); 

  // دالة لتحديث حالة النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  // دالة لحفظ الإعدادات في MongoDB وتشغيل البوت
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const responseMessage = await saveBotSettings(settings);
      setSaveMessage(`✅ نجاح: ${responseMessage}`);
      
    } catch (error) {
      setSaveMessage(`❌ فشل: ${error instanceof Error ? error.message : 'خطأ غير معروف.'}`);
    } finally {
      setIsSaving(false);
    }
  };


  if (loadingStats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-purple-600">⏳ جاري تحميل لوحة التحكم...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 mt-10">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-purple-500 pb-2">📊 لوحة تحكم النظام الآلي</h1>
      
      {/* 1. قسم الرصيد الحي (جديد) */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-lg mb-12">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">💰 رصيد المنصة الحي</h2>
        
        {loadingBalance ? (
            <p className="text-blue-500">جاري الاتصال بالمنصة وجلب الرصيد...</p>
        ) : balance.length > 0 ? (
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {balance.map((item) => (
                    <li key={item.currency} className="bg-white p-3 rounded-lg shadow-sm flex justify-between">
                        <span className="font-semibold">{item.currency}</span>
                        <span>{item.amount.toFixed(4)}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-red-500 font-semibold">لا يوجد رصيد فعال لعرضه أو فشل الاتصال بالمنصة. (تحقق من مفاتيح API).</p>
        )}
      </div>

      {/* 2. قسم الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* البطاقات الإحصائية... */}
          <div className="bg-white shadow-2xl p-8 rounded-xl text-center transition duration-300 hover:scale-[1.02] border-t-4 border-blue-500">
            <p className="text-5xl font-extrabold text-blue-600">{stats.userCount.toLocaleString()}</p>
            <p className="text-xl text-gray-500 mt-3">إجمالي المستخدمين</p>
          </div>
          <div className="bg-white shadow-2xl p-8 rounded-xl text-center transition duration-300 hover:scale-[1.02] border-t-4 border-green-500">
            <p className="text-5xl font-extrabold text-green-600">{stats.activeBots}</p>
            <p className="text-xl text-gray-500 mt-3">البوتات النشطة</p>
          </div>
          <div className="bg-white shadow-2xl p-8 rounded-xl text-center transition duration-300 hover:scale-[1.02] border-t-4 border-yellow-500">
            <p className="text-5xl font-extrabold text-yellow-600">{stats.totalTrades.toLocaleString()}</p>
            <p className="text-xl text-gray-500 mt-3">إجمالي الصفقات المنفذة</p>
          </div>
        </div>
      )}
      
      {/* 3. نموذج إعدادات البوت */}
      <div className="bg-white shadow-2xl p-8 rounded-xl border-t-4 border-purple-500">
        <h2 className="text-3xl font-bold mb-6 text-purple-700">⚙️ إعداد روبوت التداول الجديد</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* حقل زوج العملات */}
          <div className="mb-4">
            <label htmlFor="pair" className="block text-gray-700 font-medium mb-2">زوج العملات (مثلاً BTC/USDT)</label>
            <input
              type="text"
              id="pair"
              name="pair"
              value={settings.pair}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* حقل مبلغ الاستثمار */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">مبلغ الاستثمار ($)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={settings.amount}
              onChange={handleChange}
              required
              min="10"
              step="10"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* قائمة الاستراتيجية */}
          <div className="mb-6">
            <label htmlFor="strategy" className="block text-gray-700 font-medium mb-2">استراتيجية التداول</label>
            <select
              id="strategy"
              name="strategy"
              value={settings.strategy}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="DCA">DCA (متوسط تكلفة الدولار)</option>
              <option value="Grid Trading">Grid Trading (تداول الشبكة)</option>
              <option value="Scalping">Scalping (الخطف)</option>
              <option value="Arbitrage">Arbitrage (المراجحة)</option>
            </select>
          </div>

          {/* رسالة الحفظ */}
          {saveMessage && (
            <p className={`mb-4 p-3 rounded-lg font-semibold ${saveMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {saveMessage}
            </p>
          )}

          {/* زر الحفظ */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ وتشغيل البوت'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Dashboard;