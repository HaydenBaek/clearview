# ClearView

ClearView is a job and customer management system for small service businesses.  
It allows users to create, manage, and track jobs, customers, and revenue through a simple, responsive dashboard.

**Demo Video:** [Watch on YouTube](https://youtu.be/dnQmSpOHc14)  
(Currently fixing deployment before public demo release.)

---

## Tech Stack

**Frontend**
- React (TypeScript)
- Tailwind CSS for responsive UI
- React Router for navigation
- Tested with Vitest and React Testing Library

**Backend**
- Spring Boot (Java)
- REST API with JWT authentication
- Tested with JUnit 5 and Mockito
- PostgreSQL database

**Development**
- Automated builds and test runs on each push
- Deployment in progress (Render / Railway)

---

## Features

**Job Management**
- Create jobs manually or by selecting a location on a map
- Mark jobs as Paid or Unpaid
- Update or delete jobs
- View jobs grouped by Today, Upcoming, and Paid

**Customer Management**
- Add new customers with name, phone, email, and address
- Select existing customers when creating jobs
- (Planned) Deactivate customers instead of deleting them

**Map Integration**
- Select a map location to auto-fill job addresses
- Create new jobs directly from a selected map pin

**Revenue Dashboard**
- View total Paid, Unpaid, and Monthly Revenue
- Automatically aggregates monthly financial data

**Testing**
- Fully tested frontend and backend components

---

## Purpose

I built ClearView for a friend who runs a small window-cleaning business.  
He needed a simple way to track customers, jobs, and payments without relying on spreadsheets.  
This project also allowed me to strengthen my full-stack development skills using React, Spring Boot, PostgreSQL, and automated testing.

---

## Deployment

Deployment is in progress.  
To run locally:

```bash
# Frontend
npm run dev

# Backend
./mvnw spring-boot:run
