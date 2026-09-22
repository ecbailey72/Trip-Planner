with open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Fix handleSave close (line 276 area)
    if 'setInlineFormDay(null);' in line and 'scrollRef' not in lines[i-1]:
        # Check next line is setInlineEditId
        if i+1 < len(lines) and 'setInlineEditId(null);' in lines[i+1]:
            lines.insert(i, '      scrollRef.current = window.scrollY;\n')
            break

with open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'w') as f:
    f.writelines(lines)

# Now fix the cancel buttons
with open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'r') as f:
    c = f.read()

# Fix inline cancel at line 660
old1 = "onClick={() => { setShowForm(false); setEditingEvent(null); setInlineEditId(null); }}"
new1 = "onClick={() => { scrollRef.current = window.scrollY; setShowForm(false); setEditingEvent(null); setInlineEditId(null); }}"
count1 = c.count(old1)
print(f'inline cancel: {count1}x')
c = c.replace(old1, new1)

# Fix main cancel at line 467
old2 = "onClick={() => { const scrollY = window.scrollY; setShowForm(false); setEditingEvent(null); setInlineFormDay(null); setInlineEditId(null); requestAnimationFrame(() => window.scrollTo(0, scrollY)); }}"
new2 = "onClick={() => { scrollRef.current = window.scrollY; setShowForm(false); setEditingEvent(null); setInlineFormDay(null); setInlineEditId(null); }}"
count2 = c.count(old2)
print(f'main cancel: {count2}x')
c = c.replace(old2, new2)

with open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'w') as f:
    f.write(c)
print('Done')
