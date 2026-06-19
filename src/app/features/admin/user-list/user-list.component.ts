import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
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
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, PasswordModule, SelectModule, TableModule, TagModule, ToastModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Usuarios del sistema</h1>
                    <p class="text-sm text-surface-500 mt-1">Gestión de cuentas — SUPERADMIN</p>
                </div>
                <p-button label="Nuevo usuario" icon="pi pi-plus" severity="warn" (onClick)="showCreateDialog = true" />
            </div>

            <p-table [value]="users" [paginator]="users.length > 15" [rows]="15" [rowHover]="true" styleClass="p-datatable-sm" emptyMessage="No hay usuarios registrados" [loading]="loading">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th><th>Correo</th><th>CI</th><th>Teléfono</th><th style="width: 130px">Rol</th>
                        <th style="width: 100px">Estado</th><th style="width: 100px"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td class="font-medium">{{ user.full_name }}</td>
                        <td class="text-surface-500 text-sm">{{ user.email }}</td>
                        <td class="text-surface-500 text-sm">{{ user.ci ?? '—' }}</td>
                        <td class="text-surface-500 text-sm">{{ user.phone ?? '—' }}</td>
                        <td><p-tag [value]="user.role" [severity]="user.role === 'SUPERADMIN' ? 'danger' : 'info'" /></td>
                        <td><p-tag [value]="user.status === 'ACTIVO' ? 'Activo' : 'Inactivo'" [severity]="user.status === 'ACTIVO' ? 'success' : 'secondary'" /></td>
                        <td>
                            <p-button [icon]="user.status === 'ACTIVO' ? 'pi pi-ban' : 'pi pi-check'"
                                      [severity]="user.status === 'ACTIVO' ? 'danger' : 'success'" [text]="true" size="small"
                                      [pTooltip]="user.status === 'ACTIVO' ? 'Suspender' : 'Activar'" (onClick)="toggleActive(user)" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="showCreateDialog" [modal]="true" header="Nuevo usuario" styleClass="w-full max-w-md" [draggable]="false">
            <div class="flex flex-col gap-4 p-2">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Nombre completo *</label>
                    <input pInputText [(ngModel)]="form.full_name" placeholder="Juan Pérez" class="w-full" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Correo *</label>
                        <input pInputText [(ngModel)]="form.email" placeholder="correo@ejemplo.com" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Contraseña *</label>
                        <input pInputText [(ngModel)]="form.password" type="password" placeholder="••••••" class="w-full" />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Rol *</label>
                        <p-select [options]="roleOptions" [(ngModel)]="form.role" optionLabel="label" optionValue="value" styleClass="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Teléfono</label>
                        <input pInputText [(ngModel)]="form.phone" placeholder="70012345" class="w-full" />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">CI</label>
                    <input pInputText [(ngModel)]="form.ci" placeholder="12345678" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" outlined (onClick)="showCreateDialog = false" />
                <p-button label="Crear usuario" severity="warn" [loading]="saving" (onClick)="createUser()" />
            </ng-template>
        </p-dialog>
    `
})
export class UserListComponent implements OnInit {
    private userService = inject(UserService);
    private messageService = inject(MessageService);

    users: UserAuth[] = [];
    loading = true;
    showCreateDialog = false;
    saving = false;

    form = { full_name: '', email: '', password: '', role: 'CLIENTE', phone: '', ci: '' };
    roleOptions = [
        { label: 'Cliente', value: 'CLIENTE' },
        { label: 'Admin. Taller', value: 'ADMIN_TALLER' },
        { label: 'Técnico', value: 'TECNICO' },
        { label: 'Superadmin', value: 'SUPERADMIN' },
    ];

    ngOnInit(): void {
        this.userService.getAll().subscribe({ next: u => { this.users = u; this.loading = false; }, error: () => { this.loading = false; } });
    }

    createUser(): void {
        if (!this.form.full_name || !this.form.email || !this.form.password) {
            this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa nombre, correo y contraseña' });
            return;
        }
        this.saving = true;
        this.userService.createUser(this.form).subscribe({
            next: (u) => {
                this.users.unshift(u);
                this.showCreateDialog = false;
                this.saving = false;
                this.form = { full_name: '', email: '', password: '', role: 'CLIENTE', phone: '', ci: '' };
                this.messageService.add({ severity: 'success', summary: 'Creado', detail: `Usuario ${u.full_name} creado correctamente` });
            },
            error: () => { this.saving = false; }
        });
    }

    toggleActive(user: UserAuth): void {
        const newStatus = user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.userService.update(user.id, { status: newStatus }).subscribe({
            next: updated => {
                const idx = this.users.findIndex(u => u.id === user.id);
                if (idx >= 0) this.users[idx] = updated;
                this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Usuario ${updated.status === 'ACTIVO' ? 'activado' : 'suspendido'} correctamente.`, life: 3000 });
            }
        });
    }
}
