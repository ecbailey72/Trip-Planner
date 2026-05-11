import { useState, useEffect } from 'react';
import axios from 'axios';

const API = '/api';

const CATEGORIES = [
  'Flights', 'Lodging', 'Activities & Tours', 'Food & Dining',
  'Shopping & Souvenirs', 'Gas, Tolls & Parking', 'Insurance', 'Pre-trip & Misc'
];

const EVENT_STATUS = [
  { value: 'prepaid', label: 'Confirmed & prepaid' },
  { value: 'payOnSite', label: 'Confirmed & pay on site' },
  { value: 'optional', label: 'Optional' }
];

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Cash / credit card charge' },
  { value: 'pointsBooking', label: 'Points booking (no cash)' },
  { value: 'cashOffsetByPoints', label: 'Cash charge, paid with points' },
  { value: 'credit', label: 'Credit / voucher' }
];

const PROGRAMS = [
  '── Credit Cards ──', 'Capital One', 'Chase', 'Amex', 'Citi',
  '── Airlines ──', 'Delta Skymiles', 'AA Advantage', 'United MileagePlus', 'American Airlines', 'Virgin', 'Flying Blue', 'AeroMexico',
  '── Hotels ──', 'Marriott Bonvoy', 'Hilton Honors', 'Hyatt', 'Wyndham', 'Choice',
  '── Car Rentals ──', 'Hertz', 'National', 'Enterprise', 'Avis',
  '── Travel Platforms ──', 'Viator', 'Expedia', 'hotels.com', 'VRBO', 'booking.com', 'Priceline', 'Orbitz', 'trip.com', 'AirBnB',
  '── Cruises ──', 'Carnival', 'Royal Caribbean', 'Norwegian', 'Disney Cruise', 'Princess', 'Celebrity',
  '── Other ──', 'Priority Pass', 'Other'
];
const METHODS = ['Capital One card', 'Chase Sapphire', 'Cash', 'Debit', 'Other'];

const emptyPayment = {
  type: 'cash',
  dueDate: '',
  paid: false,
  amount: '',
  currency: 'USD',
  method: 'Capital One card',
  pointsProgram: '',
  pointsAmount: '',
  pointsAppliedDate: '',
  refundable: true,
  chargeAmount: '',
  cardUsed: 'Capital One card',
  netCashOut: '',
  creditSource: '',
  creditAmount: '',
  remainingCash: '',
  notes: ''
};

