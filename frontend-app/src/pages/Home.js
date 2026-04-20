
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Stack, Typography } from '@mui/material';
import './Home.css';
import heroIllustration from '../assets/hero-booking.svg';

const roleScenes = {
  USER: {
    label: 'User flow',
    title: 'Book fast. Pay on time. Stay in control.',
    description: 'Browse events, reserve a seat, and keep a live payment deadline in view.',
    accent: '#0f8b8d',
    bullets: ['Seat map selection', '24h payment window', 'Personal notifications'],
  },
  ADMIN: {
    label: 'Admin control',
    title: 'Monitor bookings and manage the system from one console.',
    description: 'View every booking, reassign seats, and keep theatre operations stable.',
    accent: '#c85a38',
    bullets: ['All bookings in one queue', 'Allocate or deallocate', 'System-wide visibility'],
  },
  THEATRE: {
    label: 'Theatre desk',
    title: 'Publish show updates and notify users instantly.',
    description: 'Create events, update schedules, and keep your audience informed.',
    accent: '#6b5df7',
    bullets: ['Schedule updates', 'User mail alerts', 'Event planning tools'],
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedScene, setSelectedScene] = React.useState('USER');
  const scene = roleScenes[selectedScene];

  return (
    <main className="home-page page-entrance">
      <section className="home-wrap">
        <div className="home-orb home-orb-a" />
        <div className="home-orb home-orb-b" />
        <div className="home-statusbar">
          <Chip label="Live booking mode" size="small" sx={{ background: 'rgba(15, 139, 141, 0.12)', color: '#0f8b8d', fontWeight: 800 }} />
          <Box className="home-marquee">
            <span>Admin control center</span>
            <span>User seat flow</span>
            <span>Theatre schedule desk</span>
            <span>24h payment watch</span>
          </Box>
        </div>

        <div className="hero-grid">
          <div className="hero-left">
            <span className="hero-pill">Live, role-based booking system</span>
            <h1>A cleaner way to manage theatre bookings.</h1>
            <p>
              Admin, User, and Theatre teams work from one coordinated interface with one active booking per user,
              24-hour payment control, and instant theatre notifications.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" type="button" onClick={() => navigate('/login')}>Start With Login</button>
              <button className="btn-secondary" type="button" onClick={() => navigate('/register')}>Create User Account</button>
            </div>

            <div className="scene-toggle" aria-label="Role preview switcher">
              {Object.entries(roleScenes).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={`scene-chip ${selectedScene === key ? 'active' : ''}`}
                  onClick={() => setSelectedScene(key)}
                  style={selectedScene === key ? { '--scene-accent': item.accent } : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <section className="scene-panel" style={{ '--scene-accent': scene.accent }}>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ color: scene.accent, fontWeight: 900, letterSpacing: '0.14em' }}>
                  {scene.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#102a43', lineHeight: 1.1 }}>
                  {scene.title}
                </Typography>
                <Typography sx={{ color: '#486581', fontWeight: 600, lineHeight: 1.65 }}>
                  {scene.description}
                </Typography>
                <Box className="scene-pills">
                  {scene.bullets.map((bullet) => (
                    <span key={bullet}>{bullet}</span>
                  ))}
                </Box>
              </Stack>
            </section>

            <div className="kpi-row">
              <article className="kpi"><strong>24h</strong><span>payment window</span></article>
              <article className="kpi"><strong>3</strong><span>role dashboards</span></article>
              <article className="kpi"><strong>1</strong><span>active seat per user</span></article>
              <article className="kpi"><strong>100%</strong><span>Java + MySQL backend</span></article>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <img className="hero-illustration" src={heroIllustration} alt="Theatre booking illustration" />
          </div>
        </div>

        <section className="flow-strip">
          <h2>Simple flow</h2>
          <p>Login, choose theatre event, book a seat, pay within 24 hours, and keep everything tracked from one screen.</p>
        </section>

        <section className="feature-grid feature-grid-modern">
          <article className="feature-card feature-card-glow">
            <div className="feature-badge" />
            <h3>01</h3>
            <h4>Animated seat path</h4>
            <p>Scroll-aware layers, floating orbs, and a live role switcher make the landing page feel responsive instead of static.</p>
          </article>
          <article className="feature-card feature-card-glow">
            <div className="feature-badge" />
            <h3>02</h3>
            <h4>Role preview switcher</h4>
            <p>Use the interactive role cards to preview what each dashboard is meant to do before you log in or sign up.</p>
          </article>
          <article className="feature-card feature-card-glow">
            <div className="feature-badge" />
            <h3>03</h3>
            <h4>Motion-first layout</h4>
            <p>Subtle drifting backgrounds, shimmering panels, and layered cards create a more premium booking experience.</p>
          </article>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <div className="feature-badge" />
            <h3>24h</h3>
            <h4>payment window</h4>
            <p>Track threat areas, monitor pending seats, allocate to friends, and declutter unpaid bookings automatically.</p>
          </article>
          <article className="feature-card">
            <div className="feature-badge" />
            <h3>3</h3>
            <h4>role dashboards</h4>
            <p>Select theatre, event, and seat with a clear map-based location interface for fast booking.</p>
          </article>
          <article className="feature-card">
            <div className="feature-badge" />
            <h3>100%</h3>
            <h4>Java + MySQL backend</h4>
            <p>Push schedule updates to users and review all active bookings from a focused theatre dashboard.</p>
          </article>
        </section>

        <section className="home-cta-band">
          <div>
            <h2>Ready to book with the right role?</h2>
            <p>Jump into the dashboard that matches your account and keep the whole flow in one place.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate('/login')}>Open Login</button>
        </section>
      </section>
      <footer className="home-footer">© 2026 EventBooking | All Rights Reserved</footer>
    </main>
  );
}
