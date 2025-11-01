# ClearView

ClearView is a job and customer management system built for my friend’s window-cleaning business.  
It helps track customers, jobs, and payments through a simple, responsive dashboard.

Live Demo: https://clearview.vercel.app  
Demo Video: https://youtu.be/dnQmSpOHc14

------------------------------------------------------------

Tech Stack
- Frontend: React (TypeScript), Tailwind CSS, React Router, Vite, Vitest  
- Backend: Spring Boot (Java), PostgreSQL, JUnit 5, Mockito, Docker  
- Deployment: Frontend on Vercel, Backend on Render (Dockerized), DB on NeonDB  
- CI/CD: GitHub Actions for automated testing and builds

------------------------------------------------------------

Features
- Manage jobs (create, update, mark paid/unpaid)
- Add and manage customers
- Map-based job creation
- Revenue dashboard with monthly summaries
- JWT authentication and secure API
- Fully tested frontend and backend

------------------------------------------------------------

Purpose
Built for a friend’s small window-cleaning business to replace manual spreadsheets  
and to strengthen my full-stack skills with React, Spring Boot, PostgreSQL, and Docker.

------------------------------------------------------------

Run Locally

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
./mvnw spring-boot:run
