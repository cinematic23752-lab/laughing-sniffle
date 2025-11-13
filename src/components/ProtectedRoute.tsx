import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- استخدام سياق المصادقة

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // التحقق من حالة تسجيل الدخول
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // إذا لم يكن مسجلاً دخوله، أعد التوجيه إلى صفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  // إذا كان مسجلاً دخوله، اعرض المحتوى المطلوب (Dashboard)
  return <>{children}</>;
};

export default ProtectedRoute;