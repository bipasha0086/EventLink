import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const normalizeText = (value) => String(value || '').toLowerCase();

const tokenizeSearch = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const cinemaIntentTokens = new Set(['pvr', 'inox', 'cinepolis', 'cinema', 'theatre', 'theater', 'mall', 'screen']);
const toNumber = (value) => Number(value);

export default function UserDashboard({ currentUser, theatres, events, seatsByEvent, bookings, onBookSeat, onPayNow, notifications }) {
  const [searchText, setSearchText] = React.useState('');
  const [selectedArea, setSelectedArea] = React.useState(theatres[0]?.area || '');
  const [selectedTheatre, setSelectedTheatre] = React.useState(theatres[0]?.theatreId || '');
  const [selectedEvent, setSelectedEvent] = React.useState('');
  const [selectedSeat, setSelectedSeat] = React.useState('');
  const [bookingError, setBookingError] = React.useState('');
  const [paymentError, setPaymentError] = React.useState('');

  const searchTokens = React.useMemo(() => tokenizeSearch(searchText), [searchText]);
  const isCinemaIntentSearch = React.useMemo(
    () => searchTokens.some((token) => cinemaIntentTokens.has(token)),
    [searchTokens]
  );

  const theatresBySearch = React.useMemo(() => {
    if (!searchTokens.length || isCinemaIntentSearch) {
      return theatres;
    }
    return theatres.filter((theatre) => {
      const haystack = normalizeText(`${theatre.name || ''} ${theatre.area || ''} ${theatre.mapQuery || ''}`);
      return searchTokens.some((token) => haystack.includes(token));
    });
  }, [theatres, searchTokens, isCinemaIntentSearch]);

  const areaOptions = React.useMemo(
    () => Array.from(new Set(theatresBySearch.map((t) => t.area).filter(Boolean))),
    [theatresBySearch]
  );

  React.useEffect(() => {
    if (!selectedTheatre && theatres.length > 0) {
      setSelectedTheatre(toNumber(theatres[0].theatreId));
    }
  }, [selectedTheatre, theatres]);

  React.useEffect(() => {
    if (areaOptions.length === 0) {
      setSelectedArea('');
      return;
    }
    if (!selectedArea || !areaOptions.includes(selectedArea)) {
      setSelectedArea(areaOptions[0]);
    }
  }, [selectedArea, areaOptions]);

  const filteredTheatres = React.useMemo(() => {
    if (!selectedArea) {
      return theatresBySearch;
    }
    return theatresBySearch.filter((t) => t.area === selectedArea);
  }, [theatresBySearch, selectedArea]);

  React.useEffect(() => {
    if (!filteredTheatres.length) {
      setSelectedTheatre('');
      setSelectedEvent('');
      setSelectedSeat('');
      return;
    }

    const stillValid = filteredTheatres.some((t) => toNumber(t.theatreId) === toNumber(selectedTheatre));
    if (!stillValid) {
      setSelectedTheatre(toNumber(filteredTheatres[0].theatreId));
      setSelectedEvent('');
      setSelectedSeat('');
    }
  }, [filteredTheatres, selectedTheatre]);

  const theatreById = React.useMemo(
    () => new Map(theatres.map((theatre) => [toNumber(theatre.theatreId), theatre])),
    [theatres]
  );
  const filteredTheatreIds = React.useMemo(
    () => new Set(filteredTheatres.map((theatre) => toNumber(theatre.theatreId))),
    [filteredTheatres]
  );

  const theatreEvents = React.useMemo(() => {
    const selectedTheatreId = toNumber(selectedTheatre);

    if (!searchTokens.length || isCinemaIntentSearch) {
      return events.filter((eventItem) => toNumber(eventItem.theatreId) === selectedTheatreId);
    }
    if (!filteredTheatreIds.size) {
      return events.filter((eventItem) => toNumber(eventItem.theatreId) === selectedTheatreId);
    }
    return events.filter((eventItem) => filteredTheatreIds.has(toNumber(eventItem.theatreId)));
  }, [events, selectedTheatre, filteredTheatreIds, searchTokens, isCinemaIntentSearch]);

  React.useEffect(() => {
    if (selectedEvent && !theatreEvents.some((eventItem) => toNumber(eventItem.eventId) === toNumber(selectedEvent))) {
      setSelectedEvent('');
      setSelectedSeat('');
    }
  }, [selectedEvent, theatreEvents]);

  React.useEffect(() => {
    if (!selectedEvent && theatreEvents.length > 0) {
      setSelectedEvent(toNumber(theatreEvents[0].eventId));
    }
  }, [selectedEvent, theatreEvents]);

  const selectedEventInfo = theatreEvents.find((e) => toNumber(e.eventId) === toNumber(selectedEvent));
  const userBooking = bookings.find(
    (b) => b.userId === currentUser.userId && (b.status === 'PENDING_PAYMENT' || b.status === 'PAID')
  );

  const selectedEventSeats = React.useMemo(() => seatsByEvent[selectedEvent] || [], [seatsByEvent, selectedEvent]);
  const selectedSeatInfo = selectedEventSeats.find((seat) => seat.seatId === selectedSeat) || null;
  const seatPrice = 45;
  const totalAmount = selectedSeatInfo ? seatPrice : 0;
  const availableSeatCount = React.useMemo(
    () => selectedEventSeats.filter((seat) => !seat.isBooked).length,
    [selectedEventSeats]
  );
  const selectedSeatLabel = selectedSeatInfo?.seatNumber || '-';

  const seatGrid = React.useMemo(() => {
    const grouped = {};

    selectedEventSeats.forEach((seat) => {
      const match = String(seat.seatNumber || '').match(/^([A-Za-z]+)(\d+)$/);
      const row = match ? match[1].toUpperCase() : 'R';
      const col = match ? Number(match[2]) : 0;
      if (!grouped[row]) {
        grouped[row] = [];
      }
      grouped[row].push({ ...seat, col });
    });

    const rows = Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([row, seats]) => [
        row,
        seats.sort((a, b) => a.col - b.col),
      ]);

    return rows;
  }, [selectedEventSeats]);

  const rowLabels = React.useMemo(() => {
    const defaultRows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const dynamic = seatGrid.map(([row]) => row);
    const merged = Array.from(new Set([...defaultRows, ...dynamic]));
    return merged;
  }, [seatGrid]);

  const maxSeatNumber = React.useMemo(() => {
    let max = 10;
    selectedEventSeats.forEach((seat) => {
      const match = String(seat.seatNumber || '').match(/^(?:[A-Za-z]+)(\d+)$/);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    });
    return max;
  }, [selectedEventSeats]);

  const aisleAfterColumn = Math.max(3, Math.floor(maxSeatNumber / 2));

  const seatLookup = React.useMemo(() => {
    const map = new Map();
    selectedEventSeats.forEach((seat) => {
      const match = String(seat.seatNumber || '').match(/^([A-Za-z]+)(\d+)$/);
      const row = match ? match[1].toUpperCase() : 'R';
      const col = match ? Number(match[2]) : 0;
      map.set(`${row}-${col}`, seat);
    });
    return map;
  }, [selectedEventSeats]);

  const handleBooking = async () => {
    setBookingError('');
    if (!selectedEvent || !selectedSeat) {
      setBookingError('Please select theatre event and seat.');
      return;
    }

    const result = await onBookSeat({
      eventId: Number(selectedEvent),
      seatId: Number(selectedSeat),
    });

    if (!result.ok) {
      setBookingError(result.message);
      return;
    }

    setSelectedSeat('');
  };

  const selectedTheatreInfo = theatres.find((t) => toNumber(t.theatreId) === toNumber(selectedTheatre));
  const selectedEventTheatre = selectedEventInfo ? theatreById.get(toNumber(selectedEventInfo.theatreId)) : null;
  const mapTargetTheatre = selectedEventTheatre || selectedTheatreInfo;
  const mapsQuery = mapTargetTheatre?.mapQuery || mapTargetTheatre?.name || searchText || selectedArea || '';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;

  const selectSx = {
    borderRadius: 3,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(16, 42, 67, 0.15)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(16, 42, 67, 0.3)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0f8b8d',
    },
    backgroundColor: 'rgba(255,255,255,0.8)',
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 120px)',
        px: { xs: 2, md: 4 },
        py: 2,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(circle at 12% 22%, rgba(134, 215, 223, 0.52) 0%, rgba(134, 215, 223, 0.08) 35%, transparent 54%), radial-gradient(circle at 86% 24%, rgba(242, 200, 184, 0.45) 0%, rgba(242, 200, 184, 0.08) 34%, transparent 56%), radial-gradient(circle at 68% 72%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.06) 46%, transparent 62%), linear-gradient(112deg, #d6ecee 0%, #f4eeea 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.52,
          background:
            'radial-gradient(circle at 22% 16%, rgba(145, 255, 255, 0.28) 0%, rgba(145, 255, 255, 0) 36%), radial-gradient(circle at 75% 32%, rgba(255, 214, 198, 0.22) 0%, rgba(255, 214, 198, 0) 44%)',
          filter: 'blur(4px)',
          animation: 'holoPulse 7s ease-in-out infinite',
          '@keyframes holoPulse': {
            '0%, 100%': { opacity: 0.45, transform: 'scale(1)' },
            '50%': { opacity: 0.68, transform: 'scale(1.02)' },
          },
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
          animation: 'sparkDrift 16s linear infinite',
          '@keyframes sparkDrift': {
            '0%': { backgroundPosition: '0 0, 0 0, 0 0' },
            '50%': { backgroundPosition: '18px -14px, -12px 16px, 14px 10px' },
            '100%': { backgroundPosition: '0 0, 0 0, 0 0' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.16,
          backgroundImage:
            'linear-gradient(90deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.02) 20%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 70%)',
          mixBlendMode: 'screen',
        }}
      />

      <Box sx={{ width: '100%', maxWidth: 1520, mx: 'auto', position: 'relative', zIndex: 2 }}>
      <Card sx={{ mb: 2.5, borderRadius: '18px', background: 'linear-gradient(130deg, #1c3557 0%, #2f4f79 100%)', color: 'white', boxShadow: '0 20px 38px rgba(16, 42, 67, 0.22)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em', fontSize: { xs: '2rem', md: '2.2rem' } }}>
            User Threat Board
          </Typography>
          <Typography sx={{ opacity: 0.92, maxWidth: 860, lineHeight: 1.7, fontSize: '1.05rem' }}>
            Book one seat in your preferred theatre, pay within 24 hours, and keep your allocation active with clear status tracking.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2.8, alignItems: 'stretch', flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box sx={{ width: { xs: '100%', lg: '36%' }, minWidth: 0 }}>
          <Card sx={{ borderRadius: '20px', mb: 2.2, overflow: 'hidden', background: 'linear-gradient(145deg, rgba(239,246,255,0.95) 0%, rgba(228,238,250,0.96) 100%)', border: '1px solid rgba(140, 170, 200, 0.25)', boxShadow: '0 18px 34px rgba(14, 44, 76, 0.1)' }}>
            <CardContent sx={{ pt: 2.8 }}>
              <Stack spacing={2.2}>
                <TextField
                  fullWidth
                  label="Search cinema / area"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setSelectedEvent('');
                    setSelectedSeat('');
                  }}
                  placeholder="Try: PVR, INOX, Downtown, West"
                  sx={selectSx}
                />

                {searchText.trim() && (
                  <Alert severity={filteredTheatres.length ? 'success' : 'warning'} sx={{ borderRadius: 2 }}>
                    {filteredTheatres.length
                      ? `Matched ${filteredTheatres.length} theatre location(s). Event list now reflects all matched areas.`
                      : 'No location matched this search. Clear the search to view all theatres.'}
                  </Alert>
                )}

                <FormControl fullWidth>
                  <InputLabel>Select Place / Area</InputLabel>
                  <Select
                    value={selectedArea}
                    label="Select Place / Area"
                    sx={selectSx}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setSelectedEvent('');
                      setSelectedSeat('');
                    }}
                  >
                    {areaOptions.map((area) => (
                      <MenuItem key={area} value={area}>{area}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Select Mall / Theatre</InputLabel>
                  <Select
                    value={selectedTheatre}
                    label="Select Mall / Theatre"
                    sx={selectSx}
                    onChange={(e) => {
                      setSelectedTheatre(Number(e.target.value));
                      setSelectedEvent('');
                      setSelectedSeat('');
                    }}
                  >
                    {filteredTheatres.map((t) => (
                      <MenuItem key={t.theatreId} value={t.theatreId}>
                        {t.name} ({t.area})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Select Event</InputLabel>
                  <Select
                    value={selectedEvent}
                    label="Select Event"
                    sx={selectSx}
                    onChange={(e) => {
                        setSelectedEvent(Number(e.target.value));
                      setSelectedSeat('');
                    }}
                  >
                    {theatreEvents.map((e) => (
                      <MenuItem key={e.eventId} value={e.eventId}>
                        {e.name} - {e.eventDate} {e.eventTime} ({theatreById.get(e.theatreId)?.name || 'Unknown Theatre'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedSeatInfo ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Selected seat: <strong>{selectedSeatInfo.seatNumber}</strong>
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Select one seat from the seat layout board.
                  </Alert>
                )}

                {bookingError && <Alert severity="error">{bookingError}</Alert>}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Alert severity="info" sx={{ borderRadius: 2, flex: 1 }}>
                    Select seat from the visual board and click Confirm Booking.
                  </Alert>
                  {userBooking && (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={async () => {
                        setPaymentError('');
                        const result = await onPayNow(userBooking.bookingId);
                        if (!result.ok) {
                          setPaymentError(result.message || 'Payment failed.');
                        }
                      }}
                      disabled={userBooking.status !== 'PENDING_PAYMENT'}
                    >
                      Pay Now
                    </Button>
                  )}
                </Stack>

                <Typography variant="body2" sx={{ color: '#556070' }}>
                  Google Map for theatre location:{' '}
                  <Link href={mapsUrl} target="_blank" rel="noreferrer">
                    Open {mapTargetTheatre?.name || searchText || selectedArea}
                  </Link>
                </Typography>

                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(16,42,67,0.12)', height: 150 }}>
                  {mapsQuery ? (
                    <Box
                      component="iframe"
                      title="Theatre location map"
                      src={mapsEmbedUrl}
                      sx={{ width: '100%', height: '100%', border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', color: '#607086', fontWeight: 600 }}>
                      Select area and theatre to preview map
                    </Box>
                  )}
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" label={`Area: ${selectedArea || '-'}`} sx={{ borderRadius: 2 }} />
                  <Chip size="small" label={`Theatre: ${mapTargetTheatre?.name || '-'}`} sx={{ borderRadius: 2 }} />
                  <Chip
                    size="small"
                    label={selectedEventInfo ? `Event: ${selectedEventInfo.name}` : 'Event: Select event'}
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(247, 250, 255, 0.95) 0%, rgba(238, 246, 251, 0.95) 100%)', border: '1px solid rgba(140, 170, 200, 0.25)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                My Booking
              </Typography>
              <Divider sx={{ mb: 1.6, borderColor: 'rgba(16,42,67,0.08)' }} />
              {!userBooking && <Alert severity="info" sx={{ borderRadius: 99, background: 'rgba(205, 235, 248, 0.65)', color: '#20405f' }}>You have no active seat booking.</Alert>}

              {userBooking && (
                <Stack spacing={1.1}>
                  <Typography><strong>Theatre:</strong> {userBooking.theatreName}</Typography>
                  <Typography><strong>Event:</strong> {userBooking.eventName}</Typography>
                  <Typography><strong>Seat:</strong> {userBooking.seatNumber}</Typography>
                  <Typography><strong>Status:</strong> {userBooking.status.replace('_', ' ')}</Typography>
                  <Typography>
                    <strong>Payment Deadline:</strong> {new Date(userBooking.paymentDeadline).toLocaleString()}
                  </Typography>
                  {userBooking.status === 'PENDING_PAYMENT' && paymentError && <Alert severity="error">{paymentError}</Alert>}
                  {userBooking.status === 'PAID' && <Alert severity="success">Seat confirmed. Payment received.</Alert>}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: '64%' }, minWidth: 0 }}>
          <Card sx={{ borderRadius: '28px', overflow: 'hidden', height: '100%', minHeight: 620, background: 'radial-gradient(circle at 20% 0%, rgba(46, 111, 184, 0.28) 0%, rgba(46, 111, 184, 0) 34%), radial-gradient(circle at 100% 18%, rgba(37, 197, 255, 0.12) 0%, rgba(37, 197, 255, 0) 30%), linear-gradient(180deg, #121a2a 0%, #0e1220 100%)', border: '1px solid rgba(92, 132, 183, 0.22)', boxShadow: '0 28px 60px rgba(5, 12, 25, 0.36)' }}>
            <CardContent sx={{ pt: 3, height: '100%', display: 'flex', flexDirection: 'column', color: '#eef4ff' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.2, mb: 2.2 }}>
                <Box
                  sx={{
                    width: { xs: '100%', md: 210 },
                    minWidth: { xs: '100%', md: 210 },
                    height: 272,
                    borderRadius: 4,
                    background: 'linear-gradient(160deg, rgba(62, 148, 232, 0.95) 0%, rgba(24, 35, 62, 0.95) 55%, rgba(11, 15, 28, 0.98) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 22px 38px rgba(0, 0, 0, 0.32)',
                    border: '1px solid rgba(131, 184, 255, 0.18)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 32%), radial-gradient(circle at 70% 80%, rgba(66, 212, 255, 0.24) 0%, rgba(66, 212, 255, 0) 38%)',
                    },
                  }}
                >
                  <Box sx={{ position: 'absolute', inset: 16, borderRadius: 3, background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Stack sx={{ position: 'absolute', inset: 18, justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.22em', color: 'rgba(234, 244, 255, 0.72)', fontWeight: 800 }}>
                        NOW SHOWING
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, lineHeight: 1.05, fontSize: { xs: '1.9rem', md: '2.05rem' } }}>
                        {selectedEventInfo ? selectedEventInfo.name : 'Select a Movie'}
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      <Chip
                        size="small"
                        label={mapTargetTheatre?.name || 'Choose a theatre'}
                        sx={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.14)', color: '#f2f7ff', borderRadius: 999, border: '1px solid rgba(255,255,255,0.14)' }}
                      />
                      <Typography sx={{ color: 'rgba(238, 245, 255, 0.76)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                        {selectedEventInfo
                          ? `Location ${selectedArea || '-'} • ${selectedEventInfo.eventDate} at ${selectedEventInfo.eventTime}`
                          : 'Pick a movie, then choose your seats and complete payment.'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.24em', color: 'rgba(199, 218, 255, 0.72)', fontWeight: 800, mb: 1 }}>
                    TICKET DETAILS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.15, fontSize: { xs: '1.7rem', md: '2.15rem' }, mb: 1.1 }}>
                    {selectedEventInfo ? selectedEventInfo.name : 'Select Your Movie'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(225, 235, 249, 0.84)', lineHeight: 1.75, mb: 1.6 }}>
                    Location: <strong>{selectedArea || '-'}</strong> | Theatre: <strong>{mapTargetTheatre?.name || '-'}</strong>
                    <br />
                    Time: <strong>{selectedEventInfo ? `${selectedEventInfo.eventDate} ${selectedEventInfo.eventTime}` : '-'}</strong>
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.8 }}>
                    <Chip size="small" label={`Seats Available: ${availableSeatCount}`} sx={{ borderRadius: 999, background: 'rgba(38, 192, 255, 0.14)', color: '#d8f0ff', border: '1px solid rgba(38, 192, 255, 0.22)' }} />
                    <Chip size="small" label={`Selected Seat: ${selectedSeatLabel}`} sx={{ borderRadius: 999, background: 'rgba(125, 202, 164, 0.14)', color: '#d8ffe8', border: '1px solid rgba(125, 202, 164, 0.22)' }} />
                    <Chip size="small" label={`Price: $${seatPrice.toFixed(2)}`} sx={{ borderRadius: 999, background: 'rgba(255, 255, 255, 0.08)', color: '#eef4ff', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </Stack>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.4, p: 1.4, borderRadius: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography sx={{ color: 'rgba(225,235,249,0.78)', fontWeight: 700 }}>Payment summary</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#ffffff', fontSize: '1.35rem' }}>
                      Total ${totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 1.8, px: 0.6, py: 0.55, borderRadius: 999, textAlign: 'center', fontWeight: 900, letterSpacing: '0.22em', color: '#eef4ff', background: 'linear-gradient(90deg, rgba(56,150,255,0.18) 0%, rgba(56,150,255,0.03) 50%, rgba(56,150,255,0.18) 100%)', border: '1px solid rgba(114, 173, 255, 0.2)' }}>
                SCREEN
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, px: 0.5, color: 'rgba(221, 233, 255, 0.72)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                <span>LEFT SIDE</span>
                <span>SCREEN FACING FRONT</span>
                <span>RIGHT SIDE</span>
              </Box>

              {!selectedEvent && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Select an event to view available and occupied seats.
                </Alert>
              )}

              {selectedEvent && seatGrid.length === 0 && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No seat data available for this event.
                </Alert>
              )}

              {selectedEvent && seatGrid.length > 0 && (
                <Box
                  sx={{
                    position: 'relative',
                    mb: 2.2,
                    p: { xs: 1.8, md: 2.6 },
                    borderRadius: 4,
                    background: 'linear-gradient(180deg, rgba(17, 23, 38, 0.98) 0%, rgba(15, 19, 32, 0.96) 100%)',
                    border: '1px solid rgba(116, 150, 196, 0.22)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03), 0 32px 60px rgba(3, 8, 18, 0.35)',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    animation: 'seatBoardFloat 7s ease-in-out infinite',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(95deg, rgba(87,190,255,0.18) 0%, rgba(87,190,255,0.04) 42%, rgba(255,255,255,0) 74%), linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 32%)',
                      animation: 'seatHoloScan 5.8s linear infinite',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: 520,
                      height: 340,
                      right: -140,
                      top: -110,
                      background: 'radial-gradient(circle, rgba(84, 164, 255, 0.28) 0%, rgba(84, 164, 255, 0) 65%)',
                      filter: 'blur(10px)',
                    },
                    '@keyframes seatHoloScan': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                    '@keyframes seatBoardFloat': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-3px)' },
                    },
                  }}
                >
                  <Stack spacing={1.05} sx={{ position: 'relative', zIndex: 1, minWidth: 820 }}>
                    {rowLabels.map((rowLabel) => (
                      <Box key={rowLabel} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: '100%' }}>
                        <Typography sx={{ width: 22, color: '#d5e7ff', fontWeight: 800, fontSize: '1rem' }}>{rowLabel}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 0.9, flex: 1, justifyContent: 'center' }}>
                          {Array.from({ length: maxSeatNumber }, (_, i) => i + 1).map((col) => {
                            const seat = seatLookup.get(`${rowLabel}-${col}`);
                            const isMissing = !seat;
                            const isSelected = seat ? seat.seatId === selectedSeat : false;
                            const isOccupied = seat ? !!seat.isBooked : false;
                            const bg = isMissing
                              ? 'linear-gradient(145deg, #f2f6fa 0%, #e4ebf2 100%)'
                              : isOccupied
                                ? 'linear-gradient(145deg, #e8edf3 0%, #d5dce4 100%)'
                                : isSelected
                                  ? 'linear-gradient(145deg, #8cccaa 0%, #63b589 100%)'
                                  : 'linear-gradient(145deg, #d9edf9 0%, #a9d8f0 100%)';
                            const color = isMissing ? '#a9b4c1' : isOccupied ? '#8a95a2' : isSelected ? '#ffffff' : '#234d66';

                            return (
                              <Box
                                key={`${rowLabel}-${col}`}
                                role="button"
                                onClick={() => {
                                  if (isMissing || isOccupied || userBooking || !seat) {
                                    return;
                                  }
                                  setSelectedSeat(seat.seatId);
                                  setBookingError('');
                                }}
                                sx={{
                                  width: { xs: 32, md: 36 },
                                  height: { xs: 32, md: 36 },
                                  borderRadius: 999,
                                  border: `1px solid ${isSelected ? '#4bb4ff' : 'rgba(120, 166, 214, 0.2)'}`,
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: isMissing || isOccupied || userBooking ? 'not-allowed' : 'pointer',
                                  backgroundColor: bg,
                                  backgroundImage: bg,
                                  color,
                                  opacity: isMissing ? 0.88 : isOccupied ? 0.8 : 1,
                                  transform: isSelected ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
                                  boxShadow: isSelected
                                    ? '0 16px 28px rgba(57, 168, 255, 0.42), inset 0 1px 0 rgba(255,255,255,0.55)'
                                    : isOccupied
                                      ? 'inset 0 1px 0 rgba(255,255,255,0.58)'
                                      : 'inset 0 1px 0 rgba(255,255,255,0.66)',
                                  animation: isSelected ? 'seatPulse 1.8s ease-in-out infinite' : 'none',
                                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
                                  '@keyframes seatPulse': {
                                    '0%, 100%': { transform: 'translateY(-2px) scale(1.05)' },
                                    '50%': { transform: 'translateY(-4px) scale(1.08)' },
                                  },
                                  '&:hover': {
                                    transform: isMissing || isOccupied || userBooking ? 'none' : 'translateY(-3px) scale(1.06)',
                                    boxShadow: isMissing || isOccupied || userBooking ? 'none' : '0 16px 26px rgba(57, 168, 255, 0.26)',
                                    filter: isMissing || isOccupied || userBooking ? 'none' : 'brightness(1.02)',
                                  },
                                }}
                                title={seat ? `${seat.seatNumber}${isOccupied ? ' (Occupied)' : ''}` : `No seat ${rowLabel}${col}`}
                              >
                                {isMissing ? col : isOccupied ? 'x' : col}
                              </Box>
                            );
                          })}
                          <Box
                            sx={{
                              width: 18,
                              height: 28,
                              borderLeft: '1px dashed rgba(157, 187, 221, 0.28)',
                              borderRight: '1px dashed rgba(157, 187, 221, 0.28)',
                              opacity: 0.9,
                              mx: 0.4,
                            }}
                            title="Aisle"
                          />
                        </Box>
                      </Box>
                    ))}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: '30px', pt: 0.25 }}>
                      {Array.from({ length: maxSeatNumber }, (_, i) => i + 1).map((col) => (
                        <Typography
                          key={`axis-${col}`}
                          sx={{ width: { xs: 32, md: 36 }, textAlign: 'center', fontSize: '0.72rem', color: 'rgba(221, 233, 255, 0.72)', fontWeight: 700 }}
                        >
                          {col}
                        </Typography>
                      ))}
                      <Typography sx={{ width: 18, textAlign: 'center', fontSize: '0.65rem', color: 'rgba(221, 233, 255, 0.72)', fontWeight: 900 }}>
                        |
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              <Box
                sx={{
                  mt: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1.2,
                  borderRadius: 99,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(146, 173, 196, 0.2)',
                  boxShadow: '0 10px 24px rgba(3, 8, 18, 0.18)',
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
                  <Chip size="small" label="Available" sx={{ background: 'linear-gradient(145deg, #28a8ff 0%, #1d77d3 100%)', color: '#ffffff', borderRadius: 2 }} />
                  <Chip size="small" label="Selected" sx={{ background: 'linear-gradient(145deg, #5fd08a 0%, #3eb86f 100%)', color: '#ffffff', borderRadius: 2 }} />
                  <Chip size="small" label="Occupied" sx={{ background: 'linear-gradient(145deg, #576273 0%, #3d4656 100%)', color: '#ffffff', borderRadius: 2 }} />
                  <Chip size="small" label={`Aisle after ${aisleAfterColumn}`} sx={{ background: 'linear-gradient(145deg, #202738 0%, #1a2030 100%)', color: '#c7d6f0', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }} />
                </Stack>
                <Typography sx={{ fontWeight: 800, color: '#eef4ff', pr: 1 }}>
                  Total ${totalAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.8 }}>
                <Button
                  variant="contained"
                  onClick={handleBooking}
                  disabled={!selectedSeat || !!userBooking || !selectedEvent}
                  sx={{
                    minWidth: 260,
                    borderRadius: 99,
                    py: 1.25,
                    fontWeight: 900,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #37a7ff 0%, #2b79ff 100%)',
                    boxShadow: '0 18px 30px rgba(38, 115, 255, 0.34)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2897f0 0%, #155fe0 100%)',
                    },
                  }}
                >
                  Proceed to Payment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Typography sx={{ textAlign: 'center', mt: 2.6, color: '#f8fcff', textShadow: '0 1px 1px rgba(0,0,0,0.2)', fontSize: '1rem', fontWeight: 500 }}>
        © 2026 EventBooking | All Rights Reserved
      </Typography>
      </Box>
    </Box>
  );
}
