
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';

const normalizeRole = (role) => {
  const value = String(role || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (value === 'ADMIN') return 'ADMIN';
  if (value === 'USER') return 'USER';
  if (['THEATRE', 'THEATER', 'THEATRE_PERSON', 'THEATER_PERSON', 'THREATRE', 'THREAD_PERSON'].includes(value)) {
    return 'THEATRE';
  }
  return value;
};

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
    const currentRole = normalizeRole(currentUser.role);
    const route =
      currentRole === 'ADMIN'
        ? '/admin-dashboard'
        : currentRole === 'THEATRE'
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
      const user = await onLogin({
        username: username.trim(),
        password: password.trim(),
        expectedRole: selectedRole,
      });

      const userRole = normalizeRole(user?.role);

      if (userRole === 'ADMIN') {
        navigate('/admin-dashboard');
        return;
      }
      if (userRole === 'THEATRE') {
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background: '#f4f7f8',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 2,
          border: '1px solid rgba(16, 42, 67, 0.1)',
          p: { xs: 2.5, md: 3.5 },
          background: '#ffffff',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#102a43', mb: 1 }}>
          Login
        </Typography>
        <Typography sx={{ color: '#486581', mb: 2.5 }}>
          Select role and sign in to continue.
        </Typography>

        <ToggleButtonGroup
          exclusive
          fullWidth
          value={selectedRole}
          onChange={(_, value) => {
            if (value) {
              setSelectedRole(value);
            }
          }}
          sx={{ mb: 2 }}
        >
          {roles.map((role) => (
            <ToggleButton key={role.value} value={role.value} sx={{ fontWeight: 700 }}>
              {role.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

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
                      {theatre.name} - {theatre.area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.25, fontWeight: 800 }}>
              {loading ? 'Logging in...' : `Continue as ${roles.find((r) => r.value === selectedRole)?.label}`}
            </Button>

            <Button variant="text" onClick={() => navigate('/register')} sx={{ fontWeight: 700 }}>
              Create new account
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
