

import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import Navbar from './components/Navbar';
import MotivationalBlock from './components/MotivationalBlock';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import TheatreDashboard from './pages/TheatreDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import {
  threatAreas as fallbackThreatAreas,
  theatres as fallbackTheatres,
  eventSchedules as fallbackEventSchedules,
  seatNumbers as fallbackSeatNumbers,
} from './data/systemData';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const buildDemoData = () => {
  const theatreIdBySourceId = new Map();
  const theatreList = fallbackTheatres.map((theatre, index) => {
    const theatreId = index + 1;
    theatreIdBySourceId.set(theatre.id, theatreId);

    return {
      theatreId,
      name: theatre.name,
      area: theatre.area,
      mapQuery: theatre.mapQuery || theatre.name,
      movies: theatre.movies || [],
    };
  });

  const eventList = fallbackEventSchedules.map((event, index) => ({
    eventId: index + 1,
    theatreId: theatreIdBySourceId.get(event.theatreId) || theatreList[0]?.theatreId || 1,
    name: event.name,
    eventDate: event.date,
    eventTime: event.time,
    description: event.description,
  }));

  const seatsByEvent = Object.fromEntries(
    eventList.map((event) => [
      event.eventId,
      fallbackSeatNumbers.map((seatNumber, seatIndex) => ({
        seatId: event.eventId * 100 + seatIndex + 1,
        seatNumber,
        isBooked: false,
      })),
    ])
  );

  return { theatreList, eventList, seatsByEvent };
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f8b8d',
    },
    secondary: {
      main: '#e07a5f',
    },
    background: {
      default: '#f2f7f7',
      paper: '#fffcf8',
    },
    text: {
      primary: '#102a43',
      secondary: '#486581',
    },
  },
  typography: {
    fontFamily: '"Sora", "Manrope", "Segoe UI", sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 14,
          paddingInline: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(16, 42, 67, 0.09)',
          boxShadow: '0 10px 30px rgba(31, 64, 104, 0.08)',
        },
      },
    },
  },
});

