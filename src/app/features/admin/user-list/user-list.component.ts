import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { UserService } from '@/core/services/user.service';
import { UserAuth } from '@/core/models/auth.model';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, ToastModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Usuarios del sistema</h1>
                    <p class="text-sm text-surface-500 mt-1">Gestión de cuentas — SUPERADMIN</p>
                </div>
            </div>

            <p-table [value]="users" [paginator]="users.length > 15" [rows]="15"
                     [rowHover]="true" styleClass="p-datatable-sm"
                     emptyMessage="No hay usuarios registrados" [loading]="loading">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>CI</th>
                        <th>Teléfono</th>
                        <th style="width: 130px">Rol</th>
                        <th style="width: 100px">Estado</th>
                        <th style="width: 100px"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td class="font-medium">{{ user.full_name }}</td>
                        <td class="text-surface-500 text-sm">{{ user.email }}</td>
                        <td class="text-surface-500 text-sm">{{ user.ci ?? '—' }}</td>
                        <td class="text-surface-500 text-sm">{{ user.phone ?? '—' }}</td>
                        <td>
                            <p-tag [value]="user.role"
                                   [severity]="user.role === 'SUPERADMIN' ? 'danger' : 'info'" />
                        </td>
                        <td>
                            <p-tag [value]="user.status === 'ACTIVO' ? 'Activo' : 'Inactivo'"
                                   [severity]="user.status === 'ACTIVO' ? 'success' : 'secondary'" />
                        </td>
                        <td>
                            <p-button [icon]="user.status === 'ACTIVO' ? 'pi pi-ban' : 'pi pi-check'"
                                      [severity]="user.status === 'ACTIVO' ? 'danger' : 'success'"
                                      [text]="true" size="small"
                                      [pTooltip]="user.status === 'ACTIVO' ? 'Suspender' : 'Activar'"
                                      (onClick)="toggleActive(user)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class UserListComponent implements OnInit {
    private userService = inject(UserService);
    private messageService = inject(MessageService);

    users: UserAuth[] = [];
    loading = true;

    ngOnInit(): void {
        this.userService.getAll().subscribe({
            next: u => { this.users = u; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    toggleActive(user: UserAuth): void {
        const newStatus = user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.userService.update(user.id, { status: newStatus }).subscribe({
            next: updated => {
                const idx = this.users.findIndex(u => u.id === user.id);
                if (idx >= 0) this.users[idx] = updated;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: `Usuario ${updated.status === 'ACTIVO' ? 'activado' : 'suspendido'} correctamente.`,
                    life: 3000
                });
            }
        });
    }
}

