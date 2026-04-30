import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-sin-empresa',
    standalone: true,
    imports: [ButtonModule],
    template: `
        <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
            <div class="w-full max-w-md text-center">

                <!-- Icono central -->
                <div class="flex items-center justify-center mb-8">
                    <div class="w-28 h-28 rounded-full flex items-center justify-center"
                         style="background: linear-gradient(135deg, var(--p-primary-100), var(--p-primary-200))">
                        <i class="pi pi-building text-primary" style="font-size: 3rem"></i>
                    </div>
                </div>

                <!-- Título y mensaje -->
                <h1 class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-4">
                    Sin empresa asignada
                </h1>
                <p class="text-surface-500 dark:text-surface-400 text-base leading-relaxed mb-2">
                    Tu usuario fue autenticado correctamente, pero no está asociado a ninguna empresa.
                </p>
                <p class="text-surface-400 dark:text-surface-500 text-sm leading-relaxed mb-10">
                    Contacta al administrador del sistema para que te asigne una empresa.
                </p>

                <!-- Acciones -->
                <div class="flex flex-col gap-3">
                    <p-button
                        label="Reintentar"
                        icon="pi pi-refresh"
                        styleClass="w-full"
                        [loading]="retrying"
                        (onClick)="onRetry()"
                    />
                    <p-button
                        label="Cerrar sesión"
                        icon="pi pi-sign-out"
                        severity="secondary"
                        styleClass="w-full"
                        [outlined]="true"
                        (onClick)="onLogout()"
                    />
                </div>

            </div>
        </div>
    `
})
export class SinEmpresa implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    retrying = false;

    ngOnInit(): void {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/auth/login']);
            return;
        }
        const user = this.authService.getCurrentUser();
        if (user?.rolCodigo === 'SUPERADMIN') {
            this.router.navigate(['/admin']);
        }
    }

    onRetry(): void {
        this.retrying = true;
        this.authService.getMe().subscribe({
            next: (res) => {
                this.retrying = false;
                const empresas = res.data?.empresas ?? [];
                if (empresas.length > 0) {
                    this.router.navigate(['/']);
                }
                // si sigue sin empresas, permanece en esta página
            },
            error: () => {
                this.retrying = false;
            }
        });
    }

    onLogout(): void {
        this.authService.logout();
    }
}

