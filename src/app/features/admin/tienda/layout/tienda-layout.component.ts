import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { StyleClassModule } from 'primeng/styleclass';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AppConfigurator } from '@/layout/component/app.configurator';
import { LayoutService } from '@/layout/service/layout.service';
import { CarritoService } from '../services/carrito.service';
import { CarritoItem } from '../models/carrito.model';
import { AuthService } from '@/core/services/auth.service';
import { UsuarioAuth } from '@/core/models/auth.model';

@Component({
    selector: 'app-tienda-layout',
    standalone: true,
    imports: [RouterModule, CommonModule, DrawerModule, ButtonModule, DividerModule, MenuModule, StyleClassModule, AppConfigurator],
    template: `
        <!-- Cart Drawer -->
        <p-drawer [(visible)]="carritoVisible" position="right" [style]="{ width: '22rem' }">
            <ng-template #header>
                <div class="flex items-center justify-between w-full pr-2">
                    <span class="font-semibold text-base">Shopping cart</span>
                </div>
            </ng-template>

            <div class="flex flex-col h-full">
                @if (items.length === 0) {
                    <div class="flex-1 flex items-center justify-center text-surface-400">
                        <div class="text-center">
                            <i class="pi pi-shopping-cart text-4xl mb-3 block"></i>
                            <p class="text-sm">Tu carrito está vacío</p>
                        </div>
                    </div>
                } @else {
                    <div class="flex-1 overflow-auto flex flex-col gap-1">
                        @for (item of items; track item.sectorId) {
                            <div class="flex items-start gap-3 py-4 border-b border-surface-200 dark:border-surface-700">
                                <div class="w-14 h-14 bg-surface-100 dark:bg-surface-700 rounded flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-ticket text-surface-400 text-xl"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-sm leading-tight mb-2 text-surface-800 dark:text-surface-100">
                                        {{ item.eventoNombre }} - {{ item.sectorNombre }}
                                    </p>
                                    <div class="flex items-center gap-1">
                                        <button
                                            class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600 flex items-center justify-center text-sm cursor-pointer bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                                            (click)="updateCantidad(item, item.cantidad - 1)"
                                        >-</button>
                                        <span class="text-sm font-medium w-6 text-center text-surface-800 dark:text-surface-100">{{ item.cantidad }}</span>
                                        <button
                                            class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600 flex items-center justify-center text-sm cursor-pointer bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                                            (click)="updateCantidad(item, item.cantidad + 1)"
                                        >+</button>
                                    </div>
                                    <p class="text-primary text-sm mt-1 font-medium">
                                        {{ item.cantidad }} × Bs.{{ item.precioBase.toFixed(2) }}
                                    </p>
                                </div>
                                <button
                                    class="text-surface-300 hover:text-red-500 bg-transparent border-0 cursor-pointer p-1 transition-colors"
                                    (click)="removeItem(item)"
                                ><i class="pi pi-times text-sm"></i></button>
                            </div>
                        }
                    </div>

                    <!-- Footer -->
                    <div class="pt-4 pb-2">
                        <div class="flex justify-between items-center mb-5">
                            <span class="font-bold text-surface-800 dark:text-surface-100">Subtotal:</span>
                            <span class="text-primary font-bold text-xl">Bs.{{ total.toFixed(2) }}</span>
                        </div>
                        <div class="flex flex-col gap-2">
                            <p-button
                                label="VER CARRITO"
                                styleClass="w-full"
                                severity="danger"
                                (onClick)="irACheckout()"
                            />
                            <p-button
                                label="FINALIZAR COMPRA"
                                styleClass="w-full"
                                severity="danger"
                                [outlined]="true"
                                (onClick)="irACheckout()"
                            />
                        </div>
                    </div>
                }
            </div>
        </p-drawer>

        <!-- Layout -->
        <div class="min-h-screen bg-surface-50 dark:bg-surface-950">
            <!-- Header -->
            <header class="bg-surface-0 dark:bg-surface-900 shadow-sm border-b border-surface-200 dark:border-surface-700 sticky top-0 z-40">
                <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <a routerLink="/tienda" class="flex items-center gap-2">
                        <img src="/logovpay.png" alt="VPay" class="h-8 object-contain dark:brightness-0 dark:invert" />
                    </a>

                    <div class="flex items-center gap-3">

                        <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                            <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                        </button>

                        <div class="hidden">
                            <div class="relative">
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

                        <!-- Cart button -->
                        <button
                            class="flex items-center gap-2 cursor-pointer text-surface-700 dark:text-surface-200 hover:text-primary transition-colors bg-transparent border-0 outline-none ml-4"
                            (click)="carritoVisible = true"
                        >
                            <i class="pi pi-shopping-cart text-xl"></i>
                            @if (totalItems > 0) {
                                <span class="font-semibold">{{ totalItems }} / Bs.{{ total.toFixed(2) }}</span>
                            } @else {
                                <span class="text-sm text-surface-400">Carrito</span>
                            }
                        </button>

                        <!-- User menu -->
                        <p-menu #userMenu [model]="userMenuItems" [popup]="true" appendTo="body" />
                        <button
                            class="flex items-center gap-2 cursor-pointer text-surface-700 dark:text-surface-200 hover:text-primary transition-colors bg-transparent border-0 outline-none px-2 py-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
                            (click)="userMenu.toggle($event)"
                        >
                            <i class="pi pi-user text-lg"></i>
                            <span class="text-sm font-medium hidden sm:inline">{{ usuario?.nombre || 'Perfil' }}</span>
                            <i class="pi pi-chevron-down text-xs text-surface-400 hidden sm:inline"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main class="max-w-6xl mx-auto px-4 py-8">
                <router-outlet />
            </main>
        </div>
    `
})
export class TiendaLayout implements OnInit, OnDestroy {
    @ViewChild('userMenu') userMenu!: Menu;

    layoutService = inject(LayoutService);
    private carritoService = inject(CarritoService);
    private authService = inject(AuthService);
    private router = inject(Router);

    carritoVisible = false;
    items: CarritoItem[] = [];
    usuario: UsuarioAuth | null = null;
    userMenuItems: MenuItem[] = [];
    private subs: Subscription[] = [];

    get totalItems(): number { return this.carritoService.totalItems; }
    get total(): number { return this.carritoService.total; }

    ngOnInit(): void {
        this.subs.push(
            this.carritoService.items$.subscribe(items => (this.items = items))
        );
        this.subs.push(
            this.authService.currentUser$.subscribe(user => {
                this.usuario = user;
                this.buildUserMenu(user);
            })
        );
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    private buildUserMenu(user: UsuarioAuth | null): void {
        const name = user ? `${user.nombre} ${user.apellidoPaterno ?? ''}`.trim() : '';
        this.userMenuItems = [
            ...(name ? [{ label: name, disabled: true }] : []),
            { separator: true },
            {
                label: 'Mi perfil',
                icon: 'pi pi-user',
                command: () => this.router.navigate(['/perfil'])
            },
            { separator: true },
            {
                label: 'Cerrar sesión',
                icon: 'pi pi-sign-out',
                command: () => this.authService.logout()
            }
        ];
    }

    updateCantidad(item: CarritoItem, cantidad: number): void {
        if (cantidad < 0) return;
        this.carritoService.actualizar(item.eventoId, item.sectorId, cantidad);
    }

    removeItem(item: CarritoItem): void {
        this.carritoService.eliminar(item.eventoId, item.sectorId);
    }

    irACheckout(): void {
        this.carritoVisible = false;
        this.router.navigate(['/tienda/checkout']);
    }

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}

