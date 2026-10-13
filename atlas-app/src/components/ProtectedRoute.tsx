import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  requiredPermission?: string;
}

const ProtectedRoute = ({ requiredPermission }: ProtectedRouteProps) => {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-3xl font-bold text-red-600">Akses Ditolak</h1>
        <p className="text-gray-600">Anda tidak memiliki izin untuk melihat halaman ini.</p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
