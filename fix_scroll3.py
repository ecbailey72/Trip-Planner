f = open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'r')
c = f.read()
f.close()

# Fix handleSave
old1 = """      setShowForm(false);
      setEditingEvent(null);
      setInlineFormDay(null);
      setInlineEditId(null);
    } catch (err) {
      console.error('Error saving event:');
      alert('Error saving event.');"""
new1 = """      scrollRef.current = window.scrollY;
      setShowForm(false);
      setEditingEvent(null);
      setInlineFormDay(null);
      setInlineEditId(null);
    } catch (err) {
      console.error('Error saving event:');
      alert('Error saving event.');"""
count1 = c.count(old1)
print(f'handleSave: {count1}x')
c = c.replace(old1, new1)

# Fix Cancel button
old2 = "{ setShowForm(false); setEditingEvent(null); setInlineFormDay(null); setInlineEditId(null); }"
new2 = "{ scrollRef.current = window.scrollY; setShowForm(false); setEditingEvent(null); setInlineFormDay(null); setInlineEditId(null); }"
count2 = c.count(old2)
print(f'Cancel: {count2}x')
c = c.replace(old2, new2)

f = open('/Users/erikbailey/Documents/travel-tool/src/components/ItineraryTab.js', 'w')
f.write(c)
f.close()
print('Done')
