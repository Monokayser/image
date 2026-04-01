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

## Project Structure

- [backend](backend)
- [frontend](frontend)
- [.github/workflows](.github/workflows)
- [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

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

Published image name:

```text
<dockerhub-username>/task-management-system
```

## Submission Checklist

- GitHub repository: this repo
- Documentation: [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- Docker image or instructions: Dockerfile + Docker Compose + Docker Hub workflow

## Finalization Helpers

If GitHub login or Docker startup is blocked on this machine, the repo includes helper scripts to finish the last mile after those external prerequisites are fixed:

```powershell
.\scripts\publish-github.ps1 -Repository "<owner>/<repo-name>"
.\scripts\run-docker.ps1
```
