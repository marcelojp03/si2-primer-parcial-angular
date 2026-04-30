import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TechnicianService } from '@/core/services/technician.service';
import { WorkshopService } from '@/core/services/workshop.service';
import { Technician, TechnicianAvailability } from '@/core/models/technician.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-technician-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule, TagModule, TableModule, DialogModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />

        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Técnicos</h1>
                <p-button label="Agregar técnico" icon="pi pi-plus" severity="warn" (onClick)="openForm()" />
            </div>

            <p-table [value]="technicians" [paginator]="technicians.length > 10" [rows]="10"
                     [rowHover]="true" styleClass="p-datatable-sm"
                     emptyMessage="No hay técnicos registrados">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th>
                        <th>CI</th>
                        <th>Teléfono</th>
                        <th>Disponibilidad</th>
                        <th style="width: 120px"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-tech>
                    <tr>
                        <td class="font-medium">{{ tech.full_name }}</td>
                        <td class="text-surface-500 text-sm">{{ tech.ci ?? '—' }}</td>
                        <td class="text-surface-500 text-sm">{{ tech.phone ?? '—' }}</td>
                        <td>
                            <p-tag [value]="tech.availability_status"
                                   [severity]="availabilitySeverity(tech.availability_status)" />
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <p-button icon="pi pi-pencil" severity="secondary" [text]="true" size="small" (onClick)="openForm(tech)" />
                                <p-button icon="pi pi-trash" severity="danger" [text]="true" size="small" (onClick)="confirmDelete(tech)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Diálogo crear/editar -->
        <p-dialog [(visible)]="dialogVisible" [modal]="true" [closable]="true"
                  [header]="editingId ? 'Editar técnico' : 'Nuevo técnico'"
                  styleClass="w-full max-w-md">
            <div class="flex flex-col gap-4 p-2">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Nombre completo *</label>
                    <input pInputText [(ngModel)]="form.full_name" placeholder="Juan Pérez" class="w-full" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">CI</label>
                        <input pInputText [(ngModel)]="form.ci" placeholder="12345678" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Teléfono</label>
                        <input pInputText [(ngModel)]="form.phone" placeholder="70012345" class="w-full" />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Disponibilidad</label>
                    <p-select [options]="availabilityOptions"
                              [(ngModel)]="form.availability_status"
                              optionLabel="label" optionValue="value"
                              styleClass="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" (onClick)="dialogVisible = false" />
                <p-button label="Guardar" severity="warn" [loading]="saving" (onClick)="save()" />
            </ng-template>
        </p-dialog>
    `
})
export class TechnicianListComponent implements OnInit {
    private technicianService = inject(TechnicianService);
    private workshopService = inject(WorkshopService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    technicians: Technician[] = [];
    workshopId: number | null = null;
    dialogVisible = false;
    saving = false;
    editingId: number | null = null;

    form: Partial<Technician> = {
        full_name: '',
        ci: '',
        phone: '',
        availability_status: 'AVAILABLE'
    };

    availabilityOptions = [
        { label: 'Disponible', value: 'AVAILABLE' as TechnicianAvailability },
        { label: 'Ocupado', value: 'BUSY' as TechnicianAvailability },
        { label: 'Inactivo', value: 'INACTIVE' as TechnicianAvailability },
    ];

    ngOnInit(): void {
        this.workshopService.getMyWorkshops().subscribe({
            next: ws => {
                if (ws.length > 0) {
                    this.workshopId = ws[0].id;
                    this.loadTechnicians();
                }
            }
        });
    }

    private loadTechnicians(): void {
        if (!this.workshopId) return;
        this.technicianService.getAll(this.workshopId).subscribe(t => this.technicians = t);
    }

    openForm(tech?: Technician): void {
        if (tech) {
            this.editingId = tech.id;
            this.form = { ...tech };
        } else {
            this.editingId = null;
            this.form = { full_name: '', ci: '', phone: '', availability_status: 'AVAILABLE' };
        }
        this.dialogVisible = true;
    }

    save(): void {
        if (!this.form.full_name) {
            this.messageService.add({ severity: 'warn', summary: 'Requerido', detail: 'Ingresa el nombre del técnico.' });
            return;
        }
        this.saving = true;
        const data = { ...this.form, workshop_id: this.workshopId! };
        const op = this.editingId
            ? this.technicianService.update(this.editingId, data)
            : this.technicianService.create(data);

        op.subscribe({
            next: () => {
                this.saving = false;
                this.dialogVisible = false;
                this.loadTechnicians();
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Técnico actualizado correctamente.', life: 3000 });
            },
            error: () => { this.saving = false; }
        });
    }

    confirmDelete(tech: Technician): void {
        this.confirmationService.confirm({
            message: `¿Eliminar a ${tech.full_name}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.technicianService.delete(tech.id).subscribe({
                    next: () => {
                        this.loadTechnicians();
                        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Técnico eliminado.', life: 3000 });
                    }
                });
            }
        });
    }

    availabilitySeverity(a: TechnicianAvailability): TagSeverity {
        const map: Record<TechnicianAvailability, TagSeverity> = {
            AVAILABLE: 'success', BUSY: 'warn', INACTIVE: 'secondary'
        };
        return map[a] ?? 'secondary';
    }
}

