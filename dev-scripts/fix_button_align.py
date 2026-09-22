path = "src/components/DashboardTab.js"

with open(path, 'r') as f:
    content = f.read()

old = """      {isComplete && showPlanningView && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>"""

new = """      {isComplete && showPlanningView && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>"""

c = content.count(old)
print(f"Found: {c}x")

if c == 1:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print("Done - file updated.")
else:
    print("Stopped - did not find exactly 1 match. No changes made, nothing broken.")
