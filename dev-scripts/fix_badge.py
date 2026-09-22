path = "src/pages/TripDetailPage.js"

with open(path, 'r') as f:
    content = f.read()

old = """              {trip.status && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', textTransform: 'capitalize', color: 'rgba(255,255,255,0.8)' }}>
                  {trip.status}
                </span>
              )}"""

new = """              {trip.status && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                  {trip.status === 'complete' ? 'Completed Trip' : trip.status === 'active' ? 'Trip in Progress' : 'Planning Phase'}
                </span>
              )}"""

c = content.count(old)
print(f"Found: {c}x")

if c == 1:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print("Done - file updated.")
else:
    print("Stopped - did not find exactly 1 match. No changes made, nothing broken.")
