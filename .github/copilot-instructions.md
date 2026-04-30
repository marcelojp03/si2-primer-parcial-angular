# Instrucciones Angular — Auxilio Mecánico · SI2 2026

> Documentación completa en el workspace raíz `.github/`:
> - `API.md` → contrato de endpoints (URLs, payloads, respuestas)
> - `ANGULAR.md` → plan de implementación, pantallas, flujos
> - `DATABASE.md` → referencia de campos para tipado de modelos

---

## Stack

- Angular 18+ (standalone components, no NgModules)
- PrimeNG para componentes UI
- TailwindCSS para estilos utilitarios
- JWT almacenado en `sessionStorage`
- Actor: **ADMIN_TALLER** exclusivamente

## Estructura de carpetas

```
src/app/
  core/
    guards/         → AuthGuard, RoleGuard
    interceptors/   → jwt.interceptor.ts (inyecta Bearer token)
    models/         → interfaces TypeScript (mapeo a respuestas API)
    services/       → servicios HTTP (un servicio por dominio)
  features/
    auth/           → login, register
    dashboard/      → métricas del taller
    incidents/      → listado, detalle, aceptar/rechazar
    technicians/    → CRUD técnicos
    workshop/       → perfil del taller, horarios, especialidades
    payments/       → historial de pagos
    ratings/        → calificaciones recibidas
  shared/
    components/     → componentes reutilizables
    pipes/          → pipes de fecha, estado, etc.
```

## Reglas críticas

1. **Solo habla con FastAPI** (`http://localhost:8000/api/v1/`). Ningún otro servicio.
2. **JWT en `sessionStorage`** bajo la clave `access_token`.
3. **Interceptor HTTP** inyecta `Authorization: Bearer <token>` en cada request autenticado.
4. **Polling cada 30 segundos** para listas de incidentes (no WebSockets).
5. **`camelCase`** para variables/funciones, **`PascalCase`** para clases y componentes.
6. **Standalone components** siempre: `standalone: true` en `@Component`.
7. Manejar errores HTTP en servicios con `catchError` y mostrar con `MessageService` de PrimeNG.

## Servicios HTTP principales

| Servicio                  | Endpoints que consume |
|---------------------------|----------------------|
| `AuthService`             | POST /auth/login, POST /auth/register |
| `IncidentService`         | GET /incidents, GET /incidents/{id}, PATCH /assignments/{id}/accept|reject |
| `WorkshopService`         | GET/PUT /workshops/{id}, POST/GET /workshops/{id}/schedules, especialidades |
| `TechnicianService`       | GET/POST/PUT/DELETE /technicians |
| `PaymentService`          | GET /payments |
| `RatingService`           | GET /ratings |
| `DashboardService`        | GET /dashboard/workshop-stats |
| `NotificationService`     | GET /notifications, PATCH /notifications/{id}/read |

## Modelos TypeScript — campos clave

```typescript
// Usar los nombres exactos del API (snake_case como viene del backend)
interface Incident {
  id: number;
  titulo: string;
  nivel_prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'INCIERTA';
  requiere_remolque: boolean;
  estado_incidente_id: number;
  fecha_solicitud: string;
}

interface Workshop {
  id: number;
  nombre: string;
  tiene_remolque: boolean;
  atiende_24_horas: boolean;
  estado: 'ACTIVO' | 'INACTIVO';
  latitud: number;
  longitud: number;
}

interface Technician {
  id: number;
  nombre_completo: string;
  estado_disponibilidad: 'DISPONIBLE' | 'OCUPADO' | 'INACTIVO';
}

interface ServiceAssignment {
  id: number;
  estado_asignacion: 'ASIGNADO' | 'EN_CAMINO' | 'EN_PROCESO' | 'ATENDIDO' | 'CANCELADO' | 'PENDIENTE_PAGO' | 'PAGADO';
  costo_estimado?: number;
  costo_final?: number;
}
```

## Pantallas principales (ADMIN_TALLER)

1. **Login** — credenciales → JWT
2. **Dashboard** — métricas: incidentes activos, técnicos disponibles, calificación promedio
3. **Incidentes** — tabla con polling 30s, filtros por estado y prioridad
4. **Detalle incidente** — evidencias, análisis IA, botón Aceptar/Rechazar
5. **Gestión técnicos** — CRUD con estado de disponibilidad
6. **Perfil taller** — datos, horarios por día, especialidades
7. **Pagos** — historial filtrable
8. **Calificaciones** — listado con comentarios

## Convención de rutas

```
/auth/login
/dashboard
/incidents
/incidents/:id
/technicians
/workshop/profile
/payments
/ratings
```
