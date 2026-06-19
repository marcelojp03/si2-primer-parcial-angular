import {
    Component, OnInit, OnDestroy, AfterViewInit,
    ChangeDetectorRef, ElementRef, ViewChild, inject, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { IncidentService } from '@/core/services/incident.service';
import { WsService } from '@/core/services/ws.service';
import { Incident } from '@/core/models/incident.model';
import { WsMessage, LocationUpdatedPayload, IncidentStatusChangedPayload } from '@/core/models/ws.model';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
    BAJA: '#22c55e',
    MEDIA: '#eab308',
    ALTA: '#f97316',
    CRITICA: '#ef4444',
    INCIERTA: '#94a3b8',
};

function markerIcon(priority: string | null | undefined): L.DivIcon {
    const color = PRIORITY_COLORS[priority ?? 'INCIERTA'] ?? '#94a3b8';
    return L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45);"></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -12],
    });
}

function priorityLabel(p: string | null | undefined): string {
    const map: Record<string, string> = {
        BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica', INCIERTA: 'Incierta',
    };
    return map[p ?? ''] ?? 'Sin prioridad';
}

// ─── Componente ──────────────────────────────────────────────────────────────

@Component({
    selector: 'app-incident-map',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, SkeletonModule],
    template: `
        <div class="p-6">
            <!-- Encabezado -->
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                        <i class="pi pi-map mr-2 text-primary"></i>Mapa de Incidentes
                    </h1>
                    <p class="text-surface-500 mt-1 text-sm">
                        Incidentes activos con ubicación GPS · actualización en tiempo real
                    </p>
                </div>
                <div class="flex gap-2 items-center">
                    <span class="text-sm text-surface-500">{{ incidents.length }} incidentes</span>
                    <p-button icon="pi pi-refresh" [loading]="loading" outlined severity="secondary"
                              pTooltip="Recargar" (onClick)="load()" />
                </div>
            </div>

            <!-- Leyenda -->
            <div class="flex flex-wrap gap-3 mb-3">
                @for (entry of legend; track entry.label) {
                    <div class="flex items-center gap-1.5 text-sm">
                        <div [style.background]="entry.color"
                             class="w-3 h-3 rounded-full border border-white shadow-sm"></div>
                        <span class="text-surface-600 dark:text-surface-400">{{ entry.label }}</span>
                    </div>
                }
            </div>

            <!-- Mapa -->
            <div class="relative" [style.height]="'500px'">
                @if (loading && !mapReady) {
                    <p-skeleton height="500px" borderRadius="12px" />
                }
                <div #mapContainer
                     class="w-full rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
                     [style.height]="'500px'"
                     [class.opacity-0]="!mapReady">
                </div>
            </div>
        </div>
    `
})
export class IncidentMapComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

    private incidentService = inject(IncidentService);
    private wsService = inject(WsService);
    private ngZone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);

    incidents: Incident[] = [];
    loading = true;
    mapReady = false;

    private map!: L.Map;
    private markers = new Map<number, L.Marker>();
    private wsSubs: Subscription[] = [];

    readonly legend = [
        { label: 'Baja', color: '#22c55e' },
        { label: 'Media', color: '#eab308' },
        { label: 'Alta', color: '#f97316' },
        { label: 'Crítica', color: '#ef4444' },
        { label: 'Sin prioridad', color: '#94a3b8' },
    ];

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.load();
        this.subscribeWs();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.ngZone.runOutsideAngular(() => {
                this.map = L.map(this.mapContainer.nativeElement, {
                    center: [-17.7863, -63.1812],
                    zoom: 13,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(this.map);
            });

            this.mapReady = true;
            setTimeout(() => this.map?.invalidateSize(), 100);
            this.cdr.detectChanges();
            this.renderMarkers();
        });
    }

    ngOnDestroy(): void {
        this.wsSubs.forEach(s => s.unsubscribe());
        if (this.map) {
            this.map.remove();
        }
    }

    // ─── Data ─────────────────────────────────────────────────────────────────

    load(): void {
        this.loading = true;
        this.incidentService.getAll(undefined, 1, 100).subscribe({
            next: (data) => {
                this.incidents = data.filter(i => i.latitude != null && i.longitude != null);
                this.loading = false;
                if (this.mapReady) this.renderMarkers();
            },
            error: () => { this.loading = false; }
        });
    }

    // ─── Marcadores ──────────────────────────────────────────────────────────

    private renderMarkers(): void {
        if (!this.map) return;
        this.ngZone.runOutsideAngular(() => {
            // Limpiar marcadores anteriores
            this.markers.forEach(m => m.remove());
            this.markers.clear();

            const bounds: [number, number][] = [];

            for (const incident of this.incidents) {
                if (incident.latitude == null || incident.longitude == null) continue;
                const latlng: [number, number] = [incident.latitude, incident.longitude];
                bounds.push(latlng);
                this.addMarker(incident, latlng);
            }

            if (bounds.length > 0) {
                this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
            }
        });
    }

    private addMarker(incident: Incident, latlng: [number, number]): void {
        const popup = `
            <div style="min-width:180px;font-family:sans-serif;">
                <div style="font-weight:600;margin-bottom:4px;">#${incident.id} · ${incident.title}</div>
                <div style="font-size:12px;color:#64748b;">Prioridad: ${priorityLabel(incident.priority_level)}</div>
                ${incident.reference_address ? `<div style="font-size:12px;color:#94a3b8;margin-top:2px;">${incident.reference_address}</div>` : ''}
                <a href="/incidents/${incident.id}"
                   style="display:inline-block;margin-top:8px;font-size:12px;color:#3b82f6;text-decoration:none;">
                   Ver detalle →
                </a>
            </div>`;

        const marker = L.marker(latlng, { icon: markerIcon(incident.priority_level) })
            .bindPopup(popup, { maxWidth: 240 })
            .addTo(this.map);

        this.markers.set(incident.id, marker);
    }

    // ─── WebSocket live update ────────────────────────────────────────────────

    private subscribeWs(): void {
        this.wsSubs.push(
            this.wsService.locationUpdated$.subscribe((msg: WsMessage<LocationUpdatedPayload>) => {
                const payload = msg.payload;
                this.ngZone.run(() => {
                    const marker = this.markers.get(payload.incident_id);
                    if (marker) {
                        const newLatLng: [number, number] = [payload.latitude, payload.longitude];
                        marker.setLatLng(newLatLng);

                        const incident = this.incidents.find(i => i.id === payload.incident_id);
                        if (incident) {
                            incident.latitude = payload.latitude;
                            incident.longitude = payload.longitude;
                        }
                    } else {
                        this.load();
                    }
                });
            })
        );

        this.wsSubs.push(
            this.wsService.incidentStatus$.subscribe(() => {
                this.ngZone.run(() => this.load());
            })
        );

        this.wsSubs.push(
            this.wsService.assignmentAccepted$.subscribe(() => {
                this.ngZone.run(() => this.load());
            })
        );
    }
}
