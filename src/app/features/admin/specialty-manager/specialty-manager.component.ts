import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';
import { WorkshopService } from '@/core/services/workshop.service';
import { Specialty } from '@/core/models/workshop.model';

@Component({
    selector: 'app-specialty-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, TableModule, DialogModule, ToastModule, ConfirmDialogModule, CheckboxModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Especialidades</h1>
                <p-button label="Nueva especialidad" icon="pi pi-plus" severity="warn" (onClick)="openForm()" />
            </div>

            <p-table [value]="specialties" [paginator]="specialties.length > 15" [rows]="15"
                     [rowHover]="true" styleClass="p-datatable-sm"
                     emptyMessage="No hay especialidades" [loading]="loading">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th style="width: 80px">Activa</th>
                        <th style="width: 100px"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-sp>
                    <tr>
                        <td class="font-medium">{{ sp.name }}</td>
                        <td class="text-surface-500 text-sm">{{ sp.description ?? '—' }}</td>
                        <td>
                            @if (sp.status === 'ACTIVO') {
                                <span class="text-green-600 text-sm font-medium">Sí</span>
                            } @else {
                                <span class="text-surface-400 text-sm">No</span>
                            }
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <p-button icon="pi pi-pencil" severity="secondary" [text]="true" size="small" (onClick)="openForm(sp)" />
                                <p-button icon="pi pi-trash" severity="danger" [text]="true" size="small" (onClick)="confirmDelete(sp)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [modal]="true"
                  [header]="editingId ? 'Editar especialidad' : 'Nueva especialidad'"
                  styleClass="w-full max-w-md">
            <div class="flex flex-col gap-4 p-2">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Nombre *</label>
                    <input pInputText [(ngModel)]="form.name" placeholder="Ej. Electricidad" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Descripción</label>
                    <textarea pTextarea [(ngModel)]="form.description" rows="3" class="w-full resize-none" placeholder="Descripción opcional"></textarea>
                </div>
                <label class="flex items-center gap-2 cursor-pointer">
                    <p-checkbox [(ngModel)]="form.status" trueValue="ACTIVO" falseValue="INACTIVO" [binary]="true" />
                    <span class="text-sm">Activa</span>
                </label>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" (onClick)="dialogVisible = false" />
                <p-button label="Guardar" severity="warn" [loading]="saving" (onClick)="save()" />
            </ng-template>
        </p-dialog>
    `
})
export class SpecialtyManagerComponent implements OnInit {
    private workshopService = inject(WorkshopService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    specialties: Specialty[] = [];
    loading = true;
    dialogVisible = false;
    saving = false;
    editingId: number | null = null;

    form: Partial<Specialty> = { name: '', description: '', status: 'ACTIVO' };

    ngOnInit(): void {
        this.load();
    }

    private load(): void {
        this.workshopService.getAllSpecialties().subscribe({
            next: s => { this.specialties = s; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    openForm(sp?: Specialty): void {
        if (sp) {
            this.editingId = sp.id;
            this.form = { ...sp };
        } else {
            this.editingId = null;
            this.form = { name: '', description: '', status: 'ACTIVO' };
        }
        this.dialogVisible = true;
    }

    save(): void {
        if (!this.form.name) {
            this.messageService.add({ severity: 'warn', summary: 'Requerido', detail: 'Ingresa el nombre de la especialidad.' });
            return;
        }
        this.saving = true;
        const payload = { name: this.form.name!, description: this.form.description, status: this.form.status };
        const op = this.editingId
            ? this.workshopService.updateSpecialty(this.editingId, payload)
            : this.workshopService.createSpecialty({ name: this.form.name!, description: this.form.description });

        op.subscribe({
            next: () => {
                this.saving = false;
                this.dialogVisible = false;
                this.load();
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Especialidad guardada.', life: 3000 });
            },
            error: () => { this.saving = false; }
        });
    }

    confirmDelete(sp: Specialty): void {
        this.confirmationService.confirm({
            message: `¿Eliminar la especialidad "${sp.name}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                // No hay endpoint de delete en el contrato actual; se actualiza a inactivo
                this.workshopService.updateSpecialty(sp.id, { status: 'INACTIVO' }).subscribe({
                    next: () => {
                        this.load();
                        this.messageService.add({ severity: 'success', summary: 'Desactivada', detail: 'Especialidad desactivada.', life: 3000 });
                    }
                });
            }
        });
    }
}

