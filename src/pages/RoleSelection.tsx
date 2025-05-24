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
    <div className="min-h-screen flex items-center justify-center bg-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white rounded-2xl shadow-2xl p-12 animate-fade-in-up transition-all duration-500">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 animate-pulse">
            Choose Your Role
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600 animate-fade-in">
            Select how you want to use FixIt
          </p>
        </div>
        <div className="mt-12 flex flex-col md:flex-row gap-8 items-center justify-center">
          <button
            onClick={() => handleRoleSelect('homeowner')}
            className="w-64 h-32 flex flex-col items-center justify-center px-6 py-4 border-2 border-primary-600 text-lg font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg transform hover:scale-105 transition-all duration-300 animate-bounce"
          >
            🏠 I need help with repairs
          </button>
          <button
            onClick={() => handleRoleSelect('fixer')}
            className="w-64 h-32 flex flex-col items-center justify-center px-6 py-4 border-2 border-secondary-600 text-lg font-semibold rounded-xl text-white bg-secondary-600 hover:bg-secondary-700 shadow-lg transform hover:scale-105 transition-all duration-300 animate-bounce delay-150"
          >
            🛠️ I want to offer repair services
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;