import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const res = await axios.post(`${API}/auth/login`, { email, password });
      console.log('Login response:', res.data);
      localStorage.setItem('ventaro_token', res.data.token);
      localStorage.setItem('ventaro_user', JSON.stringify(res.data.user));
      console.log('Token stored, navigating to /trips');
      navigate('/trips');
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1B2A4A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '10px' }}>VENTARO</div>
        <div style={{ fontSize: '12px', color: '#C9A84C', letterSpacing: '4px', marginTop: '6px' }}>— Plan. Go. Remember. —</div>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1B2A4A', marginBottom: '1.5rem' }}>Sign in to Ventaro</h2>
        {error && <div style={{ background: '#FCEBEB', border: '1px solid #FFCCCC', borderRadius: '8px', padding: '10px', marginBottom: '1rem', fontSize: '13px', color: '#A32D2D' }}>{error}</div>}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" autoFocus
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' }} />
        </div>
        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '13px', color: '#8A9AB5' }}>
          No account? <span style={{ color: '#1B2A4A', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/login?register=true')}>Create one</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
