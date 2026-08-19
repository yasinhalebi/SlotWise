# SlotWise

A booking platform for small service businesses (salons, clinics, studios, personal trainers) to manage appointments and let customers self-book online — no phone tag, no double-bookings.

**Live demo:** https://slot-wise-eight.vercel.app
**API:** https://slotwise-cv9m.onrender.com/api/health

> The API is hosted on a free-tier instance that spins down after inactivity — the first request after a while may take 20–30s to wake it up.

**Try it without signing up:** the homepage has a "Try the owner dashboard" button that logs you into a demo business account, and a "See a customer booking page" button that opens the public booking flow directly.

## The problem

Small business owners often manage appointments manually over WhatsApp or a paper notebook, which leads to double-bookings and wasted time. SlotWise gives them a simple dashboard to manage their services and calendar, plus a public booking link they can share with customers — no account required on the customer's end.

## Features

- **Owner dashboard** — email/password auth (JWT), manage services (CRUD), see all appointments on a calendar (month/week/day/agenda views), accept/reject/complete bookings
- **Public booking page** — `/book/:businessSlug` — customers pick a service, a date, and an actually-available time slot, then book with just their name and phone number
- **Conflict-free scheduling** — the core of the project: a slot is only offered if it fits inside the business's working hours *and* doesn't overlap any existing (non-cancelled) appointment for that day

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router, Tailwind CSS, Vite |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Calendar UI | react-big-calendar |
| Testing | Jest |
| Hosting | Vercel (frontend), Render (backend) |

## The scheduling algorithm

The interesting part of this project is `GET /api/appointments/available-slots`. Given a business, a service, and a date, it:

1. Looks up the business's working hours for that day of the week
2. Fetches every non-cancelled appointment already booked that day
3. Generates candidate slots at a fixed interval across the working window
4. Drops any candidate that overlaps an existing appointment, using the standard interval-overlap check: `newStart < existingEnd && newEnd > existingStart`

The logic lives as a pure function (`server/src/utils/availableSlots.js`), decoupled from Express and Mongoose, so it's covered by unit tests independent of a running database — see `server/src/tests/availableSlots.test.js`.

When a booking is actually submitted, the server re-checks the requested slot against the same rule before saving, so a race between two customers booking the same slot at once can't create a double-booking.

## Running locally

**Requirements:** Node 18+, a MongoDB connection string (Atlas free tier works fine).

```bash
git clone https://github.com/yasinhalebi/SlotWise.git
cd SlotWise
```

**Backend**

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev             # http://localhost:5000
```

**Frontend** (in a separate terminal)

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev             # http://localhost:5173
```

**Tests**

```bash
cd server
npm test
```

## Project structure

```
server/
  src/
    controllers/   # request handlers
    models/        # Mongoose schemas
    routes/
    middleware/     # auth + error handling
    utils/          # slugify, JWT helper, time utils, the scheduling algorithm
    tests/
client/
  src/
    features/       # Redux slices (auth, services, appointments)
    pages/
    components/
    api/            # axios instance with auth interceptor
```
