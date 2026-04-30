import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { IncidentService } from '@/core/services/incident.service';
import { Incident, PriorityLevel } from '@/core/models/incident.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-incident-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, TagModule, ButtonModule, BadgeModule, SkeletonModule, ToastModule],
    template: `
        <p-toast position="top-right" />
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Incidentes</h1>
                    <p class="text-surface-500 mt-1 text-sm">
                        Actualización automática cada 30 segundos
                        @if (lastUpdate) {
                            · Última actualización: {{ lastUpdate | date:'HH:mm:ss' }}
                        }
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full animate-pulse" [class]="loading ? 'bg-orange-400' : 'bg-green-400'"></div>
                    <span class="text-xs text-surface-400">{{ loading ? 'Actualizando...' : 'En vivo' }}</span>
                </div>
            </div>

            <!-- Tabs de filtro -->
            <div class="flex gap-2 mb-4">
                @for (tab of tabs; track tab.value) {
                    <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            [class]="activeTab === tab.value
                                ? 'bg-orange-500 text-white'
                                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'"
                            (click)="setTab(tab.value)">
                        {{ tab.label }}
                        @if (getCount(tab.value) > 0) {
                            <span class="ml-1 px-1.5 py-0.5 rounded text-xs"
                                  [class]="activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-orange-100 dark:bg-orange-900 text-orange-600'">
                                {{ getCount(tab.value) }}
                            </span>
                        }
                    </button>
                }
            </div>

            <!-- Tabla -->
            @if (initialLoading) {
                <div class="flex flex-col gap-3">
                    @for (i of [1,2,3,4,5]; track i) {
                        <p-skeleton height="56px" borderRadius="8px" />
                    }
                </div>
            } @else {
                <p-table [value]="filteredIncidents" [paginator]="filteredIncidents.length > 15"
                         [rows]="15" [rowHover]="true"
                         styleClass="p-datatable-sm"
                         emptyMessage="No hay incidentes en esta categoría">
                    <ng-template pTemplate="header">
                        <tr>
                            <th style="width: 60px">#</th>
                            <th>Título</th>
                            <th style="width: 130px">Prioridad</th>
                            <th style="width: 130px">Estado</th>
                            <th style="width: 100px">Remolque</th>
                            <th style="width: 160px">Fecha</th>
                            <th style="width: 80px"></th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-incident>
                        <tr>
                            <td class="text-surface-400 text-sm">{{ incident.id }}</td>
                            <td class="font-medium">{{ incident.title }}</td>
                            <td>
                                <p-tag [value]="incident.priority_level"
                                       [severity]="prioritySeverity(incident.priority_level)" />
                            </td>
                            <td>
                                <p-tag [value]="statusLabel(incident)"
                                       severity="info" />
                            </td>
                            <td>
                                @if (incident.requires_tow) {
                                    <span class="text-orange-500 font-medium text-sm">Sí</span>
                                } @else {
                                    <span class="text-surface-400 text-sm">No</span>
                                }
                            </td>
                            <td class="text-sm text-surface-500">
                                {{ incident.requested_at | date:'dd/MM/yyyy HH:mm' }}
                            </td>
                            <td>
                                <a [routerLink]="['/incidents', incident.id]">
                                    <p-button icon="pi pi-eye" severity="secondary"
                                              [text]="true" size="small" />
                                </a>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            }
        </div>
    `
})
export class IncidentListComponent implements OnInit, OnDestroy {
    private incidentService = inject(IncidentService);

    incidents: Incident[] = [];
    filteredIncidents: Incident[] = [];
    loading = false;
    initialLoading = true;
    lastUpdate: Date | null = null;
    activeTab: string = 'all';

    tabs = [
        { label: 'Todos', value: 'all' },
        { label: 'Notificados', value: 'notificado' },
        { label: 'Activos', value: 'activo' },
        { label: 'Historial', value: 'historial' },
    ];

    private pollSub?: Subscription;

    ngOnInit(): void {
        this.pollSub = interval(30000).pipe(
            startWith(0),
            switchMap(() => {
                this.loading = true;
                return this.incidentService.getAll();
            })
        ).subscribe({
            next: data => {
                this.incidents = data;
                this.applyFilter();
                this.lastUpdate = new Date();
                this.loading = false;
                this.initialLoading = false;
            },
            error: () => {
                this.loading = false;
                this.initialLoading = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.pollSub?.unsubscribe();
    }

    setTab(value: string): void {
        this.activeTab = value;
        this.applyFilter();
    }

    private applyFilter(): void {
        switch (this.activeTab) {
            case 'notificado':
                this.filteredIncidents = this.incidents.filter(i => !i.accepted_at && !i.cancelled_at);
                break;
            case 'activo':
                this.filteredIncidents = this.incidents.filter(i =>
                    !!i.accepted_at && !i.finished_at && !i.cancelled_at
                );
                break;
            case 'historial':
                this.filteredIncidents = this.incidents.filter(i =>
                    !!i.finished_at || !!i.cancelled_at
                );
                break;
            default:
                this.filteredIncidents = this.incidents;
        }
    }

    getCount(tab: string): number {
        switch (tab) {
            case 'notificado': return this.incidents.filter(i => !i.accepted_at && !i.cancelled_at).length;
            case 'activo':     return this.incidents.filter(i => !!i.accepted_at && !i.finished_at && !i.cancelled_at).length;
            case 'historial':  return this.incidents.filter(i => !!i.finished_at || !!i.cancelled_at).length;
            default:           return this.incidents.length;
        }
    }

    statusLabel(incident: Incident): string {
        if (incident.cancelled_at) return 'CANCELADO';
        if (incident.finished_at) return 'ATENDIDO';
        if (incident.started_at) return 'EN_PROCESO';
        if (incident.accepted_at) return 'ASIGNADO';
        return 'NOTIFICADO';
    }

    prioritySeverity(level: PriorityLevel): TagSeverity {
        const map: Record<PriorityLevel, TagSeverity> = {
            BAJA: 'info',
            MEDIA: 'warn',
            ALTA: 'danger',
            CRITICA: 'danger',
            INCIERTA: 'secondary'
        };
        return map[level] ?? 'secondary';
    }
}

