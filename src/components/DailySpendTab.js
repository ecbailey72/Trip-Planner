import { useState, useEffect } from 'react';
import axios from 'axios';

const API = '/api';

const CATEGORIES = ['Food & Drinks', 'Transportation', 'Shopping', 'Activities', 'Tips', 'Entrance Fees', 'Misc'];
const METHODS = ['Credit card', 'Cash', 'Debit'];

const CATEGORY_COLORS = {
  'Food & Drinks':  { bg: '#FAECE7', color: '#993C1D' },
  'Transportation': { bg: '#E6F1FB', color: '#185FA5' },
  'Shopping':       { bg: '#FBEAF0', color: '#993556' },
  'Activities':     { bg: '#EEEDFE', color: '#534AB7' },
  'Tips':           { bg: '#EAF3DE', color: '#3B6D11' },
  'Entrance Fees':  { bg: '#E1F5EE', color: '#0F6E56' },
  'Misc':           { bg: '#F1EFE8', color: '#5F5E5A' },
};

const emptyForm = (date = '') => ({
  date: date || new Date().toISOString().split('T')[0],
  amount: '',
  category: 'Food & Drinks',
  description: '',
  paymentMethod: 'Credit card'
});

function InlineForm({ date, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm(date));

  const handleSave = () => {
    if (!form.amount || form.amount <= 0) return alert('Please enter an amount');
    onSave(form);
  };

  return (
    <div style={{ background: '#f0f2f8', border: '1px solid #d0d8e8', borderRadius: '10px', padding: '1rem', margin: '8px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Amount ($)</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || '' })}
            placeholder="0.00" step="0.01" autoFocus
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Payment</label>
          <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Description (optional)</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Lunch, coffee, gas..."
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSave}
          style={{ padding: '7px 18px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          Add entry
        </button>
        <button onClick={onCancel}
          style={{ padding: '7px 18px', background: 'transparent', border: '1px solid #E8E6E1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#4A5568' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function DailySpendTab({ tripId, dailyBudget = 200 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('all');
  const [budget, setBudget] = useState(dailyBudget);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(dailyBudget);

  // Track which day has inline form open, and which item is being edited
  const [inlineFormDay, setInlineFormDay] = useState(null); // 'new' or date string for new entries
  const [editingItem, setEditingItem] = useState(null); // item being edited
  const [showTopForm, setShowTopForm] = useState(false); // top-level new entry form

  useEffect(() => { fetchItems(); }, [tripId]);
  useEffect(() => { setBudget(dailyBudget); setBudgetInput(dailyBudget); }, [dailyBudget]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/spending`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching spending:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      const res = await axios.post(`${API}/trips/${tripId}/spending`, form);
      setItems(prev => [...prev, res.data].sort((a, b) => a.date.localeCompare(b.date)));
      setInlineFormDay(null);
      setShowTopForm(false);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving. Please try again.');
    }
  };

  const handleUpdate = async (form) => {
    try {
      const res = await axios.put(`${API}/trips/${tripId}/spending/${editingItem._id}`, form);
      setItems(prev => prev.map(i => i._id === editingItem._id ? res.data : i));
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating:', err);
      alert('Error saving. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`${API}/trips/${tripId}/spending/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Group by date
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();
  const displayDates = activeDay === 'all' ? sortedDates : sortedDates.filter(d => d === activeDay);

  const totalSpent = items.reduce((sum, i) => sum + i.amount, 0);
  const daysWithSpend = sortedDates.length;
  const avgPerDay = daysWithSpend > 0 ? Math.round(totalSpent / daysWithSpend) : 0;

  const byCategory = items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.amount;
    return acc;
  }, {});

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total spent', value: '$' + Math.round(totalSpent).toLocaleString() },
          { label: 'Days tracked', value: daysWithSpend },
          { label: 'Avg per day', value: '$' + avgPerDay, warn: avgPerDay > budget },
          { label: 'Daily budget', value: '$' + budget + '/day' },
          {
            label: 'Total over/under',
            value: totalSpent > 0 ? (totalSpent > budget * daysWithSpend ? '$' + Math.round(totalSpent - budget * daysWithSpend) + ' over' : '$' + Math.round(budget * daysWithSpend - totalSpent) + ' under') : '—',
            warn: totalSpent > budget * daysWithSpend,
            good: totalSpent > 0 && totalSpent <= budget * daysWithSpend
          },
        ].map(m => (
          <div key={m.label} style={{ background: m.warn ? '#FAEEDA' : m.good ? '#E1F5EE' : '#f5f5f5', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: m.warn ? '#BA7517' : m.good ? '#1D9E75' : '#1a1a18' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Budget editor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {editingBudget ? (
          <>
            <span style={{ fontSize: '13px', color: '#888' }}>Daily budget:</span>
            <input type="number" value={budgetInput} onChange={e => setBudgetInput(parseFloat(e.target.value) || 0)}
              style={{ width: '80px', padding: '5px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <button onClick={() => { setBudget(budgetInput); setEditingBudget(false); }}
              style={{ padding: '5px 12px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
            <button onClick={() => setEditingBudget(false)}
              style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </>
        ) : (
          <button onClick={() => { setBudgetInput(budget); setEditingBudget(true); }}
            style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#666' }}>
            Edit daily budget
          </button>
        )}
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '14px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Spending by category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
              const style = CATEGORY_COLORS[cat] || { bg: '#f0f0f0', color: '#555' };
              const pct = Math.round(amt / totalSpent * 100);
              return (
                <div key={cat} style={{ background: style.bg, borderRadius: '8px', padding: '6px 12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: style.color }}>{cat}</span>
                  <span style={{ fontSize: '12px', color: style.color, marginLeft: '6px' }}>${Math.round(amt)}</span>
                  <span style={{ fontSize: '11px', color: style.color, opacity: 0.7, marginLeft: '4px' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day tabs */}
      {sortedDates.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button onClick={() => setActiveDay('all')}
            style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activeDay === 'all' ? '#1B2A4A' : 'transparent', color: activeDay === 'all' ? 'white' : '#666', cursor: 'pointer' }}>
            All days
          </button>
          {sortedDates.map(date => {
            const dayTotal = grouped[date].reduce((s, i) => s + i.amount, 0);
            const over = dayTotal > budget;
            return (
              <button key={date} onClick={() => setActiveDay(date)}
                style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: `1px solid ${over ? '#BA7517' : '#ccc'}`, background: activeDay === date ? '#1B2A4A' : 'transparent', color: activeDay === date ? 'white' : over ? '#BA7517' : '#666', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {formatDate(date)} · ${Math.round(dayTotal)}
              </button>
            );
          })}
        </div>
      )}

      {/* Top-level Add Entry button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => { setShowTopForm(true); setInlineFormDay(null); setEditingItem(null); }}
          style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + Add Entry
        </button>
      </div>

      {/* Top form — for new entry not tied to a day */}
      {showTopForm && (
        <InlineForm
          date={activeDay !== 'all' ? activeDay : ''}
          onSave={handleSave}
          onCancel={() => setShowTopForm(false)}
        />
      )}

      {/* Spend list by day */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : sortedDates.length === 0 && !showTopForm ? (
        <p style={{ color: '#888', fontSize: '13px' }}>No entries yet. Start tracking your spending!</p>
      ) : (
        <div>
          {displayDates.map(date => {
            const dayItems = grouped[date];
            const dayTotal = dayItems.reduce((s, i) => s + i.amount, 0);
            const over = dayTotal > budget;
            const pct = Math.min(100, Math.round(dayTotal / budget * 100));

            return (
              <div key={date} style={{ marginBottom: '1.5rem' }}>
                {/* Day header */}
                <div style={{ background: over ? '#FAEEDA' : '#f0f0ed', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>{formatDate(date)}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: over ? '#BA7517' : '#1B2A4A' }}>${dayTotal.toFixed(0)}</span>
                      <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>/ ${budget}</span>
                      <span style={{ fontSize: '12px', marginLeft: '8px', fontWeight: '500', color: over ? '#BA7517' : '#1B2A4A' }}>
                        {over ? `$${(dayTotal - budget).toFixed(0)} over` : `$${(budget - dayTotal).toFixed(0)} under`}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: '#ddd', borderRadius: '2px' }}>
                    <div style={{ height: '4px', borderRadius: '2px', width: pct + '%', background: over ? '#BA7517' : '#C9A84C', transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* Line items */}
                <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '0 1rem', marginBottom: '6px' }}>
                  {dayItems.map((item, idx) => {
                    const catStyle = CATEGORY_COLORS[item.category] || { bg: '#f0f0f0', color: '#555' };
                    const isEditing = editingItem && editingItem._id === item._id;
                    return (
                      <div key={item._id}>
                        {isEditing ? (
                          <div style={{ padding: '8px 0' }}>
                            <InlineForm
                              date={item.date}
                              onSave={handleUpdate}
                              onCancel={() => setEditingItem(null)}
                            />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: idx < dayItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: catStyle.bg, color: catStyle.color, fontWeight: '500', whiteSpace: 'nowrap' }}>
                              {item.category}
                            </span>
                            <span style={{ flex: 1, fontSize: '13px', color: '#444' }}>{item.description || '—'}</span>
                            <span style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap' }}>{item.paymentMethod === 'Cash' ? '💵' : '💳'}</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '50px', textAlign: 'right' }}>${item.amount.toFixed(0)}</span>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                              <button onClick={() => { setEditingItem(item); setInlineFormDay(null); setShowTopForm(false); }}
                                style={{ fontSize: '11px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDelete(item._id)}
                                style={{ fontSize: '11px', padding: '2px 6px', border: '1px solid #ffcccc', borderRadius: '4px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>×</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inline form for this day */}
                {inlineFormDay === date ? (
                  <InlineForm
                    date={date}
                    onSave={handleSave}
                    onCancel={() => setInlineFormDay(null)}
                  />
                ) : (
                  <button onClick={() => { setInlineFormDay(date); setShowTopForm(false); setEditingItem(null); }}
                    style={{ width: '100%', padding: '7px', fontSize: '12px', border: '1px dashed #ccc', borderRadius: '8px', background: 'transparent', color: '#888', cursor: 'pointer' }}>
                    + Add entry for {formatDate(date)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DailySpendTab;
