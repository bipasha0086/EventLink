import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import mailHologram from '../assets/mail-hologram.svg';

export default function TheatreDashboard({ currentUser, theatreData, theatreBookings, onAddEvent, onNotifyUsers, notifications = [] }) {
  const [message, setMessage] = React.useState('Schedule updated. Please check your event timing.');
  const [result, setResult] = React.useState(null);
  const [createResult, setCreateResult] = React.useState(null);
  const [eventForm, setEventForm] = React.useState({
    name: '',
    eventDate: '',
    eventTime: '',
    description: '',
  });

  if (!theatreData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No theatre selected for this account.</Alert>
      </Box>
    );
  }

  const handleNotify = async () => {
    const response = await onNotifyUsers(theatreData.theatreId, message);
    setResult(response);
  };

  const handleAddEvent = async () => {
    if (!onAddEvent) {
      return;
    }

    const response = await onAddEvent({
      theatreId: theatreData.theatreId,
      name: eventForm.name,
      eventDate: eventForm.eventDate,
      eventTime: eventForm.eventTime,
      location: theatreData.name,
      description: eventForm.description,
    });

    setCreateResult(response);
    if (response.ok) {
      setEventForm({
        name: '',
        eventDate: '',
        eventTime: '',
        description: '',
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 120px)',
        px: { xs: 2, md: 4 },
        py: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(circle at 12% 20%, rgba(132, 224, 230, 0.44) 0%, rgba(132, 224, 230, 0.08) 35%, transparent 58%), radial-gradient(circle at 88% 22%, rgba(246, 203, 184, 0.36) 0%, rgba(246, 203, 184, 0.06) 34%, transparent 58%), linear-gradient(120deg, #d8edef 0%, #f6efea 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.2,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0 1px, transparent 2px), radial-gradient(circle at 72% 58%, rgba(255,255,255,0.8) 0 1px, transparent 2px), radial-gradient(circle at 42% 78%, rgba(255,255,255,0.8) 0 1px, transparent 2px)',
          backgroundSize: '240px 240px, 300px 300px, 210px 210px',
          animation: 'tdSparkDrift 15s linear infinite',
          '@keyframes tdSparkDrift': {
            '0%': { backgroundPosition: '0 0, 0 0, 0 0' },
            '50%': { backgroundPosition: '16px -12px, -10px 14px, 12px 8px' },
            '100%': { backgroundPosition: '0 0, 0 0, 0 0' },
          },
        }}
      />

      <Box sx={{ width: '100%', maxWidth: 1560, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <Card sx={{ mb: 3, borderRadius: 5, background: 'linear-gradient(135deg, rgba(74,45,29,0.96) 0%, rgba(106,79,66,0.96) 100%)', color: 'white' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em' }}>
            Theatre Operations Board
          </Typography>
          <Typography sx={{ opacity: 0.92, maxWidth: 860, lineHeight: 1.7 }}>
            Manage movie timing, event schedule, and user communication from your theatre area with a focused, readable workflow.
          </Typography>
          <Typography sx={{ opacity: 0.84, mt: 1.1, fontWeight: 700 }}>
            Logged in as: {currentUser?.username || 'theatre-account'}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 5, mb: 3, background: 'linear-gradient(145deg, #fff7f0 0%, #fff3e8 100%)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 800 }}>{theatreData.name}</Typography>
              <Typography sx={{ color: '#6a4f42', mb: 2 }}>Area: {theatreData.area}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Movie Timing</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {(theatreData.movies || []).map((m) => (
                  <Chip key={`${m.title}-${m.timing}`} label={`${m.title} - ${m.timing}`} sx={{ mb: 1 }} />
                ))}
                {(!theatreData.movies || theatreData.movies.length === 0) && (
                  <Chip label="Movie timing list managed from events" sx={{ mb: 1 }} />
                )}
              </Stack>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Event Schedule</Typography>
              <Stack spacing={1.2}>
                {theatreData.events.map((e) => (
                  <Alert key={e.eventId} severity="info">
                    {e.name} | {e.eventDate} {e.eventTime} | {e.description}
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 5, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Current Bookings In Your Theatre</Typography>
              <Typography variant="body2" sx={{ color: '#6a4f42', mb: 2, lineHeight: 1.6 }}>
                Keep track of confirmed and pending attendees and see seat activity in one place.
              </Typography>
              <Stack spacing={1.2}>
                {theatreBookings.length === 0 && <Alert severity="info">No active bookings found.</Alert>}
                {theatreBookings.map((b) => (
                  <Alert key={b.bookingId} severity={b.status === 'PAID' ? 'success' : 'warning'}>
                    {b.userName} ({b.userEmail}) | Seat {b.seatNumber} | {b.eventName} | {b.status.replace('_', ' ')}
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Add New Event Schedule</Typography>
              <Typography variant="body2" sx={{ color: '#6a4f42', mb: 2, lineHeight: 1.6 }}>
                Publish a new schedule entry for this theatre so users can book from the latest event list.
              </Typography>
              <Stack spacing={1.4}>
                <TextField
                  label="Event name"
                  value={eventForm.name}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, name: e.target.value }))}
                  fullWidth
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                  <TextField
                    label="Event date"
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Event time"
                    type="time"
                    value={eventForm.eventTime}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eventTime: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <TextField
                  label="Description"
                  multiline
                  minRows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  fullWidth
                />
                <Button variant="contained" onClick={handleAddEvent} disabled={!eventForm.name || !eventForm.eventDate || !eventForm.eventTime}>
                  Create Event
                </Button>
                {createResult && (
                  <Alert severity={createResult.ok ? 'success' : 'warning'}>
                    {createResult.message || (createResult.ok ? 'Event created.' : 'Could not create event.')}
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 5, position: 'sticky', top: 112, background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(242,250,255,0.93) 100%)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Notify Users By Mail</Typography>
              <Typography variant="body2" sx={{ color: '#615f5f', mb: 2, lineHeight: 1.6 }}>
                Send schedule updates to everyone with a booking in this theatre.
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleNotify} disabled={!message.trim()} fullWidth>
                Send Mail Notification
              </Button>

              <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 160,
                    height: 124,
                    display: 'grid',
                    placeItems: 'center',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: '8px 22px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, rgba(71, 255, 250, 0.32), rgba(71, 255, 250, 0.04), rgba(71, 255, 250, 0.32))',
                      filter: 'blur(10px)',
                      animation: 'tdRingSpin 8s linear infinite',
                    },
                    '@keyframes tdRingSpin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={mailHologram}
                    alt="Mail hologram"
                    sx={{
                      width: 110,
                      height: 110,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 16px rgba(15, 139, 141, 0.22))',
                      animation: 'tdMailFloat 4s ease-in-out infinite',
                      '@keyframes tdMailFloat': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-6px)' },
                      },
                    }}
                  />
                </Box>
              </Box>
              {result && (
                <Alert severity={result.ok ? 'success' : 'warning'} sx={{ mt: 2 }}>
                  {result.message}
                </Alert>
              )}
              <Stack spacing={1} sx={{ mt: 2 }}>
                {notifications.slice(0, 4).map((note) => (
                  <Alert key={note.id} severity={note.type || 'info'}>
                    {note.message}
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}
