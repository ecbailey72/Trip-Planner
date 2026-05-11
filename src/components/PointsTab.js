import { useState, useEffect } from 'react';
import axios from 'axios';

const API = '/api';

const PROGRAMS = [
  '── Credit Cards ──', 'Capital One', 'Chase', 'Amex', 'Citi',
  '── Airlines ──', 'Delta Skymiles', 'AA Advantage', 'United MileagePlus', 'American Airlines', 'Virgin', 'Flying Blue', 'AeroMexico',
  '── Hotels ──', 'Marriott Bonvoy', 'Hilton Honors', 'Hyatt', 'Wyndham', 'Choice',
  '── Car Rentals ──', 'Hertz', 'National', 'Enterprise', 'Avis',
  '── Travel Platforms ──', 'Viator', 'Expedia', 'hotels.com', 'VRBO', 'booking.com', 'Priceline', 'Orbitz', 'trip.com', 'AirBnB',
  '── Cruises ──', 'Carnival', 'Royal Caribbean', 'Norwegian', 'Disney Cruise', 'Princess', 'Celebrity',
  '── Other ──', 'Priority Pass', 'Other'
];

const emptyForm = {
  program: 'Capital One',
  currentBalance: '',
  balanceDate: new Date().toISOString().split('T')[0],
  anticipatedAdditions: []
};

const emptyAnticipated = { amount: '', expectedDate: '', description: '' };

