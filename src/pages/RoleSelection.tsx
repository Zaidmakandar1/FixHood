import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  // If user is already logged in, redirect to their dashboard
  React.useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const handleRoleSelect = (role: 'homeowner' | 'fixer') => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select how you want to use FixIt
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleRoleSelect('homeowner')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            I need help with repairs
          </button>
          <button
            onClick={() => handleRoleSelect('fixer')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
          >
            I want to offer repair services
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;