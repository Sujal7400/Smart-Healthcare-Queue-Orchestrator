
# 🏥 Smart Healthcare Queue Orchestrator

A full-stack healthcare queue management system developed to optimize patient flow, appointment scheduling, referral management, and real-time queue monitoring in hospitals and clinics.

The system helps reduce waiting time, improve patient experience, and provide healthcare staff with efficient tools for managing queues and referrals.

---

## 📌 Project Overview

Smart Healthcare Queue Orchestrator is designed to manage healthcare operations digitally by allowing patients to book appointments, check in for visits, and track their queue status while enabling staff and administrators to monitor and manage departmental queues in real time.

The application uses role-based authentication, real-time updates, and priority-based queue handling to improve hospital workflow efficiency.

---

## ✨ Key Features

### 👤 Patient Module

* Patient Registration
* Secure Login Authentication
* Appointment Booking
* View Appointment History
* Appointment Check-In
* Queue Status Tracking

### 👨‍⚕️ Staff & Admin Module

* Department-wise Queue Management
* Call Next Patient
* Mark Consultation Complete
* Remove Queue Entries
* Real-Time Queue Monitoring

### 🔄 Referral Management

* Create Patient Referrals
* Department-to-Department Transfers
* Priority-Based Referral Processing
* Emergency Referral Handling

### ⚡ Real-Time Functionality

* Live Queue Updates
* Instant Queue Synchronization
* Socket.IO Integration

### 🎯 Priority Queue System

* Emergency Cases
* Referral Patients
* Walk-In Patients
* Appointment Patients

---

## 🛠️ Technology Stack

### Frontend

* React.js
* React Router DOM
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* JWT Authentication
* Sequelize ORM
* Socket.IO

### Database

* MySQL

### DevOps & Deployment

* Docker
* Docker Compose

---

## 🏗️ System Architecture

```text
Patient
   │
   ▼
React Frontend
   │
   ▼
Express.js Backend
   │
   ▼
MySQL Database
   │
   ▼
Socket.IO Real-Time Updates
```

---

## 📂 Project Structure

```text
healthcare-queue
│
├── frontend
│   ├── src
│   ├── public
│   └── Dockerfile
│
├── backend
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── controllers
│   └── Dockerfile
│
├── docker-compose.yml
├── package.json
├── .dockerignore
└── README.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Sujal7400/Smart-Healthcare-Queue-Orchestrator.git
cd Smart-Healthcare-Queue-Orchestrator
```

### 2️⃣ Start Application Using Docker

```bash
docker compose up --build
```

---

## 🌐 Application URLs

### Frontend

```text
http://localhost:5173
```

### Backend API

```text
http://localhost:5000
```

---

## 📸 Screenshots

### 🏠 Landing Page

(Add Screenshot Here)

---

### 🔐 Patient Login

(Add Screenshot Here)

---

### 👤 Patient Dashboard

(Add Screenshot Here)

---

### 📅 Appointment Booking

(Add Screenshot Here)

---

### 📋 Queue Management

(Add Screenshot Here)

---

### 👨‍⚕️ Staff Dashboard

(Add Screenshot Here)

---

### 🔄 Referral Management

(Add Screenshot Here)

---

### 🐳 Docker Containers Running

(Add Screenshot Here)

---

### 🗄️ MySQL Database Tables

(Add Screenshot Here)

---

## 🔒 Security Features

* JWT Based Authentication
* Protected Routes
* Role-Based Access Control
* Secure Password Hashing
* API Authorization

---

## 🎯 Core Functionalities

* Patient Registration & Login
* Appointment Scheduling
* Appointment Check-In
* Queue Management
* Referral Management
* Real-Time Queue Updates
* Department-Based Queue Monitoring
* Priority-Based Patient Handling
* Dockerized Deployment

---

## 🔮 Future Enhancements

* SMS Notifications
* Email Notifications
* Doctor Availability Tracking
* Hospital Analytics Dashboard
* Mobile Application Support
* Multi-Hospital Integration

---

## 👨‍💻 Author

### Sujal Singh

**TY B.Sc. Information Technology Student**

Developed as an academic and portfolio project to demonstrate full-stack development, database management, authentication, real-time communication, and Docker containerization skills.

---

## 📄 License

This project is intended for educational, academic, and portfolio purposes.

---