function PointsTab({ tripId, expenses = [] }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [benchmark, setBenchmark] = useState(1.5);
  const [editingBenchmark, setEditingBenchmark] = useState(false);
  const [benchmarkInput, setBenchmarkInput] = useState(1.5);

  useEffect(() => { fetchAccounts(); }, [tripId]);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/points`);
      setAccounts(res.data);
    } catch (err) {
      console.error('Error fetching points:', err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setForm({
        program: account.program,
        currentBalance: account.currentBalance,
        balanceDate: account.balanceDate || new Date().toISOString().split('T')[0],
        anticipatedAdditions: account.anticipatedAdditions || []
      });
    } else {
      setEditingAccount(null);
      setForm(emptyForm);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.program || form.program.startsWith('──')) return alert('Please select a program');
    if (form.currentBalance === '') return alert('Please enter a balance');
    try {
      if (editingAccount) {
        const res = await axios.put(`${API}/trips/${tripId}/points/${editingAccount._id}`, form);
        setAccounts(accounts.map(a => a._id === editingAccount._id ? res.data : a));
      } else {
        const res = await axios.post(`${API}/trips/${tripId}/points`, form);
        setAccounts([...accounts, res.data]);
      }
      setShowForm(false);
      setEditingAccount(null);
    } catch (err) {
      console.error('Error saving account:', err);
      alert('Error saving. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this points account?')) return;
    try {
      await axios.delete(`${API}/trips/${tripId}/points/${id}`);
      setAccounts(accounts.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const addAnticipated = () => {
    setForm({ ...form, anticipatedAdditions: [...form.anticipatedAdditions, { ...emptyAnticipated }] });
  };

  const updateAnticipated = (index, field, value) => {
    const updated = [...form.anticipatedAdditions];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, anticipatedAdditions: updated });
  };

  const removeAnticipated = (index) => {
    setForm({ ...form, anticipatedAdditions: form.anticipatedAdditions.filter((_, i) => i !== index) });
  };

  // Calculate committed points from expenses
  const getCommitted = (program) => {
    let committed = 0;
    expenses.forEach(expense => {
      if (expense.payments) {
        expense.payments.forEach(p => {
          if ((p.type === 'pointsBooking' || p.type === 'cashOffsetByPoints') && p.pointsProgram === program) {
            committed += p.pointsAmount || 0;
          }
        });
      }
    });
    return committed;
  };

  const getAnticipated = (account) => {
    return (account.anticipatedAdditions || []).reduce((sum, a) => sum + (a.amount || 0), 0);
  };

  const calcCpp = (expenseAmt, points) => {
    if (!points || points === 0) return 0;
    return parseFloat((expenseAmt / points * 100).toFixed(2));
  };

  // Get all points payments from expenses for a given program
  const getPointsPayments = (program) => {
    const payments = [];
    expenses.forEach(expense => {
      if (expense.payments) {
        expense.payments.forEach(p => {
          if ((p.type === 'pointsBooking' || p.type === 'cashOffsetByPoints') && p.pointsProgram === program) {
            payments.push({ ...p, expenseName: expense.name, expenseValue: expense.totalValue });
          }
        });
      }
    });
    return payments;
  };

  // Total points value across all accounts
  const totalPointsValue = accounts.reduce((sum, a) => {
    const planning = a.currentBalance + getAnticipated(a);
    return sum + Math.round(planning * benchmark / 100);
  }, 0);

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programs tracked</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{accounts.length}</div>
        </div>
        <div style={{ background: '#FAEEDA', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#BA7517', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. total value</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#BA7517' }}>${totalPointsValue.toLocaleString()}</div>
          <div style={{ fontSize: '10px', color: '#BA7517', marginTop: '2px' }}>at {benchmark} cpp benchmark</div>
        </div>
        {(() => {
          const allPayments = accounts.flatMap(a => getPointsPayments(a.program));
          const totalPts = allPayments.reduce((sum, p) => sum + (p.pointsAmount || 0), 0);
          const totalVal = allPayments.reduce((sum, p) => sum + (p.type === 'pointsBooking' ? (p.expenseValue || 0) : (p.chargeAmount || 0)), 0);
          const avgCpp = totalPts > 0 ? calcCpp(totalVal, totalPts) : 0;
          const good = avgCpp >= benchmark;
          return (
            <div style={{ background: avgCpp === 0 ? '#f5f5f5' : good ? '#EEF1F8' : '#FAEEDA', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: avgCpp === 0 ? '#888' : good ? '#1B2A4A' : '#BA7517', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg cpp — all redemptions</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: avgCpp === 0 ? '#888' : good ? '#1B2A4A' : '#BA7517' }}>
                {avgCpp > 0 ? avgCpp.toFixed(2) : '—'}
              </div>
              {avgCpp > 0 && (
                <div style={{ fontSize: '10px', marginTop: '2px', color: good ? '#1B2A4A' : '#BA7517' }}>
                  {good ? '✓ Above benchmark' : '⚠ Below benchmark'}
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cpp benchmark</div>
          {editingBenchmark ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input type="number" step="0.1" value={benchmarkInput} onChange={e => setBenchmarkInput(parseFloat(e.target.value) || 1.5)}
                style={{ width: '70px', padding: '4px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <button onClick={() => { setBenchmark(benchmarkInput); setEditingBenchmark(false); }}
                style={{ padding: '4px 8px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
              <button onClick={() => setEditingBenchmark(false)}
                style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '700' }}>{benchmark} cpp</span>
              <button onClick={() => { setBenchmarkInput(benchmark); setEditingBenchmark(true); }}
                style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#666', cursor: 'pointer' }}>Edit</button>
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: '#E6F1FB', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', borderLeft: '4px solid #185FA5' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#185FA5', marginBottom: '5px' }}>How to use this points tool</div>
        <div style={{ fontSize: '12px', color: '#333', lineHeight: 1.6 }}>
          Enter your current balance when you start planning this trip — this is a planning snapshot, not a live tracker. If your balance changes significantly before the trip (a large redemption, a statement credit, closing a card), update it manually. When adding or editing an account, use the <strong>Anticipated additions</strong> section to record points you're confident are coming but haven't posted yet — intro bonuses after hitting spend thresholds, a known transfer, or a large purchase you're planning. Don't include speculative earnings.
        </div>
      </div>

      {/* Add account button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => openForm()}
          style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + Add Points Account
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}>{editingAccount ? 'Edit Account' : 'Add Points Account'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Program *</label>
              <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {PROGRAMS.map(p => (
                  <option key={p} value={p} disabled={p.startsWith('──')}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Current balance</label>
              <input type="number" value={form.currentBalance} onChange={e => setForm({ ...form, currentBalance: parseInt(e.target.value) || '' })}
                placeholder="Points balance today"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Balance as of date</label>
              <input type="date" value={form.balanceDate} onChange={e => setForm({ ...form, balanceDate: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>

          {/* Anticipated additions */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500' }}>Anticipated additions</label>
              <button onClick={addAnticipated}
                style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
                + Add
              </button>
            </div>
            {form.anticipatedAdditions.length === 0 && (
              <p style={{ fontSize: '12px', color: '#aaa' }}>e.g. credit card intro bonus, upcoming earn</p>
            )}
            {form.anticipatedAdditions.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input type="number" value={item.amount} onChange={e => updateAnticipated(idx, 'amount', parseInt(e.target.value) || '')}
                  placeholder="Points" style={{ padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input type="date" value={item.expectedDate} onChange={e => updateAnticipated(idx, 'expectedDate', e.target.value)}
                  style={{ padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input value={item.description} onChange={e => updateAnticipated(idx, 'description', e.target.value)}
                  placeholder="e.g. Intro bonus after $4K spend"
                  style={{ padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <button onClick={() => removeAnticipated(idx)}
                  style={{ padding: '4px 8px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer', fontSize: '12px' }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave}
              style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {editingAccount ? 'Save changes' : 'Add account'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingAccount(null); }}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accounts list */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading points...</p>
      ) : accounts.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>No points accounts yet. Add your first program!</p>
      ) : (
        <div>
          {accounts.map(account => {
            const committed = getCommitted(account.program);
            const anticipated = getAnticipated(account);
            const planningBalance = account.currentBalance + anticipated;
            const remaining = planningBalance - committed;
            const payments = getPointsPayments(account.program);

            return (
              <div key={account._id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem', marginBottom: '12px' }}>
                {/* Account header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '3px' }}>{account.program}</h3>
                    {account.balanceDate && <div style={{ fontSize: '11px', color: '#888' }}>Balance as of {account.balanceDate}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openForm(account)}
                      style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(account._id)}
                      style={{ fontSize: '12px', padding: '3px 10px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>

                {/* Balance tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: anticipated > 0 ? '10px' : '0' }}>
                  <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current</div>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>{account.currentBalance.toLocaleString()}</div>
                  </div>
                  {anticipated > 0 && (
                    <div style={{ background: '#E6F1FB', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', color: '#185FA5', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Anticipated</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#185FA5' }}>+{anticipated.toLocaleString()}</div>
                    </div>
                  )}
                  {committed > 0 && (
                    <div style={{ background: '#FAEEDA', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', color: '#BA7517', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Committed</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#BA7517' }}>{committed.toLocaleString()}</div>
                    </div>
                  )}
                  <div style={{ background: remaining < 0 ? '#FCEBEB' : '#EEF1F8', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '10px', color: remaining < 0 ? '#A32D2D' : '#1B2A4A', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remaining</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: remaining < 0 ? '#A32D2D' : '#1B2A4A' }}>{remaining.toLocaleString()}</div>
                  </div>
                </div>

                {/* Anticipated additions detail */}
                {account.anticipatedAdditions && account.anticipatedAdditions.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0f4ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#185FA5', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Anticipated additions</div>
                    {account.anticipatedAdditions.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#444', marginBottom: '3px' }}>
                        <span>{item.description || 'Upcoming points'}</span>
                        <span style={{ fontWeight: '600' }}>+{(item.amount || 0).toLocaleString()} {item.expectedDate ? '· ' + item.expectedDate : ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Points payments from expenses */}
                {payments.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Redemptions this trip</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <th style={{ textAlign: 'left', padding: '4px 0', color: '#888', fontWeight: '500' }}>Expense</th>
                          <th style={{ textAlign: 'right', padding: '4px 0', color: '#888', fontWeight: '500' }}>Points</th>
                          <th style={{ textAlign: 'right', padding: '4px 0', color: '#888', fontWeight: '500' }}>Value</th>
                          <th style={{ textAlign: 'right', padding: '4px 0', color: '#888', fontWeight: '500' }}>cpp</th>
                          <th style={{ textAlign: 'right', padding: '4px 0', color: '#888', fontWeight: '500' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, idx) => {
                          const value = p.type === 'pointsBooking' ? p.expenseValue : p.chargeAmount;
                          const cpp = calcCpp(value || 0, p.pointsAmount || 0);
                          const cppGood = cpp >= benchmark;
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f8f8f8' }}>
                              <td style={{ padding: '6px 0', color: '#333' }}>{p.expenseName}</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600' }}>{(p.pointsAmount || 0).toLocaleString()}</td>
                              <td style={{ padding: '6px 0', textAlign: 'right' }}>${(value || 0).toLocaleString()}</td>
                              <td style={{ padding: '6px 0', textAlign: 'right' }}>
                                <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '20px', background: cppGood ? '#EEF1F8' : '#FAEEDA', color: cppGood ? '#1B2A4A' : '#BA7517', fontWeight: '500' }}>
                                  {cpp.toFixed(1)} {cppGood ? '✓' : '⚠'}
                                </span>
                              </td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '11px', color: p.paid ? '#1B2A4A' : '#BA7517' }}>
                                {p.paid ? '✓ Applied' : 'Pending'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid #e0e0e0' }}>
                          <td style={{ padding: '8px 0', fontWeight: '600', fontSize: '12px' }}>Average cpp</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                            {payments.reduce((sum, p) => sum + (p.pointsAmount || 0), 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                            ${payments.reduce((sum, p) => sum + (p.type === 'pointsBooking' ? (p.expenseValue || 0) : (p.chargeAmount || 0)), 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '8px 0', textAlign: 'right' }}>
                            {(() => {
                              const totalPts = payments.reduce((sum, p) => sum + (p.pointsAmount || 0), 0);
                              const totalVal = payments.reduce((sum, p) => sum + (p.type === 'pointsBooking' ? (p.expenseValue || 0) : (p.chargeAmount || 0)), 0);
                              const avgCpp = totalPts > 0 ? calcCpp(totalVal, totalPts) : 0;
                              const good = avgCpp >= benchmark;
                              return avgCpp > 0 ? (
                                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: good ? '#EEF1F8' : '#FAEEDA', color: good ? '#1B2A4A' : '#BA7517', fontWeight: '600' }}>
                                  {avgCpp.toFixed(2)} avg {good ? '✓' : '⚠'}
                                </span>
                              ) : '—';
                            })()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PointsTab;
