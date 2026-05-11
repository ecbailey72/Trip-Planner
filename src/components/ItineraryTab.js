import { useState, useEffect } from 'react';
import axios from 'axios';

const API = '/api';

const EVENT_TYPES = {
  flight:         { label: 'Flight',          icon: '✈',  color: '#185FA5', bg: '#E6F1FB' },
  lodging:        { label: 'Lodging',         icon: '🛏', color: '#1B2A4A', bg: '#EEF1F8' },
  activity:       { label: 'Activity',        icon: '🥾', color: '#534AB7', bg: '#EEEDFE' },
  tour:           { label: 'Tour',            icon: '🏴', color: '#534AB7', bg: '#EEEDFE' },
  restaurant:     { label: 'Restaurant',      icon: '🍽', color: '#993C1D', bg: '#FAECE7' },
  directions:     { label: 'Directions',      icon: '🧭', color: '#5F5E5A', bg: '#F1EFE8' },
  parking:        { label: 'Parking',         icon: '🅿', color: '#5F5E5A', bg: '#F1EFE8' },
  task:           { label: 'Task',            icon: '✅', color: '#3B6D11', bg: '#EAF3DE' },
  free:           { label: 'Free time',       icon: '☀', color: '#BA7517', bg: '#FAEEDA' },
  transportation: { label: 'Transportation',  icon: '🚌', color: '#5F5E5A', bg: '#F1EFE8' },
  concert:        { label: 'Concert',         icon: '🎵', color: '#993556', bg: '#FBEAF0' },
  theater:        { label: 'Theater',         icon: '🎭', color: '#993556', bg: '#FBEAF0' },
  rail:           { label: 'Rail',            icon: '🚆', color: '#185FA5', bg: '#E6F1FB' },
  ferry:          { label: 'Ferry',           icon: '⛴', color: '#185FA5', bg: '#E6F1FB' },
  cruise:         { label: 'Cruise',          icon: '🚢', color: '#185FA5', bg: '#E6F1FB' },
  note:           { label: 'Note',            icon: '📝', color: '#5F5E5A', bg: '#F1EFE8' },
};

const STATUS_OPTIONS = [
  { value: 'prepaid',   label: 'Confirmed & prepaid' },
  { value: 'payOnSite', label: 'Confirmed & pay on site' },
  { value: 'optional',  label: 'Optional' },
];

const emptyForm = {
  date: '', startTime: '', endTime: '', type: 'activity', title: '', subtitle: '',
  notes: '', status: 'prepaid', cost: '', confirmationNumber: '',
  contact: { website: '', address: '', phone: '', email: '' }
};

