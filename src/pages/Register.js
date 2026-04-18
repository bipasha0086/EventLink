

import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import './Auth.css';

export default function Register({ threatAreas = [] }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [threatArea, setThreatArea] = useState(threatAreas[0] || 'Downtown');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'register');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('email', email);
      formData.append('role', 'USER');
      formData.append('threatArea', threatArea);
      const response = await fetch('/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Registration successful!');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-hero">
          <div className="auth-hero-inner">
            <div>
              <span className="auth-eyebrow">Quick user onboarding</span>
              <h1>Create your account.</h1>
              <p>
                Register once and start booking seats, managing your threat area, and receiving theatre updates in one place.
              </p>
              <div className="auth-points">
                <div className="auth-point"><strong>1</strong><span>simple sign-up</span></div>
                <div className="auth-point"><strong>24h</strong><span>payment window</span></div>
                <div className="auth-point"><strong>Live</strong><span>mail alerts</span></div>
              </div>
            </div>

            <div className="auth-visual">
              <div className="auth-visual-grid">
                <div className="auth-visual-icon one">👤</div>
                <div className="auth-visual-icon two">🎟</div>
                <div className="auth-visual-icon three">✉</div>
                <div style={{ marginTop: 40 }}>
                  <div style={{ color: '#0f8b8d', fontWeight: 900, marginBottom: 8 }}>Booking flow</div>
                  <div className="auth-visual-bars">
                    {Array.from({ length: 24 }).map((_, index) => (
                      <span key={index} className={index % 5 === 0 ? 'auth-bar active' : 'auth-bar'} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="auth-form">
          <div className="auth-form-inner">
            <Typography className="auth-title">Join the booking system.</Typography>
            <Typography className="auth-subtitle">Create a user account and get started immediately.</Typography>

            <div className="auth-panel">
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontWeight: 500 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontWeight: 500 }} onClose={() => window.location.href = '/login'}>
                  Registration successful. Redirecting to login...
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2} className="auth-fields">
                  <TextField label="Username" variant="outlined" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a unique username" />
                  <TextField label="Email" type="email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />

                  <FormControl fullWidth>
                    <InputLabel>Threat Area</InputLabel>
                    <Select value={threatArea} label="Threat Area" onChange={(e) => setThreatArea(e.target.value)}>
                      {threatAreas.map((area) => (
                        <MenuItem key={area} value={area}>{area}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField label="Password" type="password" variant="outlined" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
                  <TextField label="Confirm Password" type="password" variant="outlined" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />

                  <Button type="submit" variant="contained" fullWidth size="large" sx={{ py: 1.4, fontWeight: 800, borderRadius: 2 }}>
                    Create Account
                  </Button>

                  <Typography sx={{ textAlign: 'center', color: '#486581', fontSize: '0.95rem', fontWeight: 600 }}>
                    Already have an account?{' '}
                    <span onClick={() => window.location.href = '/login'} style={{ color: '#0f8b8d', cursor: 'pointer', fontWeight: 800 }}>Login</span>
                  </Typography>
                </Stack>
              </form>
            </div>

            <Typography className="auth-note">Test Account: demo / demo123 (optional)</Typography>
          </div>
        </section>
      </section>
    </main>
  );
}
