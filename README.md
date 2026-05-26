# AuxilioMecánico — Panel de Administración

[![Angular](https://img.shields.io/badge/Angular-18-DD0031.svg)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-17-0065A3.svg)](https://primeng.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Web admin dashboard for an intelligent vehicle emergency assistance platform. Supports two roles: **workshop managers** who handle incoming service requests and manage their technicians, and **platform administrators** with a global cross-tenant view.

---

## Overview

- Workshop managers receive incident assignments, accept or reject service requests, track technician activity and monitor workshop performance metrics
- Platform administrators manage tenants, view global dashboards and oversee the entire operation
- Real-time notifications via WebSocket keep both roles instantly informed of status changes

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Angular 18 (standalone components) |
| **Language** | TypeScript 5.x |
| **UI Library** | PrimeNG 17 |
| **Styling** | TailwindCSS 3.x |
| **HTTP** | Angular HttpClient + interceptors |
| **Auth** | JWT stored in `sessionStorage` |
| **Real-time** | WebSocket client |
| **State** | Angular Signals + Services |

---

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running at `http://localhost:8000`

---

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/marcelojp03/si2-primer-parcial-angular.git
cd si2-primer-parcial-angular

npm install
```

### 2. Configure environment

Edit `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  wsUrl: 'ws://localhost:8000/ws',
};
```

### 3. Run the development server

```bash
ng serve
```

App → `http://localhost:4200`

---

## Build

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

---

## Project Structure

```
src/
└── app/
    ├── core/
    │   ├── services/       # Auth, HTTP, WebSocket services
    │   ├── guards/         # Route guards (role-based)
    │   └── interceptors/   # JWT injection, error handling
    ├── shared/
    │   └── components/     # Reusable UI components
    └── features/
        ├── auth/           # Login
        ├── dashboard/      # Metrics & KPIs
        ├── incidents/      # Incident management
        ├── assignments/    # Service assignment workflow
        ├── technicians/    # Technician management
        ├── workshops/      # Workshop configuration
        └── admin/          # Platform admin (tenants, global metrics)
```

---

## Related

| Repository | Description |
|------------|-------------|
| [si2-primer-parcial-fastapi](https://github.com/marcelojp03/si2-primer-parcial-fastapi) | FastAPI backend API |
| [si2-primer-parcial-flutter](https://github.com/marcelojp03/si2-primer-parcial-flutter) | Flutter mobile app |