function App() {
  const [currentUser, setCurrentUser] = React.useState(() => {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  });
  const [theatres, setTheatres] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [seatsByEvent, setSeatsByEvent] = React.useState({});
  const [bookings, setBookings] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [uiAlerts, setUiAlerts] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [globalError, setGlobalError] = React.useState('');
  const [dataNotice, setDataNotice] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const appendUiAlert = React.useCallback((type, message) => {
    setUiAlerts((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        message,
      },
      ...prev,
    ]);
  }, []);

  const fetchJson = React.useCallback(async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      throw new Error(data.message || `Request failed: ${url}`);
    }
    return data;
  }, []);

  const refreshCoreData = React.useCallback(async (activeUser) => {
    setLoadingData(true);
    setGlobalError('');
    setDataNotice('');
    try {
      const demoData = buildDemoData();
      const theatreData = await fetchJson('/theatre');
      const backendTheatres = theatreData.theatres || [];

      const theatreNameMap = new Map();
      const theatreList = [...backendTheatres];
      let nextTheatreId = theatreList.reduce((max, theatre) => Math.max(max, Number(theatre.theatreId) || 0), 0) + 1;

      demoData.theatreList.forEach((demoTheatre, index) => {
        const existing = theatreList.find((theatre) => theatre.name === demoTheatre.name || theatre.area === demoTheatre.area);
        if (existing) {
          theatreNameMap.set(demoTheatre.name, existing.theatreId);
          return;
        }

        const theatreId = nextTheatreId++;
        theatreList.push({
          theatreId,
          name: demoTheatre.name,
          area: demoTheatre.area,
          mapQuery: demoTheatre.mapQuery || demoTheatre.name,
          movies: demoTheatre.movies || [],
        });
        theatreNameMap.set(demoTheatre.name, theatreId);
      });

      theatreList.forEach((theatre) => {
        theatreNameMap.set(theatre.name, theatre.theatreId);
      });

      const theatreAreaCount = new Set(theatreList.map((theatre) => theatre.area).filter(Boolean)).size;
      if (theatreAreaCount < 2) {
        setDataNotice('Backend theatre data is limited. Showing extended theatre areas from demo data.');
      }
      setTheatres(theatreList);

      const eventData = await fetchJson('/event');
      const backendEvents = eventData.events || [];
      const eventList = [...backendEvents];
      const eventNameSet = new Set(eventList.map((event) => `${event.name}|${event.theatreId}|${event.eventDate}|${event.eventTime}`));
      let nextEventId = eventList.reduce((max, event) => Math.max(max, Number(event.eventId) || 0), 0) + 1;

      demoData.eventList.forEach((demoEvent, index) => {
        const demoTheatre = demoData.theatreList.find((theatre) => theatre.theatreId === demoEvent.theatreId);
        const mappedTheatreId = theatreNameMap.get(demoTheatre?.name || '') || theatreList[0]?.theatreId || 1;
        const signature = `${demoEvent.name}|${mappedTheatreId}|${demoEvent.eventDate}|${demoEvent.eventTime}`;

        if (eventNameSet.has(signature)) {
          return;
        }

        const eventId = nextEventId++;
        eventList.push({
          eventId,
          theatreId: mappedTheatreId,
          name: demoEvent.name,
          eventDate: demoEvent.eventDate,
          eventTime: demoEvent.eventTime,
          description: demoEvent.description,
        });
        eventNameSet.add(signature);
      });

      setEvents(eventList);

      const seatPairs = await Promise.all(
        eventList.map(async (eventItem) => {
          if (!eventItem.eventId) {
            return [null, []];
          }
          const seatsData = await fetchJson(`/seat?eventId=${eventItem.eventId}`);
          return [eventItem.eventId, seatsData.seats || []];
        })
      );

      const nextSeatsByEvent = {};
      seatPairs.forEach(([eventId, eventSeats]) => {
        if (eventId) {
          nextSeatsByEvent[eventId] = eventSeats;
        }
      });

      demoData.eventList.forEach((demoEvent) => {
        const demoTheatre = demoData.theatreList.find((theatre) => theatre.theatreId === demoEvent.theatreId);
        const mappedTheatreId = theatreNameMap.get(demoTheatre?.name || '') || theatreList[0]?.theatreId || 1;
        const matchedEvent = eventList.find(
          (eventItem) =>
            eventItem.name === demoEvent.name &&
            eventItem.theatreId === mappedTheatreId &&
            eventItem.eventDate === demoEvent.eventDate &&
            eventItem.eventTime === demoEvent.eventTime
        );

        if (matchedEvent && !nextSeatsByEvent[matchedEvent.eventId]) {
          nextSeatsByEvent[matchedEvent.eventId] = demoData.seatsByEvent[demoEvent.id === 'e1' ? 1 : demoEvent.id === 'e2' ? 2 : demoEvent.id === 'e3' ? 3 : 4] || [];
        }
      });

      setSeatsByEvent(nextSeatsByEvent);

      const allUsersData = await fetchJson('/user');
      const userList = allUsersData.users || [];

      const bookingEndpoint = !activeUser
        ? '/booking'
        : activeUser.role === 'ADMIN'
          ? '/booking'
          : activeUser.role === 'THEATRE' && activeUser.theatreId
            ? `/booking?theatreId=${activeUser.theatreId}`
            : activeUser.role === 'USER' && activeUser.userId
              ? `/booking?userId=${activeUser.userId}`
              : '/booking';

      const bookingData = await fetchJson(bookingEndpoint);
      const baseBookings = bookingData.bookings || [];

      const userMap = Object.fromEntries(userList.map((u) => [u.userId, u]));
      const theatreMap = Object.fromEntries(theatreList.map((t) => [t.theatreId, t]));
      const eventMap = Object.fromEntries(eventList.map((e) => [e.eventId, e]));

      const normalizedBookings = baseBookings.map((booking) => {
        const eventItem = eventMap[booking.eventId];
        const theatreItem = eventItem ? theatreMap[eventItem.theatreId] : null;
        const userItem = userMap[booking.userId];
        const eventSeats = nextSeatsByEvent[booking.eventId] || [];
        const seatItem = eventSeats.find((seat) => seat.seatId === booking.seatId);

        return {
          ...booking,
          id: booking.bookingId,
          userName: userItem?.username || `User ${booking.userId}`,
          userEmail: userItem?.email || 'unknown@mail.local',
          theatreId: eventItem?.theatreId || null,
          theatreName: theatreItem?.name || 'Unknown Theatre',
          threatArea: theatreItem?.area || userItem?.threatArea || 'Unknown Area',
          eventName: eventItem?.name || 'Unknown Event',
          eventDate: eventItem?.eventDate || '',
          eventTime: eventItem?.eventTime || '',
          seatNumber: seatItem?.seatNumber || `Seat ${booking.seatId}`,
          allocatedTo: booking.allocatedFriendName || '',
          paymentDeadline: booking.paymentDeadline,
        };
      });

      setBookings(normalizedBookings);

      if (activeUser && activeUser.role === 'USER' && activeUser.userId) {
        const notifData = await fetchJson(`/notification?userId=${activeUser.userId}`);
        setNotifications(notifData.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      const demoData = buildDemoData();
      setTheatres(demoData.theatreList);
      setEvents(demoData.eventList);
      setSeatsByEvent(demoData.seatsByEvent);
      setBookings([]);
      setNotifications([]);
      setDataNotice('Backend data is temporarily unavailable. Showing demo content instead.');
      setGlobalError('');
    } finally {
      setLoadingData(false);
    }
  }, [fetchJson]);

  React.useEffect(() => {
    refreshCoreData(currentUser);
  }, [currentUser, refreshCoreData]);

  const onLogin = async ({ username, password, expectedRole }) => {
    const formData = new URLSearchParams();
    formData.append('action', 'login');
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch('/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Login failed.');
    }

    if (expectedRole && data.user?.role !== expectedRole) {
      throw new Error(`This account is ${data.user?.role || 'UNKNOWN'}, not ${expectedRole}.`);
    }

    setCurrentUser(data.user);
    return data.user;
  };

  const onLogout = () => {
    setCurrentUser(null);
    setBookings([]);
    setNotifications([]);
    setUiAlerts([]);
  };

  const onBookSeat = async ({ eventId, seatId }) => {
    if (!currentUser) {
      return { ok: false, message: 'Please login first.' };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('action', 'create');
      formData.append('userId', String(currentUser.userId));
      formData.append('eventId', String(eventId));
      formData.append('seatId', String(seatId));

      await fetchJson('/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      appendUiAlert('info', 'Seat reserved. Complete payment within 24 hours.');
      await refreshCoreData(currentUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Booking failed.' };
    }
  };

  const onPayNow = async (bookingId) => {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'pay');
      formData.append('bookingId', String(bookingId));
      formData.append('userId', String(currentUser.userId));

      await fetchJson('/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      appendUiAlert('success', 'Payment successful. Seat is confirmed.');
      await refreshCoreData(currentUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Payment failed.' };
    }
  };

  const onAllocate = async (bookingId, friendName) => {
    const cleanName = friendName.trim();
    if (!cleanName) {
      return { ok: false, message: 'Friend name is required.' };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('action', 'allocate');
      formData.append('bookingId', String(bookingId));
      formData.append('friendName', cleanName);

      await fetchJson('/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      appendUiAlert('info', `Seat allocated to ${cleanName}.`);
      await refreshCoreData(currentUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Allocation failed.' };
    }
  };

  const onDeallocate = async (bookingId) => {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'deallocate');
      formData.append('bookingId', String(bookingId));

      await fetchJson('/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      appendUiAlert('warning', 'Booking deallocated by admin.');
      await refreshCoreData(currentUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Deallocation failed.' };
    }
  };

  const onAddEvent = async ({ theatreId, name, eventDate, eventTime, location, description }) => {
    if (!theatreId || !name || !eventDate || !eventTime) {
      return { ok: false, message: 'Please fill event name, date, and time.' };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('action', 'add');
      formData.append('theatreId', String(theatreId));
      formData.append('name', name.trim());
      formData.append('eventDate', eventDate);
      formData.append('eventTime', eventTime);
      formData.append('location', location?.trim() || 'Main Hall');
      formData.append('description', description?.trim() || 'New theatre schedule update');

      await fetchJson('/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      appendUiAlert('success', 'New theatre event added successfully.');
      await refreshCoreData(currentUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Could not add event.' };
    }
  };

  const onNotifyUsers = async (theatreId, message) => {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'theatre-alert');
      formData.append('theatreId', String(theatreId));
      formData.append('subject', 'Theatre Schedule Update');
      formData.append('message', message);

      const data = await fetchJson('/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      appendUiAlert('info', `Mail notifications sent to ${data.sentCount || 0} user(s).`);
      await refreshCoreData(currentUser);
      return { ok: true, message: `Mail sent to ${data.sentCount || 0} user(s).` };
    } catch (error) {
      return { ok: false, message: error.message || 'Notification failed.' };
    }
  };

  const theatreData = React.useMemo(() => {
    if (!currentUser || currentUser.role !== 'THEATRE') {
      return null;
    }
    const theatre = theatres.find((t) => t.theatreId === currentUser.theatreId);
    if (!theatre) {
      return null;
    }
    return {
      ...theatre,
      movies: [],
      events: events.filter((e) => e.theatreId === theatre.theatreId),
    };
  }, [currentUser, theatres, events]);

  const theatreBookings = React.useMemo(() => {
    if (!currentUser || currentUser.role !== 'THEATRE') {
      return [];
    }
    return bookings;
  }, [bookings, currentUser]);

  const threatAreas = React.useMemo(() => {
    const fromTheatre = theatres.map((t) => t.area).filter(Boolean);
    const merged = Array.from(new Set([...fallbackThreatAreas, ...fromTheatre]));
    return merged;
  }, [theatres]);

  const dashboardNotifications = React.useMemo(() => {
    if (currentUser?.role === 'USER') {
      return notifications.map((n) => ({
        id: n.notificationId,
        type: 'info',
        message: `${n.subject}: ${n.message}`,
      }));
    }
    return uiAlerts;
  }, [currentUser, notifications, uiAlerts]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const AppBody = () => {
    const location = useLocation();
    const showMotivation = !['/', '/user-dashboard', '/admin-dashboard', '/theatre-dashboard'].includes(location.pathname);

    return (
      <>
        <Navbar currentUser={currentUser} onLogout={onLogout} />
        {showMotivation && <MotivationalBlock />}
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          {dataNotice && <Alert severity="warning" sx={{ mt: 2 }}>{dataNotice}</Alert>}
          {globalError && <Alert severity="error" sx={{ mt: 2 }}>{globalError}</Alert>}
          {loadingData && <Alert severity="info" sx={{ mt: 2 }}>Syncing backend data...</Alert>}
        </Box>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <Login
                currentUser={currentUser}
                onLogin={onLogin}
                theatres={theatres}
                threatAreas={threatAreas}
              />
            }
          />
          <Route path="/register" element={<Register theatres={theatres} threatAreas={threatAreas} />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard
                  bookings={bookings}
                  notifications={dashboardNotifications}
                  onAllocate={onAllocate}
                  onDeallocate={onDeallocate}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard
                  currentUser={currentUser}
                  theatres={theatres}
                  events={events}
                  seatsByEvent={seatsByEvent}
                  bookings={bookings}
                  onBookSeat={onBookSeat}
                  onPayNow={onPayNow}
                  notifications={dashboardNotifications}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theatre-dashboard"
            element={
              <ProtectedRoute allowedRoles={['THEATRE']}>
                <TheatreDashboard
                  currentUser={currentUser}
                  theatreData={theatreData}
                  theatreBookings={theatreBookings}
                  onAddEvent={onAddEvent}
                  onNotifyUsers={onNotifyUsers}
                  notifications={dashboardNotifications}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-shell">
        <Box className="app-orb app-orb-one" />
        <Box className="app-orb app-orb-two" />
        <Router>
          <AppBody />
          <ChatbotWidget
            currentUser={currentUser}
            theatres={theatres}
            events={events}
            bookings={bookings}
          />
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
