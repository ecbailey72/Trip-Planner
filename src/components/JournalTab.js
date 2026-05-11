import { useState, useEffect } from 'react';
import axios from 'axios';

const API = '/api';

const TAGS = ['Memory', 'Review', 'Tip', 'Local Phrase', 'Observation'];

const TAG_STYLES = {
  'Memory':       { bg: '#FAEEDA', color: '#BA7517' },
  'Review':       { bg: '#EEF1F8', color: '#1B2A4A' },
  'Tip':          { bg: '#E6F1FB', color: '#185FA5' },
  'Local Phrase': { bg: '#EEEDFE', color: '#534AB7' },
  'Observation':  { bg: '#F1EFE8', color: '#5F5E5A' },
};

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  title: '',
  body: '',
  tag: 'Memory'
};

function JournalTab({ tripId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeTag, setActiveTag] = useState('all');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchEntries(); }, [tripId]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/journal`);
      setEntries(res.data);
    } catch (err) {
      console.error('Error fetching journal:', err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setForm({
        date: entry.date,
        title: entry.title || '',
        body: entry.body,
        tag: entry.tag
      });
    } else {
      setEditingEntry(null);
      setForm(emptyForm);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.body.trim()) return alert('Please write something');
    try {
      if (editingEntry) {
        const res = await axios.put(`${API}/trips/${tripId}/journal/${editingEntry._id}`, form);
        setEntries(entries.map(e => e._id === editingEntry._id ? res.data : e));
      } else {
        const res = await axios.post(`${API}/trips/${tripId}/journal`, form);
        setEntries([res.data, ...entries]);
      }
      setShowForm(false);
      setEditingEntry(null);
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Error saving entry.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await axios.delete(`${API}/trips/${tripId}/journal/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const filtered = activeTag === 'all' ? entries : entries.filter(e => e.tag === activeTag);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Tag filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTag('all')}
          style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activeTag === 'all' ? '#1a1a18' : 'transparent', color: activeTag === 'all' ? 'white' : '#666', cursor: 'pointer' }}>
          All
        </button>
        {TAGS.map(tag => {
          const style = TAG_STYLES[tag];
          return (
            <button key={tag} onClick={() => setActiveTag(tag)}
              style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activeTag === tag ? style.color : 'transparent', color: activeTag === tag ? 'white' : '#666', cursor: 'pointer' }}>
              {tag}
            </button>
          );
        })}
      </div>

      {/* Add entry button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => openForm()}
          style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + New Entry
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}>{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Tag</label>
              <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Title (optional)</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Dinner at El Avión, Amazing cloud forest morning..."
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Entry *</label>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Write anything — memories, notes for a review, a local phrase you learned, observations..."
                rows={6}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical', lineHeight: 1.6 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave}
              style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {editingEntry ? 'Save changes' : 'Save entry'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingEntry(null); }}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading journal...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>{entries.length === 0 ? 'No entries yet. Start writing!' : 'No entries with this tag.'}</p>
      ) : (
        <div>
          {filtered.map(entry => {
            const tagStyle = TAG_STYLES[entry.tag] || TAG_STYLES['Memory'];
            return (
              <div key={entry._id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '20px', background: tagStyle.bg, color: tagStyle.color, fontWeight: '600' }}>
                        {entry.tag}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>{formatDate(entry.date)}</span>
                    </div>
                    {entry.title && (
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a18', marginBottom: '6px' }}>{entry.title}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                    <button onClick={() => openForm(entry)}
                      style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(entry._id)}
                      style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{entry.body}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JournalTab;
