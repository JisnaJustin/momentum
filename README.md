# MOMENTUM — Full-Stack Habit Tracker

[![Python 3.13+](https://img.shields.io/badge/Python-3.13+-blue.svg)](https://www.python.org/)
[![Django 5.0+](https://img.shields.io/badge/Django-5.0+-092E20.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.14+-red.svg)](https://www.django-rest-framework.org/)
[![React 19](https://img.shields.io/badge/React-19.0+-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Momentum** is a production-ready, full-stack habit tracking web application designed to help users establish consistency, track measurable goals, visualize weekly streaks, and stay motivated. Built from scratch with a **Django REST Framework** backend and a **React + Tailwind CSS** single-page application (SPA).

---

## 🌟 Key Features

1. **Authentication & User Data Isolation**
   - Secure registration, login, and profile management with **JWT (JSON Web Tokens)**.
   - Automatic silent token refresh via Axios interceptors with failure queuing.
   - **Strict Data Isolation**: Queries and mutations are enforced at the database and API level—users can never access or modify another user's habits or history.

2. **Dual Tracking Models**
   - **Simple Habits**: Binary completion (Done / Not Done), e.g., *Meditation*, *Flossing*.
   - **Measurable Habits**: Quantitative targets with units and progress bars, e.g., *Drink 8 glasses of water*, *Read 20 pages*, *Walk 5 km*.

3. **Flexible Frequency Scheduling**
   - **Daily Habits**: Scheduled every day of the week.
   - **Selected Weekday Habits**: Custom schedules (e.g., *Mon, Wed, Fri*). Non-scheduled days are treated as rest days and do not penalize streaks.

4. **Interactive Weekly Tracker Matrix**
   - Full 7-day interactive view (Monday through Sunday) with current day highlighting.
   - Previous/Next week navigation and a "Today" quick jump button.
   - Click-to-toggle simple habits or quick modal adjustments for measurable targets.

5. **Actionable Dashboard**
   - Personalized greeting, daily completion percentage, completed vs. remaining counts, and live streak badges.
   - Interactive daily checklist synced with backend APIs in real time.

6. **Deep Habit Analytics & Details**
   - Per-habit views with current streak, longest all-time streak, 30-day completion rate, and recent 30-day activity logs.

7. **Habit Lifecycle Management**
   - Create, edit, pause/activate, or delete habits with confirmation dialogs explaining historical log retention.
   - Category filtering (Health, Fitness, Study, Personal, Productivity, Other) and name searching.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 5.0+ / 6.0+ & Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt`
- **CORS Handling**: `django-cors-headers`
- **Environment**: `python-dotenv`
- **Database**: SQLite (local development) / PostgreSQL (production-ready via `DATABASE_URL`)

### Frontend
- **Framework**: React 19 SPA (Vite)
- **Styling**: Tailwind CSS (clean, minimal, responsive design system)
- **Icons**: Lucide React
- **Routing**: React Router v7 / v6
- **HTTP Client**: Axios with request/response interceptors & token refresh queue
- **State Management**: React Context API (`AuthContext`, `ToastContext`)

---

## 📁 Project Structure

```
momentum/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── momentum_backend/
│   │   ├── __init__.py
│   │   ├── settings.py           # JWT, CORS, DRF, and DB configuration
│   │   ├── urls.py               # Main URL routing & JWT endpoints
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── habits/
│       ├── models.py             # Habit & HabitLog models with constraints
│       ├── serializers.py        # Serializers for User, Habits, Logs, and Stats
│       ├── views.py              # Scoped ViewSets, Dashboard, and Tracker APIs
│       ├── urls.py               # Habits router & endpoints
│       ├── services.py           # Streak calculation & weekly matrix services
│       ├── admin.py              # Django admin registrations
│       └── tests/                # 17 automated tests
│           ├── test_auth.py
│           ├── test_habits.py
│           ├── test_logs.py
│           ├── test_isolation.py
│           └── test_streaks.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── index.css
│       ├── main.jsx
│       ├── App.jsx               # Route definitions & layout wrappers
│       ├── api/
│       │   ├── client.js         # Axios instance with 401 interceptor & token queue
│       │   ├── auth.js           # Login, register, profile methods
│       │   ├── habits.js         # Habit CRUD & toggle methods
│       │   └── logs.js           # Habit logs, dashboard, and tracker methods
│       ├── context/
│       │   ├── AuthContext.jsx   # User state, JWT storage, and session lifecycle
│       │   └── ToastContext.jsx  # Toast notifications
│       ├── components/
│       │   ├── common/           # Navbar, Footer, Modal, ConfirmDialog, IconPicker...
│       │   ├── habits/           # HabitCard, HabitFormModal, LogValueModal
│       │   └── tracker/          # WeekSelector, WeeklyGrid, DayCell
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── MyHabits.jsx
│           ├── WeeklyTracker.jsx
│           ├── HabitDetails.jsx
│           └── NotFound.jsx
├── README.md
├── .gitignore
└── .env.example
```

---

## ⚡ Quickstart & Local Setup

### 1. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy .env.example to .env (defaults work out of the box for SQLite)
copy .env.example .env

# 5. Run database migrations
python manage.py makemigrations
python manage.py migrate

# 6. (Optional) Create an admin superuser
python manage.py createsuperuser

# 7. Start the Django development server
python manage.py runserver 8000
```

The Django REST API will be running at `http://127.0.0.1:8000/`.

---

### 2. Frontend Setup

```bash
# 1. Open a new terminal and navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env
copy .env.example .env

# 4. Start the React development server
npm run dev
```

The React frontend will be accessible at `http://localhost:5173/`.

---

## 🧪 Testing

### Backend Automated Test Suite
Momentum includes 17 tests covering authentication, user data isolation, habit validation, duplicate log prevention, and streak algorithms:

```bash
cd backend
python manage.py test habits.tests
```

### Frontend Build Verification
To test bundling and asset resolution:

```bash
cd frontend
npm run build
```

---

## 📡 API Overview

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new user account & receive tokens | No |
| `POST` | `/api/token/` | Obtain JWT access and refresh tokens | No |
| `POST` | `/api/token/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/me/` | Retrieve authenticated user profile | Yes (Bearer Token) |

### Habits Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/habits/` | List authenticated user's habits (supports `?category=`, `?is_active=`, `?search=`) | Yes |
| `POST` | `/api/habits/` | Create a new habit (owner assigned automatically) | Yes |
| `GET` | `/api/habits/{id}/` | Retrieve habit details, stats, and recent logs | Yes |
| `PATCH` | `/api/habits/{id}/` | Update habit configuration | Yes |
| `DELETE` | `/api/habits/{id}/` | Delete habit and associated history | Yes |
| `POST` | `/api/habits/{id}/toggle-active/` | Toggle habit active / paused status | Yes |
| `GET` | `/api/habits/{id}/stats/` | Retrieve streak analytics for habit | Yes |

### Tracking & Aggregation Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/today/` | Returns today's active habits, progress %, and counts | Yes |
| `GET` | `/api/tracker/weekly/?start_date=YYYY-MM-DD` | Returns 7-day Monday–Sunday matrix | Yes |
| `GET` | `/api/habit-logs/` | List habit logs (supports `?habit=`, `?date=`, `?start_date=`, `?end_date=`) | Yes |
| `POST` | `/api/habit-logs/` | Upsert habit log for a given date | Yes |

---

## 🔒 Security & Data Isolation Architecture

- **Token Storage**: Access tokens and refresh tokens are managed centrally in `AuthContext` and stored in `localStorage`.
- **Silent Refresh Interceptor**: When a request encounters a `401 Unauthorized`, it pauses subsequent requests in a queue, requests a new access token from `/api/token/refresh/`, updates the headers, and replays all queued requests seamlessly.
- **Strict Query Scoping**: All ViewSets filter models via `owner=request.user` or `habit__owner=request.user`. Attempting to access an ID belonging to another user returns `404 Not Found`.
- **Unique Date Constraints**: Database constraint `UniqueConstraint(fields=['habit', 'date'], name='unique_habit_date_log')` guarantees that duplicate logs for the same day cannot be created.

---

## 📈 Streak Calculation Logic

1. **Daily Habits**: A streak measures consecutive days ending today (or yesterday if today is still in progress) where the habit was completed.
2. **Selected Weekday Habits**: Only scheduled days (e.g. Mon, Wed, Fri) are counted. Non-scheduled days (Tue, Thu, Sat, Sun) do **not** break the streak.
3. **Completion Criteria**:
   - Simple habit: `is_done == True`.
   - Measurable habit: `is_done == True` or `value >= target`.

---

## 🚀 Production Deployment

### Backend Production Checklist
1. Set `DEBUG=False` in environment variables.
2. Set a strong secret key: `SECRET_KEY=your-production-secret-key`.
3. Configure `ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com`.
4. Configure `CORS_ALLOWED_ORIGINS=https://yourdomain.com`.
5. Set `DATABASE_URL` (e.g., PostgreSQL on Supabase, RDS, or Railway).
6. Collect static files: `python manage.py collectstatic --noinput`.

### Frontend Production Checklist
1. Set `VITE_API_URL=https://api.yourdomain.com/api` in frontend `.env.production`.
2. Build static bundle: `npm run build`.
3. Deploy the `dist/` directory to Vercel, Netlify, Cloudflare Pages, or AWS S3/CloudFront.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
