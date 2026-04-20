import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const buildNotificationTemplates = (theatreName) => [
  `Schedule updated for ${theatreName}. Please recheck your event time before arrival.`,
  `Seats are filling quickly at ${theatreName}. Complete your payment within 24 hours to confirm booking.`,
  `Heads up: minor timing adjustments have been published for today's shows at ${theatreName}.`,
  `Reminder from ${theatreName}: keep your booking active by completing pending payment before deadline.`,
];

export default function TheatreDashboard({ currentUser, theatreData, theatreBookings, onAddEvent, onNotifyUsers, notifications = [] }) {
  const [message, setMessage] = React.useState('Schedule updated. Please check your event timing.');
  const [result, setResult] = React.useState(null);
  const [createResult, setCreateResult] = React.useState(null);
  const [templateStatus, setTemplateStatus] = React.useState('');
  const [eventForm, setEventForm] = React.useState({
    name: '',
    eventDate: '',
    eventTime: '',
    description: '',
  });

  const templateList = React.useMemo(() => buildNotificationTemplates(theatreData.name), [theatreData.name]);

  const nextEvent = React.useMemo(() => {
    const now = Date.now();
    const candidates = theatreData.events
      .map((event) => {
        const timestamp = new Date(`${event.eventDate}T${event.eventTime}`).getTime();
        return { ...event, timestamp };
      })
      .filter((event) => Number.isFinite(event.timestamp) && event.timestamp >= now)
      .sort((a, b) => a.timestamp - b.timestamp);
    return candidates[0] || null;
  }, [theatreData.events]);

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

  const applySmartDraft = () => {
    if (!nextEvent) {
      setMessage(`Schedule updated for ${theatreData.name}. Please review your latest event timing and payment window.`);
      setTemplateStatus('Smart draft applied with general theatre update.');
      return;
    }
    setMessage(
      `Upcoming reminder: ${nextEvent.name} starts on ${nextEvent.eventDate} at ${nextEvent.eventTime} in ${theatreData.name}. Please verify your seat and complete any pending payment before deadline.`
    );
    setTemplateStatus('Smart draft applied from next upcoming event.');
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setTemplateStatus('Message copied. You can reuse it in mail or chat.');
    } catch {
      setTemplateStatus('Clipboard is unavailable in this browser context.');
    }
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

  const theatrePulse = [
    { label: 'Live events', value: theatreData.events.length },
    { label: 'Bookings', value: theatreBookings.length },
    { label: 'Notifications', value: notifications.length },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 110px)',
        px: { xs: 1.5, md: 2.5 },
        py: { xs: 1.5, md: 2 },
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #7ea8ad 0%, #d7c6bf 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(circle at 10% 16%, rgba(84, 145, 153, 0.50) 0%, rgba(84, 145, 153, 0.18) 30%, transparent 58%), radial-gradient(circle at 90% 16%, rgba(255, 231, 221, 0.58) 0%, rgba(255, 231, 221, 0.18) 30%, transparent 56%), linear-gradient(180deg, rgba(120, 160, 166, 0.72) 0%, rgba(214, 198, 191, 0.68) 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.12,
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
        <Card sx={{ mb: 2.2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(88, 56, 43, 0.96) 0%, rgba(123, 90, 75, 0.94) 100%)', color: 'white', overflow: 'hidden', boxShadow: '0 18px 38px rgba(36, 31, 29, 0.22)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.10) 45%, transparent 72%)', animation: 'theatreHeaderSweep 8s ease-in-out infinite', pointerEvents: 'none' }} />
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}>
              Theatre Operations Board
            </Typography>
            <Typography sx={{ opacity: 0.92, maxWidth: 860, lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
              Manage movie timing, event schedule, and user communication from your theatre area with a focused, readable workflow.
            </Typography>
            <Typography sx={{ opacity: 0.82, mt: 1.1, fontWeight: 700, position: 'relative', zIndex: 1 }}>
              Logged in as: {currentUser?.username || 'theatre-account'}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2.2, px: 1, alignItems: 'center' }}>
          {theatrePulse.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                width: 108,
                height: 82,
                borderRadius: 2,
                background: index === 1 ? 'linear-gradient(145deg, rgba(244, 215, 197, 0.98) 0%, rgba(223, 193, 179, 0.98) 100%)' : 'linear-gradient(145deg, rgba(238, 244, 246, 0.96) 0%, rgba(219, 232, 235, 0.96) 100%)',
                boxShadow: '0 10px 20px rgba(25, 41, 47, 0.12)',
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.46)',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.52rem', fontWeight: 900, color: index === 1 ? '#b36d45' : '#2f6f7a', letterSpacing: '0.08em' }}>
                  {item.label.toUpperCase()}
                </Typography>
                <Typography sx={{ fontSize: '1.9rem', lineHeight: 1, fontWeight: 900, color: index === 1 ? '#7d4b2f' : '#1f5863' }}>
                  {item.value}
                </Typography>
                <Box sx={{ width: 28, height: 4, mt: 0.25, mx: 'auto', borderRadius: 1, background: index === 1 ? 'rgba(160, 87, 45, 0.5)' : 'rgba(26, 110, 120, 0.5)' }} />
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 2.2, alignItems: 'start' }}>
          <Box sx={{ display: 'grid', gap: 2.2, minWidth: 0 }}>
            <Card sx={{ borderRadius: 2, background: 'linear-gradient(145deg, rgba(255,255,255,0.78) 0%, rgba(242,244,245,0.82) 100%)', boxShadow: '0 14px 30px rgba(18, 34, 40, 0.12)', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.3, color: '#17384a', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{theatreData.name}</Typography>
                <Typography sx={{ color: '#51656c', mb: 1.8, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>Area: {theatreData.area}</Typography>

                <Typography sx={{ fontWeight: 800, color: '#183847', mb: 0.8 }}>Movie Timing</Typography>
                <Chip
                  label={(theatreData.movies && theatreData.movies.length > 0)
                    ? theatreData.movies.map((m) => `${m.title} ${m.timing}`).join(' | ')
                    : 'Movie timing list managed from events'}
                  sx={{
                    mb: 1.4,
                    background: 'rgba(127, 138, 144, 0.18)',
                    color: '#55656b',
                    fontWeight: 700,
                    borderRadius: 2,
                    maxWidth: '100%',
                    height: 'auto',
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    overflowWrap: 'anywhere',
                    px: 1.4,
                    py: 0.8,
                  }}
                />

                <Typography sx={{ fontWeight: 800, color: '#183847', mb: 0.9 }}>Event Schedule</Typography>
                <Stack spacing={1.1}>
                  {theatreData.events.map((e) => (
                    <Box
                      key={e.eventId}
                      sx={{
                        p: 1.3,
                        borderRadius: 2,
                        background: 'rgba(141, 176, 191, 0.26)',
                        color: '#224c63',
                        border: '1px solid rgba(80, 133, 151, 0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(36, 92, 115, 0.26)', display: 'grid', placeItems: 'center', fontSize: 12, flex: '0 0 auto' }}>i</Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                        {e.name} | {e.eventDate} {e.eventTime} | {e.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, background: 'linear-gradient(145deg, rgba(255,255,255,0.74) 0%, rgba(242,244,245,0.80) 100%)', boxShadow: '0 14px 30px rgba(18, 34, 40, 0.12)', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5, color: '#17384a' }}>Current Bookings In Your Theatre</Typography>
                <Typography sx={{ color: '#51656c', mb: 1.8, lineHeight: 1.6 }}>
                  Keep track of confirmed and pending attendees and see seat activity in one place.
                </Typography>
                <Stack spacing={1}>
                  {theatreBookings.length === 0 && <Alert severity="info">No active bookings found.</Alert>}
                  {theatreBookings.map((b) => (
                    <Box
                      key={b.bookingId}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        background: b.status === 'PAID' ? 'rgba(207, 231, 213, 0.9)' : 'rgba(244, 224, 211, 0.92)',
                        border: '1px solid rgba(106, 95, 85, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        px: 1.5,
                        minWidth: 0,
                      }}
                    >
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b3d33', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                        {b.userName} ({b.userEmail}) | Sat | {b.seatNumber}
                      </Typography>
                      <Chip
                        size="small"
                        label={b.status === 'PAID' ? 'PAID' : 'PENDING PAYMENT'}
                          sx={{ fontWeight: 800, background: b.status === 'PAID' ? '#5a9e5b' : '#cc8352', color: '#fff', flex: '0 0 auto' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

            <Box sx={{ display: 'grid', gap: 2.2, minWidth: 0 }}>
                <Card sx={{ borderRadius: 2, background: 'linear-gradient(145deg, rgba(255,255,255,0.76) 0%, rgba(242,244,245,0.82) 100%)', boxShadow: '0 14px 30px rgba(18, 34, 40, 0.12)', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#17384a', mb: 0.5 }}>Notify Users By Mail</Typography>
                  <Typography sx={{ color: '#51656c', mb: 1.2, lineHeight: 1.45, fontSize: '0.9rem' }}>
                  Send schedule updates to everyone with a booking in this theatre.
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.2 }}>
                  <Button variant="outlined" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }} onClick={applySmartDraft}>
                    Smart Draft
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }} onClick={copyMessage}>
                    Copy Message
                  </Button>
                </Stack>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ mb: 1.3 }}>
                  {templateList.map((template, index) => (
                    <Chip
                      key={`template-${index}`}
                      label={`Template ${index + 1}`}
                      onClick={() => {
                        setMessage(template);
                        setTemplateStatus(`Template ${index + 1} applied.`);
                      }}
                      clickable
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    />
                  ))}
                </Stack>
                <Button variant="contained" onClick={handleNotify} disabled={!message.trim()} fullWidth sx={{ py: 1, fontWeight: 800, borderRadius: 2, background: 'linear-gradient(90deg, #126f80 0%, #1e8a96 100%)' }}>
                  Send Mail Notification
                </Button>
                {templateStatus && (
                  <Alert severity="info" sx={{ mt: 1.2, borderRadius: 2 }}>
                    {templateStatus}
                  </Alert>
                )}

                <Box sx={{ display: 'grid', placeItems: 'center', py: 2.2 }}>
                  <Box sx={{ position: 'relative', width: 160, height: 112, display: 'grid', placeItems: 'center' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 18,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 193, 208, 0.35) 0%, rgba(59, 193, 208, 0) 66%)',
                        filter: 'blur(4px)',
                      }}
                    />
                    <Box
                      sx={{
                        width: 72,
                        height: 52,
                        borderRadius: 3,
                        background: 'linear-gradient(180deg, #dff0f3 0%, #c9e6eb 100%)',
                        border: '1px solid rgba(63, 127, 140, 0.18)',
                        boxShadow: '0 12px 20px rgba(22, 97, 114, 0.16)',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ width: 34, height: 24, border: '2px solid #8eb7c0', borderTop: 'none', borderRadius: '0 0 12px 12px', position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: -2, left: 2, right: 2, height: 2, background: '#8eb7c0', transform: 'skewY(-18deg)' }} />
                      </Box>
                      <Box sx={{ position: 'absolute', top: -12, width: 18, height: 18, borderRadius: '50%', background: 'rgba(62, 177, 194, 0.12)', display: 'grid', placeItems: 'center', color: '#3ea8b8', fontWeight: 900 }}>+</Box>
                    </Box>
                  </Box>
                </Box>

                {result && (
                  <Alert severity={result.ok ? 'success' : 'warning'} sx={{ mt: 1.5, borderRadius: 2 }}>
                    {result.message}
                  </Alert>
                )}
                {createResult && (
                  <Alert severity={createResult.ok ? 'success' : 'warning'} sx={{ mt: 1.5, borderRadius: 2 }}>
                    {createResult.message || (createResult.ok ? 'Event created.' : 'Could not create event.')}
                  </Alert>
                )}
                {result && !result.ok && (
                  <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
                    Role mismatch detected. Continuing as theatre.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, background: 'linear-gradient(145deg, rgba(255,255,255,0.76) 0%, rgba(242,244,245,0.82) 100%)', boxShadow: '0 14px 30px rgba(18, 34, 40, 0.12)', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#17384a', mb: 0.5 }}>Add New Event Schedule</Typography>
                <Typography sx={{ color: '#51656c', mb: 1.5, lineHeight: 1.45, fontSize: '0.9rem' }}>
                  Publish a new schedule entry for this theatre so users can book from the latest event list.
                </Typography>
                <Stack spacing={1.2}>
                  <TextField
                    size="small"
                    label="Event name"
                    value={eventForm.name}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, name: e.target.value }))}
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                    <TextField
                      size="small"
                      label="Date"
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      size="small"
                      label="Time"
                      type="time"
                      value={eventForm.eventTime}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, eventTime: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                  <TextField
                    size="small"
                    label="Description"
                    multiline
                    minRows={2}
                    value={eventForm.description}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                    fullWidth
                  />
                  <Button variant="contained" onClick={handleAddEvent} disabled={!eventForm.name || !eventForm.eventDate || !eventForm.eventTime} sx={{ py: 1, fontWeight: 800, borderRadius: 2, background: 'linear-gradient(90deg, #126f80 0%, #1e8a96 100%)' }}>
                    Create Event
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
