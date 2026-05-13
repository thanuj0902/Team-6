# TalentDash Growth Suite

A full-stack talent intelligence platform with tools for salary benchmarking, offer evaluation, resume analysis, and user engagement features. Built with **React 19 + Vite** on the frontend and **Express (raw Node HTTP)** on the backend, connected to a **Neon PostgreSQL** database via Prisma.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Raw HTTP Server |
| Database | Neon (PostgreSQL) |
| ORM | Prisma 7 + @prisma/adapter-neon |
| Styling | Tailwind CSS 4 |
| Build | Vite |

---

## Project Structure

```
offer-calc/
├── prisma/
│   └── schema.prisma        # 7 models: User, SalaryPoint, ResumeScore, OfferAnalysis, ActivationStep, Contribution, UserActivity, Streak
├── src/
│   ├── lib/
│   │   └── db.js             # Prisma client singleton + all DB access functions
│   ├── App.jsx               # Root component with tab-based routing
│   ├── ToolsHub.jsx          # Landing dashboard with tool grid
│   ├── Onboarding.jsx        # 3-step signup flow (email, profile, confirmation)
│   ├── OfferCalculator.jsx   # Offer evaluation with market benchmarking
│   ├── SalaryCalculator.jsx  # Salary estimator with tax/skills inputs
│   ├── ResumeAnalyzer.jsx    # Resume/ATS scoring simulation
│   ├── ActivationFunnel.jsx  # Guided onboarding checklist with points/badges
│   ├── ContributionFlow.jsx  # Salary data & company review submission
│   ├── EngagementDashboard.jsx # Activity tracking, streaks, badges
│   ├── GrowthExperiments.jsx # Referral program & social sharing
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles + Tailwind
├── server.js                 # Express-like HTTP server (all routes)
├── vite.config.js            # Vite + API proxy config
├── prisma.config.ts          # Prisma datasource config
├── package.json
├── .env                      # DATABASE_URL connection string
├── index.html
└── .gitignore
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account with a project created

### 2. Clone & Install

```bash
git clone https://github.com/thanuj0902/Team-6.git
cd offer-calc
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

> Find this connection string in your Neon dashboard under **Connection Details** (use the pooled connection for production, or direct connection for local dev).

### 4. Push Schema & Generate Client

```bash
npx prisma db push       # Creates all tables in Neon
npx prisma generate      # Generates the Prisma client
```

### 5. Run the App

```bash
npm run start:dev
```

This starts both servers simultaneously:
- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:3001

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run start` | Backend only (Express HTTP server on port 3001) |
| `npm run start:dev` | Run frontend + backend together |
| `npm run dev` | Frontend only (Vite dev server) |

---

## API Endpoints

### User
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user` | Create a new user |
| GET | `/api/user/stats?userId=` | Get user stats (streak, points, counts) |

### Salary
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/salary` | Save a salary data point |
| GET | `/api/salary/benchmarks?role=&city=` | Get salary benchmarks by role/city |

### Offers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/offer` | Save an offer analysis result |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume` | Save a resume analysis score |

### Activation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activation?userId=` | Get activation steps for a user |
| POST | `/api/activation/complete` | Mark an activation step as complete |

### Contributions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contribution` | Submit a salary/review contribution |
| GET | `/api/contributions?userId=` | Get user's contributions |

### Activity & Streaks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activity?userId=` | Get user activity log |
| POST | `/api/activity/log` | Log a user action |
| GET | `/api/streak?userId=` | Get or create user streak |
| POST | `/api/streak/visit` | Record a daily visit |

---

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  salaryPoints       SalaryPoint[]
  resumeScores       ResumeScore[]
  offerAnalyses      OfferAnalysis[]
  activationSteps    ActivationStep[]
  contributions      Contribution[]
  activities         UserActivity[]
  streak             Streak?
}

model SalaryPoint {
  id           String   @id @default(cuid())
  userId       String?
  role         String
  experience   Int
  city         String
  company      String?
  companyTier  String
  baseSalary    Float
  bonus         Float?
  equity        Float?
  totalCTC      Float
  createdAt     DateTime @default(now())
}

model ResumeScore {
  id              String   @id @default(cuid())
  userId          String?
  overallScore    Int
  atsScore        Int
  role            String
  level           String
  missingKeywords String[]
  strengths       String[]
  improvements    String[]
  createdAt       DateTime @default(now())
}

model OfferAnalysis {
  id            String   @id @default(cuid())
  userId        String?
  company       String
  role          String
  city          String
  expLevel      String
  totalCTC      Float
  verdict       String
  createdAt     DateTime @default(now())
}

model ActivationStep {
  id            String   @id @default(cuid())
  userId        String
  step          String
  completed     Boolean  @default(false)
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  @@unique([userId, step])
}

model Contribution {
  id            String   @id @default(cuid())
  userId        String?
  type          String
  company       String
  role          String?
  city          String?
  salary        Float?
  rating        Int?
  content       String?
  approved      Boolean  @default(false)
  points        Int      @default(10)
  createdAt     DateTime @default(now())
}

model UserActivity {
  id            String   @id @default(cuid())
  userId        String
  action        String
  metadata      String?
  createdAt     DateTime @default(now())
}

model Streak {
  id            String   @id @default(cuid())
  userId        String   @unique
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastVisitDate DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## Features

- **Salary Calculator** — Estimate salary ranges based on role, experience, city, company tier, and skills with bonus/equity and tax breakdowns
- **Offer Calculator** — Evaluate job offers with market benchmarking and verdict generation (Below Market → Exceptional)
- **Resume Analyzer** — Simulated ATS scoring with keyword gap analysis, section breakdown, and improvement suggestions
- **Activation Funnel** — Guided 5-step onboarding with progress tracking, points, and badges
- **Contribution Flow** — Submit anonymized salary data and company reviews to earn points
- **Engagement Dashboard** — Activity tracking with daily streaks, badges, and recent activity feed
- **Growth Experiments** — Referral program, social sharing, and email invite tools

---

## Security Notes

- No authentication is currently implemented — the app is intended for local/demo use
- The `.env` file is in `.gitignore` and must **never** be committed
- If credentials were ever committed, **reset your Neon database password immediately** at neon.tech → Settings

---

## Contributors

- [@thanuj0902](https://github.com/thanuj0902)
