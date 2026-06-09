import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

function DashboardTab({ tripId, trip }) {
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [spending, setSpending] = useState([]);
  const [showPlanningView, setShowPlanningView] = useState(false);
  const [chartView, setChartView] = useState('tripValue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [tripId]);

  const fetchAll = async () => {
    try {
      const [expRes, evtRes, taskRes, spendRes] = await Promise.all([
        axios.get(`${API}/trips/${tripId}/expenses`),
        axios.get(`${API}/trips/${tripId}/events`),
        axios.get(`${API}/trips/${tripId}/tasks`),
        axios.get(`${API}/trips/${tripId}/spending`)
      ]);
      setExpenses(expRes.data);
      setEvents(evtRes.data);
      setTasks(taskRes.data);
      setSpending(spendRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#888' }}>Loading dashboard...</div>;

  // ── FINANCIAL METRICS ───────────────────────────────────────────────
  const confirmed = expenses.filter(e => e.type === 'confirmed');
  const planned = expenses.filter(e => e.type === 'planned');

  let totalValue = 0, cashPaid = 0, cashOwed = 0, ptsValue = 0, creditsValue = 0;
  confirmed.forEach(e => {
    totalValue += e.totalValue || 0;
    e.payments?.forEach(p => {
      if (p.type === 'awardBooking') ptsValue += e.totalValue || 0;
      if (p.type === 'awardBookingWithFees') {
        ptsValue += p.pointsValue || 0;
        if (p.paid) cashPaid += p.netCashOut || 0;
        else cashOwed += p.netCashOut || 0;
      }
      if (p.type === 'cashCard') {
        if (p.paid) cashPaid += p.amount || 0;
        else cashOwed += p.amount || 0;
      }
      if (p.type === 'portalBooking') {
        ptsValue += p.pointsValue || 0;
      }
      if (p.type === 'statementCredit') {
        ptsValue += p.amount || 0;
      }
      if (p.type === 'creditVoucher') {
        creditsValue += p.creditAmount || 0;
        if (p.paid) cashPaid += p.remainingCash || 0;
        else cashOwed += p.remainingCash || 0;
      }
      if (p.type === 'travelCredit') {
        creditsValue += p.creditAmount || 0;
      }
    });
  });

  const plannedTotal = planned.reduce((sum, e) => sum + (e.totalValue || 0), 0);
  const netCashNeeded = cashOwed + plannedTotal;

  // Budget vs committed
  const tripBudget = trip.tripBudget || 0;
  const cppBenchmark = trip.cppBenchmark || 1.5;

  // Calculate points value committed using benchmark
  let pointsCommittedValue = 0; let debugPoints = []; console.log("POINTS DEBUG:", debugPoints);
  confirmed.forEach(e => {
    e.payments?.forEach(p => {
      if (p.type === 'awardBooking') {
        // Direct booking — points covered full expense value
        pointsCommittedValue += e.totalValue || 0; debugPoints.push({name: e.name, type: p.type, added: e.totalValue});
      }
      if (p.type === 'awardBookingWithFees') {
        // Partial — points covered the points value portion
        pointsCommittedValue += p.pointsValue || 0; debugPoints.push({name: e.name, type: p.type, added: p.pointsValue || 0});
      }
      if (p.type === 'portalBooking') {
        // Portal booking — points redeemed for travel credit
        pointsCommittedValue += p.pointsValue || 0;
      }
      if (p.type === 'statementCredit') {
        // Statement credit — use dollar value of credit
        pointsCommittedValue += p.amount || 0;
      }
    });
  });

  // Credits count against budget (earned)
  let creditsCommitted = 0;
  confirmed.forEach(e => {
    e.payments?.forEach(p => {
      if (p.type === 'creditVoucher') creditsCommitted += p.creditAmount || 0;
      if (p.type === 'travelCredit') creditsCommitted += p.creditAmount || 0;
    });
  });

  const budgetConsumed = cashPaid + cashOwed + pointsCommittedValue + creditsCommitted + plannedTotal;
  const budgetRemaining = tripBudget - budgetConsumed;
  const budgetPct = tripBudget > 0 ? Math.min(100, Math.round(budgetConsumed / tripBudget * 100)) : 0;

  // Next cash payment due
  const unpaidCash = [];
  confirmed.forEach(e => {
    e.payments?.forEach(p => {
      if (!p.paid && (p.type === 'cashCard' || p.type === 'awardBookingWithFees') && p.dueDate) {
        unpaidCash.push({ date: p.dueDate, name: e.name, amount: p.type === 'cashCard' ? p.amount : p.netCashOut });
      }
    });
  });
  unpaidCash.sort((a, b) => a.date.localeCompare(b.date));
  const nextDue = unpaidCash[0] || null;

  // ── CHECKLIST METRICS ───────────────────────────────────────────────
  const preTrip = tasks.filter(t => t.phase === 'preTrip');
  const completedPreTrip = preTrip.filter(t => t.status === 'complete').length;
  const taskPct = preTrip.length > 0 ? Math.round(completedPreTrip / preTrip.length * 100) : 0;

  // ── DAILY SPEND METRICS ─────────────────────────────────────────────
  const totalSpent = spending.reduce((sum, s) => sum + s.amount, 0);
  const dailyBudget = trip.dailyBudget || 200;
  const spendDays = [...new Set(spending.map(s => s.date))].length;
  const avgPerDay = spendDays > 0 ? Math.round(totalSpent / spendDays) : 0;

  // ── ITINERARY — today/tomorrow ──────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === today).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  const tomorrowEvents = events.filter(e => e.date === tomorrow).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  const showEvents = todayEvents.length ? todayEvents : tomorrowEvents;
  const showLabel = todayEvents.length ? "Today's itinerary" : "Tomorrow's itinerary";

  // ── COUNTDOWN ───────────────────────────────────────────────────────
  const countdown = () => {
    if (!trip.startDate) return null;
    const depart = new Date(trip.startDate + 'T12:00:00');
    const now = new Date();
    const diff = depart - now;
    if (diff <= 0) {
      const end = new Date(trip.endDate + 'T12:00:00');
      if (now <= end) return { text: '✈ Go — you\'re on the trip!', color: '#1A7A5C' };
      return { text: '📸 Remember — trip complete', color: '#C9A84C' };
    }
    const days = Math.floor(diff / 86400000);
    if (days === 0) return { text: 'Departing today! 🌴', color: '#1D9E75' };
    if (days === 1) return { text: 'Departing tomorrow!', color: '#BA7517' };
    return { text: `${days} days to departure`, color: days <= 7 ? '#BA7517' : '#185FA5' };
  };

  const cd = countdown();

  const EVENT_ICONS = {
    flight: '✈', lodging: '🛏', activity: '🥾', tour: '🏴',
    restaurant: '🍽', directions: '🧭', parking: '🅿', task: '✅',
    free: '☀', transportation: '🚌', note: '📝'
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Phase helpers
  const phase = trip.status || 'planning';
  const isPlanning = phase === 'planning';
  const isActive = phase === 'active';
  const isComplete = phase === 'complete';
  const netCashNeededFinal = cashOwed + (isComplete ? 0 : plannedTotal);

  return (
    <div>
      {/* Phase banner */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', padding: '12px 16px',
        background: isComplete ? 'rgba(201,168,76,0.1)' : isActive ? 'rgba(26,122,92,0.08)' : 'rgba(27,42,74,0.06)',
        borderRadius: '10px', border: isComplete ? '1px solid rgba(201,168,76,0.3)' : isActive ? '1px solid rgba(26,122,92,0.2)' : '1px solid rgba(27,42,74,0.1)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: isComplete ? '#C9A84C' : isActive ? '#1A7A5C' : '#1B2A4A', marginBottom: '2px' }}>
            {isPlanning && 'PHASE: Plan — Building your trip 🗓'}
            {isActive && 'PHASE: Go — Trip is underway ✈'}
            {isComplete && 'PHASE: Remember — Trip complete 📸'}
          </div>
          <div style={{ fontSize: '12px', color: '#8A9AB5', marginTop: '2px' }}>
            {isPlanning && 'Add expenses, build your itinerary, and set your budget before you depart.'}
            {isActive && "You're on the trip! Track daily spend, check your itinerary, and capture memories."}
            {isComplete && 'Review what you spent, how your points performed, and what to plan better next time.'}
          </div>
          {trip.startDate && (
            <div style={{ fontSize: '12px', color: '#8A9AB5', marginTop: '4px' }}>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              {cd && !isComplete && <span style={{ marginLeft: '10px', fontWeight: '600', color: cd.color }}>{cd.text}</span>}
            </div>
          )}
        </div>
        {isComplete && (
          <button
            onClick={() => setShowPlanningView(v => !v)}
            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
            {showPlanningView ? 'Show remember view' : 'Show planning view'}
          </button>
        )}
      </div>

      {/* Budget progress — top of dashboard */}
      {tripBudget > 0 && (!isComplete || showPlanningView) && (
        <div style={{ background: budgetRemaining < 0 ? '#FCEBEB' : budgetPct > 85 ? '#FAEEDA' : '#E1F5EE', borderRadius: '12px', padding: '16px 20px', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#1B2A4A', marginBottom: '4px' }}>
              Planned Trip Value: ${tripBudget.toLocaleString()}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: budgetRemaining < 0 ? '#A32D2D' : budgetPct > 85 ? '#BA7517' : '#1D9E75' }}>
              ${Math.round(budgetConsumed).toLocaleString()} Planned ({budgetPct}%)
            </div>
          </div>
          <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
            <div style={{ height: '8px', borderRadius: '4px', width: budgetPct + '%', background: budgetRemaining < 0 ? '#A32D2D' : budgetPct > 85 ? '#BA7517' : '#1D9E75', transition: 'width 0.4s' }} />
          </div>
          <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '6px 10px' }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Covered by points</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1D9E75' }}>${Math.round(pointsCommittedValue).toLocaleString()}</div>
              {tripBudget > 0 && <div style={{ fontSize: '10px', color: '#888' }}>{Math.round(pointsCommittedValue / tripBudget * 100)}% of planned trip value</div>}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '6px 10px' }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Credits applied</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#185FA5' }}>${Math.round(creditsValue).toLocaleString()}</div>
              {tripBudget > 0 && <div style={{ fontSize: '10px', color: '#888' }}>{Math.round(creditsValue / tripBudget * 100)}% of planned trip value</div>}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '6px 10px' }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Cash out of pocket</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1B2A4A' }}>${Math.round(cashPaid + cashOwed + totalSpent).toLocaleString()}</div>
              {tripBudget > 0 && <div style={{ fontSize: '10px', color: '#888' }}>{Math.round((cashPaid + cashOwed + totalSpent) / tripBudget * 100)}% of planned trip value</div>}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '6px 10px' }}>
              <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Still to plan</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#BA7517' }}>${Math.round(Math.max(0, budgetRemaining)).toLocaleString()}</div>
              {tripBudget > 0 && <div style={{ fontSize: '10px', color: '#888' }}>{budgetPct}% planned so far</div>}
            </div>
          </div>
        </div>
      )}

      {/* No budget set prompt */}
      {!tripBudget && (
        <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '14px 18px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#888' }}>No trip value set — add the total value of your trip (including points-covered expenses) to track your budget.</div>
        </div>
      )}



      {/* Financial summary */}
      {(!isComplete || showPlanningView) && <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{isComplete ? 'Cash Summary' : 'Cash Planning'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { label: 'Cash still owed', value: '$' + Math.round(cashOwed).toLocaleString(), color: '#BA7517', bg: '#FAEEDA', hint: 'Confirmed expenses not yet paid' },
            ...(!isComplete ? [{ label: 'Needs Funding', value: '$' + Math.round(netCashNeededFinal).toLocaleString(), color: '#A32D2D', bg: '#FCEBEB', hint: 'Have cash ready or find points to cover this amount' }] : []),
          ].map(m => (
            <div key={m.label} style={{ background: m.bg || '#f5f5f5', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: m.color, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.8, lineHeight: 1.3 }}>{m.label}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: m.color }}>{m.value}</div>
              {m.hint && <div style={{ fontSize: '9px', color: m.color, opacity: 0.75, marginTop: '2px' }}>{m.hint}</div>}
            </div>
          ))}
        </div>

        {/* Next cash payment */}
        {nextDue && (
          <div style={{ marginTop: '10px', padding: '12px 16px', background: '#FAEEDA', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#BA7517', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Next cash payment due</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#854F0B' }}>{nextDue.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#BA7517' }}>${Math.round(nextDue.amount || 0).toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#BA7517' }}>Due {formatDate(nextDue.date)}</div>
            </div>
          </div>
        )}

        {/* Upcoming payments list — compact, no box */}
        {unpaidCash.length > 1 && (
          <div style={{ marginTop: '6px', paddingLeft: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#888', marginBottom: '3px' }}>Additional upcoming payments</div>
            {unpaidCash.slice(1).map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', lineHeight: '1.8' }}>
                <span>{p.name}</span>
                <span>${Math.round(p.amount || 0).toLocaleString()} · {formatDate(p.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>}

      {/* Dual bar chart — budget vs actual by category */}
      {(expenses.length > 0 || spending.length > 0) && (() => {
        const COLORS = {
          'Flights': '#185FA5',
          'Lodging': '#1B2A4A',
          'Activities & Tours': '#534AB7',
          'Food & Dining': '#993C1D',
          'Shopping & Souvenirs': '#993556',
          'Car Rental & Rideshare': '#2E7D9A',
          'Transportation': '#1A7A5C',
          'Gas, Tolls & Parking': '#5F5E5A',
          'Insurance': '#3B6D11',
          'Pre-trip & Misc': '#BA7517',
        };

        // Budget — use estimatedValue if set, otherwise totalValue
        const budget = {};
        expenses.forEach(e => {
          if (!budget[e.category]) budget[e.category] = 0;
          if ((e.totalValue || 0) > 0) budget[e.category] += e.estimatedValue != null ? e.estimatedValue : (e.totalValue || 0);
        });

        // Actual — paid confirmed expenses + all daily spend
        const actual = {};
        expenses.filter(e => e.type === 'confirmed').forEach(e => {
          const paid = e.payments?.some(p => p.paid);
          if (paid) {
            if (!actual[e.category]) actual[e.category] = 0;
            actual[e.category] += e.totalValue || 0;
          }
        });
        // Add daily spend to Food & Dining equivalent categories
        const SPEND_CAT_MAP = {
          'Food & Drinks': 'Food & Dining',
          'Transportation': 'Transportation',
          'Shopping': 'Shopping & Souvenirs',
          'Activities': 'Activities & Tours',
          'Tips': 'Pre-trip & Misc',
          'Entrance Fees': 'Activities & Tours',
          'Misc': 'Pre-trip & Misc',
        };
        spending.forEach(s => {
          const mappedCat = SPEND_CAT_MAP[s.category] || 'Pre-trip & Misc';
          if (!actual[mappedCat]) actual[mappedCat] = 0;
          actual[mappedCat] += s.amount || 0;
        });

        // Cash out of pocket — only real cash paid (no points value)
        const cashOnly = {};
        expenses.filter(e => e.type === 'confirmed').forEach(e => {
          const paid = e.payments?.some(p => p.paid);
          if (paid) {
            e.payments?.forEach(p => {
              if (!cashOnly[e.category]) cashOnly[e.category] = 0;
              if (p.type === 'cashCard') cashOnly[e.category] += parseFloat(p.amount) || 0;
              if (p.type === 'awardBookingWithFees') cashOnly[e.category] += parseFloat(p.netCashOut) || 0;
              if (p.type === 'portalBooking') cashOnly[e.category] += 0; // fully points
              if (p.type === 'statementCredit') cashOnly[e.category] += 0; // fully points
              if (p.type === 'travelCredit') cashOnly[e.category] += 0; // card benefit
              if (p.type === 'creditVoucher') cashOnly[e.category] += parseFloat(p.remainingCash) || 0;
            });
          }
        });
        spending.forEach(s => {
          const mappedCat = SPEND_CAT_MAP[s.category] || 'Pre-trip & Misc';
          if (!cashOnly[mappedCat]) cashOnly[mappedCat] = 0;
          cashOnly[mappedCat] += s.amount || 0;
        });

        const displayActual = chartView === 'cashOnly' ? cashOnly : actual;

        // All categories that appear in either
        const allCats = [...new Set([...Object.keys(budget), ...Object.keys(displayActual)])];
        const maxVal = Math.max(...allCats.map(c => Math.max(budget[c] || 0, displayActual[c] || 0)));

        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spend by category</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setChartView('tripValue')} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid #ccc', background: chartView === 'tripValue' ? '#1B2A4A' : 'transparent', color: chartView === 'tripValue' ? 'white' : '#666', cursor: 'pointer', fontWeight: chartView === 'tripValue' ? '600' : '400' }}>Full trip value (incl. points)</button>
                  <button onClick={() => setChartView('cashOnly')} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid #ccc', background: chartView === 'cashOnly' ? '#1B2A4A' : 'transparent', color: chartView === 'cashOnly' ? 'white' : '#666', cursor: 'pointer', fontWeight: chartView === 'cashOnly' ? '600' : '400' }}>My cash out of pocket</button>
                </div>
                <div style={{ fontSize: '11px', color: '#555', fontStyle: 'italic', textAlign: 'right' }}>
                  {chartView === 'tripValue'
                    ? '📊 Full expense value — including portions covered by points or credits'
                    : '💵 Cash out of pocket only — points and credits excluded'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#888', marginBottom: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#C9A84C', display: 'inline-block' }} />
                Planned
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1B2A4A', display: 'inline-block' }} />
                Actual spend
              </span>
            </div>

            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '14px 16px' }}>
              {allCats.sort((a, b) => (budget[b] || 0) - (budget[a] || 0)).map(cat => {
                const budgetAmt = budget[cat] || 0;
                const actualAmt = displayActual[cat] || 0;
                const budgetPct = maxVal > 0 ? Math.round(budgetAmt / maxVal * 100) : 0;
                const actualPct = maxVal > 0 ? Math.round(actualAmt / maxVal * 100) : 0;
                const over = actualAmt > budgetAmt && budgetAmt > 0;
                const color = COLORS[cat] || '#888';
                const totalActual = Object.values(displayActual).reduce((s,v) => s+v, 0);
                const totalBudget = Object.values(budget).reduce((s,v) => s+v, 0);
                const actualSharePct = totalActual > 0 ? Math.round(actualAmt / totalActual * 100) : 0;
                const budgetSharePct = totalBudget > 0 ? Math.round(budgetAmt / totalBudget * 100) : 0;
                return (
                  <div key={cat} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '500', color: '#333' }}>{cat}</span>
                      <span style={{ color: '#888' }}>
                        {budgetAmt > 0 && <span>Planned: ${Math.round(budgetAmt).toLocaleString()} <span style={{ color: '#aaa' }}>({isComplete ? Math.round(budgetAmt / Object.values(actual).reduce((s,v)=>s+v,0) * 100) : budgetSharePct}% of {isComplete ? 'actual' : 'planned'})</span></span>}
                        {actualAmt > 0 && <span style={{ marginLeft: '8px', color: over ? '#BA7517' : '#1B2A4A', fontWeight: '600' }}>Actual: ${Math.round(actualAmt).toLocaleString()} <span style={{ color: '#aaa', fontWeight: '400' }}>({isComplete ? actualSharePct : Math.round(actualAmt / tripBudget * 100)}% of {isComplete ? 'actual spend' : 'planned'})</span>{over ? ' ⚠' : ''}</span>}
                      </span>
                    </div>
                    {/* Budget bar */}
                    {budgetAmt > 0 && (
                      <div style={{ height: '5px', background: '#e0e0e0', borderRadius: '3px', marginBottom: '3px' }}>
                        <div style={{ height: '5px', borderRadius: '3px', width: budgetPct + '%', background: '#C9A84C', transition: 'width 0.4s' }} />
                      </div>
                    )}
                    {/* Actual bar */}
                    {actualAmt > 0 && (
                      <div style={{ height: '5px', background: '#e0e0e0', borderRadius: '3px' }}>
                        <div style={{ height: '5px', borderRadius: '3px', width: Math.min(100, actualPct) + '%', background: over ? '#BA7517' : '#1B2A4A', transition: 'width 0.4s' }} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                <span>{expenses.length} expenses · {spending.length} daily spend entries</span>
                <span style={{ fontWeight: '600', color: '#1a1a18' }}>Planned: ${Math.round(Object.values(budget).reduce((s,v) => s+v, 0)).toLocaleString()} · Actual: ${Math.round(Object.values(actual).reduce((s,v) => s+v, 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Phase-specific sections */}

      {/* PLAN only — checklist + countdown */}
      {isPlanning && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Pre-trip checklist</div>
            <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>{completedPreTrip} / {preTrip.length}</div>
            <div style={{ height: '5px', background: '#ddd', borderRadius: '3px', marginBottom: '6px' }}>
              <div style={{ height: '5px', borderRadius: '3px', background: taskPct === 100 ? '#1A7A5C' : '#BA7517', width: taskPct + '%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>{taskPct}% complete · {preTrip.length - completedPreTrip} remaining</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Countdown</div>
            {cd ? (
              <div style={{ fontSize: '20px', fontWeight: '700', color: cd.color }}>{cd.text}</div>
            ) : (
              <div style={{ fontSize: '13px', color: '#aaa' }}>Set trip dates to see countdown</div>
            )}
          </div>
        </div>
      )}

      {/* GO only — today/tomorrow itinerary + daily spend */}
      {isActive && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1rem' }}>
            <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Daily spend</div>
              {totalSpent > 0 ? (
                <>
                  <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', color: avgPerDay > dailyBudget ? '#BA7517' : '#1A7A5C' }}>${avgPerDay}/day avg</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>vs ${dailyBudget} budget · ${Math.round(totalSpent).toLocaleString()} total · {spendDays} days tracked</div>
                  {avgPerDay > dailyBudget && (
                    <div style={{ fontSize: '12px', color: '#BA7517', marginTop: '4px', fontWeight: '500' }}>⚠ ${avgPerDay - dailyBudget}/day over budget</div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '13px', color: '#aaa' }}>No spending tracked yet</div>
              )}
            </div>
            <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Trip status</div>
              {cd && <div style={{ fontSize: '18px', fontWeight: '700', color: cd.color }}>{cd.text}</div>}
            </div>
          </div>
          {/* Today / Tomorrow itinerary */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{showLabel}</div>
            {showEvents.length > 0 ? (
              <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '0 1rem' }}>
                {showEvents.slice(0, 6).map((event, idx) => (
                  <div key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: idx < Math.min(showEvents.length, 6) - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {EVENT_ICONS[event.type] || '📌'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18' }}>{event.title}</div>
                      {event.startTime && <div style={{ fontSize: '12px', color: '#888' }}>{event.startTime}{event.endTime ? ' → ' + event.endTime : ''}</div>}
                    </div>
                    {event.status === 'optional' && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#888', fontStyle: 'italic', flexShrink: 0 }}>optional</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '14px 16px', color: '#aaa', fontSize: '13px' }}>
                {events.length === 0 ? 'No itinerary events added yet.' : 'No events scheduled for today or tomorrow.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REMEMBER only — daily spend summary */}
      {isComplete && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Daily spend summary</div>
            {totalSpent > 0 ? (
              <>
                <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>${avgPerDay}/day avg</div>
                <div style={{ fontSize: '12px', color: '#888' }}>${Math.round(totalSpent).toLocaleString()} total · {spendDays} days tracked</div>
              </>
            ) : (
              <div style={{ fontSize: '13px', color: '#aaa' }}>No daily spend recorded</div>
            )}
          </div>
          <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Post-trip checklist</div>
            {(() => {
              const postTrip = tasks.filter(t => t.phase === 'postTrip');
              const completed = postTrip.filter(t => t.status === 'complete').length;
              const pct = postTrip.length > 0 ? Math.round(completed / postTrip.length * 100) : 0;
              return postTrip.length > 0 ? (
                <>
                  <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>{completed} / {postTrip.length}</div>
                  <div style={{ height: '5px', background: '#ddd', borderRadius: '3px', marginBottom: '6px' }}>
                    <div style={{ height: '5px', borderRadius: '3px', background: pct === 100 ? '#1A7A5C' : '#BA7517', width: pct + '%', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{pct}% complete</div>
                </>
              ) : <div style={{ fontSize: '13px', color: '#aaa' }}>No post-trip tasks added</div>;
            })()}
          </div>
        </div>
      )}

      {/* Quick links — all phases */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Quick links</div>
        {[
          {
            category: '✈ Flights',
            links: [
              { label: 'Google Flights', url: 'https://flights.google.com' },
              { label: 'Kayak', url: 'https://kayak.com' },
              { label: 'Delta Airlines', url: 'https://delta.com' },
              { label: 'American Airlines', url: 'https://aa.com' },
              { label: 'United Airlines', url: 'https://united.com' },
              { label: 'Flying Blue', url: 'https://flyingblue.com' },
              { label: 'Seats.aero', url: 'https://seats.aero' },
            ]
          },
          {
            category: '🏨 Hotels & Stays',
            links: [
              { label: 'Google Hotels', url: 'https://google.com/travel/hotels' },
              { label: 'Hotels.com', url: 'https://hotels.com' },
              { label: 'Hilton', url: 'https://hilton.com' },
              { label: 'Marriott', url: 'https://marriott.com' },
              { label: 'Airbnb', url: 'https://airbnb.com' },
              { label: 'VRBO', url: 'https://vrbo.com' },
              { label: 'Expedia', url: 'https://expedia.com' },
              { label: 'Booking.com', url: 'https://booking.com' },
            ]
          },
          {
            category: '🎟 Activities & Discovery',
            links: [
              { label: 'Viator', url: 'https://viator.com' },
              { label: 'TripAdvisor', url: 'https://tripadvisor.com' },
              { label: 'Google Maps', url: 'https://maps.google.com' },
              { label: 'Rome2Rio', url: 'https://rome2rio.com' },
            ]
          },
          {
            category: '⭐ Points & Cards',
            links: [
              { label: 'Capital One', url: 'https://capitalone.com' },
              { label: 'Amex', url: 'https://americanexpress.com' },
              { label: 'Chase', url: 'https://chase.com' },
              { label: 'Citi', url: 'https://citi.com' },
              { label: 'The Points Guy', url: 'https://thepointsguy.com' },
            ]
          },
          {
            category: '🛠 Tools',
            links: [
              { label: 'XE Currency', url: 'https://xe.com' },
            ]
          },
        ].map(group => (
          <div key={group.category} style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#1B2A4A', letterSpacing: '0.05em', marginBottom: '7px' }}>{group.category}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {group.links.map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
                  style={{
                    padding: '6px 12px', background: 'white',
                    border: '1px solid #E8E6E1', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '500', color: '#1B2A4A',
                    textDecoration: 'none', whiteSpace: 'nowrap'
                  }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default DashboardTab;
