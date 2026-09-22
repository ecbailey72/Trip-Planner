p1 = "src/pages/TripDetailPage.js"
p2 = "src/components/DashboardTab.js"

# --- File 1: TripDetailPage.js — line breaks in tagline ---
with open(p1, 'r') as f:
    c1 = f.read()

old1 = """              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '8px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                {trip.status === 'complete'
                  ? 'Review what you spent, how your points performed, and what to plan better next time.'
                  : trip.status === 'active'
                  ? "You're on the trip! Track daily spend, check your itinerary, and capture memories."
                  : 'Add expenses, build your itinerary, and set your budget before you depart.'}
                {countdown() && <span style={{ marginLeft: '8px', fontWeight: '600', color: '#FFD98A' }}>· {countdown().text}</span>}
              </div>"""

new1 = """              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '8px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                {trip.status === 'complete' ? (
                  <>Review what you spent, how your points performed,<br />and what to plan better next time.</>
                ) : trip.status === 'active' ? (
                  "You're on the trip! Track daily spend, check your itinerary, and capture memories."
                ) : (
                  <>Add expenses, build your itinerary, and set your budget<br />before you depart.</>
                )}
                {countdown() && <span style={{ marginLeft: '8px', fontWeight: '600', color: '#FFD98A' }}>· {countdown().text}</span>}
              </div>"""

n1 = c1.count(old1)
print(f"File 1 - tagline block: {n1}x")

# --- File 2: DashboardTab.js — move the button ---
with open(p2, 'r') as f:
    c2 = f.read()

old2a = """      {isComplete && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {showPlanningView ? 'Show remember view' : 'Show planning view'}
          </button>
        </div>
      )}

      {/* Budget progress — top of dashboard */}"""

new2a = """      {/* Budget progress — top of dashboard */}"""

old2b = """      {/* Dual bar chart — budget vs actual by category */}
      {(expenses.length > 0 || spending.length > 0) && (() => {"""

new2b = """      {isComplete && (
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {showPlanningView ? 'Show remember view' : 'Show planning view'}
          </button>
        </div>
      )}

      {/* Dual bar chart — budget vs actual by category */}
      {(expenses.length > 0 || spending.length > 0) && (() => {"""

n2a = c2.count(old2a)
n2b = c2.count(old2b)
print(f"File 2 - remove old button: {n2a}x, insert new button: {n2b}x")

if n1 == 1 and n2a == 1 and n2b == 1:
    c1 = c1.replace(old1, new1)
    c2 = c2.replace(old2a, new2a).replace(old2b, new2b)
    with open(p1, 'w') as f:
        f.write(c1)
    with open(p2, 'w') as f:
        f.write(c2)
    print("Done - both files updated.")
else:
    print("Stopped - did not find exactly 1 match for each block. No changes made, nothing broken.")
