import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
  { value: 'THEATRE', label: 'Theatre' },
];

const normalizeRole = (role) => {
  const value = String(role || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (value === 'ADMIN') return 'ADMIN';
  if (value === 'USER') return 'USER';
  if (['THEATRE', 'THEATER', 'THEATRE_PERSON', 'THEATER_PERSON', 'THREATRE', 'THREAD_PERSON'].includes(value)) {
    return 'THEATRE';
  }
  return value;
};

const statusColor = {
  PENDING_PAYMENT: 'warning',
  PAID: 'success',
  EXPIRED: 'error',
  DEALLOCATED: 'default',
};

const RECT_CARD_RADIUS = 2;
const RECT_CONTROL_RADIUS = 1;

const WATCHLIST_STORAGE_KEY = 'eventbooking:admin-watchlist';

const getHoursUntil = (deadline) => {
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) {
    return null;
  }
  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
};

function BookingCard({ booking, onAllocate, onDeallocate, isWatched, onToggleWatch }) {
  const [friendName, setFriendName] = React.useState('');
  const [actionError, setActionError] = React.useState('');

  return (
    <Card sx={{ borderRadius: RECT_CARD_RADIUS, border: '1px solid #e8e4d9', background: '#fffdf8' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2f3d2f' }}>
            {booking.userName} ({booking.userEmail})
          </Typography>
          <Chip
            size="small"
            label={booking.status.replace('_', ' ')}
            color={statusColor[booking.status] || 'default'}
            sx={{ borderRadius: RECT_CONTROL_RADIUS, fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="body2" sx={{ color: '#54655a' }}>
          Theatre: {booking.theatreName} | Area: {booking.threatArea}
        </Typography>
        <Typography variant="body2" sx={{ color: '#54655a' }}>
          Event: {booking.eventName} ({booking.eventDate} {booking.eventTime})
        </Typography>
        <Typography variant="body2" sx={{ color: '#54655a' }}>
          Seat: {booking.seatNumber}
        </Typography>
        <Typography variant="body2" sx={{ color: '#54655a', mt: 0.5 }}>
          Payment Deadline: {new Date(booking.paymentDeadline).toLocaleString()}
        </Typography>
        {booking.allocatedTo && (
          <Typography variant="body2" sx={{ color: '#7d4b36', mt: 0.5 }}>
            Allocated For Friend: {booking.allocatedTo}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            size="small"
            fullWidth
            label="Allocate seat to friend"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
          />
          <Button
            variant="outlined"
            sx={{ borderRadius: RECT_CONTROL_RADIUS }}
            onClick={async () => {
              setActionError('');
              const result = await onAllocate(booking.bookingId, friendName);
              if (!result.ok) {
                setActionError(result.message || 'Allocation failed.');
                return;
              }
              setFriendName('');
            }}
            disabled={booking.status !== 'PENDING_PAYMENT' || !friendName.trim()}
          >
            Allocate
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ borderRadius: RECT_CONTROL_RADIUS }}
            onClick={async () => {
              setActionError('');
              const result = await onDeallocate(booking.bookingId);
              if (!result.ok) {
                setActionError(result.message || 'Deallocation failed.');
              }
            }}
            disabled={booking.status === 'DEALLOCATED' || booking.status === 'EXPIRED'}
          >
            Deallocate
          </Button>
          <Button
            variant={isWatched ? 'contained' : 'outlined'}
            color={isWatched ? 'warning' : 'inherit'}
            sx={{ borderRadius: RECT_CONTROL_RADIUS }}
            onClick={() => onToggleWatch(booking.bookingId)}
          >
            {isWatched ? 'Watching' : 'Watch'}
          </Button>
        </Stack>
        {actionError && <Alert severity="error" sx={{ mt: 1 }}>{actionError}</Alert>}
      </CardContent>
    </Card>
  );
}

function UserRoleCard({ user, theatres, onUpdateUserRole }) {
  const [role, setRole] = React.useState(normalizeRole(user.role));
  const [theatreId, setTheatreId] = React.useState(user.theatreId ?? '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const needsTheatre = role === 'THEATRE';

  React.useEffect(() => {
    setRole(normalizeRole(user.role));
    setTheatreId(user.theatreId ?? '');
    setError('');
  }, [user]);

  return (
    <Card sx={{ borderRadius: RECT_CARD_RADIUS, border: '1px solid #e8e4d9', background: '#fffdf8' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#102a43', mb: 0.5 }}>
          {user.username}
        </Typography>
        <Typography variant="body2" sx={{ color: '#54655a', mb: 2 }}>
          {user.email || 'No email'}
        </Typography>

        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {needsTheatre && (
            <FormControl fullWidth size="small">
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

          <Button
            variant="contained"
            sx={{ borderRadius: RECT_CONTROL_RADIUS }}
            disabled={saving || (needsTheatre && !theatreId)}
            onClick={async () => {
              setSaving(true);
              setError('');
              const result = await onUpdateUserRole({
                userId: user.userId,
                role,
                theatreId: needsTheatre ? theatreId : null,
              });
              if (!result.ok) {
                setError(result.message || 'Could not update role.');
              }
              setSaving(false);
            }}
          >
            {saving ? 'Saving...' : 'Save role'}
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard({ users = [], theatres = [], bookings, notifications, onAllocate, onDeallocate, onUpdateUserRole }) {
  const pending = bookings.filter((b) => b.status === 'PENDING_PAYMENT').length;
  const paid = bookings.filter((b) => b.status === 'PAID').length;
  const expired = bookings.filter((b) => b.status === 'EXPIRED').length;
  const totalUsers = users.length;
  const [watchlistIds, setWatchlistIds] = React.useState([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (!raw) {
        setWatchlistIds([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setWatchlistIds([]);
        return;
      }
      setWatchlistIds(parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id)));
    } catch {
      setWatchlistIds([]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistIds));
  }, [watchlistIds]);

  const toggleWatchlist = (bookingId) => {
    setWatchlistIds((prev) => (prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId]));
  };

  const watchedBookings = bookings.filter((booking) => watchlistIds.includes(booking.bookingId));
  const riskyBookings = bookings.filter((booking) => {
    if (booking.status === 'EXPIRED') {
      return true;
    }
    if (booking.status !== 'PENDING_PAYMENT') {
      return false;
    }
    const hoursRemaining = getHoursUntil(booking.paymentDeadline);
    return hoursRemaining !== null && hoursRemaining <= 6;
  });

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Card sx={{ mb: 3, borderRadius: RECT_CARD_RADIUS, background: 'linear-gradient(135deg, rgba(15,139,141,0.92) 0%, rgba(10,107,109,0.95) 100%)', color: 'white', overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.14) 45%, transparent 70%)', animation: 'navbarSweep 8s ease-in-out infinite', pointerEvents: 'none' }} />
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}>
            Admin Threat & Allocation Dashboard
          </Typography>
          <Typography sx={{ opacity: 0.92, maxWidth: 840, lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
            Monitor all theatres and threat areas, allocate seats for friends, and enforce the 24-hour payment policy from one clear control surface.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Chip label={`${totalUsers} users`} size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', fontWeight: 800, borderRadius: RECT_CONTROL_RADIUS }} variant="outlined" />
            <Chip label={`${theatres.length} theatres`} size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', fontWeight: 800, borderRadius: RECT_CONTROL_RADIUS }} variant="outlined" />
            <Chip label={`${bookings.length} bookings`} size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', fontWeight: 800, borderRadius: RECT_CONTROL_RADIUS }} variant="outlined" />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: RECT_CARD_RADIUS, background: 'linear-gradient(145deg, #fff7e5 0%, #fff1c9 100%)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: '#9b6f00', fontWeight: 800 }}>Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#7d5900' }}>{pending}</Typography>
              <Typography sx={{ color: '#6d5b33' }}>Bookings awaiting payment</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: RECT_CARD_RADIUS, background: 'linear-gradient(145deg, #e5f8ea 0%, #cff1d6 100%)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: '#267349', fontWeight: 800 }}>Paid</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#245f3b' }}>{paid}</Typography>
              <Typography sx={{ color: '#4b6b57' }}>Confirmed bookings</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: RECT_CARD_RADIUS, background: 'linear-gradient(145deg, #ffe8e8 0%, #ffd4d4 100%)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: '#a73f3f', fontWeight: 800 }}>Expired</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#8b2f2f' }}>{expired}</Typography>
              <Typography sx={{ color: '#734f4f' }}>Auto-deallocated bookings</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: RECT_CARD_RADIUS, border: '1px solid #e8e4d9', background: '#fffdf8' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>User Role Management</Typography>
          <Typography variant="body2" sx={{ color: '#54655a', mb: 2 }}>
            Promote a user to Theatre by choosing a theatre, or demote back to User/Admin as needed.
          </Typography>
          {users.length === 0 ? (
            <Alert severity="info">No users available.</Alert>
          ) : (
            <Grid container spacing={2}>
              {users.map((user) => (
                <Grid key={user.userId} item xs={12} md={6} lg={4}>
                  <UserRoleCard user={user} theatres={theatres} onUpdateUserRole={onUpdateUserRole} />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#102a43' }}>Booking Control Queue</Typography>
            {bookings.length === 0 && <Alert severity="info">No bookings yet.</Alert>}
            {bookings.map((booking) => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
                onAllocate={onAllocate}
                onDeallocate={onDeallocate}
                isWatched={watchlistIds.includes(booking.bookingId)}
                onToggleWatch={toggleWatchlist}
              />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: RECT_CARD_RADIUS, height: '100%', position: 'sticky', top: 112 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Recent System Alerts</Typography>
              <Typography variant="body2" sx={{ color: '#486581', mb: 2, lineHeight: 1.6 }}>
                Keep an eye on allocation changes, expiry handling, and manual admin actions here.
              </Typography>
              <Stack spacing={1.2}>
                {notifications.length === 0 && <Alert severity="info">No alerts yet.</Alert>}
                {notifications.slice(0, 6).map((n) => (
                  <Alert key={n.id} severity={n.type}>{n.message}</Alert>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Watchlist</Typography>
              <Typography variant="body2" sx={{ color: '#486581', mb: 1.4, lineHeight: 1.5 }}>
                Track critical bookings and quickly triage expiring payments.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.4 }}>
                <Chip label={`Watched: ${watchedBookings.length}`} color="warning" sx={{ borderRadius: RECT_CONTROL_RADIUS }} />
                <Chip label={`Auto-risk: ${riskyBookings.length}`} color="error" sx={{ borderRadius: RECT_CONTROL_RADIUS }} />
              </Stack>

              <Stack spacing={1}>
                {riskyBookings.slice(0, 4).map((booking) => (
                  <Box key={`risk-${booking.bookingId}`} sx={{ p: 1.2, border: '1px solid #f1dddd', background: '#fff8f8', borderRadius: RECT_CARD_RADIUS }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#8b2f2f' }}>
                      {booking.userName} • {booking.seatNumber}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#5d6f7a', mb: 0.8 }}>
                      {booking.theatreName} | {booking.eventName}
                    </Typography>
                    <Button
                      size="small"
                      variant={watchlistIds.includes(booking.bookingId) ? 'contained' : 'outlined'}
                      color="warning"
                      sx={{ borderRadius: RECT_CONTROL_RADIUS }}
                      onClick={() => toggleWatchlist(booking.bookingId)}
                    >
                      {watchlistIds.includes(booking.bookingId) ? 'Watching' : 'Add to watchlist'}
                    </Button>
                  </Box>
                ))}
                {riskyBookings.length === 0 && (
                  <Alert severity="success">No high-risk bookings right now.</Alert>
                )}
              </Stack>

              {watchedBookings.length > 0 && (
                <Stack spacing={0.8} sx={{ mt: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#334e68', fontSize: '0.85rem' }}>Watched bookings</Typography>
                  {watchedBookings.slice(0, 5).map((booking) => (
                    <Typography key={`watched-${booking.bookingId}`} sx={{ fontSize: '0.8rem', color: '#486581' }}>
                      #{booking.bookingId} • {booking.userName} • {booking.status.replace('_', ' ')}
                    </Typography>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
