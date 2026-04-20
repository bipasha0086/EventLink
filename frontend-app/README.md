# EventLink

EventLink is a role-based theatre booking system for Admin, User, and Theatre teams. It lets users browse theatres and events, reserve seats, pay within a 24-hour window, and receive theatre updates. The frontend is a React app and the backend is a Java Servlet + MySQL application.

## What is included

- Role-based authentication and routing
- User seat booking with payment deadline handling
- Admin seat allocation and deallocation
- Theatre event publishing and alert notifications
- Seat, event, theatre, booking, and notification views
- Chatbot assistant for booking help and theatre queries
- Demo-data fallback when backend data is unavailable

## Tech Stack

### Frontend

- React 19
- Create React App
- React Router DOM
- Material UI (`@mui/material`)
- Emotion (`@emotion/react`, `@emotion/styled`)
- Plain JavaScript, HTML, and CSS
- Testing Library, Jest DOM, and User Event

### Backend

- Java 21
- Maven
- Java Servlets (`javax.servlet-api` 4.0.1)
- JDBC
- MySQL Connector/J
- Gson
- SLF4J
- Jetty Maven Plugin for local development

### Database

- MySQL
- Database name: `event_ticket_booking`
- Schema file: `database/schema.sql`

## How the project works

1. The React app starts at the home page and sends users to login or register.
2. After login, the app routes users based on role:
	- `ADMIN` goes to the admin dashboard
	- `USER` goes to the user dashboard
	- `THEATRE` goes to the theatre dashboard
3. The frontend loads live data from the backend using these endpoints:
	- `/user`
	- `/theatre`
	- `/event`
	- `/seat`
	- `/booking`
	- `/notification`
	- `/chatbot`
4. The backend applies the business rules:
	- one active seat per user
	- booking expiry after 24 hours if unpaid
	- payment confirmation for reserved seats
	- admin allocation and deallocation
	- theatre alert notifications
	- chatbot replies through Groq/xAI configuration on the server

## Main Features by Role

### Admin

- View bookings
- Allocate seats to a friend while a booking is pending
- Deallocate bookings when needed
- Review notification activity

### User

- Browse theatres and events
- Book a seat
- Pay for the booking before the deadline
- View booking status and notifications

### Theatre

- View theatre-specific events and bookings
- Add new events
- Send alerts to users linked to the theatre

## Project Structure

### Frontend

- `src/App.js` controls routing, data loading, and role-based access
- `src/pages/` contains the main screens
- `src/components/` contains shared UI pieces like the navbar and chatbot
- `src/data/systemData.js` provides fallback demo content

### Backend

- `src/main/java/servlet/` contains the HTTP endpoints
- `src/main/java/service/` contains business logic
- `src/main/java/dao/` contains database access code
- `src/main/java/model/` contains entity classes
- `src/main/java/util/` contains database and JSON helpers

## Run Locally

### Frontend

```bash
npm install
npm start
```

The frontend runs on `http://localhost:3000` and proxies API calls to the backend on `http://localhost:8081`.

### Backend

Build and run the Java backend from the backend project folder with Maven and Jetty.

```bash
mvn clean package
mvn jetty:run
```

## Notes

- The frontend uses local storage to remember the current user session.
- If the backend is unavailable, the UI shows demo theatre and event data so the app still remains usable.
- The chatbot needs a valid backend API key configured in environment variables before it can answer requests.

## API Overview

The full backend API guide lives in the sibling backend project folder in the workspace and documents the same endpoints and rules used by the frontend.
