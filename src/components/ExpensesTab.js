import { useState, useEffect } from 'react';
import axios from 'axios';
import { PROGRAMS } from '../constants';

const API = process.env.REACT_APP_API_URL || '/api';

const CATEGORIES = [
  'Flights', 'Lodging', 'Transportation', 'Activities & Tours', 'Food & Dining',
  'Shopping & Souvenirs', 'Car Rental & Rideshare', 'Gas, Tolls & Parking', 'Insurance', 'Pre-trip & Misc'
];

const EVENT_STATUS = [
  { value: 'prepaid', label: 'Confirmed & prepaid' },
  { value: 'payOnSite', label: 'Confirmed & pay on site' },
  { value: 'optional', label: 'Optional' }
];

const PAYMENT_TYPES = [
  { value: 'cashCard', label: 'Cash / Card' },
  { value: 'awardBooking', label: 'Award Booking (Points)' },
  { value: 'awardBookingWithFees', label: 'Award Booking + Fees (Points + Card)' },
  { value: 'portalBooking', label: 'Points Portal Booking' },
  { value: 'statementCredit', label: 'Statement Credit' },
  { value: 'creditVoucher', label: 'Credit / Voucher' }
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

const PAYMENT_TYPE_HINTS = {
  cashCard: 'Paid directly with a credit or debit card. No points involved.',
  awardBooking: 'Booked directly with an airline or hotel using miles or points — e.g. ANA award flight, Hilton free night certificate.',
  awardBookingWithFees: 'Points cover a portion of the booking value. The remainder — including any taxes, fees, or uncovered balance — is charged to your card.',
  portalBooking: 'Booked through a credit card travel portal using points or an annual travel credit — e.g. Capital One Travel, Chase Travel.',
  statementCredit: 'Points applied as a statement credit against a card charge after the fact.',
  creditVoucher: 'A dollar-value credit or voucher from a travel agency, booking site (Expedia, Viator, etc.), or other non-points source. Not for airline miles or hotel points — use Award Booking for those.',
};

function PaymentForm({ payment, index, onChange, onRemove, localCurrency = 'USD', exchangeRate = 1, totalValue = 0 }) {
  const update = (field, value) => {
    const updated = { ...payment, [field]: value };
    // Auto-calc net cash out for awardBookingWithFees and portalBooking
    if (field === 'chargeAmount' || field === 'pointsAmount' || field === 'localChargeAmount' || field === 'type') {
      const type = updated.type;
      const charge = parseFloat(updated.chargeAmount) || 0;
      const pts = parseFloat(updated.pointsAmount) || 0;
      if (type === 'awardBookingWithFees') {
        // Points cover flight value, card charge IS the cash out (taxes/fees)
        updated.netCashOut = charge;
      } else if (type === 'portalBooking') {
        // Points offset the card charge at 1cpp
        const pointsValue = parseFloat((pts * 0.01).toFixed(2));
        updated.netCashOut = charge > pointsValue ? parseFloat((charge - pointsValue).toFixed(2)) : 0;
      }
    }
    onChange(index, updated);
  };
  const isInternational = localCurrency && localCurrency !== 'USD' && exchangeRate > 1;

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
          {payment.type && PAYMENT_TYPE_HINTS[payment.type] && (
            <div style={{ fontSize: '11px', color: '#1A7A5C', marginTop: '5px', padding: '6px 8px', background: '#E1F5EE', borderRadius: '6px', lineHeight: '1.4' }}>
              {PAYMENT_TYPE_HINTS[payment.type]}
            </div>
          )}
          {(payment.type === 'awardBooking' || payment.type === 'awardBookingWithFees' || payment.type === 'portalBooking' || payment.type === 'statementCredit') && (
            <div style={{ fontSize: '11px', color: '#BA7517', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              💡 This will appear in your <strong>Points tab</strong> as committed spend.
            </div>
          )}
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
        {payment.type === 'cashCard' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Amount ($)</label>
              <input type="number" value={payment.amount} onChange={e => update('amount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
              {isInternational && (
                <div style={{ marginTop: '5px' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8A9AB5', marginBottom: '2px' }}>Or enter in {localCurrency}</label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#8A9AB5' }}>{localCurrency}</span>
                    <input type="number" value={payment.localAmount || ''} onChange={e => {
                      const local = parseFloat(e.target.value) || '';
                      const usd = local ? parseFloat((local / exchangeRate).toFixed(2)) : '';
                      onChange(index, { ...payment, localAmount: local, localCurrency, amount: usd ? usd.toFixed(2) : '' });
                    }} placeholder="0" style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    {payment.localAmount > 0 && <span style={{ fontSize: '11px', color: '#1A7A5C', whiteSpace: 'nowrap' }}>= ${parseFloat(payment.amount || 0).toFixed(2)}</span>}
                  </div>
                </div>
              )}
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
        {payment.type === 'awardBooking' && (
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

        {/* PORTAL BOOKING */}
        {payment.type === 'portalBooking' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points program / portal</label>
              <select value={payment.pointsProgram} onChange={e => update('pointsProgram', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">Select program</option>
                {PROGRAMS.map(p => <option key={p} disabled={p.startsWith('──')}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points / credits used</label>
              <input type="number" value={payment.pointsAmount} onChange={e => update('pointsAmount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Value redeemed ($)</label>
              <input type="number" value={payment.pointsValue || ''} onChange={e => update('pointsValue', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Date redeemed</label>
              <input type="date" value={payment.pointsAppliedDate} onChange={e => update('pointsAppliedDate', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </>
        )}

        {/* STATEMENT CREDIT */}
        {payment.type === 'statementCredit' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points program</label>
              <select value={payment.pointsProgram} onChange={e => update('pointsProgram', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">Select program</option>
                {PROGRAMS.map(p => <option key={p} disabled={p.startsWith('──')}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points used</label>
              <input type="number" value={payment.pointsAmount} onChange={e => update('pointsAmount', e.target.value)}
                placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Credit value ($)</label>
              <input type="number" value={payment.amount} onChange={e => update('amount', e.target.value)}
                placeholder="Dollar value of credit applied" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Card the credit applied to</label>
              <select value={payment.cardUsed} onChange={e => update('cardUsed', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Date applied</label>
              <input type="date" value={payment.pointsAppliedDate} onChange={e => update('pointsAppliedDate', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </>
        )}

        {/* CASH OFFSET BY POINTS */}
        {payment.type === 'awardBookingWithFees' && (
          <>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '2px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#BA7517', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Points — covers flight/hotel value</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Value of points ($)</label>
                  <input type="number" value={payment.pointsValue || ''} onChange={e => {
                    const pv = parseFloat(e.target.value) || 0;
                    const net = totalValue > 0 ? parseFloat(Math.max(0, totalValue - pv).toFixed(2)) : 0;
                    onChange(index, { ...payment, pointsValue: e.target.value, netCashOut: net });
                  }} placeholder="0" style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Points applied date</label>
                  <input type="date" value={payment.pointsAppliedDate} onChange={e => update('pointsAppliedDate', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#185FA5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Card charge — remaining balance &amp; fees</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>Card used</label>
                  <select value={payment.cardUsed} onChange={e => update('cardUsed', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    {METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>
                    Remainder charged to card ($)
                    <span style={{ fontWeight: '400', color: '#8A9AB5', marginLeft: '4px' }}>— auto-calculated</span>
                  </label>
                  <input type="number" value={payment.netCashOut}
                    onChange={e => {
                      const val = e.target.value;
                      const calc = totalValue > 0 ? parseFloat(Math.max(0, totalValue - (parseFloat(payment.pointsValue) || 0)).toFixed(2)) : 0;
                      const net = val === '' || parseFloat(val) === 0 ? calc : parseFloat(val);
                      onChange(index, { ...payment, netCashOut: net, localNetCashOut: '' });
                    }}
                    placeholder="0"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc', MozAppearance: 'textfield' }} />
                  {isInternational && (
                    <div style={{ marginTop: '5px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: '#8A9AB5', marginBottom: '2px' }}>Or enter in {localCurrency}</label>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#8A9AB5' }}>{localCurrency}</span>
                        <input type="number" value={payment.localNetCashOut || ''} onChange={e => {
                          const local = parseFloat(e.target.value) || 0;
                          const calc = totalValue > 0 ? parseFloat(Math.max(0, totalValue - (parseFloat(payment.pointsValue) || 0)).toFixed(2)) : 0;
                          const usd = local > 0 ? parseFloat((local / exchangeRate).toFixed(2)) : calc;
                          onChange(index, { ...payment, localNetCashOut: local > 0 ? local : '', netCashOut: usd });
                        }} placeholder="0" style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1', MozAppearance: 'textfield' }} />
                        {payment.localNetCashOut > 0 && <span style={{ fontSize: '11px', color: '#1A7A5C', whiteSpace: 'nowrap' }}>= ${parseFloat(payment.netCashOut || 0).toFixed(2)}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* CREDIT */}
        {payment.type === 'creditVoucher' && (
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
              {isInternational && (
                <div style={{ marginTop: '5px' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8A9AB5', marginBottom: '2px' }}>Or enter in {localCurrency}</label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#8A9AB5' }}>{localCurrency}</span>
                    <input type="number" value={payment.localAmount || ''} onChange={e => {
                      const local = parseFloat(e.target.value) || '';
                      const usd = local ? parseFloat((local / exchangeRate).toFixed(2)) : '';
                      onChange(index, { ...payment, localAmount: local, localCurrency, creditAmount: usd ? usd.toFixed(2) : '' });
                    }} placeholder="0" style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    {payment.localAmount > 0 && <span style={{ fontSize: '11px', color: '#1A7A5C', whiteSpace: 'nowrap' }}>= ${parseFloat(payment.creditAmount || 0).toFixed(2)}</span>}
                  </div>
                </div>
              )}
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

function ExpensesTab({ tripId, localCurrency = 'USD', exchangeRate = 1, onExpenseChange }) {
  const isInternational = localCurrency && localCurrency !== 'USD' && exchangeRate > 1;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [inlineEditId, setInlineEditId] = useState(null); // expense._id being edited inline
  const [payments, setPayments] = useState([{ ...emptyPayment }]);
  const [form, setForm] = useState({
    name: '', category: 'Flights', type: 'planned', eventStatus: 'placeholder',
    totalValue: '', estimatedValue: '', activityDate: '', bookedDate: '', vendor: '', confirmationNumber: '', notes: '', localAmount: '', localCurrency: ''
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
      setInlineEditId(expense._id);
      setEditingExpense(expense);
      setForm({
        name: expense.name, category: expense.category, type: expense.type,
        eventStatus: expense.eventStatus, totalValue: expense.totalValue,
        estimatedValue: expense.estimatedValue || '',
        activityDate: expense.activityDate || '', bookedDate: expense.bookedDate || '',
        vendor: expense.vendor || '', confirmationNumber: expense.confirmationNumber || '',
        notes: expense.notes || ''
      });
      setPayments(expense.payments && expense.payments.length > 0 ? expense.payments : [{ ...emptyPayment }]);
    } else {
      setEditingExpense(null);
      setInlineEditId(null);
      setForm({ name: '', category: 'Flights', type: 'planned', eventStatus: 'placeholder', totalValue: '', estimatedValue: '', activityDate: '', bookedDate: '', vendor: '', confirmationNumber: '', notes: '', localAmount: '', localCurrency: '' });
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
      eventStatus: form.eventStatus,
      payments: form.type === 'confirmed' ? payments : []
    };
    try {
      if (editingExpense) {
        const res = await axios.put(`${API}/trips/${tripId}/expenses/${editingExpense._id}`, dataToSave);
        setExpenses(expenses.map(e => e._id === editingExpense._id ? res.data : e));
        if (onExpenseChange) onExpenseChange();
      } else {
        const res = await axios.post(`${API}/trips/${tripId}/expenses`, dataToSave);
        setExpenses([...expenses, res.data]);
        if (onExpenseChange) onExpenseChange();
      }
      setShowForm(false);
      setEditingExpense(null);
      setInlineEditId(null);
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
    if (p.type === 'cashCard') return `$${p.amount || 0} · ${p.method || ''}${p.paid ? ' · ✓ Paid' : ''}`;
    if (p.type === 'awardBooking') return `${Number(p.pointsAmount || 0).toLocaleString()} ${p.pointsProgram || ''} pts${p.paid ? ' · ✓ Applied' : ''}`;
    if (p.type === 'awardBookingWithFees') return `$${p.chargeAmount || 0} charge · ${Number(p.pointsAmount || 0).toLocaleString()} ${p.pointsProgram || ''} pts · $${p.netCashOut || 0} net cash${p.paid ? ' · ✓ Paid' : ''}`;
    if (p.type === 'creditVoucher') return `$${p.creditAmount || 0} ${p.creditSource || ''} credit · $${p.remainingCash || 0} remaining${p.paid ? ' · ✓ Applied' : ''}`;
    return '';
  };

  const paymentTypeLabel = (t) => ({ cashCard: 'Cash/Card', awardBooking: 'Award Booking', awardBookingWithFees: 'Award + Fees', portalBooking: 'Portal Booking', statementCredit: 'Statement Credit', creditVoucher: 'Credit/Voucher' }[t] || t);
  const paymentTypeColor = (t) => ({ cashCard: '#555', awardBooking: '#BA7517', awardBookingWithFees: '#534AB7', portalBooking: '#185FA5', statementCredit: '#1A7A5C', creditVoucher: '#993C1D' }[t] || '#555');

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

      {showForm && !inlineEditId && (
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{form.type === 'planned' ? 'Estimated amount ($)' : 'Final / actual value ($)'}</label>
              <input type="number" value={form.localAmount && form.totalValue ? parseFloat(form.totalValue).toFixed(2) : form.totalValue} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) || '' })}
                placeholder="0" style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
              {isInternational && (
                <div style={{ marginTop: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8A9AB5', marginBottom: '3px' }}>Or enter in {localCurrency}</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#8A9AB5' }}>{localCurrency}</span>
                    <input type="number" value={form.localAmount} onChange={e => {
                      const local = parseFloat(e.target.value) || '';
                      const usd = local ? Math.round(local / exchangeRate * 100) / 100 : '';
                      setForm({ ...form, localAmount: local, localCurrency, totalValue: usd });
                    }} placeholder="0" style={{ flex: 1, padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                    {form.localAmount > 0 && <span style={{ fontSize: '12px', color: '#1A7A5C', whiteSpace: 'nowrap' }}>= ${parseFloat(form.totalValue).toFixed(2)}</span>}
                  </div>
                </div>
              )}
            </div>
            {form.type === 'confirmed' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Original quote / estimate ($) <span style={{ color: '#aaa', fontWeight: '400' }}>optional</span></label>
              <input type="number" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: parseFloat(e.target.value) || '' })}
                placeholder="What you expected to pay" style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>e.g. quoted price before unexpected fees</div>
            </div>
            )}
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
                <PaymentForm key={i} payment={p} index={i} onChange={handlePaymentChange} onRemove={handlePaymentRemove} localCurrency={localCurrency} exchangeRate={exchangeRate} totalValue={parseFloat(form.totalValue) || 0} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {editingExpense ? 'Save changes' : 'Add expense'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingExpense(null); setInlineEditId(null); }}
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
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '2px' }}>${(expense.totalValue || 0).toLocaleString()}{expense.localAmount >= 1 && expense.localCurrency && expense.localCurrency !== 'USD' && <span style={{ fontSize: '13px', color: '#8A9AB5', fontWeight: '400', marginLeft: '6px' }}>({expense.localCurrency} {Math.round(expense.localAmount).toLocaleString()})</span>}</div>
                      {expense.estimatedValue != null && expense.estimatedValue !== '' && expense.estimatedValue !== expense.totalValue && (
                        <div style={{ fontSize: '11px', marginBottom: '4px', color: expense.totalValue > expense.estimatedValue ? '#A32D2D' : '#1A7A5C', fontWeight: '600' }}>
                          {expense.totalValue > expense.estimatedValue ? '▲' : '▼'} ${Math.abs(Math.round(expense.totalValue - expense.estimatedValue)).toLocaleString()} vs ${Math.round(expense.estimatedValue).toLocaleString()} est.
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openForm(expense)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(expense._id)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                  {/* Inline edit form */}
                  {inlineEditId === expense._id && showForm && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Expense name *</label>
                          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
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
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Final / actual value ($)</label>
                          <input type="number" value={form.totalValue} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) || '' })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                          {isInternational && (
                            <div style={{ marginTop: '5px' }}>
                              <label style={{ display: 'block', fontSize: '10px', color: '#8A9AB5', marginBottom: '2px' }}>Or enter in {localCurrency}</label>
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#8A9AB5' }}>{localCurrency}</span>
                                <input type="number" value={form.localAmount || ''} onChange={e => {
                                  const local = parseFloat(e.target.value) || '';
                                  const usd = local ? (local / exchangeRate).toFixed(2) : '';
                                  setForm({ ...form, localAmount: local, localCurrency, totalValue: usd });
                                }} placeholder="0" style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                                {form.localAmount > 0 && <span style={{ fontSize: '11px', color: '#1A7A5C', whiteSpace: 'nowrap' }}>= ${parseFloat(form.totalValue || 0).toFixed(2)}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Original quote ($) <span style={{ color: '#aaa', fontWeight: '400' }}>optional</span></label>
                          <input type="number" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: parseFloat(e.target.value) || '' })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Activity date</label>
                          <input type="date" value={form.activityDate} onChange={e => setForm({ ...form, activityDate: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Vendor</label>
                          <input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Confirmation #</label>
                          <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Notes</label>
                          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={2} style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
                        </div>
                      </div>
                      {/* Expense type */}
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Expense type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                          <option value="planned">Planned estimate</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                      </div>
                      {/* Payments section in inline edit */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payments</h4>
                          <button onClick={() => setPayments([...payments, { ...emptyPayment }])}
                            style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
                            + Add payment
                          </button>
                        </div>
                        {payments.map((p, i) => (
                          <PaymentForm key={i} payment={p} index={i} onChange={handlePaymentChange} onRemove={handlePaymentRemove} localCurrency={localCurrency} exchangeRate={exchangeRate} totalValue={parseFloat(form.totalValue) || 0} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSave} style={{ padding: '7px 18px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Save changes</button>
                        <button onClick={() => { setShowForm(false); setEditingExpense(null); setInlineEditId(null); }}
                          style={{ padding: '7px 18px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                      </div>
                    </div>
                  )}
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
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '2px' }}>${(expense.totalValue || 0).toLocaleString()}{expense.localAmount >= 1 && expense.localCurrency && expense.localCurrency !== 'USD' && <span style={{ fontSize: '13px', color: '#8A9AB5', fontWeight: '400', marginLeft: '6px' }}>({expense.localCurrency} {Math.round(expense.localAmount).toLocaleString()})</span>}</div>
                      {expense.estimatedValue != null && expense.estimatedValue !== '' && expense.estimatedValue !== expense.totalValue && (
                        <div style={{ fontSize: '11px', marginBottom: '4px', color: expense.totalValue > expense.estimatedValue ? '#A32D2D' : '#1A7A5C', fontWeight: '600' }}>
                          {expense.totalValue > expense.estimatedValue ? '▲' : '▼'} ${Math.abs(Math.round(expense.totalValue - expense.estimatedValue)).toLocaleString()} vs ${Math.round(expense.estimatedValue).toLocaleString()} est.
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openForm(expense)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(expense._id)} style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                  {inlineEditId === expense._id && showForm && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Expense name *</label>
                          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
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
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{form.type === 'planned' ? 'Estimated amount ($)' : 'Final / actual value ($)'}</label>
                          <input type="number" value={form.totalValue} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) || '' })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                          {isInternational && (
                            <div style={{ marginTop: '5px' }}>
                              <label style={{ display: 'block', fontSize: '10px', color: '#8A9AB5', marginBottom: '2px' }}>Or enter in {localCurrency}</label>
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#8A9AB5' }}>{localCurrency}</span>
                                <input type="number" value={form.localAmount || ''} onChange={e => {
                                  const local = parseFloat(e.target.value) || '';
                                  const usd = local ? (local / exchangeRate).toFixed(2) : '';
                                  setForm({ ...form, localAmount: local, localCurrency, totalValue: usd });
                                }} placeholder="0" style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1' }} />
                                {form.localAmount > 0 && <span style={{ fontSize: '11px', color: '#1A7A5C', whiteSpace: 'nowrap' }}>= ${parseFloat(form.totalValue || 0).toFixed(2)}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Original quote ($) <span style={{ color: '#aaa', fontWeight: '400' }}>optional</span></label>
                          <input type="number" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: parseFloat(e.target.value) || '' })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Activity date</label>
                          <input type="date" value={form.activityDate} onChange={e => setForm({ ...form, activityDate: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Vendor</label>
                          <input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Confirmation #</label>
                          <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Notes</label>
                          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={2} style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Expense type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                          <option value="planned">Planned estimate</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payments</h4>
                          <button onClick={() => setPayments([...payments, { ...emptyPayment }])}
                            style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
                            + Add payment
                          </button>
                        </div>
                        {payments.map((p, i) => (
                          <PaymentForm key={i} payment={p} index={i} onChange={handlePaymentChange} onRemove={handlePaymentRemove} localCurrency={localCurrency} exchangeRate={exchangeRate} totalValue={parseFloat(form.totalValue) || 0} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSave} style={{ padding: '7px 18px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Save changes</button>
                        <button onClick={() => { setShowForm(false); setEditingExpense(null); setInlineEditId(null); }}
                          style={{ padding: '7px 18px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                      </div>
                    </div>
                  )}
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
