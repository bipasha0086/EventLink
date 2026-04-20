
import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const thoughts = [
  "Stay positive, work hard, make it happen!",
  "Every ticket is a new experience.",
  "Your best event is just a click away.",
  "Believe in yourself and book your dreams!",
  "Progress, not perfection.",
  "You are stronger than you think.",
  "Small steps every day.",
  "Your journey matters."
];

export default function MotivationalBlock() {
  const [thought, setThought] = React.useState(thoughts[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setThought((current) => {
        const next = thoughts[Math.floor(Math.random() * thoughts.length)];
        return next === current ? thoughts[(thoughts.indexOf(next) + 1) % thoughts.length] : next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.3, md: 2.7 },
        mt: 2,
        mb: 3,
        mx: 'auto',
        maxWidth: 940,
        background: 'linear-gradient(125deg, rgba(255,255,255,0.88) 0%, rgba(241, 251, 247, 0.92) 55%, rgba(255, 244, 235, 0.9) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(16, 42, 67, 0.09)',
        boxShadow: '0 16px 36px rgba(16, 42, 67, 0.09)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 84,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #0f8b8d, #f2cc8f)',
          boxShadow: '0 0 0 8px rgba(15, 139, 141, 0.08)',
          animation: 'pulse-dot 2.2s ease-in-out infinite',
          '@keyframes pulse-dot': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.18)' },
          },
        }}
      />
      <Typography
        variant="h6"
        align="center"
        sx={{
          px: 2,
          color: '#102a43',
          fontWeight: 800,
          letterSpacing: 0.2,
        }}
      >
        {thought}
      </Typography>
      <Box sx={{ color: '#486581', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', pr: 1 }}>
        refreshed every 5s
      </Box>
    </Paper>
  );
}
