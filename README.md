# Task Management System

Group 2 full-stack project for **CSE 504: Software Development Methodology**. This repository implements a collaborative **Task Management System** using:

- **Backend:** Spring Boot 3, Java 21, Maven, Spring Security, JPA, Flyway
- **Frontend:** React, TypeScript, Vite
- **Database:** PostgreSQL
- **Containerization:** Docker multi-stage build + Docker Compose
- **CI/CD:** GitHub Actions for CI and Docker Hub publishing

## Features

- User registration, login, logout, and session-based authentication
- Workspace creation and joining by invite code
- Kanban board with `TODO`, `IN_PROGRESS`, and `DONE`
- Task CRUD with assignee, due date, priority, and status
- Task comments for team collaboration
- Filters for status, priority, assignee, overdue tasks, and keyword search
- Dashboard counters for total, overdue, completed, and assigned tasks

## Submission Package

This GitHub repository contains the assignment-ready submission package:

- `Task-Management-System-source.zip`: complete project source code
- `docs/Task_Management_System_Documentation.pdf`: documentation PDF
- local Docker deployment has been verified successfully at `http://localhost:8080`

## Local Development

### Option 1: Run with Docker Compose

```bash
docker compose up --build
```

Application URL: `http://localhost:8080`

### Option 2: Run frontend and backend separately

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## CI/CD

- `ci.yml` runs frontend tests, frontend build, and backend tests
- `docker-publish.yml` publishes a Docker image to Docker Hub from `main`

Docker Hub workflow secrets required:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
