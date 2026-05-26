import { Component, inject, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item; let i = $index) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
            }
            @if (item.separator) {
                <li class="menu-separator"></li>
            }
        }
    </ul>`
})
export class AppMenu implements OnInit {
    private authService = inject(AuthService);
    model: MenuItem[] = [];

    ngOnInit() {
        const user = this.authService.getCurrentUser();
        const isSuperadmin = user?.role === 'SUPERADMIN';
        const isPlatformAdmin = isSuperadmin && user?.is_platform_admin === true;
        const isAdminTaller = user?.role === 'ADMIN_TALLER';

        this.model = [
            {
                label: 'Principal',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard'] },
                    { label: 'Incidentes', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/incidents'] },
                    { label: 'Mapa en vivo', icon: 'pi pi-fw pi-map', routerLink: ['/incidents/map'] },
                    ...(isAdminTaller ? [
                        { label: 'Invitaciones', icon: 'pi pi-fw pi-bell', routerLink: ['/invitations'] },
                        { label: 'Técnicos', icon: 'pi pi-fw pi-wrench', routerLink: ['/technicians'] },
                        { label: 'Mi Taller', icon: 'pi pi-fw pi-building', routerLink: ['/workshop'] },
                    ] : []),
                    ...(!isSuperadmin && !isAdminTaller ? [
                        { label: 'Técnicos', icon: 'pi pi-fw pi-wrench', routerLink: ['/technicians'] },
                        { label: 'Mi Taller', icon: 'pi pi-fw pi-building', routerLink: ['/workshop'] },
                    ] : [])
                ]
            },
            ...(isSuperadmin && !isPlatformAdmin ? [
                { separator: true } as MenuItem,
                {
                    label: 'Administración',
                    items: [
                        { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                        { label: 'Talleres', icon: 'pi pi-fw pi-car', routerLink: ['/admin/workshops'] },
                        { label: 'Especialidades', icon: 'pi pi-fw pi-tags', routerLink: ['/admin/specialties'] },
                    ]
                } as MenuItem
            ] : []),
            ...(isPlatformAdmin ? [
                { separator: true } as MenuItem,
                {
                    label: 'Plataforma',
                    items: [
                        { label: 'Tenants', icon: 'pi pi-fw pi-sitemap', routerLink: ['/platform/tenants'] },
                        { label: 'Reporte NL', icon: 'pi pi-fw pi-search-plus', routerLink: ['/reports/nl'] },
                        { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                        { label: 'Talleres', icon: 'pi pi-fw pi-car', routerLink: ['/admin/workshops'] },
                        { label: 'Especialidades', icon: 'pi pi-fw pi-tags', routerLink: ['/admin/specialties'] },
                    ]
                } as MenuItem
            ] : [])
        ];
    }
}

