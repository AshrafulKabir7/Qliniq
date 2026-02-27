<![CDATA[<div align="center">
  <h1>🏥 Qliniq</h1>
  <p><strong>Smart Clinic Management System with Real-Time Queue Display</strong></p>
  <p>A full-stack, multi-tenant clinic management platform built with NestJS, Next.js, Prisma, and WebSockets.</p>

  <br/>

  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
  ![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
  ![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
</div>

---

## ✨ Features

### 👥 Multi-Role Access Control
| Role | Capabilities |
|------|-------------|
| **Super Admin** | Full system management, all clinics |
| **Clinic Admin** | Staff, doctors, schedules, services, settings |
| **Receptionist** | Queue control, walk-in tokens, appointment booking |
| **Doctor** | Today's patient queue, start/complete consultations |
| **Patient** | View appointments, self-registration |
| **Kiosk Display** | Public real-time queue TV screen (no login) |

### 📋 Core Modules
- **Dashboard** — Real-time stats (appointments, wait times, no-shows, active doctors)
- **Appointments** — Book, confirm, cancel, mark no-show with time slot availability
- **Queue & Tokens** — Call next, mark done, skip, walk-in patients, priority tokens
- **Doctor Management** — Register doctors with profiles (specialty, room, fee, consultation time)
- **Schedule Management** — Configure doctor availability by day/time with slot durations
- **Services** — Define clinic services with durations for appointment booking
- **Kiosk Display** — Full-screen TV queue board with auto-refresh (public, no auth)
- **Clinic Settings** — Edit clinic name, address, phone, timezone

### ⚡ Technical Highlights
- **Multi-tenant architecture** — Tenant-isolated data with row-level security
- **Real-time WebSockets** — Live queue updates pushed to all connected clients
- **JWT Authentication** — Stateless auth with role-based guards
- **Prisma ORM** — Type-safe database queries with migrations
- **Docker Compose** — One-command PostgreSQL setup

---

## 🏗️ Architecture

```
clinic/
├── backend/                  # NestJS API Server (port 3001)
│   ├── src/
│   │   ├── auth/             # JWT auth, guards, roles
│   │   ├── users/            # User CRUD
│   │   ├── clinics/          # Clinic management
│   │   ├── doctors/          # Doctor registration & availability
│   │   ├── schedules/        # Doctor schedule slots
│   │   ├── services/         # Clinic services
│   │   ├── appointments/     # Appointment booking & status
│   │   ├── queue/            # Token queue + WebSocket gateway
│   │   ├── stats/            # Dashboard analytics
│   │   └── prisma/           # Database client
│   └── prisma/
│       ├── schema.prisma     # Database schema (12 models)
│       └── seed.ts           # Demo data seeder
│
├── frontend/                 # Next.js 15 App (port 3000)
│   └── src/
│       ├── app/
│       │   ├── login/        # Auth + patient registration
│       │   ├── dashboard/    # Admin panel (8 sub-pages)
│       │   ├── queue/        # Receptionist queue control
│       │   ├── appointments/ # Doctor & patient views
│       │   └── display/      # Public kiosk screen
│       └── lib/
│           ├── api.ts        # Axios client with interceptors
│           ├── store.ts      # Zustand auth store
│           └── socket.ts     # Socket.IO client
│
└── docker-compose.yml        # PostgreSQL container
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **Docker** (for PostgreSQL)
- **npm** or **yarn**

### 1. Clone the repository
```bash
git clone https://github.com/AshrafulKabir7/Qliniq.git
cd Qliniq
```

### 2. Start the database
```bash
docker compose up -d
```
This starts a PostgreSQL container on port `5432`.

### 3. Setup the backend
```bash
cd backend
npm install
cp .env.example .env          # or create .env with DATABASE_URL
npx prisma migrate dev        # Apply migrations
npx prisma db seed            # Seed demo data
npm run start:dev             # Starts on http://localhost:3001
```

### 4. Setup the frontend
```bash
cd frontend
npm install
npm run dev                   # Starts on http://localhost:3000
```

### 5. Open the app
Navigate to **http://localhost:3000** and login with any of the demo credentials below.

---

## 🔐 Demo Credentials

| Role | Email | Password | Landing Page |
|------|-------|----------|-------------|
| Super Admin | `admin@clinic.local` | `admin123` | `/dashboard` |
| Clinic Admin | `admin@cityclinic.local` | `demo123` | `/dashboard` |
| Receptionist | `reception@cityclinic.local` | `demo123` | `/queue` |
| Doctor | `dr.house@cityclinic.local` | `demo123` | `/appointments` |
| Patient | `patient@demo.local` | `demo123` | `/appointments` |

**Kiosk Display** (no login): `http://localhost:3000/display/{clinicId}`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/register` | Patient self-registration |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | List all users |
| POST | `/users` | Admin | Create staff account |
| PATCH | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Deactivate user |

### Doctors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/doctors?clinicId=` | Any | List clinic doctors |
| POST | `/doctors` | Admin | Register new doctor |
| GET | `/doctors/:id/availability?date=` | Any | Available slots |

### Schedules
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/schedules?clinicId=` | Any | List schedules |
| POST | `/schedules` | Admin | Create schedule slot |
| DELETE | `/schedules/:id` | Admin | Remove schedule |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/appointments` | Any | Book appointment |
| GET | `/appointments/today?clinicId=` | Any | Today's appointments |
| GET | `/appointments/my` | Patient | My appointments |
| PATCH | `/appointments/:id/status` | Any | Update status |

### Queue
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/queue/tokens/public?clinicId=` | **None** | Kiosk display data |
| POST | `/queue/tokens/walk-in` | Staff | Create walk-in token |
| GET | `/queue/tokens/today?clinicId=` | Staff | Today's queue |
| POST | `/queue/tokens/:id/call` | Staff | Call next patient |
| PATCH | `/queue/tokens/:id` | Staff | Update token status |

### Services, Clinics, Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH/DELETE | `/services` | CRUD clinic services |
| GET/POST/PATCH | `/clinics` | Manage clinics |
| GET | `/stats/dashboard` | Dashboard analytics |

---

## 🔄 Workflow

```
Patient Registers → Admin Books Appointment → Receptionist Creates Token
        ↓                    ↓                          ↓
   Gets Account      Slot from Schedule          Token appears in Queue
                           ↓                          ↓
                    Patient Arrives           Receptionist calls "Next"
                           ↓                          ↓
                    Check-in at Kiosk        Token shows on Kiosk Display
                                                      ↓
                                              Doctor marks "Done"
                                                      ↓
                                              Stats update in Dashboard
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Zustand, Axios, Socket.IO Client |
| **Backend** | NestJS 10, TypeScript, Passport JWT, Socket.IO |
| **Database** | PostgreSQL 15, Prisma ORM |
| **Real-time** | WebSockets (Socket.IO) |
| **Infra** | Docker Compose |
| **Styling** | Tailwind CSS |

---

## 📊 Database Schema

12 models with full multi-tenancy:

`Tenant` → `Clinic` → `User` → `DoctorProfile` / `PatientProfile`

`DoctorSchedule` → `Appointment` → `QueueToken`

Plus: `Service`, `DoctorTimeOff`, `Notification`, `AuditLog`

---

## 📄 License

This project is for educational and demonstration purposes.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/AshrafulKabir7">Ashraful Kabir</a></p>
</div>
]]>
