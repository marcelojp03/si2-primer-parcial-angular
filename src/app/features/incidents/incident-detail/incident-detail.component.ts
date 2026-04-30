import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IncidentService } from '@/core/services/incident.service';
import { AssignmentService } from '@/core/services/assignment.service';
import { AuthService } from '@/core/services/auth.service';
import { Incident, IncidentEvidence, AiAnalysis } from '@/core/models/incident.model';
import { PriorityLevel } from '@/core/models/incident.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-incident-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, CardModule, DividerModule, SkeletonModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-right" />
        <p-confirmdialog />
        <div class="p-6 max-w-4xl mx-auto">

            <div class="flex items-center gap-3 mb-6">
                <a routerLink="/incidents">
                    <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" />
                </a>
                <h1 class="text-xl font-bold text-surface-900 dark:text-surface-0">Detalle del incidente</h1>
            </div>

            @if (loading) {
                <p-skeleton height="200px" borderRadius="12px" />
            } @else if (incident) {

                <!-- Cabecera -->
                <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ incident.title }}</h2>
                            <p class="text-sm text-surface-500 mt-1">ID: {{ incident.id }} · {{ incident.requested_at | date:'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                        <div class="flex gap-2">
                            <p-tag [value]="incident.priority_level || ''" [severity]="prioritySeverity(incident.priority_level || 'BAJA')" />
                            @if (incident.requires_tow) {
                                <p-tag value="Remolque" severity="warn" icon="pi pi-car" />
                            }
                        </div>
                    </div>
                    @if (incident.description_text) {
                        <p class="text-surface-600 dark:text-surface-400">{{ incident.description_text }}</p>
                    }
                </div>

                <!-- Análisis IA -->
                @if (aiAnalysis) {
                    <div class="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-6 mb-4">
                        <div class="flex items-center gap-2 mb-4">
                            <i class="pi pi-microchip text-blue-600 dark:text-blue-400"></i>
                            <h3 class="font-semibold text-blue-800 dark:text-blue-300">Análisis de Inteligencia Artificial</h3>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            @if (aiAnalysis.predicted_priority_level) {
                                <div><span class="text-surface-500">Prioridad sugerida:</span>
                                    <p-tag [value]="aiAnalysis.predicted_priority_level" [severity]="prioritySeverity(aiAnalysis.predicted_priority_level!)" />
                                </div>
                            }
                            @if (aiAnalysis.confidence_score !== undefined) {
                                <div><span class="text-surface-500">Confianza:</span> <strong>{{ (aiAnalysis.confidence_score * 100) | number:'1.0-0' }}%</strong></div>
                            }
                        </div>
                        @if (aiAnalysis.generated_summary) {
                            <p class="mt-3 text-surface-600 dark:text-surface-400 text-sm">{{ aiAnalysis.generated_summary }}</p>
                        }
                        @if (aiAnalysis.transcribed_audio) {
                            <div class="mt-3 p-3 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
                                <p class="text-xs text-surface-400 mb-1">Transcripción de audio:</p>
                                <p class="text-sm italic">{{ aiAnalysis.transcribed_audio }}</p>
                            </div>
                        }
                    </div>
                }

                <!-- Evidencias -->
                @if (evidences.length > 0) {
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4">
                        <h3 class="font-semibold mb-4 text-surface-900 dark:text-surface-0">Evidencias</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            @for (ev of evidences; track ev.id) {
                                @if (ev.evidence_type === 'IMAGE') {
                                    <img [src]="ev.file_url" alt="Evidencia" class="rounded-lg w-full h-32 object-cover border border-surface-200 dark:border-surface-700" />
                                } @else {
                                    <div class="rounded-lg border border-surface-200 dark:border-surface-700 p-3 flex items-center gap-2">
                                        <i class="pi pi-file-audio text-surface-400 text-xl"></i>
                                        <span class="text-sm text-surface-500">{{ ev.evidence_type }}</span>
                                    </div>
                                }
                            }
                        </div>
                    </div>
                }

                <!-- Acciones -->
                <div class="flex gap-3 justify-end">
                    <p-button label="Rechazar solicitud" icon="pi pi-times"
                              severity="danger" [outlined]="true"
                              [loading]="actionLoading"
                              (onClick)="onReject()" />
                    <p-button label="Aceptar solicitud" icon="pi pi-check"
                              severity="success"
                              [loading]="actionLoading"
                              (onClick)="onAccept()" />
                </div>
            }
        </div>
    `
})
export class IncidentDetailComponent implements OnInit {
    private incidentService = inject(IncidentService);
    private assignmentService = inject(AssignmentService);
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    incident: Incident | null = null;
    evidences: IncidentEvidence[] = [];
    aiAnalysis: AiAnalysis | null = null;
    loading = true;
    actionLoading = false;

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.loadIncident(id);
    }

    private loadIncident(id: number): void {
        this.incidentService.getById(id).subscribe({
            next: inc => {
                this.incident = inc;
                this.loading = false;
                this.incidentService.getEvidences(id).subscribe(ev => this.evidences = ev);
                this.incidentService.getAiAnalysis(id).subscribe({ next: ai => this.aiAnalysis = ai, error: () => {} });
            },
            error: () => { this.loading = false; }
        });
    }

    onAccept(): void {
        if (!this.incident) return;
        const user = this.authService.getCurrentUser();
        this.actionLoading = true;
        // Primero calcular candidatos para obtener el workshopId del taller actual
        this.assignmentService.getCandidates(this.incident.id).subscribe({
            next: candidates => {
                // Buscar si el taller del usuario está entre los candidatos
                // Si no, aceptamos con un id genérico (la API resolverá)
                const ws = candidates.find(c => String(c.workshop_id) === String(user?.id ?? 0)) ?? candidates[0];
                if (!ws) {
                    this.messageService.add({ severity: 'warn', summary: 'Sin candidatos', detail: 'No se encontró candidato disponible.' });
                    this.actionLoading = false;
                    return;
                }
                this.assignmentService.respond(this.incident!.id, ws.workshop_id, 'ACEPTADO').subscribe({
                    next: () => {
                        this.assignmentService.assign(this.incident!.id).subscribe({
                            next: assignment => {
                                this.actionLoading = false;
                                this.messageService.add({ severity: 'success', summary: 'Solicitud aceptada', detail: 'Se ha asignado el servicio correctamente.', life: 3000 });
                                setTimeout(() => this.router.navigate(['/assignments', assignment.id]), 2000);
                            },
                            error: () => { this.actionLoading = false; }
                        });
                    },
                    error: () => { this.actionLoading = false; }
                });
            },
            error: () => { this.actionLoading = false; }
        });
    }

    onReject(): void {
        if (!this.incident) return;
        const user = this.authService.getCurrentUser();
        this.actionLoading = true;
        this.assignmentService.getCandidates(this.incident.id).subscribe({
            next: candidates => {
                const ws = candidates.find(c => String(c.workshop_id) === String(user?.id ?? 0)) ?? candidates[0];
                if (!ws) {
                    this.actionLoading = false;
                    this.router.navigate(['/incidents']);
                    return;
                }
                this.assignmentService.respond(this.incident!.id, ws.workshop_id, 'RECHAZADO').subscribe({
                    next: () => {
                        this.actionLoading = false;
                        this.messageService.add({ severity: 'info', summary: 'Solicitud rechazada', detail: 'La solicitud fue rechazada.', life: 3000 });
                        setTimeout(() => this.router.navigate(['/incidents']), 2000);
                    },
                    error: () => { this.actionLoading = false; }
                });
            },
            error: () => { this.actionLoading = false; }
        });
    }

    prioritySeverity(level: PriorityLevel): TagSeverity {
        const map: Record<PriorityLevel, TagSeverity> = {
            BAJA: 'info', MEDIA: 'warn', ALTA: 'danger', CRITICA: 'danger', INCIERTA: 'secondary'
        };
        return map[level] ?? 'secondary';
    }
}

