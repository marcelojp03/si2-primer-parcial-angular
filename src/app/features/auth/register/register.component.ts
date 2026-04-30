import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { LayoutService } from '@/layout/service/layout.service';
import { AuthService } from '@/core/services/auth.service';
import { RegisterRequest } from '@/core/models/auth.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule, FloatLabelModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />
        <div class="min-h-screen flex items-center justify-center bg-surface-0 dark:bg-surface-950 p-8">
            <div class="w-full max-w-md">

                <div class="flex justify-center mb-8">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                         style="background: linear-gradient(135deg, #ff8c00, #ff4500)">
                        <i class="pi pi-car text-white text-2xl"></i>
                    </div>
                </div>

                <div class="mb-8 text-center">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-1">Crear cuenta de taller</h2>
                    <p class="text-surface-400 dark:text-surface-500 text-sm">Auxilio Mecánico — Registro de administrador</p>
                </div>

                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Nombre completo *</label>
                        <input pInputText [(ngModel)]="form.full_name" type="text" placeholder="Juan Pérez" class="w-full" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Correo electrónico *</label>
                        <input pInputText [(ngModel)]="form.email" type="email" placeholder="taller@ejemplo.com" class="w-full" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Contraseña *</label>
                        <p-password [(ngModel)]="form.password" [toggleMask]="true"
                                    styleClass="w-full" inputStyleClass="w-full"
                                    placeholder="Mínimo 8 caracteres" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">CI (opcional)</label>
                            <input pInputText [(ngModel)]="form.ci" type="text" placeholder="12345678" class="w-full" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Teléfono (opcional)</label>
                            <input pInputText [(ngModel)]="form.phone" type="text" placeholder="70012345" class="w-full" />
                        </div>
                    </div>

                    <p-button label="Crear cuenta" [loading]="loading" (onClick)="onRegister()"
                              styleClass="w-full mt-2" severity="warn" />

                    <p class="text-center text-sm text-surface-500">
                        ¿Ya tienes cuenta?
                        <a routerLink="/login" class="text-orange-500 font-medium hover:underline cursor-pointer ml-1">
                            Iniciar sesión
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `
})
export class RegisterComponent {
    private auth = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    layoutService = inject(LayoutService);

    form: RegisterRequest = {
        full_name: '',
        email: '',
        password: '',
        role: 'ADMIN_TALLER',
        ci: '',
        phone: ''
    };
    loading = false;

    onRegister(): void {
        if (!this.form.full_name || !this.form.email || !this.form.password) {
            this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Nombre, correo y contraseña son obligatorios.' });
            return;
        }
        if (this.form.password.length < 8) {
            this.messageService.add({ severity: 'warn', summary: 'Contraseña corta', detail: 'La contraseña debe tener al menos 8 caracteres.' });
            return;
        }
        // Limpiar campos opcionales vacíos
        const payload: RegisterRequest = { ...this.form, role: 'ADMIN_TALLER' };
        if (!payload.ci) delete payload.ci;
        if (!payload.phone) delete payload.phone;

        this.loading = true;
        this.auth.register(payload).subscribe({
            next: () => {
                // register() devuelve UserAuth sin token; hacer login para obtenerlo
                this.auth.login(this.form.email, this.form.password).subscribe({
                    next: () => {
                        this.loading = false;
                        this.router.navigate(['/onboarding/workshop-setup']);
                    },
                    error: () => {
                        this.loading = false;
                        this.router.navigate(['/login']);
                    }
                });
            },
            error: (err) => {
                this.loading = false;
                const msg = err?.error?.detail || 'Error al crear la cuenta. Verifica los datos ingresados.';
                this.messageService.add({ severity: 'error', summary: 'Error de registro', detail: msg, life: 5000 });
            }
        });
    }
}

