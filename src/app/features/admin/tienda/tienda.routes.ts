import { Routes } from '@angular/router';
import { TiendaLayout } from './layout/tienda-layout.component';

export default [
    {
        path: '',
        component: TiendaLayout,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/tienda-eventos.component').then(m => m.TiendaEventosComponent),
            },
            {
                path: 'evento/:eventoId',
                loadComponent: () => import('./pages/tienda-sectores.component').then(m => m.TiendaSectoresComponent),
            },
            {
                path: 'checkout',
                loadComponent: () => import('./pages/tienda-checkout.component').then(m => m.TiendaCheckoutComponent),
            },
            {
                path: 'confirmacion',
                loadComponent: () => import('./pages/tienda-confirmacion.component').then(m => m.TiendaConfirmacionComponent),
            },
        ],
    },
] as Routes;

