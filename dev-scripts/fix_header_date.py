path = "src/pages/TripDetailPage.js"

with open(path, 'r') as f:
    content = f.read()

old1 = """  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
"""

new1 = """  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
"""

old2 = "                {trip.startDate} \u2014 {trip.endDate}"
new2 = "                {formatDate(trip.startDate)} to {formatDate(trip.endDate)}"

c1 = content.count(old1)
c2 = content.count(old2)
print(f"Found block 1: {c1}x")
print(f"Found block 2: {c2}x")

if c1 == 1 and c2 == 1:
    content = content.replace(old1, new1)
    content = content.replace(old2, new2)
    with open(path, 'w') as f:
        f.write(content)
    print("Done - file updated.")
else:
    print("Stopped - did not find exactly 1 match each. No changes made, nothing broken.")
