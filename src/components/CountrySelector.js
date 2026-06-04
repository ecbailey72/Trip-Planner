import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES } from '../constants';

export default function CountrySelector({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef(null);

  const filtered = query.length < 1
    ? COUNTRIES
    : COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync query when value changes externally
  useEffect(() => { setQuery(value || ''); }, [value]);

  const select = (country) => {
    setQuery(country.name);
    setOpen(false);
    onChange(country);
  };

  const handleKey = (e) => {
    if (!open) { setOpen(true); return; }
    if (e.key === 'ArrowDown') { setHighlighted(h => Math.min(h + 1, filtered.length - 1)); e.preventDefault(); }
    if (e.key === 'ArrowUp') { setHighlighted(h => Math.max(h - 1, 0)); e.preventDefault(); }
    if (e.key === 'Enter' && filtered[highlighted]) { select(filtered[highlighted]); e.preventDefault(); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder="Search country..."
        style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1a1a1a', background: 'white' }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          background: 'white', border: '1px solid #ccc', borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: '220px', overflowY: 'auto', marginTop: '2px'
        }}>
          {filtered.map((country, i) => (
            <div key={country.code}
              onMouseDown={() => select(country)}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                background: i === highlighted ? '#EEF1F8' : 'white', color: '#1a1a1a',
                borderBottom: '1px solid #f5f5f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
              <span>{country.name}</span>
              <span style={{ fontSize: '11px', color: '#8A9AB5' }}>{country.currencyCode}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
