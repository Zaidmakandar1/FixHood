import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error: contextError, setError } = useUser();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error('Login failed:', err);
      if (contextError === 'Invalid credentials') {
        setError('The email or password you entered is incorrect. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.02] animate-fade-in-up">
        <div>
          <div className="w-20 h-20 mx-auto bg-primary-500 text-white rounded-2xl flex items-center justify-center transform transition-transform hover:rotate-3">
            <span className="text-3xl font-bold">F</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 animate-fade-in">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-fade-in">
            Sign in to continue to FixItLocal
          </p>
          <div className="mt-4 text-center">
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 animate-fade-in"
            >
              Don't have an account? Register here
            </Link>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {contextError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative animate-fade-in">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{contextError}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;