import { Routes, Route } from 'react-router-dom';
import './styles/ventaro.css';
import LandingPage from './pages/LandingPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/:id" element={<TripDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
