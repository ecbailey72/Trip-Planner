import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(27,42,74,0.90)', backdropFilter: 'blur(12px)',
        padding: '0 2rem', height: '76px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <img src="/logo-horizontal.png" alt="Ventaro" style={{ height: '88px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '7px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            Sign in
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background: '#C9A84C', border: 'none', color: '#111C33', padding: '7px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
            Get started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', height: '100vh', minHeight: '600px',
        backgroundImage: 'url(/hero.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: '76px'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(17,28,51,0.45) 0%, rgba(17,28,51,0.65) 100%)'
        }} />

        {/* Top content — branding */}
        <div style={{
          position: 'relative', textAlign: 'center',
          padding: '0 2rem', maxWidth: '700px',
          flex: '0 0 auto', marginBottom: 'auto', paddingTop: '3vh'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', letterSpacing: '14px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>VENTARO</div>
            <div style={{ fontSize: '16px', color: '#E2C47A', letterSpacing: '6px', marginTop: '10px', fontWeight: '700', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>— Plan. Go. Remember. —</div>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800',
            color: 'white', marginBottom: '1rem', lineHeight: 1.2,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)'
          }}>
            Travel smarter.<br />Remember everything.
          </h1>
          <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)', color: '#C9A84C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem', lineHeight: 1.6 }}>The only trip planner built<br />specifically for points travelers</div>

        </div>

        {/* Bottom content — button anchored to lower portion */}
        <div style={{
          position: 'relative', textAlign: 'center',
          flex: '0 0 auto', marginTop: 'auto', paddingBottom: '3vh'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#C9A84C', color: '#111C33', border: 'none',
              padding: '14px 40px', borderRadius: '10px',
              fontSize: '16px', fontWeight: '800', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
              letterSpacing: '0.03em'
            }}>
            Start planning →
          </button>
          <div style={{
            marginTop: '2rem', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
          }}>
            <span>Scroll to explore</span>
            <span style={{ fontSize: '18px' }}>↓</span>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A84C', marginBottom: '12px' }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: '800', color: '#1B2A4A', marginBottom: '12px' }}>
              Built for the points-savvy traveler
            </h2>
            <p style={{ fontSize: '16px', color: '#4A5568', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Most trip planners ignore your points. Ventaro doesn't. From CPP analysis to committed spend tracking — your points are treated as currency, not an afterthought.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { icon: '⭐', title: 'Points optimizer', desc: 'Track balances, anticipated earnings, and cpp per redemption. Know exactly how much your points are worth — and commit them to expenses automatically.', featured: true },
              { icon: '✈', title: 'Smart itinerary', desc: 'Day-by-day planning with event types, contact links, confirmation numbers, and live timeline view during your trip.' },
              { icon: '💰', title: 'Budget intelligence', desc: 'Track confirmed expenses, planned estimates, cash flow, and how much you need to have set aside — all in real time.' },
              { icon: '📊', title: 'Daily spend tracker', desc: 'Log every coffee, dinner, and souvenir by category. See daily totals, over/under budget, and category breakdowns.' },
              { icon: '✓', title: 'Pre-trip checklist', desc: 'Three-phase task management — before, during, and after your trip. Relative due dates, overdue warnings, progress tracking.' },
              { icon: '📓', title: 'Travel journal', desc: 'Capture memories, tips, local phrases, and reviews in the moment. Tag and filter by type to find exactly what you wrote.' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '1.75rem', borderRadius: '14px',
                border: f.featured ? '2px solid #C9A84C' : '1px solid #E8E6E1',
                background: f.featured ? '#1B2A4A' : '#FAFAF8',
                gridColumn: f.featured ? 'span 2' : 'span 1',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontSize: f.featured ? '20px' : '16px', fontWeight: '700', color: f.featured ? '#C9A84C' : '#1B2A4A', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '14px', color: f.featured ? 'rgba(255,255,255,0.85)' : '#4A5568', lineHeight: 1.65 }}>{f.desc}</div>
                {f.featured && <div style={{ marginTop: '12px', fontSize: '12px', color: '#C9A84C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✦ Ventaro's signature feature</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── POINTS CALLOUT ── */}
      <div style={{ background: '#1B2A4A', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A84C', marginBottom: '16px' }}>
            Points aren't a bonus — they're currency
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: 1.3 }}>
            Most trip planners ignore your points.<br />Ventaro doesn't.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto 2rem' }}>
            Ventaro tracks your points balances, analyzes redemption value with the CPP Analyzer, and automatically commits points to expenses — so your available balance is always accurate. Whether you're booking through a portal or transferring to an airline partner, Ventaro helps you get the most out of every point.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', maxWidth: '640px', margin: '0 auto' }}>
            {[
              { stat: 'CPP Analyzer', desc: 'Compare redemption options side by side' },
              { stat: 'Auto-tracking', desc: 'Points committed when you add expenses' },
              { stat: 'Multi-program', desc: 'Track Amex, Chase, Capital One & more' },
            ].map(s => (
              <div key={s.stat} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(201,168,76,0.3)' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#C9A84C', marginBottom: '6px' }}>{s.stat}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: '#F8F7F4', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A84C', marginBottom: '12px' }}>
            Simple by design
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '800', color: '#1B2A4A', marginBottom: '3rem' }}>
            Plan. Go. Remember.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {[
              { step: '01', title: 'Plan', desc: 'Build your itinerary, set your budget, track your points. Know exactly what the trip will cost before you leave.' },
              { step: '02', title: 'Go', desc: 'Live timeline keeps you on track. Log daily spend as you go. Everything you need, right in your pocket.' },
              { step: '03', title: 'Remember', desc: 'Journal entries, trip review, category analysis. Learn from each trip to plan the next one even better.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%',
                  background: '#1B2A4A', color: '#C9A84C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '800', margin: '0 auto 16px',
                  letterSpacing: '0.05em'
                }}>{s.step}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1B2A4A', marginBottom: '8px' }}>{s.title}</div>
                <div style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: '#1B2A4A', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '6px', textTransform: 'uppercase' }}>VENTARO</div>
          <div style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '4px', marginTop: '4px' }}>— Plan. Go. Remember. —</div>
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
          Ready to travel smarter?
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          Join the adventure. Your next trip is waiting.
        </p>
        <button onClick={() => navigate('/login')}
          style={{
            background: '#C9A84C', color: '#111C33', border: 'none',
            padding: '14px 40px', borderRadius: '10px',
            fontSize: '16px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.3)'
          }}>
          Get started free →
        </button>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: '#111C33', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          © 2026 Ventaro · Plan. Go. Remember.
        </p>
      </div>

    </div>
  );
}

export default LandingPage;
