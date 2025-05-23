import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

type ProtectedRouteProps = {
  children: ReactNode;
  role: 'homeowner' | 'fixer' | null;
};

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { role: userRole } = useUser();
  
  if (!userRole) {
    return <Navigate to="/" replace />;
  }
  
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'homeowner' ? '/homeowner' : '/fixer'} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;