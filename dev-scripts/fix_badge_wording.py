path = "src/pages/TripDetailPage.js"

with open(path, 'r') as f:
    content = f.read()

old = "'Trip in Progress' : 'Planning Phase'"
new = "'Trip in Progress' : 'Planning This Trip'"

c = content.count(old)
print(f"Found: {c}x")

if c == 1:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print("Done - file updated.")
else:
    print("Stopped - did not find exactly 1 match. No changes made, nothing broken.")
