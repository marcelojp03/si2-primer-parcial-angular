import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { WorkshopService } from '@/core/services/workshop.service';
import { UserService } from '@/core/services/user.service';
import { TenantService } from '@/core/services/tenant.service';
import { Workshop, WorkshopStatus } from '@/core/models/workshop.model';
import { UserAuth } from '@/core/models/auth.model';
import { Tenant } from '@/core/models/tenant.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-workshop-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CheckboxModule, SelectModule, TableModule, TagModule, ToastModule, DialogModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Talleres registrados</h1>
                    <p class="text-sm text-surface-500 mt-1">Gestión de talleres — SUPERADMIN</p>
                </div>
                <p-button label="Nuevo taller" icon="pi pi-plus" severity="warn" (onClick)="openCreate()" />
            </div>

            <p-table [value]="workshops" [paginator]="workshops.length > 15" [rows]="15" [rowHover]="true" styleClass="p-datatable-sm" emptyMessage="No hay talleres registrados" [loading]="loading">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th><th>Dirección</th><th>Teléfono</th><th style="width: 90px">Remolque</th>
                        <th style="width: 70px">24h</th><th style="width: 110px">Estado</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-ws>
                    <tr>
                        <td class="font-medium">{{ ws.name }}</td>
                        <td class="text-surface-500 text-sm">{{ ws.address ?? '—' }}</td>
                        <td class="text-surface-500 text-sm">{{ ws.phone ?? '—' }}</td>
                        <td>@if (ws.has_tow) { <span class="text-orange-500 text-sm font-medium">Sí</span> } @else { <span class="text-surface-400 text-sm">No</span> }</td>
                        <td>@if (ws.is_24_hours) { <span class="text-green-600 text-sm font-medium">Sí</span> } @else { <span class="text-surface-400 text-sm">No</span> }</td>
                        <td><p-tag [value]="ws.status" [severity]="ws.status === 'ACTIVO' ? 'success' : 'secondary'" /></td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="showCreate" [modal]="true" header="Nuevo taller" styleClass="w-full max-w-md" [draggable]="false">
            <div class="flex flex-col gap-4 p-2">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Nombre *</label>
                    <input pInputText [(ngModel)]="form.name" placeholder="Taller Mecánico Ejemplo" class="w-full" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Teléfono</label>
                        <input pInputText [(ngModel)]="form.phone" placeholder="70012345" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Correo</label>
                        <input pInputText [(ngModel)]="form.email" placeholder="taller@mail.com" class="w-full" />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Dirección</label>
                    <input pInputText [(ngModel)]="form.address" placeholder="Av. Principal #123" class="w-full" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Latitud</label>
                        <input pInputText [(ngModel)]="form.latitude" type="number" step="0.000001" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Longitud</label>
                        <input pInputText [(ngModel)]="form.longitude" type="number" step="0.000001" class="w-full" />
                    </div>
                </div>
                <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <p-checkbox [(ngModel)]="form.has_tow" [binary]="true" />
                        <span class="text-sm">Remolque</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <p-checkbox [(ngModel)]="form.is_24_hours" [binary]="true" />
                        <span class="text-sm">24 horas</span>
                    </label>
                </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Administrador del taller</label>
                        <p-select [options]="adminUsers" [(ngModel)]="form.admin_user_id" optionLabel="full_name" optionValue="id" placeholder="Seleccionar administrador" styleClass="w-full" />
                        <span class="text-xs text-surface-400">El tenant se crea automáticamente (1 taller = 1 tenant)</span>
                    </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" outlined (onClick)="showCreate = false" />
                <p-button label="Crear taller" severity="warn" [loading]="saving" (onClick)="create()" />
            </ng-template>
        </p-dialog>
    `
})
export class WorkshopListComponent implements OnInit {
    private workshopService = inject(WorkshopService);
    private userService = inject(UserService);
    private tenantService = inject(TenantService);
    private messageService = inject(MessageService);

    workshops: Workshop[] = [];
    adminUsers: UserAuth[] = [];
    tenants: Tenant[] = [];
    loading = true;
    showCreate = false;
    saving = false;

    form: any = { name: '', phone: '', email: '', address: '', latitude: null, longitude: null, has_tow: false, is_24_hours: false, tenant_id: null, admin_user_id: null };

    ngOnInit(): void {
        this.workshopService.getAllWorkshops().subscribe({ next: ws => { this.workshops = ws; this.loading = false; }, error: () => { this.loading = false; } });
        this.userService.getAll().subscribe({ next: u => this.adminUsers = u.filter(u => u.role === 'ADMIN_TALLER' || u.role === 'SUPERADMIN') });
        this.tenantService.getAll().subscribe({ next: t => this.tenants = t });
    }

    openCreate(): void { this.showCreate = true; }

    create(): void {
        if (!this.form.name) {
            this.messageService.add({ severity: 'warn', summary: 'Requerido', detail: 'Ingresa el nombre del taller' });
            return;
        }
        this.saving = true;
        this.workshopService.create(this.form).subscribe({
            next: (ws) => {
                this.workshops.unshift(ws);
                this.showCreate = false;
                this.saving = false;
                this.form = { name: '', phone: '', email: '', address: '', latitude: null, longitude: null, has_tow: false, is_24_hours: false, tenant_id: null, admin_user_id: null };
                this.messageService.add({ severity: 'success', summary: 'Creado', detail: `Taller ${ws.name} creado correctamente` });
            },
            error: () => { this.saving = false; }
        });
    }
}
