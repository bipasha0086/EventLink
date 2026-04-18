
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(242, 252, 250, 0.95) 0%, rgba(255, 244, 234, 0.95) 100%)',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              color: '#0f8b8d', 
              mb: 1,
              fontSize: { xs: '28px', md: '42px' },
              letterSpacing: '-0.02em'
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            sx={{ 
              color: '#486581', 
              fontSize: { xs: '15px', md: '17px' },
              fontWeight: 500
            }}
          >
            Choose your role and unlock your dashboard
          </Typography>
        </Box>

        {/* Role Selection Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {roles.map((role) => (
            <Card
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              sx={{
                borderRadius: 3,
                border: selectedRole === role.value ? '3px solid #0f8b8d' : '2px solid rgba(16, 42, 67, 0.08)',
                background: selectedRole === role.value 
                  ? 'linear-gradient(135deg, rgba(15, 139, 141, 0.08) 0%, rgba(242, 252, 250, 0.95) 100%)' 
                  : 'rgba(255,255,255,0.92)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: selectedRole === role.value 
                  ? '0 12px 32px rgba(15, 139, 141, 0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 40px rgba(15, 139, 141, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800, 
                    color: selectedRole === role.value ? '#0f8b8d' : '#102a43',
                    mb: 1,
                    fontSize: '17px'
                  }}
                >
                  {role.label}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#486581', 
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontWeight: 500
                  }}
                >
                  {role.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Login Form Card */}
        <Card 
          sx={{ 
            borderRadius: 4, 
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid rgba(16, 42, 67, 0.08)',
            boxShadow: '0 8px 24px rgba(16, 42, 67, 0.08)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2.5, borderRadius: 2, fontWeight: 500 }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(242, 252, 250, 0.5)',
                    },
                  }}
                  placeholder="Enter your username"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(242, 252, 250, 0.5)',
                    },
                  }}
                  placeholder="Enter your password"
                />

                {selectedRole === 'USER' && threatAreas.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Threat Area</InputLabel>
                    <Select
                      value={threatArea}
                      label="Threat Area"
                      onChange={(e) => setThreatArea(e.target.value)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(242, 252, 250, 0.5)',
                      }}
                    >
                      {threatAreas.map((area) => (
                        <MenuItem key={area} value={area}>{area}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedRole === 'THEATRE' && theatres.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Theatre</InputLabel>
                    <Select 
                      value={theatreId} 
                      label="Theatre"
                      onChange={(e) => setTheatreId(e.target.value)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(242, 252, 250, 0.5)',
                      }}
                    >
                      {theatres.map((theatre) => (
                        <MenuItem key={theatre.theatreId} value={theatre.theatreId}>
                          {theatre.name} • {theatre.area}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 1,
                    py: 1.3,
                    fontWeight: 700,
                    fontSize: '16px',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0f8b8d 0%, #0a6b6d 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d7375 0%, #085959 100%)',
                      boxShadow: '0 8px 20px rgba(15, 139, 141, 0.3)',
                    },
                    '&:disabled': {
                      background: 'rgba(15, 139, 141, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Logging in...' : `Continue as ${roles.find((r) => r.value === selectedRole)?.label}`}
                </Button>

                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Typography sx={{ color: '#486581', fontSize: '14px', fontWeight: 500 }}>
                    Don't have an account?{' '}
                    <Typography
                      component="span"
                      onClick={() => navigate('/register')}
                      sx={{
                        color: '#0f8b8d',
                        fontWeight: 700,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Create one
                    </Typography>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
