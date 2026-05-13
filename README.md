# TalentDash — Offer Calculator & Growth Suite

A full-stack career intelligence platform for benchmarking offers, analyzing resumes, calculating salary ranges, and tracking professional growth. Built with **React 19 + Vite** on the frontend and **Express + Prisma** on the backend, connected to a **Neon (PostgreSQL)** database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Express (HTTP server) |
| Database | Neon (PostgreSQL) |
| ORM | Prisma 7 + @prisma/adapter-neon |
| Dev tooling | dotenv |

---

## Project Structure

```
offer-calc/
├── prisma/
│   └── schema.prisma          # 8 models: User, SalaryPoint, ResumeScore, OfferAnalysis, ActivationStep, Contribution, UserActivity, Streak
├── server/
│   ├── index.js               # Express server with inline route handlers
│   └── db.js                  # Prisma client singleton + data access layer
├── src/
│   ├── App.jsx                # Root component with tab-based routing
│   ├── main.jsx               # React entry point
│   └── components/
│       ├── ToolsHub.jsx           # Dashboard — 7-tool launcher
│       ├── OfferCalculator.jsx    # AI-powered offer evaluation & benchmarking
│       ├── SalaryCalculator.jsx   # Compensation estimator by role/exp/location
│       ├── ResumeAnalyzer.jsx     # ATS scoring and skill gap analysis
│       ├── ActivationFunnel.jsx   # Guided onboarding checklist with badges
│       ├── ContributionFlow.jsx   # Community salary/review data sharing
│       ├── EngagementDashboard.jsx# Streaks, activity log, and badges
│       ├── GrowthExperiments.jsx  # Referral program and social sharing
│       └── Onboarding.jsx         # Signup / profile creation flow
├── index.html
├── vite.config.js
├── prisma.config.ts
├── package.json
├── .env                         # Database connection string (not committed)
└── .gitignore
```

---

## Features

| Tool | Description |
|---|---|
| **Offer Calculator** | Paste or upload an offer letter for AI extraction; benchmark against 4Cr+ data points; get verdict (Below Market → Exceptional) with percentile bars |
| **Salary Calculator** | Estimate compensation by role, experience, company tier, location, and skills; view tax breakdowns under New/Old regimes |
| **Resume Analyzer** | AI-powered ATS scoring, keyword gap analysis, and improvement suggestions |
| **Activation Funnel** | Guided 5-step onboarding (profile → resume → salary → offer → contribute) with badge rewards |
| **Contribution Flow** | Share salary data and company reviews to earn community points |
| **Engagement Dashboard** | Track daily streaks, earned badges, and recent activity history |
| **Growth Experiments** | Referral program with share-to-social links |

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account with a project created

### 2. Clone & Install

```bash
git clone <repo-url>
cd offer-calc
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

This is the pooled connection string from your Neon dashboard under **Connection Details**.

### 4. Push Schema & Generate Client

```bash
npx prisma db push          # Creates all 8 tables in Neon
npx prisma generate         # Generates the Prisma client
```

### 5. Run the App

```bash
npm run dev                  # Frontend only (Vite on port 5173)
npm run start                # Backend API only (port 3001)
npm run start:dev            # Both simultaneously
```

- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:3001

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server (frontend only) |
| `npm run start` | Express API server (backend only) |
| `npm run start:dev` | Run both frontend + backend |
| `npm run build` | Production build via Vite |

---

## API Endpoints

All endpoints return JSON. The database layer is in `server/db.js`.

### Users

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user` | Create a new user (email, name, role) |

### Offers

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/offer` | Save an offer analysis result |

### Resumes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume` | Save a resume score analysis |

### Salaries

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/salary` | Save a salary calculation |
| GET | `/api/salary/benchmarks?role=&city=` | Get aggregate benchmark data |

### Activation

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activation?userId=` | Get user's activation steps |
| POST | `/api/activation/complete` | Mark a step as completed |

### Contributions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contribution` | Submit salary or review data |
| GET | `/api/contributions?userId=` | Get user's contributions |

### Activity & Engagement

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activity?userId=` | Get user's activity log |
| POST | `/api/activity/log` | Log a user action |
| GET | `/api/streak?userId=` | Get or create streak data |
| POST | `/api/streak/visit` | Record a daily visit |
| GET | `/api/user/stats?userId=` | Aggregate stats (counts per feature) |

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
  user         User?    @relation(fields: [userId], references: [id])
  role         String
  experience   Int
  city         String
  company      String?
  companyTier  String
  baseSalary   Float
  bonus        Float?
  equity       Float?
  totalCTC     Float
  createdAt    DateTime @default(now())
}

model ResumeScore {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
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
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  company   String
  role      String
  city      String
  expLevel  String
  totalCTC  Float
  verdict   String
  createdAt DateTime @default(now())
}

model ActivationStep {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  step        String
  completed   Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  @@unique([userId, step])
}

model Contribution {
  id        String    @id @default(cuid())
  userId    String?
  user      User?     @relation(fields: [userId], references: [id])
  type      String
  company   String
  role      String?
  city      String?
  salary    Float?
  rating    Int?
  content   String?
  approved  Boolean   @default(false)
  points    Int       @default(10)
  createdAt DateTime  @default(now())
}

model UserActivity {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  metadata  String?
  createdAt DateTime @default(now())
}

model Streak {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastVisitDate DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## Security Notes

- The `.env` file is in `.gitignore` and must **never** be committed
- If credentials were ever committed, **reset your Neon database password immediately**
- `prisma.config.ts` may contain hardcoded connection strings — avoid committing it with live credentials

---

## Contributors

- [@thanuj0902](https://github.com/thanuj0902)