function PaymentForm({ payment, index, onChange, onRemove }) {
  const update = (field, value) => onChange(index, { ...payment, [field]: value });

  return (
    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment {index + 1}</span>
        <button onClick={() => onRemove(index)} style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ffcccc', borderRadius: '4px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Remove</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Payment type</label>
          <select value={payment.type} onChange={e => update('type', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
            {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Due date</label>
          <input type="date" value={payment.dueDate} onChange={e => update('dueDate', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
          <input type="checkbox" id={`paid-${index}`} checked={payment.paid} onChange={e => update('paid', e.target.checked)} />
          <label htmlFor={`paid-${index}`} style={{ fontSize: '13px', cursor: 'pointer' }}>Already paid</label>
        </div>

        {/* CASH */}
        {payment.type === 'cash' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Amount ($)</label>
              <input type="number" value={payment.amount} onChange={e => update('amount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Payment method</label>
              <select value={payment.method} onChange={e => update('method', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}

        {/* POINTS BOOKING */}
        {payment.type === 'pointsBooking' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points program</label>
              <select value={payment.pointsProgram} onChange={e => update('pointsProgram', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">Select program</option>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points amount</label>
              <input type="number" value={payment.pointsAmount} onChange={e => update('pointsAmount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points applied date</label>
              <input type="date" value={payment.pointsAppliedDate} onChange={e => update('pointsAppliedDate', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
              <input type="checkbox" id={`ref-${index}`} checked={payment.refundable} onChange={e => update('refundable', e.target.checked)} />
              <label htmlFor={`ref-${index}`} style={{ fontSize: '13px', cursor: 'pointer' }}>Refundable if cancelled</label>
            </div>
          </>
        )}

        {/* CASH OFFSET BY POINTS */}
        {payment.type === 'cashOffsetByPoints' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Charge amount ($)</label>
              <input type="number" value={payment.chargeAmount} onChange={e => update('chargeAmount', e.target.value)}
                placeholder="Amount on statement" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Card used</label>
              <select value={payment.cardUsed} onChange={e => update('cardUsed', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points program</label>
              <select value={payment.pointsProgram} onChange={e => update('pointsProgram', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">Select program</option>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points to apply</label>
              <input type="number" value={payment.pointsAmount} onChange={e => update('pointsAmount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points applied date</label>
              <input type="date" value={payment.pointsAppliedDate} onChange={e => update('pointsAppliedDate', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Net cash out ($)</label>
              <input type="number" value={payment.netCashOut} onChange={e => update('netCashOut', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </>
        )}

        {/* CREDIT */}
        {payment.type === 'credit' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Credit source</label>
              <input value={payment.creditSource} onChange={e => update('creditSource', e.target.value)}
                placeholder="e.g. Viator, Gift card" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Credit amount ($)</label>
              <input type="number" value={payment.creditAmount} onChange={e => update('creditAmount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Remaining cash ($)</label>
              <input type="number" value={payment.remainingCash} onChange={e => update('remainingCash', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Notes</label>
          <input value={payment.notes} onChange={e => update('notes', e.target.value)}
            placeholder="e.g. Applied on May 1 bill pay" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
      </div>
    </div>
  );
}

function ExpensesTab({ tripId }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [payments, setPayments] = useState([{ ...emptyPayment }]);
  const [form, setForm] = useState({
    name: '', category: 'Flights', type: 'confirmed', eventStatus: 'prepaid',
    totalValue: '', activityDate: '', bookedDate: '', vendor: '', confirmationNumber: '', notes: ''
  });

  useEffect(() => { fetchExpenses(); }, [tripId]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setForm({
        name: expense.name, category: expense.category, type: expense.type,
        eventStatus: expense.eventStatus, totalValue: expense.totalValue,
        activityDate: expense.activityDate || '', bookedDate: expense.bookedDate || '',
        vendor: expense.vendor || '', confirmationNumber: expense.confirmationNumber || '',
        notes: expense.notes || ''
      });
      setPayments(expense.payments && expense.payments.length > 0 ? expense.payments : [{ ...emptyPayment }]);
    } else {
      setEditingExpense(null);
      setForm({ name: '', category: 'Flights', type: 'confirmed', eventStatus: 'prepaid', totalValue: '', activityDate: '', bookedDate: '', vendor: '', confirmationNumber: '', notes: '' });
      setPayments([{ ...emptyPayment }]);
    }
    setShowForm(true);
  };

  const handlePaymentChange = (index, updated) => {
    const newPayments = [...payments];
    newPayments[index] = updated;
    setPayments(newPayments);
  };

  const handlePaymentRemove = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name) return alert('Please enter an expense name');
    const dataToSave = {
      ...form,
      eventStatus: form.type === 'planned' ? 'planned' : form.eventStatus,
      payments: form.type === 'confirmed' ? payments : []
    };
    try {
      if (editingExpense) {
        const res = await axios.put(`${API}/trips/${tripId}/expenses/${editingExpense._id}`, dataToSave);
        setExpenses(expenses.map(e => e._id === editingExpense._id ? res.data : e));
      } else {
        const res = await axios.post(`${API}/trips/${tripId}/expenses`, dataToSave);
        setExpenses([...expenses, res.data]);
      }
      setShowForm(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Error saving expense. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`${API}/trips/${tripId}/expenses/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const confirmed = expenses.filter(e => e.type === 'confirmed');
  const planned = expenses.filter(e => e.type === 'planned');
  const totalValue = expenses.reduce((sum, e) => sum + (e.totalValue || 0), 0);

  const statusColor = (s) => ({ prepaid: '#1B2A4A', payOnSite: '#185FA5', optional: '#888', planned: '#BA7517' }[s] || '#888');
  const statusLabel = (s) => ({ prepaid: 'Prepaid', payOnSite: 'Pay on site', optional: 'Optional', planned: 'Budget estimate' }[s] || s);

  const paymentSummary = (p) => {
    if (p.type === 'cash') return `$${p.amount || 0} · ${p.method || ''}${p.paid ? ' · ✓ Paid' : ''}`;
    if (p.type === 'pointsBooking') return `${Number(p.pointsAmount || 0).toLocaleString()} ${p.pointsProgram || ''} pts${p.paid ? ' · ✓ Applied' : ''}`;
    if (p.type === 'cashOffsetByPoints') return `$${p.chargeAmount || 0} charge · ${Number(p.pointsAmount || 0).toLocaleString()} ${p.pointsProgram || ''} pts · $${p.netCashOut || 0} net cash${p.paid ? ' · ✓ Paid' : ''}`;
    if (p.type === 'credit') return `$${p.creditAmount || 0} ${p.creditSource || ''} credit · $${p.remainingCash || 0} remaining${p.paid ? ' · ✓ Applied' : ''}`;
    return '';
  };

  const paymentTypeLabel = (t) => ({ cash: 'Cash', pointsBooking: 'Points booking', cashOffsetByPoints: 'Cash + points', credit: 'Credit' }[t] || t);
  const paymentTypeColor = (t) => ({ cash: '#555', pointsBooking: '#BA7517', cashOffsetByPoints: '#534AB7', credit: '#185FA5' }[t] || '#555');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total trip value', value: `$${totalValue.toLocaleString()}` },
          { label: 'Confirmed expenses', value: confirmed.length },
          { label: 'Planned estimates', value: planned.length },
        ].map(m => (
          <div key={m.label} style={{ background: '#f5f5f5', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Expenses</h2>
        <button onClick={() => openForm()} style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + Add Expense
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}>{editingExpense ? 'Edit Expense' : 'New Expense'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Expense name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Delta flights ATL-TYO"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="confirmed">Confirmed expense</option>
                <option value="planned">Planned estimate</option>
              </select>
            </div>
            {form.type === 'confirmed' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Booking status</label>
                <select value={form.eventStatus} onChange={e => setForm({ ...form, eventStatus: e.target.value })}
                  style={{ width: '50%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  {EVENT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{form.type === 'planned' ? 'Estimated amount ($)' : 'Total value ($)'}</label>
              <input type="number" value={form.totalValue} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) || '' })}
                placeholder="0" style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Activity date</label>
              <input type="date" value={form.activityDate} onChange={e => setForm({ ...form, activityDate: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            {form.type === 'confirmed' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Date booked</label>
                  <input type="date" value={form.bookedDate} onChange={e => setForm({ ...form, bookedDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Vendor</label>
                  <input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                    placeholder="e.g. delta.com" style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Confirmation #</label>
                  <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })}
                    placeholder="Confirmation number" style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </>
            )}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes" rows={2}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
            </div>
          </div>

          {form.type === 'confirmed' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payments</h4>
                <button onClick={() => setPayments([...payments, { ...emptyPayment }])}
                  style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
                  + Add payment
                </button>
              </div>
              {payments.map((p, i) => (
                <PaymentForm key={i} payment={p} index={i} onChange={handlePaymentChange} onRemove={handlePaymentRemove} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {editingExpense ? 'Save changes' : 'Add expense'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingExpense(null); }}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888' }}>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>No expenses yet. Add your first expense!</p>
      ) : (
        <div>
          {confirmed.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Confirmed</h3>
              {confirmed.map(expense => (
                <div key={expense._id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{expense.name}</h3>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: statusColor(expense.eventStatus) + '20', color: statusColor(expense.eventStatus), fontWeight: '500' }}>
                          {statusLabel(expense.eventStatus)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {expense.category}{expense.activityDate && ` · ${expense.activityDate}`}{expense.vendor && ` · ${expense.vendor}`}{expense.confirmationNumber && ` · Conf: ${expense.confirmationNumber}`}
                      </div>
                      {expense.notes && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>{expense.notes}</div>}
                      {expense.payments && expense.payments.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          {expense.payments.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: paymentTypeColor(p.type) + '15', color: paymentTypeColor(p.type), fontWeight: '500' }}>
                                {paymentTypeLabel(p.type)}
                              </span>
                              <span style={{ fontSize: '12px', color: '#666' }}>{paymentSummary(p)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>${(expense.totalValue || 0).toLocaleString()}</div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openForm(expense)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(expense._id)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {planned.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Planned Estimates</h3>
              {planned.map(expense => (
                <div key={expense._id} style={{ background: '#fafaf8', border: '1.5px dashed #ccc', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{expense.name}</h3>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#BA751720', color: '#BA7517', fontWeight: '500' }}>Budget estimate</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{expense.category}{expense.notes && ` · ${expense.notes}`}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>${(expense.totalValue || 0).toLocaleString()}</div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openForm(expense)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(expense._id)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpensesTab;
