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
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const statusColor = {
  PENDING_PAYMENT: 'warning',
  PAID: 'success',
  EXPIRED: 'error',
  DEALLOCATED: 'default',
};

function BookingCard({ booking, onAllocate, onDeallocate }) {
  const [friendName, setFriendName] = React.useState('');
  const [actionError, setActionError] = React.useState('');

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #e8e4d9', background: '#fffdf8' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2f3d2f' }}>
            {booking.userName} ({booking.userEmail})
          </Typography>
          <Chip size="small" label={booking.status.replace('_', ' ')} color={statusColor[booking.status] || 'default'} />
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
        </Stack>
        {actionError && <Alert severity="error" sx={{ mt: 1 }}>{actionError}</Alert>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard({ bookings, notifications, onAllocate, onDeallocate }) {
  const pending = bookings.filter((b) => b.status === 'PENDING_PAYMENT').length;
  const paid = bookings.filter((b) => b.status === 'PAID').length;
  const expired = bookings.filter((b) => b.status === 'EXPIRED').length;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Card sx={{ mb: 3, borderRadius: 5, background: 'linear-gradient(135deg, rgba(15,139,141,0.92) 0%, rgba(10,107,109,0.95) 100%)', color: 'white' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em' }}>
            Admin Threat & Allocation Dashboard
          </Typography>
          <Typography sx={{ opacity: 0.92, maxWidth: 840, lineHeight: 1.7 }}>
            Monitor all theatres and threat areas, allocate seats for friends, and enforce the 24-hour payment policy from one clear control surface.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 4, background: 'linear-gradient(145deg, #fff7e5 0%, #fff1c9 100%)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: '#9b6f00', fontWeight: 800 }}>Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#7d5900' }}>{pending}</Typography>
              <Typography sx={{ color: '#6d5b33' }}>Bookings awaiting payment</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 4, background: 'linear-gradient(145deg, #e5f8ea 0%, #cff1d6 100%)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: '#267349', fontWeight: 800 }}>Paid</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#245f3b' }}>{paid}</Typography>
              <Typography sx={{ color: '#4b6b57' }}>Confirmed bookings</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 4, background: 'linear-gradient(145deg, #ffe8e8 0%, #ffd4d4 100%)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: '#a73f3f', fontWeight: 800 }}>Expired</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#8b2f2f' }}>{expired}</Typography>
              <Typography sx={{ color: '#734f4f' }}>Auto-deallocated bookings</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 5, height: '100%', position: 'sticky', top: 112 }}>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
