import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { IncidentService } from '@/core/services/incident.service';
import { AssignmentService } from '@/core/services/assignment.service';
import { FallbackRoutingService } from '@/core/services/routing/fallback-routing.service';
import { OsrmRoutingService } from '@/core/services/routing/osrm-routing.service';
import { OrsRoutingService } from '@/core/services/routing/ors-routing.service';
import { RouteResult } from '@/core/models/route-result.model';
import { WsService } from '@/core/services/ws.service';
import { Incident, IncidentEvidence, AiAnalysis } from '@/core/models/incident.model';
import { PriorityLevel } from '@/core/models/incident.model';
import { ServiceAssignment } from '@/core/models/assignment.model';
import { WsMessage, LocationUpdatedPayload } from '@/core/models/ws.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

type StatusOption = { label: string; value: string; icon: string };

@Component({
    selector: 'app-incident-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ButtonModule, InputNumberModule, TagModule, CardModule, DividerModule, SkeletonModule, ToastModule],
    providers: [MessageService, OsrmRoutingService, OrsRoutingService, FallbackRoutingService],
    template: `
        <p-toast position="top-right" />
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
                            @if (incident.service_modality === 'CLIENTE_VE_TALLER') {
                                <p-tag value="Va al taller" severity="info" icon="pi pi-map" />
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

                <!-- Gestión de asignación -->
                @if (assignment) {
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4">
                        <h3 class="font-semibold mb-4 text-surface-900 dark:text-surface-0">
                            <i class="pi pi-truck mr-2 text-primary"></i>Seguimiento del servicio
                        </h3>
                        <div class="mb-3">
                            <p-tag [value]="assignmentStatusLabel" [severity]="statusSeverity" />
                        </div>
                        @if (availableStatuses.length > 0) {
                            <label class="block text-sm text-surface-500 mb-2">Cambiar estado:</label>
                            <div class="flex flex-wrap gap-2">
                                @for (opt of availableStatuses; track opt.value) {
                                    <p-button
                                        [label]="opt.label"
                                        [icon]="opt.icon"
                                        [severity]="assignment!.assignment_status === opt.value ? 'primary' : 'secondary'"
                                        [loading]="statusUpdating"
                                        (onClick)="updateStatus(opt.value)"
                                    />
                                }
                            </div>
                        }
                        @if (assignment.estimated_arrival_minutes) {
                            <div class="mt-3 text-sm text-surface-500">
                                <i class="pi pi-clock mr-1"></i>
                                Tiempo estimado de llegada: {{ assignment.estimated_arrival_minutes }} min
                            </div>
                        }
                    </div>
                }

                <!-- Cotización -->
                @if (assignment && assignment.assignment_status === 'ASIGNADO') {
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4">
                        <h3 class="font-semibold mb-4 text-surface-900 dark:text-surface-0">
                            <i class="pi pi-file-invoice mr-2 text-primary"></i>Cotización
                        </h3>

                        @if (!assignment.quotation_status) {
                            <!-- Formulario para crear cotización -->
                            <div class="flex flex-col gap-3">
                                <div>
                                    <label class="block text-sm text-surface-500 mb-1">Costo estimado (Bs)</label>
                                    <p-inputNumber [(ngModel)]="quoteCost" [min]="0" [max]="999999" mode="decimal" [minFractionDigits]="2" inputId="quote-cost" styleClass="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm text-surface-500 mb-1">Tiempo estimado de reparación (minutos)</label>
                                    <p-inputNumber [(ngModel)]="quoteMinutes" [min]="1" [max]="1440" inputId="quote-minutes" styleClass="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm text-surface-500 mb-1">Descripción del trabajo</label>
                                    <textarea [(ngModel)]="quoteDescription" rows="3" placeholder="Ej: Cambio de batería, revisión del sistema eléctrico..." class="w-full text-sm p-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0"></textarea>
                                </div>
                                <p-button label="Enviar cotización" icon="pi pi-send" [loading]="quoteLoading" (onClick)="submitQuote()" />
                            </div>
                        } @else {
                            <!-- Estado de cotización -->
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-surface-500">Estado:</span>
                                    <p-tag [value]="quoteStatusLabel" [severity]="quoteStatusSeverity" />
                                </div>
                                @if (assignment.estimated_cost) {
                                    <div class="text-sm"><span class="text-surface-500">Costo:</span> <strong>Bs {{ assignment.estimated_cost | number:'1.2-2' }}</strong></div>
                                }
                                @if (assignment.estimated_completion_minutes) {
                                    <div class="text-sm"><span class="text-surface-500">Tiempo estimado:</span> <strong>{{ assignment.estimated_completion_minutes }} min</strong></div>
                                }
                                @if (assignment.quotation_description) {
                                    <div class="text-sm mt-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                                        <p class="text-surface-500 mb-1">Descripción:</p>
                                        <p class="text-surface-700 dark:text-surface-300">{{ assignment.quotation_description }}</p>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }

                <!-- Sin asignación aún -->
                @if (!assignment) {
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4">
                        <div class="flex items-center gap-3 text-surface-500">
                            <i class="pi pi-info-circle text-2xl"></i>
                            <div>
                                <p class="font-medium text-surface-700 dark:text-surface-300">Invitación pendiente</p>
                                <p class="text-sm mt-1">Gestiona esta invitación desde la sección <a routerLink="/invitations" class="text-primary hover:underline">Invitaciones</a>.</p>
                            </div>
                        </div>
                    </div>
                }
            }

            <!-- Mapa de seguimiento (siempre en DOM, fuera de @if) -->
            <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-6 mb-4"
                 [class.hidden]="!incident?.latitude || !incident?.longitude">
                <h3 class="font-semibold mb-3 text-surface-900 dark:text-surface-0">
                    <i class="pi pi-map mr-2 text-primary"></i>Ubicación del incidente
                    @if (assignment) {
                        <span class="text-sm font-normal text-surface-500 ml-2">· {{ assignmentStatusLabel }}</span>
                    }
                </h3>
                <div #trackMapContainer
                     class="w-full rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden"
                     [style.height]="'250px'">
                </div>
                <div class="flex gap-4 mt-2 text-xs text-surface-500">
                    <span><i class="pi pi-map-marker text-red-500 mr-1"></i>Cliente</span>
                    @if (showTechnicianMarker) {
                        <span><i class="pi pi-car text-green-600 mr-1"></i>Auxilio</span>
                    }
                </div>
                @if (osrmRoute && !osrmRoute.errorMessage) {
                    <div class="mt-2 text-xs text-surface-500">
                        <i class="pi pi-route mr-1"></i>
                        {{ osrmRoute.distanceKm | number:'1.1-1' }} km · ~{{ osrmRoute.durationMinutes }} min
                        · Llega {{ osrmRoute.eta | date:'HH:mm' }}
                    </div>
                } @else if (osrmRoute) {
                    <div class="mt-2 text-xs text-surface-400 italic">
                        <i class="pi pi-route mr-1"></i>
                        {{ osrmRoute.errorMessage }}
                    </div>
                }
            </div>
        </div>
    `
})
export class IncidentDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('trackMapContainer') trackMapContainer!: ElementRef<HTMLDivElement>;

    private incidentService = inject(IncidentService);
    private assignmentService = inject(AssignmentService);
    private routingService = inject(FallbackRoutingService);
    private wsService = inject(WsService);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);
    private ngZone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);

    incident: Incident | null = null;
    evidences: IncidentEvidence[] = [];
    aiAnalysis: AiAnalysis | null = null;
    assignment: ServiceAssignment | null = null;
    loading = true;
    statusUpdating = false;

    // Quote form
    quoteCost: number = 0;
    quoteMinutes: number = 60;
    quoteDescription: string = '';
    quoteLoading = false;

    private trackMap: L.Map | null = null;
    private clientMarker: L.Marker | null = null;
    private techMarker: L.Marker | null = null;
    private routeLine: L.Polyline | null = null;
    osrmRoute: RouteResult | null = null;
    private wsSubs: Subscription[] = [];

    // Coordenadas del taller (del workshop del assignment)
    workshopCoords: [number, number] | null = null;
    showTechnicianMarker = false;

    private incidentId = 0;

    readonly statusOptions: StatusOption[] = [
        { label: 'En camino', value: 'EN_CAMINO', icon: 'pi pi-car' },
        { label: 'En sitio', value: 'EN_SITIO', icon: 'pi pi-map-marker' },
        { label: 'En atención', value: 'EN_PROCESO', icon: 'pi pi-wrench' },
        { label: 'Completado', value: 'COMPLETADO', icon: 'pi pi-check' },
    ];

    get availableStatuses(): StatusOption[] {
        if (!this.assignment) return [];
        const current = this.assignment!.assignment_status;
        const flow: Record<string, StatusOption[]> = {
            'ASIGNADO': this.statusOptions.filter(s => s.value === 'EN_CAMINO'),
            'EN_CAMINO': this.statusOptions.filter(s => s.value === 'EN_SITIO' || s.value === 'EN_PROCESO'),
            'EN_SITIO': this.statusOptions.filter(s => s.value === 'EN_PROCESO'),
            'EN_PROCESO': this.statusOptions.filter(s => s.value === 'COMPLETADO'),
        };
        return flow[current] || [];
    }

    get assignmentStatusLabel(): string {
        const labels: Record<string, string> = {
            'ASIGNADO': 'Asignado',
            'EN_CAMINO': 'En camino',
            'EN_SITIO': 'En sitio',
            'EN_PROCESO': 'En atención',
            'COMPLETADO': 'Completado',
            'CANCELADO': 'Cancelado',
        };
        return labels[this.assignment?.assignment_status ?? ''] || this.assignment?.assignment_status || '—';
    }

    get statusSeverity(): TagSeverity {
        const map: Record<string, TagSeverity> = {
            'ASIGNADO': 'info',
            'EN_CAMINO': 'warn',
            'EN_SITIO': 'success',
            'EN_PROCESO': 'info',
            'COMPLETADO': 'success',
            'CANCELADO': 'danger',
        };
        return map[this.assignment?.assignment_status ?? ''] ?? 'secondary';
    }

    ngOnInit(): void {
        this.incidentId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadIncident(this.incidentId);
        this.subscribeWs();
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.initTrackMap(), 200);
    }

    ngOnDestroy(): void {
        this.wsSubs.forEach(s => s.unsubscribe());
        if (this.trackMap) {
            this.trackMap.remove();
            this.trackMap = null;
        }
    }

    // ─── Inicialización ──────────────────────────────────

    private loadIncident(id: number): void {
        this.incidentService.getById(id).subscribe({
            next: inc => {
                this.incident = inc;
                this.loading = false;
                this.incidentService.getEvidences(id).subscribe(ev => this.evidences = ev);
                this.incidentService.getAiAnalysis(id).subscribe({ next: ai => this.aiAnalysis = ai, error: () => {} });
                this.updateMapMarkers();
                this.loadAssignment(id);
                this.loadRoute();
                setTimeout(() => this.trackMap?.invalidateSize(), 300);
            },
            error: () => { this.loading = false; }
        });
    }

    private loadAssignment(incidentId: number): void {
        this.assignmentService.getByIncidentId(incidentId).subscribe({
            next: assignment => {
                this.assignment = assignment;
                this.cdr.detectChanges();
                this.updateMapMarkers();
            },
            error: () => {}
        });
    }

    // ─── Mapa ────────────────────────────────────────────

    private initTrackMap(): void {
        if (!this.trackMapContainer) return;

        this.ngZone.runOutsideAngular(() => {
            this.trackMap = L.map(this.trackMapContainer.nativeElement, {
                center: [-17.7863, -63.1812],
                zoom: 13,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(this.trackMap);
        });

        this.updateMapMarkers();
    }

    private updateMapMarkers(): void {
        if (!this.trackMap || !this.incident?.latitude || !this.incident?.longitude) return;

        this.ngZone.runOutsideAngular(() => {
            const clientCoords: [number, number] = [
                this.incident!.latitude!,
                this.incident!.longitude!,
            ];

            if (!this.clientMarker) {
                this.clientMarker = L.marker(clientCoords, {
                    icon: L.divIcon({
                        html: '<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>',
                        className: '', iconSize: [20, 20], iconAnchor: [10, 10],
                    }),
                }).addTo(this.trackMap!).bindPopup('Ubicación del cliente');
            }

            this.trackMap!.setView(clientCoords, 14);

            if (this.techMarker) {
                this.techMarker.remove();
                this.techMarker = null;
            }

            if (this.technicianPosition) {
                this.showTechnicianMarker = true;
                this.techMarker = L.marker(
                    [this.technicianPosition![0], this.technicianPosition![1]],
                    {
                        icon: L.divIcon({
                            html: '<div style="width:18px;height:18px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>',
                            className: '', iconSize: [18, 18], iconAnchor: [9, 9],
                        }),
                    }
                ).addTo(this.trackMap!).bindPopup(
                    this.incident!.requires_tow ? 'Grúa en camino' : 'Auxilio en camino'
                );

                const bounds = L.latLngBounds(clientCoords, [
                    this.technicianPosition![0],
                    this.technicianPosition![1],
                ]);
                this.trackMap!.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
            }
        });
    }

    private technicianPosition: [number, number] | null = null;

    private loadRoute(): void {
        if (!this.incident?.latitude || !this.incident?.longitude) return;
        const client: [number, number] = [this.incident.latitude, this.incident.longitude];
        const target = this.technicianPosition ?? this.workshopCoords;
        if (!target) return;
        this.routingService.getRoute(client, target).subscribe(route => {
            if (route) {
                this.osrmRoute = route;
                this.updateMapRoute();
            }
        });
    }

    private updateMapRoute(): void {
        if (!this.trackMap) return;
        this.ngZone.runOutsideAngular(() => {
            if (this.routeLine) {
                this.routeLine.remove();
                this.routeLine = null;
            }
            if (!this.osrmRoute || this.osrmRoute.points.length === 0) return;
            this.routeLine = L.polyline(this.osrmRoute.points, {
                color: '#3b82f6',
                weight: 4,
                opacity: 0.7,
            }).addTo(this.trackMap!);
        });
    }

    // ─── WebSocket ───────────────────────────────────────

    private subscribeWs(): void {
        this.wsSubs.push(
            this.wsService.locationUpdated$.subscribe((msg: WsMessage<LocationUpdatedPayload>) => {
                if (msg.payload.incident_id !== this.incidentId) return;
                this.ngZone.run(() => {
                    this.technicianPosition = [msg.payload.latitude, msg.payload.longitude];
                    this.updateMapMarkers();
                    this.loadRoute();
                });
            })
        );

        this.wsSubs.push(
            this.wsService.incidentStatus$.subscribe(msg => {
                if (msg.payload.incident_id !== this.incidentId) return;
                this.ngZone.run(() => this.loadAssignment(this.incidentId));
            })
        );
    }

    // ─── Cotización ──────────────────────────────────────

    get quoteStatusLabel(): string {
        const labels: Record<string, string> = {
            'PENDIENTE': 'Pendiente de aprobación',
            'APROBADO': 'Aprobada por el cliente',
            'RECHAZADO': 'Rechazada por el cliente',
        };
        return labels[this.assignment?.quotation_status ?? ''] || '—';
    }

    get quoteStatusSeverity(): TagSeverity {
        const map: Record<string, TagSeverity> = {
            'PENDIENTE': 'warn',
            'APROBADO': 'success',
            'RECHAZADO': 'danger',
        };
        return map[this.assignment?.quotation_status ?? ''] ?? 'secondary';
    }

    submitQuote(): void {
        if (!this.assignment || !this.quoteDescription || this.quoteCost <= 0) {
            this.messageService.add({ severity: 'warn', summary: 'Campos incompletos', detail: 'Completa todos los campos de la cotización.', life: 3000 });
            return;
        }
        this.quoteLoading = true;
        this.assignmentService.submitQuote(this.assignment.id, {
            estimated_cost: this.quoteCost,
            estimated_completion_minutes: this.quoteMinutes,
            quotation_description: this.quoteDescription,
        }).subscribe({
            next: updated => {
                this.quoteLoading = false;
                this.assignment = updated;
                this.cdr.detectChanges();
                this.messageService.add({ severity: 'success', summary: 'Cotización enviada', detail: 'El cliente podrá aprobarla o rechazarla.', life: 3000 });
            },
            error: () => { this.quoteLoading = false; }
        });
    }

    // ─── Acciones ────────────────────────────────────────

    updateStatus(newStatus: string): void {
        if (!this.assignment) return;
        this.statusUpdating = true;
        this.assignmentService.update(this.assignment.id, { assignment_status: newStatus }).subscribe({
            next: updated => {
                this.statusUpdating = false;
                this.assignment = updated;
                this.cdr.detectChanges();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `Servicio cambiado a: ${this.assignmentStatusLabel}`,
                    life: 3000,
                });
            },
            error: () => { this.statusUpdating = false; }
        });
    }

    prioritySeverity(level: PriorityLevel): TagSeverity {
        const map: Record<PriorityLevel, TagSeverity> = {
            BAJA: 'info', MEDIA: 'warn', ALTA: 'danger', CRITICA: 'danger', INCIERTA: 'secondary'
        };
        return map[level] ?? 'secondary';
    }
}

