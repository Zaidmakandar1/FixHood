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
import FixerProfile from '../pages/profile/FixerProfile';
import HomeownerProfile from '../pages/profile/HomeownerProfile';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import Register from '../pages/Register';
import Login from '../pages/Login';

const AppRoutes = () => {
  const { user, role } = useUser();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navigation />
      <main className="pt-16">
        <Routes>
          {/* Redirect from root based on role */}
          <Route
            path="/"
            element={
              <Navigate
                to={role === 'homeowner' ? '/homeowner' : '/fixer'}
                replace
              />
            }
          />

          {/* Homeowner routes */}
          <Route
            path="/homeowner"
            element={
              <ProtectedRoute role="homeowner">
                <HomeOwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute role="homeowner">
                <CreateJob />
              </ProtectedRoute>
            }
          />

          {/* Fixer routes */}
          <Route
            path="/fixer"
            element={
              <ProtectedRoute role="fixer">
                <FixerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute role="fixer">
                <AvailableJobs />
              </ProtectedRoute>
            }
          />

          {/* Shared routes */}
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/chat/:jobId" element={<ChatPage />} />
          
          {/* Profile routes */}
          <Route
            path="/profile"
            element={
              role === 'homeowner' ? (
                <ProtectedRoute role="homeowner">
                  <HomeownerProfile />
                </ProtectedRoute>
              ) : (
                <ProtectedRoute role="fixer">
                  <FixerProfile isOwnProfile />
                </ProtectedRoute>
              )
            }
          />
          <Route path="/fixer/:fixerId" element={<FixerProfile />} />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
};

export default AppRoutes; 