function ItineraryTab({ tripId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeDay, setActiveDay] = useState('all');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchEvents(); }, [tripId]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (event = null, date = '') => {
    if (event) {
      setEditingEvent(event);
      setForm({
        date: event.date || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        type: event.type || 'activity',
        title: event.title || '',
        subtitle: event.subtitle || '',
        notes: event.notes || '',
        status: event.status || 'prepaid',
        cost: event.cost || '',
        confirmationNumber: event.confirmationNumber || '',
        contact: event.contact || { website: '', address: '', phone: '', email: '' }
      });
    } else {
      setEditingEvent(null);
      setForm({ ...emptyForm, date });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) return alert('Please enter a title');
    if (!form.date) return alert('Please enter a date');
    try {
      if (editingEvent) {
        const res = await axios.put(`${API}/trips/${tripId}/events/${editingEvent._id}`, form);
        setEvents(events.map(e => e._id === editingEvent._id ? res.data : e));
      } else {
        const res = await axios.post(`${API}/trips/${tripId}/events`, form);
        setEvents([...events, res.data].sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || '')));
      }
      setShowForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Error saving event.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`${API}/trips/${tripId}/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const updateContact = (field, value) => {
    setForm({ ...form, contact: { ...form.contact, [field]: value } });
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();
  const displayDates = activeDay === 'all' ? sortedDates : sortedDates.filter(d => d === activeDay);

  const statusColor = (s) => ({ prepaid: '#1B2A4A', payOnSite: '#185FA5', optional: '#888' }[s] || '#888');
  const statusLabel = (s) => ({ prepaid: 'Prepaid', payOnSite: 'Pay on site', optional: 'Optional' }[s] || s);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Day filter tabs */}
      {sortedDates.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveDay('all')}
            style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activeDay === 'all' ? '#1a1a18' : 'transparent', color: activeDay === 'all' ? 'white' : '#666', cursor: 'pointer', fontWeight: activeDay === 'all' ? '600' : '400' }}>
            All days
          </button>
          {sortedDates.map(date => (
            <button
              key={date}
              onClick={() => setActiveDay(date)}
              style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activeDay === date ? '#1a1a18' : 'transparent', color: activeDay === date ? 'white' : '#666', cursor: 'pointer', fontWeight: activeDay === date ? '600' : '400', whiteSpace: 'nowrap' }}>
              {formatDate(date)}
            </button>
          ))}
        </div>
      )}

      {/* Add event button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => openForm(null, activeDay !== 'all' ? activeDay : '')}
          style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + Add Event
        </button>
      </div>

      {/* Event form */}
      {showForm && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}>{editingEvent ? 'Edit Event' : 'New Event'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. DL 1937 — ATL → SJO"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Event type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Start time</label>
                <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                  placeholder="e.g. 9:00 AM"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>End time</label>
                <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                  placeholder="e.g. 11:00 AM"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                placeholder="e.g. Nonstop · Boeing 757 · Seats 27B & 27C"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Important details, reminders, packing notes..."
                rows={2} style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Confirmation #</label>
              <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })}
                placeholder="Confirmation number"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Cost (display only)</label>
              <input value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
                placeholder="e.g. $507 + 48,235 pts"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            {/* Contact section */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #ddd', paddingTop: '12px', marginTop: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Contact & Location</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Website</label>
                  <input value={form.contact.website} onChange={e => updateContact('website', e.target.value)}
                    placeholder="e.g. delta.com"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Phone</label>
                  <input value={form.contact.phone} onChange={e => updateContact('phone', e.target.value)}
                    placeholder="Tap to call"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Address</label>
                  <input value={form.contact.address} onChange={e => updateContact('address', e.target.value)}
                    placeholder="Full address — opens in Maps"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Email</label>
                  <input value={form.contact.email} onChange={e => updateContact('email', e.target.value)}
                    placeholder="Tap to email"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave}
              style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {editingEvent ? 'Save changes' : 'Add event'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingEvent(null); }}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading itinerary...</p>
      ) : sortedDates.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>No events yet. Add your first itinerary event!</p>
      ) : (
        <div>
          {displayDates.map(date => (
            <div key={date} style={{ marginBottom: '2rem' }}>
              {/* Day header */}
              <div style={{ background: '#f0f0ed', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>{formatDate(date)}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>{groupedEvents[date].length} event{groupedEvents[date].length !== 1 ? 's' : ''}</span>
              </div>

              {/* Events for this day */}
              {groupedEvents[date]
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                .map(event => {
                  const ts = EVENT_TYPES[event.type] || EVENT_TYPES.note;
                  const isOptional = event.status === 'optional';
                  return (
                    <div key={event._id} style={{
                      background: 'white',
                      border: isOptional ? '1.5px dashed #ccc' : '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '8px',
                      display: 'flex',
                      gap: '12px',
                      opacity: isOptional ? 0.75 : 1
                    }}>
                      {/* Icon */}
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {ts.icon}
                      </div>

                      {/* Time */}
                      <div style={{ fontSize: '11px', color: '#888', minWidth: '54px', paddingTop: '2px', lineHeight: 1.5 }}>
                        {event.startTime || '—'}
                        {event.endTime && <div style={{ fontSize: '10px', color: '#aaa' }}>→ {event.endTime}</div>}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{event.title}</div>
                            {event.subtitle && <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{event.subtitle}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button onClick={() => openForm(event)}
                              style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDelete(event._id)}
                              style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                          </div>
                        </div>

                        {event.notes && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', padding: '5px 10px', background: '#f8f8f5', borderLeft: '3px solid #ddd', borderRadius: '0 4px 4px 0' }}>
                            {event.notes}
                          </div>
                        )}

                        {/* Contact links */}
                        {event.contact && (event.contact.website || event.contact.address || event.contact.phone || event.contact.email) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                            {event.contact.website && (
                              <a href={`https://${event.contact.website.replace(/https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                                style={{ fontSize: '12px', color: '#185FA5', textDecoration: 'none' }}>🌐 {event.contact.website}</a>
                            )}
                            {event.contact.address && (
                              <a href={`https://maps.google.com?q=${encodeURIComponent(event.contact.address)}`} target="_blank" rel="noreferrer"
                                style={{ fontSize: '12px', color: '#185FA5', textDecoration: 'none' }}>📍 Map</a>
                            )}
                            {event.contact.phone && (
                              <a href={`tel:${event.contact.phone}`}
                                style={{ fontSize: '12px', color: '#185FA5', textDecoration: 'none' }}>📞 {event.contact.phone}</a>
                            )}
                            {event.contact.email && (
                              <a href={`mailto:${event.contact.email}`}
                                style={{ fontSize: '12px', color: '#185FA5', textDecoration: 'none' }}>✉ {event.contact.email}</a>
                            )}
                          </div>
                        )}

                        {/* Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: ts.bg, color: ts.color, fontWeight: '500' }}>
                            {ts.label}
                          </span>
                          {isOptional && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#888', fontStyle: 'italic' }}>optional</span>
                          )}
                          {event.status === 'payOnSite' && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#E6F1FB', color: '#185FA5', fontWeight: '500' }}>Pay on site</span>
                          )}
                          {event.confirmationNumber && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#EEF1F8', color: '#1B2A4A', fontWeight: '500' }}>Conf: {event.confirmationNumber}</span>
                          )}
                          {event.cost && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#E6F1FB', color: '#185FA5', fontWeight: '500' }}>{event.cost}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Add event to this day */}
              <button onClick={() => openForm(null, date)}
                style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px dashed #ccc', borderRadius: '8px', background: 'transparent', color: '#888', cursor: 'pointer', marginTop: '4px' }}>
                + Add event on {formatDate(date)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItineraryTab;
