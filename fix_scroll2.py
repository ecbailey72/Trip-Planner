f = open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'r')
c = f.read()
f.close()

# Fix import
old1 = "import React, { useState, useEffect } from 'react';"
new1 = "import React, { useState, useEffect, useRef } from 'react';"
count1 = c.count(old1)
print(f'import: {count1}x')
c = c.replace(old1, new1)

# Add scrollRef declaration before showForm
old2 = "  const [showForm, setShowForm] = useState(false);"
new2 = "  const scrollRef = useRef(0);\n  const [showForm, setShowForm] = useState(false);"
count2 = c.count(old2)
print(f'scrollRef: {count2}x')
c = c.replace(old2, new2)

f = open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'w')
f.write(c)
f.close()
print('Done')
