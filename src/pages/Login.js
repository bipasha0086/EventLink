

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import './Auth.css';

const roles = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Manage all theatres, monitor threats, and control deallocation.',
  },
  {
    value: 'USER',
    label: 'User',
    description: 'Book seats from threat-board and complete payment within 24 hours.',
  },
  {
    value: 'THEATRE',
    label: 'Theatre Person',
    description: 'Access movie timings, schedules, and send update mails to users.',
  },
];

export default function Login({ currentUser, onLogin, theatres, threatAreas }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('USER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [threatArea, setThreatArea] = useState(threatAreas[0] || '');
  const [theatreId, setTheatreId] = useState(theatres[0]?.theatreId || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    const route =
      currentUser.role === 'ADMIN'
        ? '/admin-dashboard'
        : currentUser.role === 'THEATRE'
          ? '/theatre-dashboard'
          : '/user-dashboard';
    return <Navigate to={route} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    if (selectedRole === 'THEATRE' && !theatreId) {
      setError('Please pick your theatre account.');
      return;
    }

    try {
      setLoading(true);
      await onLogin({
        username: username.trim(),
        password: password.trim(),
        expectedRole: selectedRole,
      });

      if (selectedRole === 'ADMIN') {
        navigate('/admin-dashboard');
        return;
      }
      if (selectedRole === 'THEATRE') {
        navigate('/theatre-dashboard');
        return;
      }
      navigate('/user-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-hero">
          <div className="auth-hero-inner">
            <div>
              <span className="auth-eyebrow">Secure role access</span>
              <h1>Welcome back.</h1>
              <p>
                Sign in to manage bookings, payments, theatre alerts, and role-based dashboards from one coordinated system.
              </p>
              <div className="auth-points">
                <div className="auth-point"><strong>24h</strong><span>payment control</span></div>
                <div className="auth-point"><strong>3</strong><span>role views</span></div>
                <div className="auth-point"><strong>1</strong><span>active seat per user</span></div>
              </div>
            </div>

            <div className="auth-visual">
              <div className="auth-visual-grid">
                <div className="auth-visual-icon one">🔒</div>
                <div className="auth-visual-icon two">▶</div>
                <div className="auth-visual-icon three">✉</div>
                <div style={{ marginTop: 40 }}>
                  <div style={{ color: '#0f8b8d', fontWeight: 900, marginBottom: 8 }}>Upcoming Schedules</div>
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
            <Typography className="auth-title">Choose your role and sign in.</Typography>
            <Typography className="auth-subtitle">Select the account type, then continue to your dashboard.</Typography>

            <div className="auth-role-grid">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`auth-role-card ${selectedRole === role.value ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedRole(role.value)}
                >
                  <h3>{role.label}</h3>
                  <p>{role.description}</p>
                </div>
              ))}
            </div>

            <div className="auth-panel">
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontWeight: 500 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2} className="auth-fields">
                  <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth placeholder="Enter your username" />
                  <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth placeholder="Enter your password" />

                  {selectedRole === 'USER' && threatAreas.length > 0 && (
                    <FormControl fullWidth>
                      <InputLabel>Threat Area</InputLabel>
                      <Select value={threatArea} label="Threat Area" onChange={(e) => setThreatArea(e.target.value)}>
                        {threatAreas.map((area) => (
                          <MenuItem key={area} value={area}>{area}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {selectedRole === 'THEATRE' && theatres.length > 0 && (
                    <FormControl fullWidth>
                      <InputLabel>Theatre</InputLabel>
                      <Select value={theatreId} label="Theatre" onChange={(e) => setTheatreId(e.target.value)}>
                        {theatres.map((theatre) => (
                          <MenuItem key={theatre.theatreId} value={theatre.theatreId}>
                            {theatre.name} • {theatre.area}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.4, fontWeight: 800, borderRadius: 2 }}>
                    {loading ? 'Logging in...' : `Continue as ${roles.find((r) => r.value === selectedRole)?.label}`}
                  </Button>

                  <Typography sx={{ textAlign: 'center', color: '#486581', fontSize: '0.95rem', fontWeight: 600 }}>
                    Don&apos;t have an account?{' '}
                    <span onClick={() => navigate('/register')} style={{ color: '#0f8b8d', cursor: 'pointer', fontWeight: 800 }}>Create one</span>
                  </Typography>
                </Stack>
              </Box>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
