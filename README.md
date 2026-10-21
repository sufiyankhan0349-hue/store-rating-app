# Store Rating App

Roxiler Full Stack Intern coding challenge. Express + PostgreSQL backend, React (Vite) frontend.

## Roles
- **Admin**: dashboard counts, add users/stores, filter + sort lists, view user details
- **Normal user**: signup, login, search stores, rate (1-5), modify rating, change password
- **Store owner**: see average rating and users who rated their store, change password

## Setup

### 1. Database
```
psql -U postgres -c "CREATE DATABASE store_rating;"
psql -U postgres -d store_rating -f backend/schema.sql
```

### 2. Backend
```
cd backend
cp .env.example .env     # then edit Postgres password and JWT_SECRET
npm install
npm run seed             # creates admin: admin@example.com / Admin@123
npm start                # runs on http://localhost:5000
```

### 3. Frontend
```
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

## How to test
1. Login as admin (`admin@example.com` / `Admin@123`).
2. Add a Store Owner user, then add a store linked to that owner.
3. Sign up a normal user from the signup page, login, and rate the store.
4. Login as the owner to see the rating on the dashboard.

## Validations (frontend + backend)
- Name: 20-60 characters
- Address: max 400 characters
- Password: 8-16 characters, 1 uppercase, 1 special character
- Email: standard format

## Notes
- Passwords are hashed with bcrypt, login uses JWT.
- All SQL uses parameters (no SQL injection); sort columns are whitelisted.
- One rating per user per store (unique key), updating changes the same row.
