import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- تم تصحيح الاستيراد

// تعريف نوع بيانات سياق المصادقة
interface AuthContextType {
  isLoggedIn: boolean;
  // دالة login تم تحديثها لاستقبال الـ token
  login: (token: string) => void; 
  // تم تحديث logout لاستقبال navigate
  logout: (navigate: ReturnType<typeof useNavigate>) => void; 
}

// إنشاء السياق (Context)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// نوع لخصائص مزود السياق
interface AuthProviderProps {
  children: ReactNode;
}

// مكون مزود السياق (Provider)
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // ⚠️ تم إزالة استدعاء useNavigate من هنا لحل خطأ "must be used in context of a Router"

  // التحقق من حالة تسجيل الدخول عند تحميل التطبيق (هل يوجد token؟)
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setIsLoggedIn(true);
    }
  }, []);

  // دالة تسجيل الدخول: تخزين الـ Token
  const login = (token: string) => {
    localStorage.setItem('userToken', token); 
    setIsLoggedIn(true);
  };

  // دالة تسجيل الخروج: مسح الـ Token (تستقبل navigate كمعامل)
  const logout = (navigate: ReturnType<typeof useNavigate>) => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    navigate('/login'); // التوجيه إلى صفحة تسجيل الدخول بعد الخروج
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook لاستخدام السياق في أي مكان
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};