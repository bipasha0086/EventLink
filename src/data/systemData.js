export const threatAreas = [
  'Downtown',
  'North Zone',
  'East Side',
  'West End',
  'University Belt',
];

export const theatres = [
  {
    id: 't1',
    name: 'CineSphere Downtown',
    area: 'Downtown',
    mapQuery: 'CineSphere Downtown',
    movies: [
      { title: 'Skyline Chase', timing: '10:00 AM' },
      { title: 'Ocean Pulse', timing: '1:30 PM' },
      { title: 'Hidden Code', timing: '7:15 PM' },
    ],
  },
  {
    id: 't2',
    name: 'Nova Screen East',
    area: 'East Side',
    mapQuery: 'Nova Screen East',
    movies: [
      { title: 'Midnight Orbit', timing: '11:00 AM' },
      { title: 'Quantum Hearts', timing: '4:00 PM' },
      { title: 'City Sparks', timing: '8:45 PM' },
    ],
  },
  {
    id: 't3',
    name: 'StarView North',
    area: 'North Zone',
    mapQuery: 'StarView North',
    movies: [
      { title: 'Solar Drift', timing: '9:30 AM' },
      { title: 'Paper Wings', timing: '3:00 PM' },
      { title: 'Final Signal', timing: '9:00 PM' },
    ],
  },
];

export const eventSchedules = [
  {
    id: 'e1',
    theatreId: 't1',
    name: 'Music Night Live',
    date: '2026-04-08',
    time: '06:00 PM',
    description: 'Local bands and indie artists in one show.',
  },
  {
    id: 'e2',
    theatreId: 't1',
    name: 'Stand-Up Marathon',
    date: '2026-04-10',
    time: '08:00 PM',
    description: 'Top comedians from across the city.',
  },
  {
    id: 'e3',
    theatreId: 't2',
    name: 'Anime Fan Fest',
    date: '2026-04-09',
    time: '05:30 PM',
    description: 'Cosplay, screening, and community meetups.',
  },
  {
    id: 'e4',
    theatreId: 't3',
    name: 'Classic Retro Night',
    date: '2026-04-11',
    time: '07:00 PM',
    description: 'Timeless classics back on the big screen.',
  },
];

export const seatNumbers = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
