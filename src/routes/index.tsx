import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import RoleSelection from '../pages/RoleSelection';
import HomeOwnerDashboard from '../pages/homeowner/Dashboard';
import FixerDashboard from '../pages/fixer/Dashboard';
import AvailableJobs from '../pages/fixer/AvailableJobs';
import JobList from '../pages/jobs/JobList';
import JobDetails from '../pages/jobs/JobDetails';
import CreateJob from '../pages/jobs/CreateJob';
import Navigation from '../components/shared/Navigation';
import ChatPage from '../pages/chat/ChatPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import Register from '../pages/Register';
import Login from '../pages/Login';

const AppRoutes: React.FC = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      {user && <Navigation />}
      <main className="pt-16 min-h-screen">
        <Routes>
          {/* Root route - redirect based on user role */}
          <Route path="/" element={
            !user ? (
              <RoleSelection />
            ) : user.role === 'homeowner' ? (
              <Navigate to="/homeowner" replace />
            ) : (
              <Navigate to="/fixer" replace />
            )
          } />
          
          {/* Auth routes */}
          <Route path="/login" element={
            !user ? <Login /> : <Navigate to={`/${user.role}`} replace />
          } />
          <Route path="/register" element={
            !user ? <Register /> : <Navigate to={`/${user.role}`} replace />
          } />
          
          {/* Protected routes */}
          <Route path="/homeowner" element={
            <ProtectedRoute role="homeowner">
              <HomeOwnerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/fixer" element={
            <ProtectedRoute role="fixer">
              <FixerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Job routes */}
          <Route path="/jobs" element={
            <ProtectedRoute role="fixer">
              <AvailableJobs />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute role="fixer">
              <JobDetails />
            </ProtectedRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/create-job" element={
            <ProtectedRoute role="homeowner">
              <CreateJob />
            </ProtectedRoute>
          } />
          
          <Route path="/chat/:jobId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
};

export default AppRoutes; 