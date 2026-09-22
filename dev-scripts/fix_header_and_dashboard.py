p1 = "src/pages/TripDetailPage.js"
p2 = "src/components/DashboardTab.js"

# --- File 1: TripDetailPage.js ---
with open(p1, 'r') as f:
    c1 = f.read()

old1a = """  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
"""

new1a = """  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const countdown = () => {
    if (!trip.startDate || trip.status !== 'planning') return null;
    const depart = new Date(trip.startDate + 'T12:00:00');
    const diff = depart - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return { text: 'Departing today!' };
    if (days === 1) return { text: 'Departing tomorrow' };
    return { text: `${days} days to departure` };
  };
"""

old1b = """            {/* Center — trip info */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 1.5rem' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', lineHeight: 1.2, marginBottom: '4px' }}>{trip.name}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>
                {formatDate(trip.startDate)} to {formatDate(trip.endDate)}
              </div>
              {trip.status && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                  {trip.status === 'complete' ? 'Completed Trip' : trip.status === 'active' ? 'Trip in Progress' : 'Planning This Trip'}
                </span>
              )}
            </div>"""

new1b = """            {/* Center — trip info */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 1.5rem' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', lineHeight: 1.2, marginBottom: '4px' }}>{trip.name}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>
                {formatDate(trip.startDate)} to {formatDate(trip.endDate)}
              </div>
              {trip.status && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                  {trip.status === 'complete' ? 'Completed Trip' : trip.status === 'active' ? 'Trip in Progress' : 'Planning This Trip'}
                </span>
              )}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '8px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                {trip.status === 'complete'
                  ? 'Review what you spent, how your points performed, and what to plan better next time.'
                  : trip.status === 'active'
                  ? "You're on the trip! Track daily spend, check your itinerary, and capture memories."
                  : 'Add expenses, build your itinerary, and set your budget before you depart.'}
                {countdown() && <span style={{ marginLeft: '8px', fontWeight: '600', color: '#FFD98A' }}>· {countdown().text}</span>}
              </div>
            </div>"""

n1a = c1.count(old1a)
n1b = c1.count(old1b)
print(f"File 1 - block a: {n1a}x, block b: {n1b}x")

# --- File 2: DashboardTab.js ---
with open(p2, 'r') as f:
    c2 = f.read()

old2 = """      {/* Phase banner */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', padding: '12px 16px',
        background: isComplete ? 'rgba(201,168,76,0.1)' : isActive ? 'rgba(26,122,92,0.08)' : 'rgba(27,42,74,0.06)',
        borderRadius: '10px', border: isComplete ? '1px solid rgba(201,168,76,0.3)' : isActive ? '1px solid rgba(26,122,92,0.2)' : '1px solid rgba(27,42,74,0.1)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: isComplete ? '#C9A84C' : isActive ? '#1A7A5C' : '#1B2A4A', marginBottom: '2px' }}>
            {isPlanning && 'PHASE: Plan — Building your trip 🗓'}
            {isActive && 'PHASE: Go — Trip is underway ✈'}
            {isComplete && 'PHASE: Remember — Trip complete 📸'}
          </div>
          <div style={{ fontSize: '12px', color: '#8A9AB5', marginTop: '2px' }}>
            {isPlanning && 'Add expenses, build your itinerary, and set your budget before you depart.'}
            {isActive && "You're on the trip! Track daily spend, check your itinerary, and capture memories."}
            {isComplete && 'Review what you spent, how your points performed, and what to plan better next time.'}
          </div>
          {trip.startDate && (
            <div style={{ fontSize: '12px', color: '#8A9AB5', marginTop: '4px' }}>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              {cd && !isComplete && <span style={{ marginLeft: '10px', fontWeight: '600', color: cd.color }}>{cd.text}</span>}
            </div>
          )}
        </div>
        {isComplete && (
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
            {showPlanningView ? 'Show remember view' : 'Show planning view'}
          </button>
        )}
      </div>"""

new2 = """      {isComplete && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {showPlanningView ? 'Show remember view' : 'Show planning view'}
          </button>
        </div>
      )}"""

n2 = c2.count(old2)
print(f"File 2 - block: {n2}x")

if n1a == 1 and n1b == 1 and n2 == 1:
    c1 = c1.replace(old1a, new1a).replace(old1b, new1b)
    c2 = c2.replace(old2, new2)
    with open(p1, 'w') as f:
        f.write(c1)
    with open(p2, 'w') as f:
        f.write(c2)
    print("Done - both files updated.")
else:
    print("Stopped - did not find exactly 1 match for each block. No changes made, nothing broken.")
