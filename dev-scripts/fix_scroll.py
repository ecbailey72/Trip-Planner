f = open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'r')
c = f.read()
f.close()

old = '  const [inlineEditId, setInlineEditId] = useState(null); // event._id for inline edit'
new = '''  const [inlineEditId, setInlineEditId] = useState(null); // event._id for inline edit

  // Restore scroll position after form close
  useEffect(() => {
    if (!showForm && !inlineEditId && scrollRef.current > 0) {
      window.scrollTo(0, scrollRef.current);
      scrollRef.current = 0;
    }
  }, [showForm, inlineEditId]);'''

count = c.count(old)
print(f'useEffect: {count}x')
c = c.replace(old, new)

f = open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'w')
f.write(c)
f.close()
print('Done')
