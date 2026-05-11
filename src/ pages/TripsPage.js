import { useState } from 'react';

function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTrip, setNewTrip] = useState({ name: '', startDate: '', endDate: '' });

  const handleCreate = () => {
    if (!newTrip.name) return alert('Please enter a trip name');
    setTrips([...trips, { ...newTrip, id: Date.now() }]);
    setNewTrip({ name: '', startDate: '', endDate: '' });
    setShowForm(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Trips</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: '10px 20px', fontSize: '14px', cursor: 'pointer', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px' }}>
          + New Trip
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>New Trip</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Trip name</label>
            <input
              value={newTrip.name}
              onChange={e => setNewTrip({ ...newTrip, name: e.target.value })}
              placeholder="e.g. Japan 2027"
              style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Start date</label>
              <input
                type="date"
                value={newTrip.startDate}
                onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>End date</label>
              <input
                type="date"
                value={newTrip.endDate}
                onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreate}
              style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Create Trip
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <p style={{ color: '#888' }}>No trips yet. Create your first trip!</p>
      ) : (
        <div>
          {trips.map(trip => (
            <div key={trip.id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>{trip.name}</h2>
              <p style={{ fontSize: '13px', color: '#888' }}>{trip.startDate} — {trip.endDate}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default TripsPage;
