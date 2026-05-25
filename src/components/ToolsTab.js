import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BENCHMARK_DEFAULT = 1.5;
const API = process.env.REACT_APP_API_URL || '/api';

const TRANSFER_PARTNERS = {
  'American Express': [
    { airline: 'ANA', program: 'ANA Mileage Club', ratio: '1:1', time: '48 hours' },
    { airline: 'Air Canada', program: 'Aeroplan', ratio: '1:1', time: 'Instant' },
    { airline: 'Avianca', program: 'LifeMiles', ratio: '1:1', time: '<1 hour' },
    { airline: 'Singapore Airlines', program: 'KrisFlyer', ratio: '1:1', time: '<24 hours' },
    { airline: 'Air France/KLM', program: 'Flying Blue', ratio: '1:1', time: 'Instant' },
    { airline: 'Delta', program: 'SkyMiles', ratio: '1:1', time: 'Instant' },
    { airline: 'Virgin Atlantic', program: 'Flying Club', ratio: '1:1', time: 'Instant' },
    { airline: 'British Airways', program: 'Executive Club', ratio: '1:1', time: 'Instant' },
    { airline: 'Cathay Pacific', program: 'Asia Miles', ratio: '1:1', time: '48 hours' },
    { airline: 'Iberia', program: 'Iberia Plus', ratio: '1:1', time: '48 hours' },
    { airline: 'Qantas', program: 'Qantas FF', ratio: '1:1', time: 'Instant' },
    { airline: 'Aer Lingus', program: 'AerClub', ratio: '1:1', time: 'Instant' },
    { airline: 'Emirates', program: 'Skywards', ratio: '1:1', time: 'Instant' },
    { airline: 'Etihad', program: 'Etihad Guest', ratio: '1:1', time: 'Instant' },
    { airline: 'Aeromexico', program: 'Club Premier', ratio: '1:1.6', time: '24 hours' },
  ],
  'Capital One': [
    { airline: 'Air Canada', program: 'Aeroplan', ratio: '1:1', time: 'Instant' },
    { airline: 'Avianca', program: 'LifeMiles', ratio: '1:1', time: 'Instant' },
    { airline: 'EVA Air', program: 'Infinity MileageLands', ratio: '2:1.5', time: '36 hours' },
    { airline: 'Singapore Airlines', program: 'KrisFlyer', ratio: '1:1', time: 'Instant' },
    { airline: 'TAP Air Portugal', program: 'Miles&Go', ratio: '1:1', time: 'Instant' },
    { airline: 'Turkish Airlines', program: 'Miles&Smiles', ratio: '1:1', time: 'Instant' },
    { airline: 'Air France/KLM', program: 'Flying Blue', ratio: '1:1', time: 'Instant' },
    { airline: 'Virgin Atlantic', program: 'Flying Club', ratio: '1:1', time: 'Instant' },
    { airline: 'British Airways', program: 'Executive Club', ratio: '1:1', time: 'Instant' },
    { airline: 'Cathay Pacific', program: 'Asia Miles', ratio: '1:1', time: '24 hours' },
    { airline: 'Finnair', program: 'Finnair Plus', ratio: '1:1', time: 'Instant' },
    { airline: 'Qantas', program: 'Qantas FF', ratio: '1:1', time: 'Instant' },
    { airline: 'Emirates', program: 'Skywards', ratio: '1:1', time: 'Instant' },
    { airline: 'Etihad', program: 'Etihad Guest', ratio: '1:1', time: 'Instant' },
    { airline: 'Aeromexico', program: 'Club Premier', ratio: '1:1', time: 'Instant' },
  ],
  'Chase': [
    { airline: 'ANA', program: 'ANA Mileage Club', ratio: '1:1', time: 'Up to 24 hours' },
    { airline: 'Singapore Airlines', program: 'KrisFlyer', ratio: '1:1', time: '2 days' },
    { airline: 'United Airlines', program: 'MileagePlus', ratio: '1:1', time: 'Instant' },
    { airline: 'Air France/KLM', program: 'Flying Blue', ratio: '1:1', time: 'Instant' },
    { airline: 'Virgin Atlantic', program: 'Flying Club', ratio: '1:1', time: 'Instant' },
    { airline: 'British Airways', program: 'Executive Club', ratio: '1:1', time: 'Instant' },
    { airline: 'Iberia', program: 'Iberia Plus', ratio: '1:1', time: 'Instant' },
    { airline: 'Qantas', program: 'Qantas FF', ratio: '1:1', time: 'Instant' },
    { airline: 'Aer Lingus', program: 'AerClub', ratio: '1:1', time: 'Instant' },
    { airline: 'Emirates', program: 'Skywards', ratio: '1:1', time: 'Instant' },
    { airline: 'Southwest', program: 'Rapid Rewards', ratio: '1:1', time: 'Instant' },
    { airline: 'JetBlue', program: 'TrueBlue', ratio: '1:1', time: 'Instant' },
  ],
  'Citi': [
    { airline: 'Avianca', program: 'LifeMiles', ratio: '1:1', time: 'Instant' },
    { airline: 'Singapore Airlines', program: 'KrisFlyer', ratio: '1:1', time: '<24 hours' },
    { airline: 'Thai Airways', program: 'Royal Orchid Plus', ratio: '1:1', time: 'Instant' },
    { airline: 'Turkish Airlines', program: 'Miles&Smiles', ratio: '1:1', time: 'Instant' },
    { airline: 'Air France/KLM', program: 'Flying Blue', ratio: '1:1', time: 'Instant' },
    { airline: 'Virgin Atlantic', program: 'Flying Club', ratio: '1:1', time: 'Instant' },
    { airline: 'Cathay Pacific', program: 'Asia Miles', ratio: '1:1', time: 'Instant' },
    { airline: 'Malaysia Airlines', program: 'Enrich', ratio: '1:1', time: '2 days' },
    { airline: 'Qantas', program: 'Qantas FF', ratio: '1:1', time: 'Instant' },
    { airline: 'Qatar Airways', program: 'Privilege Club', ratio: '1:1', time: '2 days' },
    { airline: 'Emirates', program: 'Skywards', ratio: '1:1', time: 'Instant' },
    { airline: 'Etihad', program: 'Etihad Guest', ratio: '1:1', time: 'Instant' },
    { airline: 'Aeromexico', program: 'Club Premier', ratio: '1:1', time: 'Instant' },
    { airline: 'JetBlue', program: 'TrueBlue', ratio: '1:1', time: 'Instant' },
  ],
};

