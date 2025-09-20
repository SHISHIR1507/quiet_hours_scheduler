# ⏰ Quiet Hours Scheduler

A **full-stack scheduling application** with **automated email notifications** and **dual-database architecture** for reliable session reminders.

**Architecture**: Next.js application with MongoDB for primary data storage, Supabase for authentication and cron scheduling, serverless Edge Functions for email processing, and timezone-aware temporal handling.

**Technical Highlights**: Multi-database persistence pattern, UTC-based scheduling with timezone conversion, atomic email delivery using database flags, and serverless cron execution.

---

## 🚀 Key Features

- **Full-Stack Authentication** - Supabase JWT-based auth with secure API routes
- **Dual Database Strategy** - MongoDB for user data persistence, Supabase for scheduling events
- **Automated Notifications** - Serverless email reminders triggered by cron jobs
- **Timezone Handling** - UTC storage with IST display conversion for accuracy
- **CRUD Operations** - Complete session management with real-time UI updates
- **Serverless Architecture** - Edge Functions for scalable email processing
- **Race Condition Prevention** - Database flags ensure single notification delivery

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 + React | Server-side rendering with App Router |
| **API Layer** | Next.js API Routes | RESTful endpoints with authentication |
| **Database** | MongoDB + Supabase PostgreSQL | Dual storage for data and scheduling |
| **Authentication** | Supabase Auth | JWT-based user management |
| **Background Jobs** | Supabase Edge Functions | Serverless cron job execution |
| **Email Service** | Resend API | Reliable email delivery |
| **UI Components** | TailwindCSS + shadcn/ui | Modern, responsive design system |

---

## 📂 Project Structure

```
quiet-hours-scheduler/
├── src/
│   ├── app/
│   │   ├── api/quiet-hours/
│   │   │   ├── route.js              # GET + POST quiet hours
│   │   │   └── [id]/route.js         # PUT + DELETE specific hour
│   │   ├── auth/page.js              # Login/Register page
│   │   ├── dashboard/page.js         # Main dashboard UI
│   │   ├── layout.js                 # App layout
│   │   └── page.js                   # Home page
│   ├── components/ui/                # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   └── table.jsx
│   └── lib/
│       ├── mongodb.js                # MongoDB connection
│       └── supabaseClient.js         # Supabase client setup
├── supabase/
│   └── functions/send-reminders/
│       ├── index.ts                  # Email reminder logic
│       └── deno.json                 # Deno configuration
└── .env.local                        # Environment variables
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/SHISHIR1507/quiet_hours_scheduler.git
cd quiet-hours-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiet_hours_db

# For Supabase Edge Functions (set via CLI)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=your-verified-email@domain.com
```

### 4. Database Setup

#### MongoDB
- Create a MongoDB Atlas cluster
- Create database: `quiet_hours_db`
- Collection: `quiet_hours` (auto-created)

#### Supabase Table
Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE public.quiet_hours (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  start_ts timestamp with time zone NOT NULL,
  end_ts timestamp with time zone,
  reminder_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  mongo_id text,
  CONSTRAINT quiet_hours_pkey PRIMARY KEY (id)
);

CREATE INDEX quiet_hours_start_ts_idx 
ON public.quiet_hours USING btree (start_ts);
```

### 5. Deploy Supabase Edge Function

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Deploy the function
npx supabase functions deploy send-reminders
```

### 6. Set Supabase Secrets

```bash
npx supabase secrets set \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  RESEND_API_KEY=your-resend-api-key \
  FROM_EMAIL=your-verified-email@domain.com
```

### 7. Setup Cron Job

In Supabase SQL Editor, run:

```sql
SELECT cron.schedule(
  'quiet_hour_reminders',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.functions.supabase.co/send-reminders',
    headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
  );
  $$
);
```

### 8. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---


## 🔄 Advanced Architecture Flow

### Data Flow Pipeline
```
Client Request → JWT Validation → MongoDB Transaction → Supabase Mirror → Event Trigger
     ↓                                                                         ↓
Response Cache ← UI State Update ← Business Logic ← Database Sync ← pg_cron Scheduler
```

### Distributed Scheduling System
1. **Event Ingestion** → Client submits temporal data via REST API with bearer token
2. **Dual-Write Pattern** → Atomic write to MongoDB (source of truth) + Supabase (event store)
3. **Temporal Query Engine** → pg_cron executes time-window queries with millisecond precision
4. **Serverless Activation** → Edge function invocation with distributed lock acquisition
5. **Message Delivery** → Transactional email dispatch with idempotency keys
6. **State Reconciliation** → Optimistic concurrency control prevents duplicate notifications

### Concurrency Control
- **Optimistic Locking**: Compare-and-swap operations on `reminder_sent` flag
- **Event Sourcing**: Immutable event log in Supabase for audit trails
- **Circuit Breaker**: Automatic retry with exponential backoff on delivery failures

---

## 🌏 Timezone Handling

- **Frontend Input**: IST (Asia/Kolkata) - user-friendly
- **Database Storage**: UTC - for accurate cron scheduling
- **Email Display**: IST - matches user's local time
- **Conversion**: Automatic via JavaScript Date objects

---


