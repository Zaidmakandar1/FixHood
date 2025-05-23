import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import useUserRole from '../hooks/useUserRole';

const NotFoundPage = () => {
  const { role } = useUserRole();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          to={role === 'homeowner' ? '/homeowner' : role === 'fixer' ? '/fixer' : '/'} 
          className="btn btn-primary inline-flex items-center"
        >
          <Home size={18} className="mr-2" />
          Go to {role ? 'Dashboard' : 'Home'}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;