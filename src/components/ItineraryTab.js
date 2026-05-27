import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

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
  { value: 'placeholder', label: 'Placeholder / tentative' },
  { value: 'prepaid',   label: 'Confirmed & prepaid' },
  { value: 'payOnSite', label: 'Confirmed & pay on site' },
  { value: 'optional',  label: 'Optional' },
];

const emptyForm = {
  date: '', startTime: '', endTime: '', type: 'activity', title: '', subtitle: '',
  notes: '', status: 'placeholder', cost: '', confirmationNumber: '',
  contact: { website: '', address: '', phone: '', email: '' }
};

function ItineraryTab({ tripId, trip }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [inlineFormDay, setInlineFormDay] = useState(null); // date string for inline add
  const [inlineEditId, setInlineEditId] = useState(null); // event._id for inline edit
  const [activeDay, setActiveDay] = useState('all');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchEvents(); }, [tripId]);

  const printItinerary = () => {
    const dates = [...new Set(events.map(e => e.date))].sort();
    const tripName = trip?.name || 'Trip Itinerary';
    const startDate = trip?.startDate || dates[0] || '';
    const endDate = trip?.endDate || dates[dates.length - 1] || '';

    const formatDate = (d) => {
      if (!d) return '';
      const dt = new Date(d + 'T12:00:00');
      return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatShortDate = (d) => {
      if (!d) return '';
      const dt = new Date(d + 'T12:00:00');
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const eventIcons = {
      flight: '✈', lodging: '🛏', activity: '🥾', tour: '🏴', restaurant: '🍽',
      directions: '🧭', parking: '🅿', task: '✅', free: '☀', transportation: '🚌',
      concert: '🎵', theater: '🎭', rail: '🚆', ferry: '⛴', cruise: '🚢', note: '📝'
    };

    const statusBadge = (s) => {
      if (s === 'prepaid') return '<span style="font-size:10px;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:10px;font-weight:600;">✓ Confirmed</span>';
      if (s === 'payOnSite') return '<span style="font-size:10px;background:#e3f2fd;color:#1565c0;padding:1px 6px;border-radius:10px;font-weight:600;">Pay on site</span>';
      if (s === 'optional') return '<span style="font-size:10px;background:#f5f5f5;color:#888;padding:1px 6px;border-radius:10px;">Optional</span>';
      if (s === 'placeholder') return '<span style="font-size:10px;background:#fff8e1;color:#f57f17;padding:1px 6px;border-radius:10px;">Tentative</span>';
      return '';
    };

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${tripName} — Itinerary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: white; padding: 32px 40px; max-width: 760px; margin: 0 auto; }

    /* Header */
    .header { margin-bottom: 32px; }
    .trip-name { font-size: 28px; font-weight: 900; color: #1B2A4A; letter-spacing: -0.5px; }
    .trip-dates { font-size: 14px; color: #888; margin-top: 4px; }
    .header-line { height: 3px; background: linear-gradient(to right, #1B2A4A, #C9A84C); border-radius: 2px; margin-top: 12px; }

    /* Day block */
    .day-block { margin-bottom: 8px; page-break-inside: avoid; }

    /* Day header row — sits on the timeline */
    .day-row { display: flex; align-items: center; margin-bottom: 0; position: relative; }
    .day-dot { width: 14px; height: 14px; border-radius: 50%; background: #1B2A4A; flex-shrink: 0; z-index: 1; margin-left: 1px; }
    .day-label { background: #1B2A4A; color: white; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-left: 12px; }

    /* Timeline container */
    .timeline { padding-left: 7px; border-left: 2px solid #E0E0E0; margin-left: 7px; padding-top: 4px; padding-bottom: 4px; }

    /* Event row */
    .event-row { display: flex; align-items: flex-start; gap: 0; padding: 8px 0; position: relative; }
    .event-dot-wrap { display: flex; flex-direction: column; align-items: center; margin-left: -8px; margin-right: 14px; flex-shrink: 0; }
    .event-dot { width: 12px; height: 12px; border-radius: 50%; background: white; border: 2px solid #C9A84C; flex-shrink: 0; margin-top: 3px; margin-left: -6px; }
    .event-icon { font-size: 16px; margin-right: 10px; flex-shrink: 0; margin-top: 1px; }
    .event-time { font-size: 11px; color: #888; min-width: 65px; flex-shrink: 0; padding-top: 3px; font-weight: 600; }
    .event-body { flex: 1; }
    .event-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .event-subtitle { font-size: 12px; color: #555; margin-bottom: 2px; }
    .event-conf { font-size: 11px; color: #888; }
    .event-notes { font-size: 11px; color: #777; margin-top: 3px; font-style: italic; }
    .event-meta { font-size: 11px; color: #888; margin-top: 2px; }

    /* Status badges */
    .badge-confirmed { font-size: 10px; background: #e8f5e9; color: #2e7d32; padding: 1px 7px; border-radius: 10px; font-weight: 600; font-style: normal; }
    .badge-payonsite { font-size: 10px; background: #e3f2fd; color: #1565c0; padding: 1px 7px; border-radius: 10px; font-weight: 600; font-style: normal; }
    .badge-optional  { font-size: 10px; background: #f5f5f5; color: #888; padding: 1px 7px; border-radius: 10px; font-style: normal; }
    .badge-tentative { font-size: 10px; background: #fff8e1; color: #f57f17; padding: 1px 7px; border-radius: 10px; font-weight: 600; font-style: normal; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }

    /* Print button */
    .print-btn { background: #1B2A4A; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px; }

    @media print {
      body { padding: 16px 24px; }
      .no-print { display: none !important; }
      .day-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; display: flex; align-items: center; gap: 24px;">
    <button class="print-btn" onclick="window.print()">🖨 Print itinerary</button>
    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #444; cursor: pointer;">
      <input type="checkbox" id="showAllDetails" style="width: 16px; height: 16px; cursor: pointer;">
      Show all details
    </label>
  </div>
  <script>
    document.getElementById('showAllDetails').addEventListener('change', function() {
      const details = document.querySelectorAll('.event-details');
      details.forEach(d => d.style.display = this.checked ? 'block' : 'none');
    });
  </script>
  <div class="header">
    <div class="trip-name">${tripName}</div>
    <div class="trip-dates">${formatShortDate(startDate)} &mdash; ${formatShortDate(endDate)}</div>
    <div class="header-line"></div>
  </div>`;

    dates.forEach(date => {
      const dayEvents = events.filter(e => e.date === date).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      const badgeFor = (s) => {
        if (s === 'prepaid') return '<span class="badge-confirmed">✓ Confirmed</span>';
        if (s === 'payOnSite') return '<span class="badge-payonsite">Pay on site</span>';
        if (s === 'optional') return '<span class="badge-optional">Optional</span>';
        if (s === 'placeholder') return '<span class="badge-tentative">Tentative</span>';
        return '';
      };
      html += `<div class="day-block">
    <div class="day-row">
      <div class="day-dot"></div>
      <div class="day-label">${formatDate(date)}</div>
    </div>
    <div class="timeline">`;
      dayEvents.forEach(event => {
        html += `<div class="event-row">
        <div class="event-dot-wrap"><div class="event-dot"></div></div>
        <div class="event-icon">${eventIcons[event.type] || '📌'}</div>
        <div class="event-time">${event.startTime || '&nbsp;'}${event.endTime ? '<br>' + event.endTime : ''}</div>
        <div class="event-body">
          <div class="event-title">${event.title} ${badgeFor(event.status)}</div>
          <div class="event-details" style="display:none">
          ${event.subtitle ? '<div class="event-subtitle">' + event.subtitle + '</div>' : ''}
          ${event.confirmationNumber ? '<div class="event-conf">Conf: ' + event.confirmationNumber + '</div>' : ''}
          ${event.contact?.address ? '<div class="event-meta">📍 ' + event.contact.address + '</div>' : ''}
          ${event.contact?.phone ? '<div class="event-meta">📞 ' + event.contact.phone + '</div>' : ''}
          ${event.notes ? '<div class="event-notes">' + event.notes + '</div>' : ''}
          </div>
        </div>
      </div>`;
      });
      html += `</div></div>`;
    });

    html += `<div class="footer">
    <span>${tripName} · Printed from Ventaro</span>
    <span>${new Date().toLocaleDateString()}</span>
  </div>
</body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

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
      setInlineEditId(event._id);
      setInlineFormDay(null);
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
      setShowForm(true);
    } else if (date) {
      // Inline form for a specific day
      setEditingEvent(null);
      setInlineEditId(null);
      setForm({ ...emptyForm, date });
      setInlineFormDay(date);
      setShowForm(false);
    } else {
      // Top-level new event form
      setEditingEvent(null);
      setInlineEditId(null);
      setInlineFormDay(null);
      setForm({ ...emptyForm, date });
      setShowForm(true);
    }
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
      setInlineFormDay(null);
      setInlineEditId(null);
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

  const statusColor = (s) => ({ placeholder: '#BA7517', prepaid: '#1B2A4A', payOnSite: '#185FA5', optional: '#888' }[s] || '#888');
  const statusLabel = (s) => ({ placeholder: 'Placeholder', prepaid: 'Prepaid', payOnSite: 'Pay on site', optional: 'Optional' }[s] || s);

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '1rem' }}>
        <button onClick={printItinerary}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #E8E6E1', color: '#1B2A4A', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          🖨 Print
        </button>
        <button
          onClick={() => openForm(null, activeDay !== 'all' ? activeDay : '')}
          style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + Add Event
        </button>
      </div>

      {/* Event form */}
      {showForm && !inlineFormDay && (
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
            <button onClick={() => { setShowForm(false); setEditingEvent(null); setInlineFormDay(null); setInlineEditId(null); }}
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
                    <React.Fragment key={event._id}>
                    <div style={{
                      background: 'white',
                      border: isOptional ? '1.5px dashed #ccc' : '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: inlineEditId === event._id ? '0' : '8px',
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
                    {/* Inline edit form */}
                    {inlineEditId === event._id && showForm && (
                      <div style={{ background: '#f0f2f8', border: '1px solid #d0d8e8', borderRadius: '0 0 12px 12px', padding: '1rem', marginBottom: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Title *</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }}>
                              {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }}>
                              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Start time</label>
                            <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                              placeholder="e.g. 9:00 AM"
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>End time</label>
                            <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                              placeholder="e.g. 11:00 AM"
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Subtitle</label>
                            <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Confirmation #</label>
                            <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Cost</label>
                            <input value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
                              placeholder="e.g. $150"
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Notes</label>
                            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                              rows={2} style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', resize: 'vertical', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Address</label>
                            <input value={form.contact?.address || ''} onChange={e => setForm({ ...form, contact: { ...form.contact, address: e.target.value } })}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Website</label>
                            <input value={form.contact?.website || ''} onChange={e => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })}
                              placeholder="e.g. hilton.com"
                              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={handleSave}
                            style={{ padding: '7px 18px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                            Save changes
                          </button>
                          <button onClick={() => { setShowForm(false); setEditingEvent(null); setInlineEditId(null); }}
                            style={{ padding: '7px 18px', background: 'transparent', border: '1px solid #E8E6E1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#4A5568' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    </React.Fragment>
                  );
                })}

              {/* Add event to this day — inline */}
              {inlineFormDay === date ? (
                <div style={{ background: '#f0f2f8', border: '1px solid #d0d8e8', borderRadius: '10px', padding: '1rem', marginTop: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Event title *</label>
                      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus
                        placeholder="e.g. Arrive at hotel"
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Type</label>
                      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }}>
                        {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Start time</label>
                      <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                        placeholder="e.g. 9:00 AM"
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Subtitle</label>
                      <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                        placeholder="e.g. Flight details, address..."
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Status</label>
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }}>
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>End time</label>
                      <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                        placeholder="e.g. 11:00 AM"
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Confirmation #</label>
                      <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Cost</label>
                      <input value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
                        placeholder="e.g. $150"
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Address</label>
                      <input value={form.contact?.address || ''} onChange={e => setForm({ ...form, contact: { ...form.contact, address: e.target.value } })}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Website</label>
                      <input value={form.contact?.website || ''} onChange={e => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })}
                        placeholder="e.g. hilton.com"
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Notes</label>
                      <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                        rows={2} placeholder="Details, reminders..."
                        style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', resize: 'vertical' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleSave}
                      style={{ padding: '7px 18px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      Add event
                    </button>
                    <button onClick={() => { setInlineFormDay(null); setForm(emptyForm); }}
                      style={{ padding: '7px 18px', background: 'transparent', border: '1px solid #E8E6E1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#4A5568' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => openForm(null, date)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px dashed #ccc', borderRadius: '8px', background: 'transparent', color: '#888', cursor: 'pointer', marginTop: '4px' }}>
                  + Add event on {formatDate(date)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItineraryTab;
