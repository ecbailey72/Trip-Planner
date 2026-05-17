import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.NODE_ENV === 'development' ? 'http://localhost:5001/api' : '/api';

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    signupReason: '', travelFrequency: 'varies', typicalBudget: 'varies', heardAbout: ''
  });

  const handleLogin = async () => {
    setError('');
    if (!loginForm.email || !loginForm.password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, loginForm);
      localStorage.setItem('ventaro_token', res.data.token);
      localStorage.setItem('ventaro_user', JSON.stringify(res.data.user));
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!registerForm.name || !registerForm.email || !registerForm.password) return setError('Name, email and password are required.');
    if (registerForm.password.length < 8) return setError('Password must be at least 8 characters.');
    if (registerForm.password !== registerForm.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, registerForm);
      localStorage.setItem('ventaro_token', res.data.token);
      localStorage.setItem('ventaro_user', JSON.stringify(res.data.user));
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1B2A4A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {/* Logo */}
      <div style={{ marginBottom: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '10px' }}>VENTARO</div>
        <div style={{ fontSize: '12px', color: '#C9A84C', letterSpacing: '4px', marginTop: '6px', fontWeight: '600' }}>— Plan. Go. Remember. —</div>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Toggle */}
        <div style={{ display: 'flex', background: '#F8F7F4', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#1B2A4A' : '#8A9AB5',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#FCEBEB', border: '1px solid #FFCCCC', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#A32D2D' }}>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="you@example.com" autoFocus
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Password</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
            </div>
            <button onClick={handleLogin} disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </div>
        ) : (
          <div>
            {/* Required fields */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Full name *</label>
              <input value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Erik Bailey" autoFocus
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Email *</label>
              <input type="email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Password * <span style={{ fontWeight: '400', color: '#aaa' }}>(min 8 characters)</span></label>
              <input type="password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Confirm password *</label>
              <input type="password" value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
            </div>

            {/* Optional fields */}
            <div style={{ borderTop: '1px solid #E8E6E1', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#8A9AB5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Tell us about yourself <span style={{ fontWeight: '400' }}>(optional)</span></div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Why do you want to use Ventaro?</label>
                <input value={registerForm.signupReason} onChange={e => setRegisterForm({ ...registerForm, signupReason: e.target.value })}
                  placeholder="e.g. Planning a trip to Japan..."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Travel frequency</label>
                  <select value={registerForm.travelFrequency} onChange={e => setRegisterForm({ ...registerForm, travelFrequency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }}>
                    <option value="varies">Varies</option>
                    <option value="1-2 trips/year">1-2 trips/year</option>
                    <option value="3-5 trips/year">3-5 trips/year</option>
                    <option value="6+ trips/year">6+ trips/year</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Typical budget</label>
                  <select value={registerForm.typicalBudget} onChange={e => setRegisterForm({ ...registerForm, typicalBudget: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }}>
                    <option value="varies">Varies</option>
                    <option value="under $2k">Under $2k</option>
                    <option value="$2k-$5k">$2k - $5k</option>
                    <option value="$5k-$10k">$5k - $10k</option>
                    <option value="$10k+">$10k+</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>How did you hear about Ventaro?</label>
                <input value={registerForm.heardAbout} onChange={e => setRegisterForm({ ...registerForm, heardAbout: e.target.value })}
                  placeholder="e.g. Friend, social media..."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
              </div>
            </div>

            <button onClick={handleRegister} disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#C9A84C', color: '#111C33', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        © 2026 Ventaro · Plan. Go. Remember.
      </div>
    </div>
  );
}

export default LoginPage;
