import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Rides from './pages/Rides.jsx';
import CreateRide from './pages/CreateRide.jsx';
import RideDetails from './pages/RideDetails.jsx';
import MyRides from './pages/MyRides.jsx';
import Messages from './pages/Messages.jsx';
import TripHistory from './pages/TripHistory.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/rides/new" element={<CreateRide />} />
              <Route path="/rides/:id" element={<RideDetails />} />
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/history" element={<TripHistory />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
