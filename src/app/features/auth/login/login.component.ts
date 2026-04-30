import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { LayoutService } from '@/layout/service/layout.service';
import { AuthService } from '@/core/services/auth.service';
import { WorkshopService } from '@/core/services/workshop.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule, MessageModule, FloatLabelModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />
        <div class="min-h-screen flex">

            <!-- Panel izquierdo decorativo -->
            <div class="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col items-center justify-center"
                 style="background: linear-gradient(160deg, #0a1628 0%, #0d2a50 55%, #0a3a70 100%)">
                <div class="absolute top-[-8%] right-[-12%] w-96 h-96 rounded-full pointer-events-none"
                     style="background: radial-gradient(circle, rgba(255,140,0,0.15), transparent 70%)"></div>
                <div class="absolute bottom-[-12%] left-[-8%] w-80 h-80 rounded-full pointer-events-none"
                     style="background: radial-gradient(circle, rgba(255,165,0,0.10), transparent 70%)"></div>
                <div class="relative z-10 flex flex-col items-center text-center px-12 max-w-xs">
                    <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
                         style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12)">
                        <i class="pi pi-car text-white" style="font-size: 2.2rem"></i>
                    </div>
                    <h1 class="text-white text-4xl font-bold mb-3 tracking-tight">Auxilio Mecánico</h1>
                    <p class="text-white/50 text-sm leading-relaxed mb-10">
                        Plataforma de emergencias vehiculares — Panel de gestión para talleres
                    </p>
                    <div class="grid grid-cols-2 gap-4 w-full">
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-exclamation-triangle text-orange-400 text-base"></i>
                            <span class="text-white/60 text-xs">Incidentes</span>
                        </div>
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-wrench text-orange-400 text-base"></i>
                            <span class="text-white/60 text-xs">Técnicos</span>
                        </div>
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-building text-orange-400 text-base"></i>
                            <span class="text-white/60 text-xs">Taller</span>
                        </div>
                        <div class="flex items-center gap-3 rounded-xl p-3"
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
                            <i class="pi pi-chart-bar text-orange-400 text-base"></i>
                            <span class="text-white/60 text-xs">Dashboard</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel derecho: formulario -->
            <div class="w-full lg:w-7/12 flex items-center justify-center bg-surface-0 dark:bg-surface-950 p-8 relative">
                <button type="button"
                        class="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                        (click)="toggleDarkMode()">
                    <i [class]="layoutService.isDarkTheme() ? 'pi pi-sun text-lg' : 'pi pi-moon text-lg'"></i>
                </button>

                <div class="w-full max-w-sm">
                    <div class="flex justify-center mb-10">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                             style="background: linear-gradient(135deg, #ff8c00, #ff4500)">
                            <i class="pi pi-car text-white text-2xl"></i>
                        </div>
                    </div>

                    <div class="mb-8">
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-1">Iniciar sesión</h2>
                        <p class="text-surface-400 dark:text-surface-500 text-sm">Auxilio Mecánico — Gestión de talleres</p>
                    </div>

                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Correo electrónico</label>
                            <input pInputText [(ngModel)]="email" type="email"
                                   placeholder="taller@ejemplo.com"
                                   class="w-full"
                                   (keyup.enter)="onLogin()" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Contraseña</label>
                            <p-password [(ngModel)]="password" [feedback]="false" [toggleMask]="true"
                                        styleClass="w-full"
                                        inputStyleClass="w-full"
                                        placeholder="••••••••"
                                        (keyup.enter)="onLogin()" />
                        </div>

                        <p-button label="Iniciar sesión" [loading]="loading" (onClick)="onLogin()"
                                  styleClass="w-full"
                                  severity="warn" />

                        <p class="text-center text-sm text-surface-500">
                            ¿No tienes cuenta?
                            <a routerLink="/register" class="text-orange-500 font-medium hover:underline cursor-pointer ml-1">
                                Registrar taller
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class LoginComponent {
    private auth = inject(AuthService);
    private workshopService = inject(WorkshopService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    layoutService = inject(LayoutService);

    email = '';
    password = '';
    loading = false;

    onLogin(): void {
        if (!this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Ingresa tu correo y contraseña.' });
            return;
        }
        this.loading = true;
        this.auth.login(this.email, this.password).subscribe({
            next: (response) => {
                // Verificar si tiene taller registrado
                this.workshopService.getMyWorkshops().subscribe({
                    next: (workshops) => {
                        this.loading = false;
                        if (!workshops || workshops.length === 0) {
                            this.router.navigate(['/onboarding/workshop-setup']);
                        } else {
                            this.router.navigate(['/dashboard']);
                        }
                    },
                    error: () => {
                        this.loading = false;
                        this.router.navigate(['/dashboard']);
                    }
                });
            },
            error: (err) => {
                this.loading = false;
                const msg = err?.error?.detail || 'Credenciales incorrectas. Verifica tu correo y contraseña.';
                this.messageService.add({ severity: 'error', summary: 'Error de acceso', detail: msg, life: 4000 });
            }
        });
    }

    toggleDarkMode(): void {
        this.layoutService.toggleDarkMode();
    }
}

