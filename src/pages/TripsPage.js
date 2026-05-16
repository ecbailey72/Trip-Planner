import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTrip, setNewTrip] = useState({ name: '', startDate: '', endDate: '', tripBudget: '', dailyBudget: '' });
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get(`${API}/trips`);
      setTrips(res.data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTrip.name) return alert('Please enter a trip name');
    try {
      const res = await axios.post(`${API}/trips`, newTrip);
      setTrips([res.data, ...trips]);
      setNewTrip({ name: '', startDate: '', endDate: '', tripBudget: '', dailyBudget: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating trip:', err);
      alert('Error creating trip. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await axios.delete(`${API}/trips/${id}`);
      setTrips(trips.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting trip:', err);
    }
  };

  const statusColor = (status) => {
    if (status === 'planning') return '#1B2A4A';
    if (status === 'active') return '#1A7A5C';
    if (status === 'complete') return '#C9A84C';
    return '#888';
  };

  const statusBg = (status) => {
    if (status === 'planning') return 'rgba(27,42,74,0.1)';
    if (status === 'active') return 'rgba(26,122,92,0.1)';
    if (status === 'complete') return 'rgba(201,168,76,0.12)';
    return '#f0f0f0';
  };

  const statusLabel = (status) => {
    if (status === 'planning') return 'Phase: Plan (trip planning)';
    if (status === 'active') return 'Phase: Go (trip underway)';
    if (status === 'complete') return 'Phase: Remember (trip complete)';
    return status;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4' }}>

      {/* Nav */}
      <nav style={{
        background: '#1B2A4A', padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <img src="/logo-horizontal.png" alt="Ventaro"
          style={{ height: '52px', width: 'auto', filter: 'brightness(0) invert(1)', cursor: 'pointer' }}
          onClick={() => navigate('/')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Hi, {user.name.split(' ')[0]}</span>}
          <button onClick={() => setShowForm(true)}
            style={{ background: '#C9A84C', border: 'none', color: '#111C33', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
            + New Trip
          </button>
          <button onClick={logout}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1B2A4A', marginBottom: '4px' }}>My Trips</h1>
          <p style={{ fontSize: '14px', color: '#8A9AB5' }}>Plan your next adventure or revisit a past one.</p>
        </div>

        {/* New trip form */}
        {showForm && (
          <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(27,42,74,0.08)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1B2A4A', marginBottom: '1.25rem' }}>New Trip</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Trip name *</label>
              <input
                value={newTrip.name}
                onChange={e => setNewTrip({ ...newTrip, name: e.target.value })}
                placeholder="e.g. Japan 2027"
                style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none', color: '#1B2A4A' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Start date</label>
                <input type="date" value={newTrip.startDate}
                  onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>End date</label>
                <input type="date" value={newTrip.endDate}
                  onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Total trip budget ($)</label>
                <input type="number" value={newTrip.tripBudget}
                  onChange={e => setNewTrip({ ...newTrip, tripBudget: parseFloat(e.target.value) || '' })}
                  placeholder="e.g. 12000"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
                <div style={{ fontSize: '11px', color: '#8A9AB5', marginTop: '3px' }}>Cash + points combined</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Daily spend budget ($)</label>
                <input type="number" value={newTrip.dailyBudget}
                  onChange={e => setNewTrip({ ...newTrip, dailyBudget: parseFloat(e.target.value) || '' })}
                  placeholder="e.g. 200"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
                <div style={{ fontSize: '11px', color: '#8A9AB5', marginTop: '3px' }}>Variable daily expenses</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCreate}
                style={{ padding: '9px 22px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Create trip
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '9px 22px', background: 'transparent', border: '1px solid #E8E6E1', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#4A5568' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Trips list */}
        {loading ? (
          <p style={{ color: '#8A9AB5' }}>Loading trips...</p>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '14px', border: '1px solid #E8E6E1' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>✈</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1B2A4A', marginBottom: '8px' }}>No trips yet</div>
            <div style={{ fontSize: '14px', color: '#8A9AB5', marginBottom: '1.5rem' }}>Create your first trip to get started</div>
            <button onClick={() => setShowForm(true)}
              style={{ padding: '9px 22px', background: '#C9A84C', color: '#111C33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
              + New Trip
            </button>
          </div>
        ) : (
          <div>
            {trips.map(trip => (
              <div key={trip._id} style={{
                background: 'white', border: '1px solid #E8E6E1', borderRadius: '14px',
                padding: '1.25rem 1.5rem', marginBottom: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(27,42,74,0.05)',
                transition: 'box-shadow 0.2s'
              }}>
                <div onClick={() => navigate(`/trips/${trip._id}`)} style={{ cursor: 'pointer', flex: 1 }}>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', color: '#1B2A4A' }}>{trip.name}</h2>
                  <div style={{ fontSize: '13px', color: '#8A9AB5', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {trip.startDate && <span>{trip.startDate} — {trip.endDate}</span>}
                    {trip.tripBudget > 0 && <span>Budget: ${trip.tripBudget.toLocaleString()}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '1rem' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    background: statusBg(trip.status), color: statusColor(trip.status),
                    fontWeight: '600', textTransform: 'capitalize'
                  }}>
                    {trip.status}
                  </span>
                  <button onClick={() => navigate(`/trips/${trip._id}`)}
                    style={{ fontSize: '12px', padding: '5px 12px', border: '1px solid #E8E6E1', borderRadius: '6px', background: 'transparent', color: '#1B2A4A', cursor: 'pointer', fontWeight: '500' }}>
                    Open →
                  </button>
                  <button onClick={() => handleDelete(trip._id)}
                    style={{ fontSize: '12px', padding: '5px 10px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripsPage;
