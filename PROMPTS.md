# PROMPTS.md - Development Chat Logs

This file records key prompts and collaborative workflows utilized during the engineering of the Elite Garages Full-Stack Inventory System.

## 1. Backend Architecture & Atomic Purchasing
- **Prompt**: "Design a FastAPI backend with SQLAlchemy and SQLite that implements JWT-based authentication, RBAC, and atomic inventory reduction to prevent race conditions during concurrent vehicle purchases. Write comprehensive Pytest test cases for TDD verification."
- **Focus**: FastAPI dependency injection, atomic database transactions, unique constraints, and Pytest test client fixtures.

## 2. Frontend Showroom & Payment UX
- **Prompt**: "Build a React and Vite frontend with Tailwind CSS styled as a luxury automotive showroom (Elite Garages). Include brand-specific car livery themes, an executive KPI ribbon, live search filtering, and a dedicated multi-step checkout payment flow before finalizing stock deduction."
- **Focus**: Component architecture, API service layer abstraction, responsive CSS grids, and modal state management.

## 3. DevOps & Containerization
- **Prompt**: "Write Dockerfiles for the FastAPI backend and Vite frontend, and link them using a root `docker-compose.yml` file so evaluators can spin up the full-stack system with a single command."
- **Focus**: Multi-stage container builds, environment configuration, port mapping, and volume mounting.