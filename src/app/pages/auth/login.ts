import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { AuthService } from '@/core/services/auth.service';
import { LayoutService } from '../../layout/service/layout.service';
import { AppConfigurator } from '../../layout/component/app.configurator';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule, FloatLabelModule, MessageModule, CommonModule, StyleClassModule, AppConfigurator],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />
        <div class="min-h-screen flex">

            <!-- Left branded panel -->
            <div class="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col items-center justify-center"
                 style="background: linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #334155 100%)">
                <div class="absolute top-[-8%] right-[-12%] w-96 h-96 rounded-full pointer-events-none"
                     style="background: radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)"></div>
                <div class="absolute bottom-[-12%] left-[-8%] w-80 h-80 rounded-full pointer-events-none"
                     style="background: radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%)"></div>

                <div class="relative z-10 flex flex-col items-center text-center px-12 max-w-xs">
                    <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
                         style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12)">
                        <i class="pi pi-car text-white" style="font-size: 2.2rem"></i>
                    </div>

                    <h1 class="text-white text-4xl font-bold mb-3 tracking-tight">Auxilio Mecánico</h1>
                    <p class="text-white/50 text-sm leading-relaxed mb-10">
                        Plataforma inteligente de atención de emergencias vehiculares
                    </p>

                    <div class="grid grid-cols-2 gap-4 w-full">
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-map-marker text-white/60 text-base"></i>
                            <span class="text-white/60 text-xs">Geolocalización</span>
                        </div>
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-microchip text-white/60 text-base"></i>
                            <span class="text-white/60 text-xs">IA</span>
                        </div>
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-bolt text-white/60 text-base"></i>
                            <span class="text-white/60 text-xs">Tiempo real</span>
                        </div>
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-credit-card text-white/60 text-base"></i>
                            <span class="text-white/60 text-xs">Pagos</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right form panel -->
            <div class="w-full lg:w-7/12 flex items-center justify-center bg-surface-0 dark:bg-surface-950 p-8 relative">
                <button type="button" class="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }" class="text-lg"></i>
                </button>

                <div class="hidden">
                    <button pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>

                <div class="w-full max-w-sm">
                    <div class="flex justify-center mb-10">
                        <i class="pi pi-car text-5xl text-orange-500"></i>
                    </div>

                    <div class="mb-8">
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-1">Iniciar sesión</h2>
                        <p class="text-surface-400 dark:text-surface-500 text-sm">Panel de gestión — Auxilio Mecánico</p>
                    </div>

                    @if (sessionExpired) {
                        <p-message severity="warn" styleClass="w-full mb-4">
                            <span class="flex items-center gap-2">
                                <i class="pi pi-clock"></i>
                                Tu sesión ha expirado. Inicia sesión nuevamente.
                            </span>
                        </p-message>
                    }

                    @if (loginError) {
                        <p-message severity="error" styleClass="w-full mb-4">
                            {{ loginError }}
                        </p-message>
                    }

                    <div class="flex flex-col gap-5">
                        <p-floatlabel variant="on">
                            <input pInputText id="email" type="email" class="w-full" autocomplete="email"
                                   [(ngModel)]="email" (keyup.enter)="onLogin()" />
                            <label for="email">Correo electrónico</label>
                        </p-floatlabel>

                        <p-floatlabel variant="on">
                            <p-password id="password" [(ngModel)]="password" [toggleMask]="true"
                                        [fluid]="true" [feedback]="false" (keyup.enter)="onLogin()" />
                            <label for="password">Contraseña</label>
                        </p-floatlabel>

                        <p-button label="Ingresar" icon="pi pi-sign-in" styleClass="w-full mt-1"
                                  [loading]="loading" (onClick)="onLogin()" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);
    layoutService = inject(LayoutService);

    email = '';
    password = '';
    loading = false;
    sessionExpired = false;
    loginError: string | null = null;

    ngOnInit(): void {
        this.sessionExpired = this.route.snapshot.queryParamMap.get('sessionExpired') === '1';
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    onLogin(): void {
        if (!this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese correo y contraseña', life: 3000 });
            return;
        }

        this.loading = true;
        this.loginError = null;

        this.authService.login(this.email, this.password).subscribe({
            next: () => {
                this.loading = false;
                this.messageService.add({ severity: 'success', summary: '¡Bienvenido!', detail: 'Inicio de sesión exitoso', life: 2000, icon: 'pi pi-check' });
                setTimeout(() => this.router.navigate(['/dashboard']), 1000);
            },
            error: () => {
                this.loading = false;
                this.loginError = 'Credenciales inválidas. Verifica tu correo y contraseña.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Credenciales inválidas', life: 4000 });
            }
        });
    }
}
