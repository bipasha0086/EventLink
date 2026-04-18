
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import heroIllustration from '../assets/hero-booking.svg';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <section className="home-wrap">
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
      </section>
      <footer className="home-footer">© 2026 EventBooking | All Rights Reserved</footer>
    </main>
  );
}
