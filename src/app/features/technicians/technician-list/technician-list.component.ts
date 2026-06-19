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
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TechnicianService } from '@/core/services/technician.service';
import { WorkshopService } from '@/core/services/workshop.service';
import { Technician, TechnicianAvailability } from '@/core/models/technician.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-technician-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule, TagModule, TableModule, DialogModule, ToastModule, ToolbarModule, ConfirmDialogModule, RippleModule, IconFieldModule, InputIconModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nuevo" icon="pi pi-plus" severity="warn" class="mr-2" (onClick)="openForm()" />
                <p-button severity="danger" label="Eliminar" icon="pi pi-trash" outlined (onClick)="confirmDeleteSelected()" [disabled]="!selectedTechs?.length" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="technicians" [rows]="10" [paginator]="true" [rowHover]="true"
                 [(selection)]="selectedTechs" dataKey="id"
                 currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
                 [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 20, 30]">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0 text-lg font-semibold">Técnicos</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="full_name">Nombre</th>
                    <th pSortableColumn="ci">CI</th>
                    <th pSortableColumn="phone">Teléfono</th>
                    <th pSortableColumn="availability_status">Disponibilidad</th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-tech>
                <tr>
                    <td><p-tableCheckbox [value]="tech" /></td>
                    <td class="font-medium">{{ tech.full_name }}</td>
                    <td class="text-surface-500">{{ tech.ci ?? '—' }}</td>
                    <td class="text-surface-500">{{ tech.phone ?? '—' }}</td>
                    <td><p-tag [value]="tech.availability_status" [severity]="availabilitySeverity(tech.availability_status)" /></td>
                    <td>
                        <p-button icon="pi pi-pencil" severity="secondary" [text]="true" rounded size="small" (onClick)="openForm(tech)" />
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" rounded size="small" (onClick)="confirmDelete(tech)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr><td colspan="6" class="text-center py-8 text-surface-400">No hay técnicos registrados</td></tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [modal]="true" [closable]="true"
                  [header]="editingId ? 'Editar técnico' : 'Nuevo técnico'"
                  styleClass="w-full max-w-md" [draggable]="false">
            <div class="flex flex-col gap-4 p-2">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Nombre completo *</label>
                    <input pInputText [(ngModel)]="form.full_name" placeholder="Juan Pérez" class="w-full" autofocus />
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
                    <p-select [options]="availabilityOptions" [(ngModel)]="form.availability_status"
                              optionLabel="label" optionValue="value" styleClass="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" outlined (onClick)="dialogVisible = false" />
                <p-button label="Guardar" severity="warn" [loading]="saving" (onClick)="save()" icon="pi pi-check" />
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
    selectedTechs: Technician[] = [];
    workshopId: number | null = null;
    dialogVisible = false;
    saving = false;
    editingId: number | null = null;

    form: Partial<Technician> = { full_name: '', ci: '', phone: '', availability_status: 'AVAILABLE' };

    availabilityOptions = [
        { label: 'Disponible', value: 'AVAILABLE' as TechnicianAvailability },
        { label: 'Ocupado', value: 'BUSY' as TechnicianAvailability },
        { label: 'Inactivo', value: 'INACTIVE' as TechnicianAvailability },
    ];

    ngOnInit(): void {
        this.workshopService.getMyWorkshops().subscribe({
            next: ws => { if (ws.length > 0) { this.workshopId = ws[0].id; this.load(); } }
        });
    }

    private load(): void {
        if (!this.workshopId) return;
        this.technicianService.getAll(this.workshopId).subscribe(t => this.technicians = t);
    }

    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openForm(tech?: Technician): void {
        this.editingId = tech ? tech.id : null;
        this.form = tech ? { ...tech } : { full_name: '', ci: '', phone: '', availability_status: 'AVAILABLE' };
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
                this.saving = false; this.dialogVisible = false; this.load();
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Técnico actualizado.', life: 3000 });
            },
            error: () => { this.saving = false; }
        });
    }

    confirmDelete(tech: Technician): void {
        this.confirmationService.confirm({
            message: `¿Eliminar a ${tech.full_name}?`, header: 'Confirmar eliminación', icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.technicianService.delete(tech.id).subscribe({
                    next: () => { this.load(); this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Técnico eliminado.', life: 3000 }); }
                });
            }
        });
    }

    confirmDeleteSelected(): void {
        this.confirmationService.confirm({
            message: `¿Eliminar los ${this.selectedTechs.length} técnicos seleccionados?`, header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle', acceptLabel: 'Eliminar', acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                let pending = this.selectedTechs.length;
                this.selectedTechs.forEach(t => {
                    this.technicianService.delete(t.id).subscribe({
                        next: () => { pending--; if (pending === 0) { this.load(); this.selectedTechs = []; } }
                    });
                });
                this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: `${this.selectedTechs.length} técnicos eliminados.`, life: 3000 });
            }
        });
    }

    availabilitySeverity(a: TechnicianAvailability): TagSeverity {
        const map: Record<TechnicianAvailability, TagSeverity> = { AVAILABLE: 'success', BUSY: 'warn', INACTIVE: 'secondary' };
        return map[a] ?? 'secondary';
    }
}
