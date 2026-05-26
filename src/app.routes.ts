import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { authGuard } from './app/core/guards/auth.guard';
import { roleGuard, platformAdminGuard } from './app/core/guards/role.guard';

export const appRoutes: Routes = [
    // ─── Rutas públicas ──────────────────────────────────────────────────────
    {
        path: 'login',
        loadComponent: () => import('./app/features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./app/features/auth/register/register.component').then(m => m.RegisterComponent)
    },

    // ─── Rutas protegidas con layout ─────────────────────────────────────────
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // Onboarding (wizard de taller)
            {
                path: 'onboarding/workshop-setup',
                loadComponent: () => import('./app/features/onboarding/workshop-setup/workshop-setup.component').then(m => m.WorkshopSetupComponent)
            },

            // Dashboard
            {
                path: 'dashboard',
                loadComponent: () => import('./app/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },

            // Incidentes
            {
                path: 'incidents',
                loadComponent: () => import('./app/features/incidents/incident-list/incident-list.component').then(m => m.IncidentListComponent)
            },
            {
                path: 'incidents/map',
                loadComponent: () => import('./app/features/incidents/incident-map/incident-map.component').then(m => m.IncidentMapComponent)
            },
            {
                path: 'incidents/:id',
                loadComponent: () => import('./app/features/incidents/incident-detail/incident-detail.component').then(m => m.IncidentDetailComponent)
            },

            // Asignaciones
            {
                path: 'assignments/:id',
                loadComponent: () => import('./app/features/assignments/assignment-detail/assignment-detail.component').then(m => m.AssignmentDetailComponent)
            },

            // Invitaciones con TTL (CU23/24)
            {
                path: 'invitations',
                loadComponent: () => import('./app/features/assignments/invitations/invitations.component').then(m => m.InvitationsComponent)
            },

            // Técnicos
            {
                path: 'technicians',
                loadComponent: () => import('./app/features/technicians/technician-list/technician-list.component').then(m => m.TechnicianListComponent)
            },

            // Perfil del taller
            {
                path: 'workshop',
                loadComponent: () => import('./app/features/workshop/workshop-profile/workshop-profile.component').then(m => m.WorkshopProfileComponent)
            },

            // ─── SUPERADMIN ───────────────────────────────────────────────────
            {
                path: 'admin/users',
                canActivate: [roleGuard('SUPERADMIN')],
                loadComponent: () => import('./app/features/admin/user-list/user-list.component').then(m => m.UserListComponent)
            },
            {
                path: 'admin/workshops',
                canActivate: [roleGuard('SUPERADMIN')],
                loadComponent: () => import('./app/features/admin/workshop-list/workshop-list.component').then(m => m.WorkshopListComponent)
            },
            {
                path: 'admin/specialties',
                canActivate: [roleGuard('SUPERADMIN')],
                loadComponent: () => import('./app/features/admin/specialty-manager/specialty-manager.component').then(m => m.SpecialtyManagerComponent)
            },

            // ─── ADMIN_PLATAFORMA ─────────────────────────────────────────────
            {
                path: 'platform/tenants',
                canActivate: [platformAdminGuard],
                loadComponent: () => import('./app/features/admin-plataforma/tenants/tenant-list.component').then(m => m.TenantListComponent)
            },

            // ─── Reporte NL (CU35) ────────────────────────────────────────────
            {
                path: 'reports/nl',
                loadComponent: () => import('./app/features/dashboard/nl-report/nl-report.component').then(m => m.NlReportComponent)
            },
        ]
    },

    { path: '**', redirectTo: '/login' }
];

