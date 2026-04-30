import { Routes } from '@angular/router';

export default [
    { path: '', loadChildren: () => import('./dashboard/dashboard.routes') },
    { path: 'eventos', loadChildren: () => import('./eventos/eventos.routes') },
    { path: 'eventos/:eventoId/sectores', loadChildren: () => import('./sectores/sectores.routes') },
    { path: 'eventos/:eventoId/sectores/:sectorId/butacas', loadChildren: () => import('./butacas/butacas.routes') },
    { path: 'eventos/:eventoId/staff', loadChildren: () => import('./staff-evento/staff-evento.routes') },
    { path: 'tickets', loadChildren: () => import('./tickets-evento/tickets-evento.routes') },
    { path: 'usuarios', loadChildren: () => import('./usuarios-empresa/usuarios-empresa.routes') },
    { path: 'perfil', loadChildren: () => import('../perfil/perfil.routes') },
] as Routes;

