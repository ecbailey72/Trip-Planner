path = "src/components/DashboardTab.js"

with open(path, 'r') as f:
    content = f.read()

old_a = "      {/* Budget progress — top of dashboard */}"

new_a = """      {isComplete && showPlanningView && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Show remember view
          </button>
        </div>
      )}

      {/* Budget progress — top of dashboard */}"""

old_b = """      {isComplete && (
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {showPlanningView ? 'Show remember view' : 'Show planning view'}
          </button>
        </div>
      )}

      {/* Dual bar chart — budget vs actual by category */}"""

new_b = """      {isComplete && !showPlanningView && (
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Show planning view
          </button>
        </div>
      )}

      {/* Dual bar chart — budget vs actual by category */}"""

na = content.count(old_a)
nb = content.count(old_b)
print(f"Block a: {na}x, Block b: {nb}x")

if na == 1 and nb == 1:
    content = content.replace(old_a, new_a).replace(old_b, new_b)
    with open(path, 'w') as f:
        f.write(content)
    print("Done - file updated.")
else:
    print("Stopped - did not find exactly 1 match each. No changes made, nothing broken.")
