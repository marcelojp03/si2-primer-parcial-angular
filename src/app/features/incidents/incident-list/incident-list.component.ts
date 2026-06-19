import { Component, inject, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { IncidentService } from '@/core/services/incident.service';
import { WsService } from '@/core/services/ws.service';
import { Incident, PriorityLevel } from '@/core/models/incident.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-incident-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, TagModule, ButtonModule, BadgeModule, SkeletonModule, ToastModule, ToolbarModule, IconFieldModule, InputIconModule, InputTextModule, RippleModule],
    template: `
        <p-toast position="top-right" />
        <div class="p-6">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <div class="flex items-center gap-2">
                        @for (tab of tabs; track tab.value) {
                            <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    [class]="activeTab === tab.value
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'"
                                    (click)="setTab(tab.value)">
                                {{ tab.label }}
                                @if (getCount(tab.value) > 0) {
                                    <span class="ml-1.5 px-1.5 py-0.5 rounded text-xs"
                                          [class]="activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-orange-100 dark:bg-orange-900 text-orange-600'">
                                        {{ getCount(tab.value) }}
                                    </span>
                                }
                            </button>
                        }
                    </div>
                </ng-template>
                <ng-template #end>
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full animate-pulse" [class]="loading ? 'bg-orange-400' : 'bg-green-400'"></div>
                        <span class="text-xs text-surface-400">{{ loading ? 'Actualizando...' : 'En vivo' }}</span>
                        @if (lastUpdate) {
                            <span class="text-xs text-surface-400">· {{ lastUpdate | date:'HH:mm:ss' }}</span>
                        }
                    </div>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="filteredIncidents" [rows]="15" [paginator]="true" [rowHover]="true"
                     [globalFilterFields]="['id', 'title', 'priority_level']"
                     currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} incidentes"
                     [showCurrentPageReport]="true" [rowsPerPageOptions]="[15, 30, 50]"
                     emptyMessage="No hay incidentes en esta categoría"
                     sortField="id" [sortOrder]="-1">
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h5 class="m-0 text-lg font-semibold">Incidentes</h5>
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="id" style="width: 80px">#</th>
                        <th pSortableColumn="title">Título</th>
                        <th pSortableColumn="priority_level" style="width: 130px">Prioridad</th>
                        <th style="width: 130px">Estado</th>
                        <th style="width: 90px">Remolque</th>
                        <th pSortableColumn="requested_at" style="width: 160px">Fecha</th>
                        <th style="width: 80px"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-incident>
                    <tr>
                        <td class="text-surface-400 text-sm">{{ incident.id }}</td>
                        <td class="font-medium">{{ incident.title }}</td>
                        <td><p-tag [value]="incident.priority_level" [severity]="prioritySeverity(incident.priority_level)" /></td>
                        <td><p-tag [value]="statusLabel(incident)" severity="info" /></td>
                        <td>
                            @if (incident.requires_tow) {
                                <span class="text-orange-500 font-medium text-sm"><i class="pi pi-truck mr-1"></i>Sí</span>
                            } @else {
                                <span class="text-surface-400 text-sm">—</span>
                            }
                        </td>
                        <td class="text-sm text-surface-500">{{ incident.requested_at | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td>
                            <a [routerLink]="['/incidents', incident.id]">
                                <p-button icon="pi pi-eye" severity="secondary" [text]="true" rounded size="small" pTooltip="Ver detalle" />
                            </a>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class IncidentListComponent implements OnInit, OnDestroy {
    @ViewChild('dt') dt: any;
    private incidentService = inject(IncidentService);
    private wsService = inject(WsService);
    private ngZone = inject(NgZone);

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

    private subs: Subscription[] = [];

    ngOnInit(): void {
        this.load();
        this.subs.push(
            this.wsService.incidentStatus$.subscribe(() => this.ngZone.run(() => this.load()))
        );
        this.subs.push(
            this.wsService.assignmentAccepted$.subscribe(() => this.ngZone.run(() => this.load()))
        );
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private load(): void {
        this.loading = true;
        this.incidentService.getAll().subscribe({
            next: data => {
                this.incidents = data;
                this.applyFilter();
                this.lastUpdate = new Date();
                this.loading = false;
                this.initialLoading = false;
            },
            error: () => { this.loading = false; this.initialLoading = false; }
        });
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
                this.filteredIncidents = this.incidents.filter(i => !!i.accepted_at && !i.finished_at && !i.cancelled_at);
                break;
            case 'historial':
                this.filteredIncidents = this.incidents.filter(i => !!i.finished_at || !!i.cancelled_at);
                break;
            default:
                this.filteredIncidents = [...this.incidents];
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
        const map: Record<PriorityLevel, TagSeverity> = { BAJA: 'info', MEDIA: 'warn', ALTA: 'danger', CRITICA: 'danger', INCIERTA: 'secondary' };
        return map[level] ?? 'secondary';
    }
}
