


import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  const roleLabel = currentUser?.role === 'ADMIN'
    ? 'Admin Mode'
    : currentUser?.role === 'THEATRE'
      ? 'Theatre Mode'
      : currentUser?.role === 'USER'
        ? 'User Mode'
        : 'Guest Mode';

  const dashboardPath =
    currentUser?.role === 'ADMIN'
      ? '/admin-dashboard'
      : currentUser?.role === 'THEATRE'
        ? '/theatre-dashboard'
        : '/user-dashboard';

  return (
    <Box sx={{ position: 'relative', zIndex: 100, mb: 2 }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="primary"
        sx={{
          mx: { xs: 1.5, md: 3 },
          mt: 2,
          borderRadius: 1.5,
          border: '1px solid rgba(15, 139, 141, 0.15)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(246,251,250,0.95) 100%)',
          color: '#102a43',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(15, 139, 141, 0.08)',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(120deg, transparent 0%, rgba(15, 139, 141, 0.08) 50%, transparent 100%)',
              transform: 'translateX(-100%)',
              animation: isAuthRoute ? 'none' : 'navbarSweep 8s ease-in-out infinite',
              pointerEvents: 'none',
            },
        }}
      >
        <Toolbar sx={{ py: 1, px: { xs: 2, md: 3 } }}>
          <Box
            onClick={() => navigate('/')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <Box 
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0f8b8d 0%, #0a6b6d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 900,
                fontSize: '20px',
                animation: isAuthRoute ? 'none' : 'navPulse 4.5s ease-in-out infinite',
              }}
            >
              🎭
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#0f8b8d', 
                fontWeight: 900, 
                letterSpacing: '-0.5px',
                fontSize: { xs: '16px', md: '18px' }
              }}
            >
              EventBooking
            </Typography>
          </Box>

          <Typography
            sx={{
              display: { xs: 'none', md: 'block' },
              fontWeight: 800,
              color: '#1f2d3d',
              fontSize: '17px',
              mr: 2,
            }}
          >
            {roleLabel}
          </Typography>

          <Stack 
            direction="row" 
            spacing={0.5} 
            alignItems="center" 
            sx={{ 
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              justifyContent: 'flex-end',
              gap: { xs: 1, sm: 0.5 }
            }}
          >
            <Button
              color="inherit"
              onClick={() => navigate('/')}
              sx={{
                px: { xs: 1.5, md: 2.5 },
                py: 0.8,
                borderRadius: 1.25,
                fontWeight: 600,
                fontSize: '14px',
                color: '#486581',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(15, 139, 141, 0.1)',
                  color: '#0f8b8d',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Home
            </Button>

            {currentUser && (
              <Button
                color="inherit"
                onClick={() => navigate(dashboardPath)}
                sx={{
                  px: { xs: 1.5, md: 2.5 },
                  py: 0.8,
                  borderRadius: 1.25,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#486581',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'rgba(15, 139, 141, 0.1)',
                    color: '#0f8b8d',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Dashboard
              </Button>
            )}

            <Button
              color="inherit"
              onClick={() => window.dispatchEvent(new CustomEvent('open-eventbooking-chat'))}
              sx={{
                px: { xs: 1.5, md: 2.5 },
                py: 0.8,
                borderRadius: 1.25,
                fontWeight: 600,
                fontSize: '14px',
                color: '#0f8b8d',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(15, 139, 141, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              ChatX
            </Button>

            {!currentUser && (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: { xs: 1.5, md: 2.5 },
                    py: 0.8,
                    borderRadius: 1.25,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#486581',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(15, 139, 141, 0.1)',
                      color: '#0f8b8d',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: { xs: 1.5, md: 2.5 },
                    py: 0.8,
                    borderRadius: 1.25,
                    fontWeight: 700,
                    fontSize: '14px',
                    background: 'linear-gradient(135deg, #0f8b8d 0%, #0a6b6d 100%)',
                    boxShadow: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d7375 0%, #085959 100%)',
                      boxShadow: '0 6px 16px rgba(15, 139, 141, 0.25)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Get Started
                </Button>
              </>
            )}

            {currentUser && (
              <>
                <Chip
                  label={`${currentUser.username}`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(15, 139, 141, 0.08)',
                    color: '#0f8b8d',
                    border: '1.5px solid rgba(15, 139, 141, 0.2)',
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                />
                <Chip
                  label={currentUser.role}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(224, 122, 95, 0.1)',
                    color: '#c85a38',
                    border: '1.5px solid rgba(224, 122, 95, 0.2)',
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                />
                <Button
                  color="inherit"
                  onClick={onLogout}
                  sx={{
                    px: { xs: 1.5, md: 2.5 },
                    py: 0.8,
                    borderRadius: 1.25,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#c85a38',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(224, 122, 95, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
