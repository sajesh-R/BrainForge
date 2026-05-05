import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';
import CreateCourse from './pages/courses/CreateCourse';

import DirectChat from './pages/chat/DirectChat';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import SmartDashboard from './pages/smart/SmartDashboard';
import ReportsPage from './pages/reports/ReportsPage';
import Navbar from './components/layout/Navbar';
import './assets/styles/base/global.css';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/courses" element={
          <PrivateRoute>
            <CourseList />
          </PrivateRoute>
        } />

        <Route path="/courses/create" element={
          <PrivateRoute>
            <CreateCourse />
          </PrivateRoute>
        } />

        <Route path="/courses/:id" element={
          <PrivateRoute>
            <CourseDetails />
          </PrivateRoute>
        } />

        <Route path="/courses/:id/assignments" element={
          <PrivateRoute>
            <AssignmentsPage />
          </PrivateRoute>
        } />

        <Route path="/smart" element={
          <PrivateRoute>
            <SmartDashboard />
          </PrivateRoute>
        } />

        <Route path="/chat" element={
          <PrivateRoute>
            <DirectChat />
          </PrivateRoute>
        } />

        <Route path="/reports" element={
          <PrivateRoute>
            <ReportsPage />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
