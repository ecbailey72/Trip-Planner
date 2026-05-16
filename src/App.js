import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './styles/ventaro.css';
import { setupAxiosAuth, isLoggedIn } from './utils/auth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';

// Set up axios interceptors once
setupAxiosAuth();

// Protected route wrapper
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/trips" element={
          <ProtectedRoute><TripsPage /></ProtectedRoute>
        } />
        <Route path="/trips/:id" element={
          <ProtectedRoute><TripDetailPage /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
