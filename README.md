<![CDATA[<div align="center">

# 🏥 Qliniq
### Smart Clinic Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Qliniq** is a full-stack, multi-tenant clinic management platform with real-time queue displays.  
Manage doctors, appointments, walk-in tokens, and overlay live queue status on waiting room kiosk screens.

[Features](#-features) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 👥 Multi-Role Access Control
- **6 distinct user roles** with JWT-based route protection
- Role-specific dashboards — each user lands on the right page
- Admin-managed staff accounts with one-click deactivation

| Role | Access |
|------|--------|
| 🔴 **Super Admin** | Full system management, all clinics & tenants |
| 🟠 **Clinic Admin** | Staff, doctors, schedules, services, settings |
| 🟡 **Receptionist** | Queue control, walk-in tokens, appointment booking |
| 🟢 **Doctor** | Today's patient queue, start/complete consultations |
| 🔵 **Patient** | View appointments, self-registration |
| ⚪ **Kiosk Display** | Public real-time queue TV screen (no login) |

### 📊 Live Dashboard
- Real-time stats: total appointments, waiting count, avg wait time, no-shows
- Active doctors list with specialty and room numbers
- Quick action buttons to navigate queue, appointments, and doctors

### 📋 Appointment Booking
- Book appointments with **doctor → date → available slot** flow
- Slot availability computed from real doctor schedules
- Status lifecycle: `PENDING` → `CONFIRMED` → `COMPLETED` / `NO_SHOW` / `CANCELLED`
- Admin can confirm, cancel, or mark no-show with one click

### 🔄 Real-Time Queue System
- **Token-based queue** with automatic numbering per doctor per day
- Actions: **Call Next** → **Start Consultation** → **Mark Done** / **Skip**
- **Walk-in tokens** — create tokens for patients without prior appointments
- **Priority levels**: Normal, Emergency, VIP
- **WebSocket-powered** — all connected clients see updates instantly

### 📺 Kiosk Display
- Full-screen waiting room display — **no login required**
- Shows currently serving token and waiting queue per doctor
- Auto-refreshes every 5 seconds for live updates
- Doctor name, room number, and token status badges

### 👨‍⚕️ Doctor Management
- Register doctors with full profiles: specialty, room, fee, consultation time
- Real schedule-based availability (not hardcoded!)
- Doctor portal: see today's queue, start/complete consultations

### 🗓️ Schedule Management
- Configure doctor availability by **day of week + time range**
- Customizable slot duration per schedule (15min, 30min, etc.)
- Visual schedule grid grouped by doctor

### 🛎️ Services
- Define clinic services with names and durations
- Services are required for booking — ties into slot duration calculation
- Full CRUD with soft-delete

### ⚙️ Clinic Settings
- Edit clinic name, address, phone, timezone
- Multi-clinic support per tenant

### 🔐 Patient Self-Registration
- Patients can create their own account from the login page
- Instant JWT token — logged in immediately after registration
- View appointment history in the patient portal

---

## 📸 Screenshots

| Login Page | Admin Dashboard |
|-----------|----------------|
| Premium login with patient registration toggle | Live stats, active doctors, quick actions |

| Queue Control | Kiosk Display |
|--------------|---------------|
| Call next, mark done, skip, walk-in modal | Full-screen TV board with auto-refresh |

| Doctor Registration | Schedule Management |
|--------------------|-------------------|
| Full profile form with clinic & specialty | Day/time grid grouped by doctor |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **State** | Zustand (persisted auth store) |
| **HTTP** | Axios with JWT interceptors |
| **Real-time** | Socket.IO Client |
| **Backend** | NestJS 10, TypeScript, Passport JWT |
| **WebSockets** | Socket.IO Server with room-based broadcasting |
| **ORM** | Prisma with typed queries & migrations |
| **Database** | PostgreSQL 15 |
| **Infra** | Docker Compose |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Docker](https://www.docker.com/) (for PostgreSQL)
- npm v9 or higher

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/AshrafulKabir7/Qliniq.git
cd Qliniq
```

**2. Start the database**
```bash
docker compose up -d
```
> PostgreSQL runs on **port 5432**

**3. Setup the backend**
```bash
cd backend
npm install
npx prisma migrate dev        # Apply database migrations
npx prisma db seed             # Seed demo users & clinic data
npm run start:dev              # Starts on http://localhost:3001
```

**4. Setup the frontend (in a new terminal)**
```bash
cd frontend
npm install
npm run dev                    # Starts on http://localhost:3000
```

**5. Open the app**

Navigate to [http://localhost:3000](http://localhost:3000) and login with the demo credentials below.

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@clinic.local` | `admin123` |
| Clinic Admin | `admin@cityclinic.local` | `demo123` |
| Receptionist | `reception@cityclinic.local` | `demo123` |
| Doctor | `dr.house@cityclinic.local` | `demo123` |
| Patient | `patient@demo.local` | `demo123` |

> **Kiosk Display** (no login): `http://localhost:3000/display/{clinicId}`

---

## 📁 Project Structure

```
Qliniq/
├── backend/                       # NestJS API Server (port 3001)
│   ├── src/
│   │   ├── auth/                  # JWT auth, guards, roles decorator
│   │   ├── users/                 # User CRUD (list, create, update, deactivate)
│   │   ├── clinics/               # Clinic management + settings
│   │   ├── doctors/               # Doctor registration & real availability
│   │   ├── schedules/             # Doctor schedule slots (day/time)
│   │   ├── services/              # Clinic services CRUD
│   │   ├── appointments/          # Appointment booking & status lifecycle
│   │   ├── queue/                 # Token queue + WebSocket gateway
│   │   ├── stats/                 # Dashboard analytics aggregation
│   │   └── prisma/                # Database client service
│   └── prisma/
│       ├── schema.prisma          # Database schema (12 models)
│       ├── migrations/            # SQL migration history
│       └── seed.ts                # Demo data seeder
│
├── frontend/                      # Next.js 15 App (port 3000)
│   └── src/
│       ├── app/
│       │   ├── login/             # Auth page + patient registration
│       │   ├── dashboard/         # Admin panel
│       │   │   ├── page.tsx       #   Dashboard stats & doctors
│       │   │   ├── appointments/  #   Today's appointments + booking modal
│       │   │   ├── doctors/       #   Doctor directory + registration form
│       │   │   ├── schedules/     #   Schedule management grid
│       │   │   ├── services/      #   Service list CRUD
│       │   │   ├── users/         #   Staff management table
│       │   │   └── settings/      #   Clinic settings editor
│       │   ├── queue/             # Receptionist queue control
│       │   ├── appointments/      # Doctor & patient views
│       │   └── display/           # Public kiosk screen
│       └── lib/
│           ├── api.ts             # Axios client with JWT interceptors
│           ├── store.ts           # Zustand persisted auth store
│           └── socket.ts          # Socket.IO client
│
├── docker-compose.yml             # PostgreSQL container
└── README.md                      # You are here
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login with email & password |
| `POST` | `/auth/register` | Patient self-registration |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users (admin only) |
| `POST` | `/users` | Create staff account |
| `PATCH` | `/users/:id` | Update user details |
| `DELETE` | `/users/:id` | Deactivate user (soft delete) |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/doctors?clinicId=` | List doctors by clinic |
| `POST` | `/doctors` | Register new doctor with profile |
| `GET` | `/doctors/:id/availability?date=` | Get available time slots |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/schedules?clinicId=` | List all schedules |
| `POST` | `/schedules` | Create schedule slot |
| `DELETE` | `/schedules/:id` | Remove schedule slot |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services?clinicId=` | List clinic services |
| `POST` | `/services` | Create service |
| `PATCH` | `/services/:id` | Update service |
| `DELETE` | `/services/:id` | Deactivate service |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/appointments` | Book new appointment |
| `GET` | `/appointments/today?clinicId=` | Today's appointments |
| `GET` | `/appointments/my` | Patient's own appointments |
| `GET` | `/appointments` | All appointments (filtered) |
| `PATCH` | `/appointments/:id/status` | Update appointment status |
| `POST` | `/appointments/:id/check-in` | Patient check-in |

### Queue Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/queue/tokens/public?clinicId=` | Kiosk display data (**no auth**) |
| `POST` | `/queue/tokens/walk-in` | Create walk-in token |
| `GET` | `/queue/tokens/today?clinicId=` | Today's full queue |
| `POST` | `/queue/tokens/:id/call` | Call next patient |
| `PATCH` | `/queue/tokens/:id` | Update token status |
| `GET` | `/queue/tokens` | List tokens (filtered) |
| `POST` | `/queue/tokens` | Create token from appointment |

### Clinics & Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/clinics` | List tenant clinics |
| `POST` | `/clinics` | Create new clinic |
| `PATCH` | `/clinics/:id` | Update clinic settings |
| `GET` | `/stats/dashboard` | Dashboard analytics |

---

## 🗄️ Database Schema

The app uses **PostgreSQL** with **Prisma ORM** across 12 models:

```
Tenant              — Multi-tenant isolation (plan, status)
├── Clinic          — Physical clinic locations (name, address, timezone)
├── User            — All users with role-based access
│   ├── DoctorProfile    — Specialty, room, fee, consultation time
│   └── PatientProfile   — DOB, gender, address
├── Service         — Bookable clinic services with durations
├── DoctorSchedule  — Weekly availability (day, start/end, slot duration)
├── DoctorTimeOff   — Leave/vacation tracking
├── Appointment     — Bookings with status lifecycle & tracking UUID
├── QueueToken      — Queue entries with priority & timing
├── Notification    — Push/SMS/Email notification queue
└── AuditLog        — Full audit trail of all actions
```

The database is auto-created on first `prisma migrate dev` with the seed script loading demo data.

---

## 🔄 Workflow

```
Patient Registers ──→ Admin Books Appointment ──→ Receptionist Creates Token
        │                      │                           │
   Gets Account         Slot from Schedule          Token in Queue
                              │                           │
                       Patient Arrives          Receptionist calls "Next"
                              │                           │
                       Check-in at Desk         Token on Kiosk Display
                                                          │
                                                Doctor marks "Done"
                                                          │
                                                Stats update on Dashboard
```

---

## 🎨 Design System

Qliniq uses a clean, modern design with Tailwind CSS:

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `indigo-600` | Buttons, nav active, links |
| Success | `green-600` | Confirmed, completed states |
| Warning | `orange-500` | Waiting, pending states |
| Danger | `red-500` | Cancelled, no-show, delete |
| Surface | `gray-50` | Page backgrounds |
| Card | `white` | Content panels with borders |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Ashraful Kabir](https://github.com/AshrafulKabir7)

**[⬆ Back to Top](#-qliniq)**

</div>
]]>