const emptyPayment = () => ({ label: '', points: '', fees: 0 });
const emptyOption = (mode, idx) => ({
  id: Date.now() + idx,
  description: '',
  cashPrice: '',
  nights: 1,
  payments: [emptyPayment()],
});

function CPPAnalyzer({ benchmark = BENCHMARK_DEFAULT, tripId, initialData, savedId, onSaved, onClose, savedAnalyses, onLoadAnalysis, onDeleteAnalysis }) {
  const [mode, setMode] = useState(initialData?.mode || 'flight');
  const [saveName, setSaveName] = useState(initialData?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [options, setOptions] = useState(initialData?.options?.map((o, i) => ({ ...o, id: Date.now() + i, payments: o.payments || [emptyPayment()] })) || [emptyOption('flight', 0), emptyOption('flight', 1)]);
  const [showAlliances, setShowAlliances] = useState(false);
  const [selectedCard, setSelectedCard] = useState('American Express');

  const handleSave = async () => {
    if (!saveName.trim()) return setSaveMsg('Please enter a name for this analysis');
    setSaving(true);
    try {
      const payload = { name: saveName, mode, options: options.map(({ id, ...rest }) => rest), benchmark };
      let saved;
      if (savedId) {
        saved = await axios.put(`${API}/trips/${tripId}/cpp/${savedId}`, payload);
      } else {
        saved = await axios.post(`${API}/trips/${tripId}/cpp`, payload);
      }
      setSaveMsg('✓ Analysis saved!');
      if (onSaved) onSaved(saved.data);
    } catch (err) {
      setSaveMsg('✗ Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const calcCPP = (cashPrice, nights, points, fees) => {
    const cash = (parseFloat(cashPrice) || 0) * (mode === 'hotel' ? parseInt(nights) || 1 : 1);
    const pts = parseFloat(points) || 0;
    const f = parseFloat(fees) || 0;
    if (!cash || !pts) return null;
    return ((cash - f) / pts * 100);
  };

  const getBadge = (cpp) => {
    if (!cpp) return null;
    if (cpp >= benchmark * 1.5) return { label: '🔥 Excellent', color: '#1A7A5C', bg: '#E1F5EE' };
    if (cpp >= benchmark) return { label: '✓ Above benchmark', color: '#185FA5', bg: '#E6F1FB' };
    if (cpp >= benchmark * 0.75) return { label: '~ Near benchmark', color: '#BA7517', bg: '#FDF3E3' };
    return { label: '✗ Below benchmark', color: '#A32D2D', bg: '#FCEBEB' };
  };

  const addOption = () => setOptions([...options, emptyOption(mode, options.length)]);
  const removeOption = (id) => setOptions(options.filter(o => o.id !== id));
  const updateOption = (id, field, value) => setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  const addPayment = (id) => setOptions(options.map(o => o.id === id ? { ...o, payments: [...o.payments, emptyPayment()] } : o));
  const removePayment = (id, pidx) => setOptions(options.map(o => o.id === id ? { ...o, payments: o.payments.filter((_, i) => i !== pidx) } : o));
  const updatePayment = (id, pidx, field, value) => setOptions(options.map(o => o.id === id ? { ...o, payments: o.payments.map((p, i) => i === pidx ? { ...p, [field]: value } : p) } : o));

  // Find best overall combo
  const allResults = [];
  options.forEach(opt => {
    opt.payments.forEach((pmt, pidx) => {
      const cpp = calcCPP(opt.cashPrice, opt.nights, pmt.points, pmt.fees);
      if (cpp) allResults.push({ optDesc: opt.description || `Option ${options.indexOf(opt) + 1}`, pmtLabel: pmt.label || `Payment ${pidx + 1}`, cpp, cashPrice: opt.cashPrice, nights: opt.nights, points: pmt.points, fees: pmt.fees });
    });
  });
  allResults.sort((a, b) => b.cpp - a.cpp);
  const best = allResults[0];

  return (
    <div>
      {/* Saved analyses — shown at top of CPP tool */}
      {savedAnalyses && savedAnalyses.length > 0 && !initialData && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#8A9AB5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Saved analyses
          </div>
          {savedAnalyses.map(analysis => (
            <div key={analysis._id} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '10px', padding: '10px 14px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1B2A4A' }}>
                  {analysis.mode === 'flight' ? '✈' : '🏨'} {analysis.name}
                </div>
                <div style={{ fontSize: '11px', color: '#8A9AB5', marginTop: '2px' }}>
                  {analysis.options?.length} option{analysis.options?.length !== 1 ? 's' : ''} · saved {new Date(analysis.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => onLoadAnalysis && onLoadAnalysis(analysis)}
                  style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #E8E6E1', borderRadius: '6px', background: 'transparent', color: '#1B2A4A', cursor: 'pointer' }}>
                  Load
                </button>
                <button onClick={() => onDeleteAnalysis && onDeleteAnalysis(analysis._id)}
                  style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '12px', color: '#8A9AB5', marginBottom: '12px' }}>— or start a new analysis below —</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: '13px', color: '#8A9AB5', marginBottom: '1.25rem' }}>
        Add multiple {mode === 'flight' ? 'flight' : 'hotel'} options, then add payment methods for each.
        Your benchmark is <strong style={{ color: '#1B2A4A' }}>{benchmark} cpp</strong>.
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', background: '#F8F7F4', borderRadius: '10px', padding: '4px', marginBottom: '1.25rem', width: 'fit-content' }}>
        {['flight', 'hotel'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '7px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#1B2A4A' : '#8A9AB5',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
            {m === 'flight' ? '✈ Flights' : '🏨 Hotels'}
          </button>
        ))}
      </div>

      {/* Best result banner */}
      {best && (
        <div style={{ background: '#1B2A4A', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#C9A84C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>🏆 Best overall</div>
            <div style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>{best.optDesc} — {best.pmtLabel}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              {parseInt(best.points).toLocaleString()} pts{parseFloat(best.fees) > 0 ? ` + $${best.fees} fees` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#C9A84C' }}>{best.cpp.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>cpp</div>
          </div>
        </div>
      )}

      {/* Options */}
      {options.map((opt, oidx) => {
        const totalCash = (parseFloat(opt.cashPrice) || 0) * (mode === 'hotel' ? parseInt(opt.nights) || 1 : 1);
        return (
          <div key={opt.id} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>

            {/* Option header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1B2A4A' }}>
                {mode === 'flight' ? '✈' : '🏨'} Option {oidx + 1}
              </div>
              {options.length > 1 && (
                <button onClick={() => removeOption(opt.id)}
                  style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ffcccc', borderRadius: '4px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>
                  Remove
                </button>
              )}
            </div>

            {/* Option details */}
            <div style={{ display: 'grid', gridTemplateColumns: mode === 'hotel' ? '2fr 1fr 1fr' : '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>
                  {mode === 'flight' ? 'Flight (airline, route, stops)' : 'Hotel name'}
                </label>
                <input value={opt.description} onChange={e => updateOption(opt.id, 'description', e.target.value)}
                  placeholder={mode === 'flight' ? 'e.g. Delta ATL→NRT nonstop' : 'e.g. Hyatt Regency Tokyo'}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
              </div>
              {mode === 'hotel' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>Nights</label>
                  <input type="number" value={opt.nights} onChange={e => updateOption(opt.id, 'nights', e.target.value)} min="1"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4A5568', marginBottom: '3px' }}>
                  {mode === 'hotel' ? 'Cash price/night ($)' : 'Total cash price ($)'}
                </label>
                <input type="number" value={opt.cashPrice} onChange={e => updateOption(opt.id, 'cashPrice', e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
              </div>
            </div>
            {mode === 'hotel' && opt.cashPrice && opt.nights > 1 && (
              <div style={{ fontSize: '12px', color: '#8A9AB5', marginBottom: '10px' }}>
                Total: <strong>${totalCash.toLocaleString()}</strong> for {opt.nights} nights
              </div>
            )}

            {/* Payment options */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#8A9AB5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Payment options
              </div>
              {/* Cash baseline */}
              {opt.cashPrice > 0 && (
                <div style={{ background: '#F8F7F4', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>💵 Pay cash</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1B2A4A' }}>${(parseFloat(opt.cashPrice) * (mode === 'hotel' ? parseInt(opt.nights) || 1 : 1)).toLocaleString()}</span>
                </div>
              )}
              {opt.payments.map((pmt, pidx) => {
                const cpp = calcCPP(opt.cashPrice, opt.nights, pmt.points, pmt.fees);
                const badge = getBadge(cpp);
                const isBest = best && best.optDesc === (opt.description || `Option ${oidx + 1}`) && best.pmtLabel === (pmt.label || `Payment ${pidx + 1}`);
                return (
                  <div key={pidx} style={{ background: isBest ? '#FDF8EC' : '#F8F7F4', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', border: isBest ? '1px solid #C9A84C' : '1px solid transparent' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: badge ? '6px' : '0' }}>
                      <input value={pmt.label} onChange={e => updatePayment(opt.id, pidx, 'label', e.target.value)}
                        placeholder="e.g. Delta SkyMiles, Cap One portal..."
                        style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                      <input type="number" value={pmt.points} onChange={e => updatePayment(opt.id, pidx, 'points', e.target.value)}
                        placeholder="Points"
                        style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#8A9AB5' }}>+$</span>
                        <input type="number" value={pmt.fees} onChange={e => updatePayment(opt.id, pidx, 'fees', e.target.value)}
                          placeholder="Fees"
                          style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E8E6E1', outline: 'none' }} />
                      </div>
                      {opt.payments.length > 1 && (
                        <button onClick={() => removePayment(opt.id, pidx)}
                          style={{ padding: '3px 6px', border: '1px solid #ffcccc', borderRadius: '4px', background: 'transparent', color: '#cc4444', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                      )}
                    </div>
                    {badge && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: badge.bg, color: badge.color, padding: '2px 10px', borderRadius: '20px', fontWeight: '600', fontSize: '11px' }}>
                          {cpp.toFixed(2)} cpp — {badge.label}
                        </span>
                        {isBest && <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: '700' }}>🏆 Best overall</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={() => addPayment(opt.id)}
                style={{ fontSize: '12px', padding: '5px 12px', border: '1px dashed #ccc', borderRadius: '6px', background: 'transparent', color: '#888', cursor: 'pointer', width: '100%', marginTop: '4px' }}>
                + Add payment option
              </button>
            </div>
          </div>
        );
      })}

      {/* Add option button */}
      <button onClick={addOption}
        style={{ width: '100%', padding: '10px', border: '1px dashed #C9A84C', borderRadius: '10px', background: 'transparent', color: '#C9A84C', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '1.5rem' }}>
        + Add another {mode === 'flight' ? 'flight' : 'hotel'} option
      </button>

      {/* Save analysis */}
      <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#8A9AB5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Save this analysis</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="e.g. Japan flights — May 2026"
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {saving ? 'Saving...' : savedId ? 'Update' : 'Save'}
          </button>
          {onClose && (
            <button onClick={onClose}
              style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #E8E6E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#888' }}>
              Cancel
            </button>
          )}
        </div>
        {saveMsg && <div style={{ fontSize: '12px', marginTop: '8px', color: saveMsg.startsWith('✓') ? '#1A7A5C' : '#A32D2D' }}>{saveMsg}</div>}
      </div>

      {/* Alliance reference */}
      <div style={{ border: '1px solid #E8E6E1', borderRadius: '12px', overflow: 'hidden' }}>
        <button onClick={() => setShowAlliances(!showAlliances)}
          style={{ width: '100%', padding: '12px 1.25rem', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#8A9AB5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🗺 Transfer partner reference
          </span>
          <span style={{ color: '#8A9AB5' }}>{showAlliances ? '▲' : '▼'}</span>
        </button>
        {showAlliances && (
          <div style={{ padding: '0 1.25rem 1rem', background: 'white' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {Object.keys(TRANSFER_PARTNERS).map(card => (
                <button key={card} onClick={() => setSelectedCard(card)}
                  style={{ padding: '5px 14px', border: '1px solid', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                    background: selectedCard === card ? '#1B2A4A' : 'transparent',
                    color: selectedCard === card ? 'white' : '#1B2A4A',
                    borderColor: '#1B2A4A' }}>
                  {card}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {TRANSFER_PARTNERS[selectedCard].map((p, idx) => (
                <div key={idx} style={{ background: '#F8F7F4', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1B2A4A' }}>{p.airline}</div>
                  <div style={{ fontSize: '11px', color: '#8A9AB5' }}>{p.program}</div>
                  <div style={{ fontSize: '11px', color: '#1B2A4A', marginTop: '3px' }}>
                    <span style={{ background: '#EEF1F8', padding: '1px 6px', borderRadius: '4px', marginRight: '6px' }}>{p.ratio}</span>
                    {p.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolsTab({ trip, tripId }) {
  const [activeTool, setActiveTool] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [editingAnalysis, setEditingAnalysis] = useState(null);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/cpp`);
      setSavedAnalyses(res.data);
    } catch (err) { console.error('Error fetching analyses:', err); }
  }, [tripId]);

  useEffect(() => { if (tripId) fetchAnalyses(); }, [fetchAnalyses, tripId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    await axios.delete(`${API}/trips/${tripId}/cpp/${id}`);
    fetchAnalyses();
  };
  const phase = trip?.status || 'planning';
  const isComplete = phase === 'complete';
  const benchmark = trip?.cppBenchmark || BENCHMARK_DEFAULT;

  const tools = [
    {
      id: 'cpp',
      icon: '🔢',
      title: 'CPP Analyzer',
      description: 'Compare multiple flight or hotel options, each with different payment methods. Find the best cents-per-point value across all combinations.',
      phases: ['planning', 'active'],
      component: editingAnalysis
        ? <CPPAnalyzer benchmark={benchmark} tripId={tripId} initialData={editingAnalysis} savedId={editingAnalysis._id}
            onSaved={() => { fetchAnalyses(); setEditingAnalysis(null); }}
            onClose={() => setEditingAnalysis(null)} />
        : <CPPAnalyzer benchmark={benchmark} tripId={tripId}
            savedAnalyses={savedAnalyses}
            onLoadAnalysis={(analysis) => setEditingAnalysis(analysis)}
            onDeleteAnalysis={async (id) => { await handleDelete(id); fetchAnalyses(); }}
            onSaved={() => fetchAnalyses()} />,
    },
    {
      id: 'packing',
      icon: '👗',
      title: 'Packing Planner',
      description: 'Build your capsule wardrobe and packing list based on your itinerary events.',
      phases: ['planning', 'active'],
      component: <div style={{ padding: '2rem', textAlign: 'center', color: '#8A9AB5', fontSize: '14px' }}>Coming soon — Packing Planner is in development.</div>,
    },
  ].filter(t => t.phases.includes(phase));

  if (isComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#8A9AB5' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem' }}>🔧</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1B2A4A', marginBottom: '8px' }}>Planning tools</div>
        <div style={{ fontSize: '14px' }}>Planning tools are available during the Plan and Go phases.</div>
      </div>
    );
  }

  return (
    <div>
      {activeTool ? (
        <div>
          <button onClick={() => setActiveTool(null)}
            style={{ background: 'transparent', border: 'none', color: '#8A9AB5', cursor: 'pointer', fontSize: '13px', marginBottom: '1rem', padding: 0 }}>
            ← Back to tools
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1B2A4A', marginBottom: '1.25rem' }}>
            {tools.find(t => t.id === activeTool)?.icon} {tools.find(t => t.id === activeTool)?.title}
          </h2>
          {tools.find(t => t.id === activeTool)?.component}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '13px', color: '#8A9AB5', marginBottom: '1.5rem' }}>
            Planning tools to help you make smarter decisions for this trip.
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {tools.map(tool => (
              <div key={tool.id} onClick={() => setActiveTool(tool.id)}
                style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: '14px', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{tool.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1B2A4A', marginBottom: '6px' }}>{tool.title}</div>
                <div style={{ fontSize: '13px', color: '#8A9AB5', lineHeight: 1.5, marginBottom: '1rem' }}>{tool.description}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#C9A84C' }}>Open tool →</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ToolsTab;
