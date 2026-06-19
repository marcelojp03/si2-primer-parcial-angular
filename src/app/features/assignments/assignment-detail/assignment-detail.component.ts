import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AssignmentService } from '@/core/services/assignment.service';
import { TechnicianService } from '@/core/services/technician.service';
import { AuthService } from '@/core/services/auth.service';
import { WorkshopService } from '@/core/services/workshop.service';
import { ServiceAssignment, AssignmentStatus } from '@/core/models/assignment.model';
import { Technician } from '@/core/models/technician.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-assignment-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ButtonModule, TagModule, SelectModule, SkeletonModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="p-6 max-w-3xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
                <a routerLink="/incidents">
                    <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" />
                </a>
                <h1 class="text-xl font-bold text-surface-900 dark:text-surface-0">Seguimiento del servicio</h1>
            </div>

            @if (loading) {
                <p-skeleton height="200px" borderRadius="12px" />
            } @else if (assignment) {
                <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h2 class="text-lg font-semibold">Asignación #{{ assignment.id }}</h2>
                            <p class="text-sm text-surface-500 mt-1">Incidente #{{ assignment.incident_id }}</p>
                        </div>
                        <p-tag [value]="assignment.assignment_status" [severity]="statusSeverity(assignment.assignment_status)" />
                    </div>

                    <div class="grid grid-cols-2 gap-4 text-sm mb-6">
                        @if (assignment.estimated_cost) {
                            <div><span class="text-surface-500">Costo estimado:</span> <strong>Bs. {{ assignment.estimated_cost | number:'1.2-2' }}</strong></div>
                        }
                        @if (assignment.final_cost) {
                            <div><span class="text-surface-500">Costo final:</span> <strong>Bs. {{ assignment.final_cost | number:'1.2-2' }}</strong></div>
                        }
                        @if (assignment.assigned_at) {
                            <div><span class="text-surface-500">Asignado:</span> {{ assignment.assigned_at | date:'dd/MM/yyyy HH:mm' }}</div>
                        }
                    </div>

                    <!-- Cotización -->
                    @if (assignment.quotation_status) {
                        <div class="mb-4 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium">Cotización</span>
                                <p-tag [value]="quotationStatusLabel" [severity]="quotationStatusSeverity" />
                            </div>
                            @if (assignment.quotation_description) {
                                <p class="text-sm text-surface-600 dark:text-surface-400">{{ assignment.quotation_description }}</p>
                            }
                            @if (assignment.estimated_completion_minutes) {
                                <p class="text-xs text-surface-500 mt-1">Tiempo estimado: {{ assignment.estimated_completion_minutes }} min</p>
                            }
                        </div>
                    }

                    <!-- Estado de pago -->
                    @if (showPaymentInfo) {
                        <div class="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-credit-card text-green-600"></i>
                                <span class="text-sm font-medium text-green-700 dark:text-green-300">
                                    @if (assignment.assignment_status === 'PAGADO') {
                                        Pago confirmado
                                    } @else {
                                        Pendiente de pago
                                    }
                                </span>
                            </div>
                            @if (assignment.final_cost) {
                                <p class="text-sm text-green-600 dark:text-green-400 mt-1">Monto: Bs. {{ assignment.final_cost | number:'1.2-2' }}</p>
                            }
                        </div>
                    }

                    <!-- Cambiar estado / asignar técnico -->
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex flex-col gap-2 flex-1">
                            <label class="text-sm font-medium">Técnico asignado</label>
                            <p-select [options]="technicians" [(ngModel)]="selectedTechnicianId"
                                      optionLabel="full_name" optionValue="id"
                                      placeholder="Seleccionar técnico" styleClass="w-full" />
                        </div>
                        <div class="flex flex-col gap-2 flex-1">
                            <label class="text-sm font-medium">Cambiar estado</label>
                            <p-select [options]="statusOptions" [(ngModel)]="selectedStatus"
                                      optionLabel="label" optionValue="value"
                                      placeholder="Seleccionar estado" styleClass="w-full" />
                        </div>
                    </div>

                    <div class="flex justify-end mt-4">
                        <p-button label="Actualizar" icon="pi pi-save"
                                  severity="warn" [loading]="saving"
                                  (onClick)="update()" />
                    </div>
                </div>
            }
        </div>
    `
})
export class AssignmentDetailComponent implements OnInit {
    private assignmentService = inject(AssignmentService);
    private technicianService = inject(TechnicianService);
    private authService = inject(AuthService);
    private workshopService = inject(WorkshopService);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);

    assignment: ServiceAssignment | null = null;
    technicians: Technician[] = [];
    loading = true;
    saving = false;
    selectedTechnicianId: number | null = null;
    selectedStatus: AssignmentStatus | null = null;

    get showPaymentInfo(): boolean {
        return this.assignment?.assignment_status === 'PENDIENTE_PAGO' || this.assignment?.assignment_status === 'PAGADO';
    }

    get quotationStatusLabel(): string {
        const labels: Record<string, string> = {
            'PENDIENTE': 'Pendiente', 'APROBADO': 'Aprobada', 'RECHAZADO': 'Rechazada',
        };
        return labels[this.assignment?.quotation_status ?? ''] ?? '—';
    }

    get quotationStatusSeverity(): TagSeverity {
        const map: Record<string, TagSeverity> = {
            'PENDIENTE': 'warn', 'APROBADO': 'success', 'RECHAZADO': 'danger',
        };
        return map[this.assignment?.quotation_status ?? ''] ?? 'secondary';
    }

    statusOptions = [
        { label: 'En camino', value: 'EN_CAMINO' as AssignmentStatus },
        { label: 'En proceso', value: 'EN_PROCESO' as AssignmentStatus },
        { label: 'Atendido', value: 'ATENDIDO' as AssignmentStatus },
        { label: 'Pendiente de pago', value: 'PENDIENTE_PAGO' as AssignmentStatus },
        { label: 'Pagado', value: 'PAGADO' as AssignmentStatus },
        { label: 'Cancelado', value: 'CANCELADO' as AssignmentStatus },
    ];

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.assignmentService.getByIncidentId(id).subscribe({
            next: a => {
                if (!a) { this.loading = false; return; }
                this.assignment = a;
                this.selectedStatus = a.assignment_status;
                this.selectedTechnicianId = a.technician_id ?? null;
                this.loading = false;
                this.loadTechnicians();
            },
            error: () => { this.loading = false; }
        });
    }

    private loadTechnicians(): void {
        this.workshopService.getMyWorkshops().subscribe({
            next: workshops => {
                if (workshops.length > 0) {
                    this.technicianService.getAll(workshops[0].id).subscribe(t => this.technicians = t);
                }
            }
        });
    }

    update(): void {
        if (!this.assignment) return;
        this.saving = true;
        const payload: Partial<ServiceAssignment> = {};
        if (this.selectedStatus) payload.assignment_status = this.selectedStatus;
        if (this.selectedTechnicianId) payload.technician_id = this.selectedTechnicianId;

        this.assignmentService.update(this.assignment.id, payload).subscribe({
            next: updated => {
                this.assignment = updated;
                this.saving = false;
                this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'La asignación fue actualizada.', life: 3000 });
            },
            error: () => { this.saving = false; }
        });
    }

    statusSeverity(status: AssignmentStatus): TagSeverity {
        const map: Record<AssignmentStatus, TagSeverity> = {
            ASIGNADO: 'info',
            EN_CAMINO: 'warn',
            EN_PROCESO: 'warn',
            ATENDIDO: 'success',
            CANCELADO: 'danger',
            PENDIENTE_PAGO: 'warn',
            PAGADO: 'success',
        };
        return map[status] ?? 'secondary';
    }
}

