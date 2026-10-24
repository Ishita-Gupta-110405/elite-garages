# Elite Garages | Production-Grade Car Dealership Inventory & Ledger System

> A high-performance, full-stack automotive showroom inventory and acquisition management system engineered with clean architecture, Test-Driven Development (TDD), atomic race-condition prevention, and Role-Based Access Control (RBAC).

# Architectural Overview

Elite Garages is designed to meet strict production-grade engineering standards:
* **Backend**: FastAPI (Python) adhering to strict asynchronous and dependency-injection paradigms, backed by SQLAlchemy ORM and SQLite.
* **Frontend**: React (Vite) styled with Tailwind CSS, featuring an eye-friendly matte charcoal/champagne palette, live executive KPIs, brand-specific vehicle livery mapping, and an itemized checkout payment flow.
* **Security**: JWT-based authentication with granular Role-Based Access Control (Admin / Curator vs. Client / Buyer tiers).
* **Data Integrity**: Atomic stock depletion logic to prevent race conditions during concurrent high-demand purchases, paired with an immutable audit order ledger.

# Tech Stack

* **Backend Framework**: FastAPI, Uvicorn, Pydantic v2, SQLAlchemy
* **Database**: SQLite (Local persistent storage with atomic transaction control)
* **Frontend Library**: React 18, Vite, Lucide Icons, Tailwind CSS v4
* **Testing Suite**: Pytest, Pytest-Asyncio, TestClient (18 comprehensive backend test cases)
* **Containerization**: Docker & Docker Compose

# Quick Start (via Docker Compose)

The entire application can be built and spun up locally with a single command using Docker:

1. Ensure **Docker Desktop** is running.
2. Clone the repository and navigate to the root directory.
3. Run the following command:
   ```bash
   docker compose up --build

# My AI Usage

In accordance with the project guidelines, AI tools were actively leveraged as collaborative assistants throughout the software development lifecycle to accelerate boilerplate generation, structure testing suites, and refine UI/UX styling.

* **AI Tools Used**: Gemini.
* **How AI Was Used**:
  * **Architecture & API Design**: Utilized AI to draft initial FastAPI router structures, SQLAlchemy models, and JWT security dependency injection patterns.
  * **Test-Driven Development (TDD)**: Prompted AI to help generate edge-case unit test assertions for atomic stock purchases and order history deletion.
  * **Frontend Styling & UI Layouts**: Collaborated with AI to design the luxury matte charcoal/champagne color palette, brand-specific livery mapping, and the multi-step checkout payment flow.
* **Reflection & Impact**: 
  AI significantly reduced the time spent writing repetitive boilerplate code and configuring modern tooling (such as Tailwind CSS v4 and Vite proxy mapping). This allowed me to focus my efforts on core backend logic, data integrity, concurrency safety, and verifying the test suite manually.