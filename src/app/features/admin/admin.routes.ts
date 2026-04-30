import { Routes } from '@angular/router';

export default [
    { path: '', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
    { path: 'empresas', loadComponent: () => import('./empresas/admin-empresas.component').then(m => m.AdminEmpresasComponent) },
    { path: 'tipos-evento', loadComponent: () => import('./tipos-evento/admin-tipos-evento.component').then(m => m.AdminTiposEventoComponent) },
    { path: 'usuarios', loadComponent: () => import('./usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
    { path: 'transacciones', loadComponent: () => import('./transacciones/admin-transacciones.component').then(m => m.AdminTransaccionesComponent) },
    { path: 'perfil', loadChildren: () => import('../perfil/perfil.routes') },
] as Routes;

