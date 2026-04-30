import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { WorkshopService } from '@/core/services/workshop.service';
import { Workshop, WorkshopSchedule, Specialty } from '@/core/models/workshop.model';

@Component({
    selector: 'app-workshop-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, CheckboxModule, MultiSelectModule, TableModule, DialogModule, ToastModule, TabsModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="p-6 max-w-4xl mx-auto">
            <h1 class="text-2xl font-bold mb-6 text-surface-900 dark:text-surface-0">Mi Taller</h1>

            @if (!workshop) {
                <div class="text-center py-12 text-surface-400">
                    <i class="pi pi-spin pi-spinner text-3xl mb-3"></i>
                    <p>Cargando información...</p>
                </div>
            } @else {
                <p-tabs [value]="0">
                    <p-tablist>
                        <p-tab [value]="0">Datos generales</p-tab>
                        <p-tab [value]="1">Horarios</p-tab>
                        <p-tab [value]="2">Especialidades</p-tab>
                    </p-tablist>
                    <p-tabpanels>
                        <!-- Tab datos generales -->
                        <p-tabpanel [value]="0">
                            <div class="flex flex-col gap-4 mt-4">
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Nombre</label>
                                    <input pInputText [(ngModel)]="editForm.name" class="w-full" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Descripción</label>
                                    <textarea pTextarea [(ngModel)]="editForm.description" rows="3" class="w-full resize-none"></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label class="text-sm font-medium">Teléfono</label>
                                        <input pInputText [(ngModel)]="editForm.phone" class="w-full" />
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="text-sm font-medium">Correo</label>
                                        <input pInputText [(ngModel)]="editForm.email" class="w-full" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Dirección</label>
                                    <input pInputText [(ngModel)]="editForm.address" class="w-full" />
                                </div>
                                <div class="flex gap-6">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <p-checkbox [(ngModel)]="editForm.has_tow" [binary]="true" />
                                        <span class="text-sm">Servicio de remolque</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <p-checkbox [(ngModel)]="editForm.is_24_hours" [binary]="true" />
                                        <span class="text-sm">Atención 24 horas</span>
                                    </label>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label class="text-sm font-medium">Latitud</label>
                                        <input pInputText [(ngModel)]="editForm.latitude" type="number" step="0.000001" class="w-full" />
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="text-sm font-medium">Longitud</label>
                                        <input pInputText [(ngModel)]="editForm.longitude" type="number" step="0.000001" class="w-full" />
                                    </div>
                                </div>
                                <div class="flex justify-end">
                                    <p-button label="Guardar cambios" icon="pi pi-save" severity="warn" [loading]="saving" (onClick)="saveProfile()" />
                                </div>
                            </div>
                        </p-tabpanel>

                        <!-- Tab horarios -->
                        <p-tabpanel [value]="1">
                            <div class="flex flex-col gap-3 mt-4">
                                @for (s of schedules; track s.id) {
                                    <div class="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                                        <div>
                                            <span class="font-medium text-sm">{{ s.weekday }}</span>
                                            <span class="text-surface-400 text-sm ml-3">{{ s.start_time }} – {{ s.end_time }}</span>
                                        </div>
                                        <p-button icon="pi pi-trash" severity="danger" [text]="true" size="small" (onClick)="deleteSchedule(s.id)" />
                                    </div>
                                }
                                @if (schedules.length === 0) {
                                    <p class="text-surface-400 text-sm text-center py-4">No hay horarios configurados</p>
                                }
                            </div>
                        </p-tabpanel>

                        <!-- Tab especialidades -->
                        <p-tabpanel [value]="2">
                            <div class="flex flex-col gap-4 mt-4">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm text-surface-500">Especialidades activas</span>
                                    <p-button label="Actualizar especialidades" icon="pi pi-plus" severity="secondary" size="small" (onClick)="openSpecialtiesDialog()" />
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    @for (sp of workshopSpecialties; track sp.id) {
                                        <div class="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full px-3 py-1 text-sm">
                                            {{ sp.name }}
                                            <button class="hover:text-red-500" (click)="removeSpecialty(sp.workshopSpecialtyId!)">
                                                <i class="pi pi-times text-xs"></i>
                                            </button>
                                        </div>
                                    }
                                    @if (workshopSpecialties.length === 0) {
                                        <p class="text-surface-400 text-sm py-2">Sin especialidades configuradas</p>
                                    }
                                </div>
                            </div>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            }
        </div>

        <!-- Diálogo agregar especialidades -->
        <p-dialog [(visible)]="specialtiesDialogVisible" header="Agregar especialidades"
                  [modal]="true" styleClass="w-full max-w-md">
            <div class="p-2">
                <p-multiSelect [options]="allSpecialties"
                               [(ngModel)]="selectedToAdd"
                               optionLabel="name"
                               placeholder="Selecciona especialidades"
                               [filter]="true"
                               display="chip"
                               styleClass="w-full" />
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" severity="secondary" (onClick)="specialtiesDialogVisible = false" />
                <p-button label="Agregar" severity="warn" [loading]="saving" (onClick)="addSpecialties()" />
            </ng-template>
        </p-dialog>
    `
})
export class WorkshopProfileComponent implements OnInit {
    private workshopService = inject(WorkshopService);
    private messageService = inject(MessageService);

    workshop: Workshop | null = null;
    editForm: Partial<Workshop> = {};
    schedules: WorkshopSchedule[] = [];
    allSpecialties: (Specialty & { workshopSpecialtyId?: number })[] = [];
    workshopSpecialties: (Specialty & { workshopSpecialtyId?: number })[] = [];
    selectedToAdd: Specialty[] = [];
    specialtiesDialogVisible = false;
    saving = false;

    ngOnInit(): void {
        this.workshopService.getMyWorkshops().subscribe({
            next: ws => {
                if (ws.length > 0) {
                    this.workshop = ws[0];
                    this.editForm = { ...ws[0] };
                    this.loadSchedules();
                    this.loadSpecialties();
                }
            }
        });
    }

    private loadSchedules(): void {
        this.workshopService.getSchedules(this.workshop!.id).subscribe(s => this.schedules = s);
    }

    private loadSpecialties(): void {
        this.workshopService.getAllSpecialties().subscribe(all => {
            this.allSpecialties = all;
        });
        this.workshopService.getWorkshopSpecialties(this.workshop!.id).subscribe(ws => {
            this.workshopSpecialties = ws as any;
        });
    }

    saveProfile(): void {
        this.saving = true;
        this.workshopService.update(this.workshop!.id, this.editForm).subscribe({
            next: updated => {
                this.workshop = updated;
                this.saving = false;
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Perfil del taller actualizado.', life: 3000 });
            },
            error: () => { this.saving = false; }
        });
    }

    deleteSchedule(id: number): void {
        this.workshopService.deleteSchedule(id).subscribe({
            next: () => {
                this.schedules = this.schedules.filter(s => s.id !== id);
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Horario eliminado.', life: 3000 });
            }
        });
    }

    openSpecialtiesDialog(): void {
        this.selectedToAdd = [];
        this.specialtiesDialogVisible = true;
    }

    addSpecialties(): void {
        if (this.selectedToAdd.length === 0) return;
        this.saving = true;
        let done = 0;
        this.selectedToAdd.forEach(sp => {
            this.workshopService.addSpecialty({ workshop_id: this.workshop!.id, specialty_id: sp.id }).subscribe({
                next: () => {
                    done++;
                    if (done === this.selectedToAdd.length) {
                        this.saving = false;
                        this.specialtiesDialogVisible = false;
                        this.loadSpecialties();
                        this.messageService.add({ severity: 'success', summary: 'Agregadas', detail: 'Especialidades actualizadas.', life: 3000 });
                    }
                },
                error: () => { this.saving = false; }
            });
        });
    }

    removeSpecialty(workshopSpecialtyId: number): void {
        this.workshopService.removeSpecialty(workshopSpecialtyId).subscribe({
            next: () => {
                this.loadSpecialties();
                this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Especialidad removida.', life: 3000 });
            }
        });
    }
}

