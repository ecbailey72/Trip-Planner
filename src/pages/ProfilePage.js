import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser, logout } from '../utils/auth';

const API = process.env.REACT_APP_API_URL || '/api';

function ProfilePage() {
  const navigate = useNavigate();
  const user = getUser();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [emailForm, setEmailForm] = useState({ email: user?.email || '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [nameMsg, setNameMsg] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const updateName = async () => {
    try {
      const res = await axios.put(`${API}/auth/profile`, { name: nameForm.name });
      const updatedUser = { ...user, name: res.data.name };
      localStorage.setItem('ventaro_user', JSON.stringify(updatedUser));
      setNameMsg('✓ Name updated successfully');
    } catch (err) {
      setNameMsg(`✗ ${err.response?.data?.error || 'Failed to update name'}`);
    }
  };

  const updateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.email)) return setEmailMsg('✗ Please enter a valid email address');
    if (!emailForm.password) return setEmailMsg('✗ Please enter your password to confirm');
    try {
      const res = await axios.put(`${API}/auth/profile`, { email: emailForm.email, currentPassword: emailForm.password });
      const updatedUser = { ...user, email: res.data.email };
      localStorage.setItem('ventaro_user', JSON.stringify(updatedUser));
      setEmailMsg('✓ Email updated successfully');
      setEmailForm({ ...emailForm, password: '' });
    } catch (err) {
      setEmailMsg(`✗ ${err.response?.data?.error || 'Failed to update email'}`);
    }
  };

  const updatePassword = async () => {
    if (passwordForm.newPassword.length < 8) return setPasswordMsg('✗ Password must be at least 8 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setPasswordMsg('✗ Passwords do not match');
    try {
      await axios.put(`${API}/auth/profile`, { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordMsg('✓ Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg(`✗ ${err.response?.data?.error || 'Failed to update password'}`);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #E8E6E1', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '5px' };
  const sectionStyle = { background: 'white', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1rem' };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4' }}>
      {/* Nav */}
      <nav style={{ background: '#1B2A4A', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="/logo-horizontal.png" alt="Ventaro"
          onClick={() => navigate('/')}
          style={{ height: '52px', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
        <button onClick={() => navigate('/trips')}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          ← My Trips
        </button>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2A4A', marginBottom: '0.5rem' }}>Account settings</h1>
        <p style={{ fontSize: '14px', color: '#8A9AB5', marginBottom: '2rem' }}>Update your name, email, or password.</p>

        {/* Name */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1B2A4A', marginBottom: '1rem' }}>Display name</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Name</label>
            <input value={nameForm.name} onChange={e => setNameForm({ name: e.target.value })} style={inputStyle} />
          </div>
          {nameMsg && <div style={{ fontSize: '13px', color: nameMsg.startsWith('✓') ? '#1A7A5C' : '#A32D2D', marginBottom: '10px' }}>{nameMsg}</div>}
          <button onClick={updateName}
            style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Update name
          </button>
        </div>

        {/* Email */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1B2A4A', marginBottom: '1rem' }}>Email address</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>New email</label>
            <input type="email" value={emailForm.email} onChange={e => setEmailForm({ ...emailForm, email: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Confirm with your password</label>
            <input type="password" value={emailForm.password} onChange={e => setEmailForm({ ...emailForm, password: e.target.value })}
              placeholder="••••••••" style={inputStyle} />
          </div>
          {emailMsg && <div style={{ fontSize: '13px', color: emailMsg.startsWith('✓') ? '#1A7A5C' : '#A32D2D', marginBottom: '10px' }}>{emailMsg}</div>}
          <button onClick={updateEmail}
            style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Update email
          </button>
        </div>

        {/* Password */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1B2A4A', marginBottom: '1rem' }}>Password</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Current password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>New password <span style={{ fontWeight: '400', color: '#aaa' }}>(min 8 characters)</span></label>
            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Confirm new password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••" style={inputStyle} />
          </div>
          {passwordMsg && <div style={{ fontSize: '13px', color: passwordMsg.startsWith('✓') ? '#1A7A5C' : '#A32D2D', marginBottom: '10px' }}>{passwordMsg}</div>}
          <button onClick={updatePassword}
            style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Update password
          </button>
        </div>

        {/* Danger zone */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={logout}
            style={{ background: 'transparent', border: 'none', color: '#A32D2D', cursor: 'pointer', fontSize: '13px' }}>
            Sign out of Ventaro
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
