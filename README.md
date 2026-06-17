<p align="center">
  <img src="src/assets/logo.png" alt="Tahfiy Logo" width="128" />
</p>

<h1 align="center">Tahfiy</h1>

<p align="center">
  <strong>Tahfidz Digital System</strong> — a web application for managing Quran memorization (tahfidz) programs.<br />
  Tahfiy helps administrators track student (<em>santri</em>) progress, manage study groups (<em>halaqah</em>), and record daily <em>ziyadah</em> (new memorization) and <em>murojaah</em> (review) sessions.
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
</p>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

---

## Features

### Admin Dashboard
- Overview statistics: total *santri*, *ustadz*, and *halaqah*
- Monthly *ziyadah* and *murojaah* activity tracking
- Attendance rate and 6-month activity trend chart
- Recent activity feed and top *santri* leaderboard
- Per-*halaqah* statistics and individual progress overview

### Data Management
- **Santri** — manage students, class assignment, and *halaqah* membership
- **Ustadz** — manage teachers and their specializations
- **Halaqah** — manage study groups and assign *ustadz*
- **Ziyadah** — record new memorization (juz, page range, date)
- **Murojaah** — record review sessions
- **Users** — manage system accounts with role-based access

### Security
- JWT-based session authentication via HTTP-only cookies
- Role-based access control (`admin`, `ustadz`, `santri`)
- Protected admin routes via middleware proxy

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | [jose](https://github.com/panva/jose) (JWT), [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Forms | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Icons | [React Icons](https://react-icons.github.io/react-icons/) |
| Notifications | [React Toastify](https://fkhadra.github.io/react-toastify/) |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `http://localhost:3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Add environment variables in the Vercel dashboard.
4. Deploy.

### General Production Checklist

- [ ] Set a strong `JWT_SECRET` (minimum 32 characters)
- [ ] Remove or disable the hardcoded `admin` / `admin123` credential
- [ ] Configure Supabase Row Level Security (RLS) policies as needed
- [ ] Ensure `NODE_ENV=production` for secure cookie settings

---

## License

This project is private and not licensed for public distribution.
