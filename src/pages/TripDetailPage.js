import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../utils/auth';
import axios from 'axios';
import ExpensesTab from '../components/ExpensesTab';
import ItineraryTab from '../components/ItineraryTab';
import ChecklistTab from '../components/ChecklistTab';
import DailySpendTab from '../components/DailySpendTab';
import JournalTab from '../components/JournalTab';
import PointsTab from '../components/PointsTab';
import DashboardTab from '../components/DashboardTab';

const API = process.env.REACT_APP_API_URL || '/api';

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const location = useLocation();

  const getTabFromHash = () => {
    const hash = location.hash.replace('#', '');
    const valid = ['dashboard', 'expenses', 'itinerary', 'daily-spend', 'checklist', 'journal', 'points'];
    return valid.includes(hash) ? hash : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [expenses, setExpenses] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState(false);
  const [tripForm, setTripForm] = useState({});
  const [ownerName, setOwnerName] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [collaborators, setCollaborators] = useState([]);

  const fetchOwner = async () => {
    try {
      const res = await axios.get(`${API}/trips/${id}/owner`);
      if (res.data.id !== currentUser?.id) {
        setOwnerName(res.data.name);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchTrip();
    fetchExpenses();
    fetchCollaborators();
    fetchOwner();
  }, [id]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/trips/${id}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const res = await axios.get(`${API}/trips/${id}/collaborators`);
      setCollaborators(res.data);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
    }
  };

  const handleShare = async () => {
    if (!shareEmail) return;
    try {
      const res = await axios.post(`${API}/trips/${id}/share`, { email: shareEmail });
      setShareMessage(`✓ Trip shared with ${res.data.collaborator.name}`);
      setShareEmail('');
      fetchCollaborators();
    } catch (err) {
      setShareMessage(`✗ ${err.response?.data?.error || 'Failed to share trip'}`);
    }
  };



  const fetchTrip = async () => {
    try {
      const res = await axios.get(`${API}/trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async () => {
    try {
      const res = await axios.put(`${API}/trips/${id}`, tripForm);
      setTrip(res.data);
      setEditingTrip(false);
    } catch (err) {
      console.error('Error updating trip:', err);
      alert('Error saving trip.');
    }
  };

  const statusLabel = (status) => {
    if (status === 'planning') return 'Phase: Plan (trip planning)';
    if (status === 'active') return 'Phase: Go (trip underway)';
    if (status === 'complete') return 'Phase: Remember (trip complete)';
    return status;
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!trip) return <div style={{ padding: '2rem' }}>Trip not found.</div>;

  const tabs = ['Dashboard', 'Expenses', 'Itinerary', 'Daily Spend', 'Checklist', 'Journal', 'Points'];

  const tabSubtitle = (tab) => {
    const phase = trip.status || 'planning';
    const subtitles = {
      planning: {
        'Dashboard': 'Budget & trip overview',
        'Expenses': 'Add bookings & estimates',
        'Itinerary': 'Build your day-by-day plan',
        'Daily Spend': 'Set your daily budget',
        'Checklist': 'Pre-trip tasks to complete',
        'Journal': 'Ready for your notes',
        'Points': 'Plan your points strategy',
      },
      active: {
        'Dashboard': "Today's overview",
        'Expenses': 'Track payments as you go',
        'Itinerary': "Today's schedule",
        'Daily Spend': 'Log your spending',
        'Checklist': 'Tasks to do on the trip',
        'Journal': 'Capture memories now',
        'Points': 'Track redemptions',
      },
      complete: {
        'Dashboard': 'Trip summary & analysis',
        'Expenses': 'Review what you spent',
        'Itinerary': 'Your trip timeline',
        'Daily Spend': 'Spending breakdown',
        'Checklist': 'Post-trip follow-ups',
        'Journal': 'Your travel memories',
        'Points': 'Points performance',
      }
    };
    return subtitles[phase]?.[tab] || '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4' }}>

      {/* ── HEADER ── */}
      <div style={{ background: '#1B2A4A', color: 'white', padding: '0.875rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Header row: logo+nav | trip info | edit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Left — logo + My Trips */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <img src="/logo-horizontal.png" alt="Ventaro"
                onClick={() => navigate('/')}
                style={{ height: '72px', width: 'auto', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
              <button onClick={() => navigate('/trips')}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: '12px', padding: 0, letterSpacing: '0.02em' }}>
                ← My Trips
              </button>
            </div>

            {/* Center — trip info */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 1.5rem' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', lineHeight: 1.2, marginBottom: '4px' }}>{trip.name}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>
                {trip.startDate} — {trip.endDate}
              </div>
              {trip.status && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', textTransform: 'capitalize', color: 'rgba(255,255,255,0.8)' }}>
                  {trip.status}
                </span>
              )}
            </div>

            {/* Right — share + edit */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setShowShare(!showShare); setShareMessage(''); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '12px', padding: '5px 12px', borderRadius: '6px' }}>
                  👥 Share
                </button>
                <button
                  onClick={() => {
                    setTripForm({
                      name: trip.name, startDate: trip.startDate || '', endDate: trip.endDate || '',
                      tripBudget: trip.tripBudget || '', dailyBudget: trip.dailyBudget || '',
                      status: trip.status, cppBenchmark: trip.cppBenchmark || 1.5
                    });
                    setEditingTrip(true);
                  }}
                  style={{ background: 'rgba(201,168,76,0.25)', border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C', cursor: 'pointer', fontSize: '12px', padding: '5px 12px', borderRadius: '6px' }}>
                  Edit trip
                </button>
              </div>
              {collaborators.length > 0 && trip?.userId?._id === currentUser?.id && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                  Shared with: {collaborators.map(c => c.name).join(', ')}
                </div>
              )}
              {trip?.userId?._id !== currentUser?.id && trip?.userId?.name && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                  Shared with you by {trip.userId.name}
                </div>
              )}
            </div>
          </div>

          {/* Share trip panel */}
          {showShare && (
            <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>Share this trip</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="email" value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleShare()}
                  placeholder="Enter their Ventaro email address"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                <button onClick={handleShare}
                  style={{ padding: '7px 16px', background: '#C9A84C', color: '#111C33', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Invite
                </button>
                <button onClick={() => { setShowShare(false); setShareMessage(''); }}
                  style={{ padding: '7px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'white' }}>
                  Cancel
                </button>
              </div>
              {shareMessage && (
                <div style={{ fontSize: '12px', color: shareMessage.startsWith('✓') ? '#C9A84C' : '#ff8888', marginTop: '4px' }}>
                  {shareMessage}
                </div>
              )}
              {collaborators.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currently shared with</div>
                  {collaborators.map(c => (
                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
                      <span>{c.name} · {c.email}</span>
                      <button onClick={async () => {
                        await axios.delete(`${API}/trips/${id}/collaborators/${c._id}`);
                        fetchCollaborators();
                      }} style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid rgba(255,100,100,0.4)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,100,100,0.8)', cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit trip form */}
          {editingTrip && (
            <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>Trip name</label>
                  <input value={tripForm.name || ''} onChange={e => setTripForm({ ...tripForm, name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>Start date</label>
                  <input type="date" value={tripForm.startDate || ''} onChange={e => setTripForm({ ...tripForm, startDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>End date</label>
                  <input type="date" value={tripForm.endDate || ''} onChange={e => setTripForm({ ...tripForm, endDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>Total trip budget ($)</label>
                  <input type="number" value={tripForm.tripBudget || ''} onChange={e => setTripForm({ ...tripForm, tripBudget: parseFloat(e.target.value) || '' })}
                    placeholder="e.g. 12000" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>Daily spend budget ($)</label>
                  <input type="number" value={tripForm.dailyBudget || ''} onChange={e => setTripForm({ ...tripForm, dailyBudget: parseFloat(e.target.value) || '' })}
                    placeholder="e.g. 200" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>Cpp benchmark</label>
                  <input type="number" step="0.1" value={tripForm.cppBenchmark || ''} onChange={e => setTripForm({ ...tripForm, cppBenchmark: parseFloat(e.target.value) || '' })}
                    placeholder="e.g. 1.5" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>Status</label>
                  <select value={tripForm.status || 'planning'} onChange={e => setTripForm({ ...tripForm, status: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: 'none' }}>
                    <option value="planning">🗓 Plan — trip is being planned</option>
                    <option value="active">✈ Go — trip is underway</option>
                    <option value="complete">📸 Remember — trip is complete</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={saveTrip}
                  style={{ padding: '6px 16px', background: '#C9A84C', color: '#111C33', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Save changes
                </button>
                <button onClick={() => setEditingTrip(false)}
                  style={{ padding: '6px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'white' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8E6E1', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map(tab => {
            const key = tab.toLowerCase().replace(' ', '-');
            return (
              <button key={tab}
                onClick={() => { setActiveTab(key); window.location.hash = key; }}
                style={{
                  padding: '10px 18px 12px', fontSize: '13px', border: 'none',
                  background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: activeTab === key ? '2px solid #C9A84C' : '2px solid transparent',
                  color: activeTab === key ? '#1B2A4A' : '#8A9AB5',
                  fontWeight: activeTab === key ? '600' : '400',
                  transition: 'all 0.2s', textAlign: 'center'
                }}>
                <div>{tab}</div>
                <div style={{ fontSize: '10px', color: activeTab === key ? '#C9A84C' : '#aaa', marginTop: '2px', fontWeight: '400' }}>{tabSubtitle(tab)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab === 'dashboard' && <DashboardTab tripId={id} trip={trip} />}
        {activeTab === 'expenses' && <ExpensesTab tripId={id} />}
        {activeTab === 'itinerary' && <ItineraryTab tripId={id} />}
        {activeTab === 'daily-spend' && <DailySpendTab tripId={id} dailyBudget={trip.dailyBudget || 200} />}
        {activeTab === 'checklist' && <ChecklistTab tripId={id} tripStartDate={trip.startDate} />}
        {activeTab === 'journal' && <JournalTab tripId={id} />}
        {activeTab === 'points' && <PointsTab tripId={id} expenses={expenses} />}
      </div>

    </div>
  );
}

export default TripDetailPage;
