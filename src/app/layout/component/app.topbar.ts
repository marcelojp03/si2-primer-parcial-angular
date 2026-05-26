import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { AppConfigurator } from './app.configurator';
import { NotificationsPanelComponent } from './notifications-panel.component';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '@/core/services/auth.service';
import { WsService } from '@/core/services/ws.service';
import { UserAuth } from '@/core/models/auth.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, FormsModule, StyleClassModule, MenuModule, AppConfigurator, NotificationsPanelComponent],
    template: `
        <p-menu #userMenu [model]="userMenuItems" [popup]="true" appendTo="body" />

        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <img src="/logovpay.png" alt="VPay" class="h-8 object-contain dark:brightness-0 dark:invert" />
                </a>
            </div>

            <div class="layout-topbar-actions">

                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                    <div class="hidden">
                        <button
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </div>
                </div>

                <button class="layout-topbar-menu-button layout-topbar-action"
                        pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein"
                        leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <app-notifications-panel />
                        <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                            <i class="pi pi-user"></i>
                            <span>{{ usuario?.full_name || 'Perfil' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AppTopbar implements OnInit, OnDestroy {
    @ViewChild('userMenu') userMenu!: Menu;

    usuario: UserAuth | null = null;
    userMenuItems: MenuItem[] = [];

    layoutService = inject(LayoutService);
    private authService = inject(AuthService);
    private wsService = inject(WsService);
    private router = inject(Router);
    private subs: Subscription[] = [];

    ngOnInit(): void {
        this.subs.push(
            this.authService.currentUser$.subscribe((user) => {
                this.usuario = user;
                this.buildUserMenu(user);
                if (user) {
                    this.wsService.connect();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subs.forEach((s) => s.unsubscribe());
    }

    private buildUserMenu(user: UserAuth | null): void {
        const name = user?.full_name ?? '';

        this.userMenuItems = [
            ...(name ? [{ label: name, disabled: true }] : []),
            ...(user?.role ? [{ label: user.role, disabled: true, styleClass: 'text-xs' }] : []),
            { separator: true },
            {
                label: 'Mi perfil',
                icon: 'pi pi-user',
                command: () => this.router.navigate(['/workshop'])
            },
            { separator: true },
            {
                label: 'Cerrar sesión',
                icon: 'pi pi-sign-out',
                command: () => this.authService.logout()
            }
        ];
    }

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}

