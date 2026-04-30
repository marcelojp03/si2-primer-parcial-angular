import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TiendaService } from '../services/tienda.service';
import { CarritoService } from '../services/carrito.service';
import { Evento } from '@/features/empresa/eventos/models/evento.model';
import { Sector } from '@/features/empresa/sectores/models/sector.model';

interface SectorConCantidad extends Sector {
    cantidadSeleccionada: number;
}

@Component({
    selector: 'app-tienda-sectores',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TagModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-surface-400 mb-6">
            <a routerLink="/tienda" class="hover:text-primary cursor-pointer transition-colors">Eventos</a>
            <i class="pi pi-angle-right text-xs"></i>
            <span class="text-surface-600 dark:text-surface-300 truncate max-w-xs">{{ evento()?.nombre }}</span>
        </nav>

        @if (loading()) {
            <div class="flex items-center justify-center py-20 text-surface-400">
                <i class="pi pi-spin pi-spinner text-3xl"></i>
            </div>
        } @else if (!evento()) {
            <div class="text-center py-20 text-surface-400">
                <i class="pi pi-exclamation-triangle text-4xl block mb-3"></i>
                <p class="mb-4">Evento no encontrado</p>
                <p-button label="Volver a eventos" routerLink="/tienda" />
            </div>
        } @else {
            <!-- Event header -->
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl p-6 mb-8 border border-surface-200 dark:border-surface-700">
                <div class="flex items-start gap-4">
                    <div class="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                         style="background: linear-gradient(135deg, var(--p-primary-400), var(--p-primary-700))">
                        <i class="pi pi-ticket text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">{{ evento()!.nombre }}</h1>
                        <div class="flex flex-wrap gap-4 text-sm text-surface-500">
                            <span><i class="pi pi-map-marker mr-1"></i>{{ evento()!.lugar }}, {{ evento()!.ciudad }}</span>
                            <span><i class="pi pi-calendar mr-1"></i>{{ evento()!.fechaInicio | date:'dd/MM/yyyy · HH:mm' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sectors -->
            <h2 class="text-base font-semibold text-surface-700 dark:text-surface-200 mb-4">Selecciona tus entradas</h2>

            @if (sectores().length === 0) {
                <div class="text-center py-10 text-surface-400 bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
                    <i class="pi pi-inbox text-3xl block mb-2"></i>
                    <p>No hay sectores disponibles para este evento</p>
                </div>
            } @else {
                <div class="flex flex-col gap-4">
                    @for (sector of sectores(); track sector.sectorId) {
                        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                            <div class="flex items-center gap-4 flex-wrap">
                                <!-- Info -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <h3 class="font-semibold text-surface-900 dark:text-surface-0">{{ sector.nombreSector }}</h3>
                                        @if (sector.asientosNumerados) {
                                            <p-tag value="Numerado" severity="info" />
                                        }
                                    </div>
                                    <p class="text-sm text-surface-400">
                                        <i class="pi pi-users mr-1"></i>Capacidad: {{ sector.capacidad }}
                                    </p>
                                </div>

                                <!-- Price -->
                                <div class="text-right flex-shrink-0">
                                    <p class="font-bold text-primary text-xl">Bs.{{ sector.precioBase.toFixed(2) }}</p>
                                    <p class="text-xs text-surface-400">por entrada</p>
                                </div>

                                <!-- Quantity controls -->
                                <div class="flex items-center gap-3 flex-shrink-0">
                                    <button
                                        class="w-9 h-9 rounded-full border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center font-bold cursor-pointer bg-transparent hover:border-primary hover:text-primary transition-colors text-surface-700 dark:text-surface-200 text-lg leading-none"
                                        (click)="decrementar(sector)"
                                    >−</button>
                                    <span class="w-8 text-center font-bold text-surface-900 dark:text-surface-0 text-lg">
                                        {{ sector.cantidadSeleccionada }}
                                    </span>
                                    <button
                                        class="w-9 h-9 rounded-full border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center font-bold cursor-pointer bg-transparent hover:border-primary hover:text-primary transition-colors text-surface-700 dark:text-surface-200 text-lg leading-none"
                                        (click)="incrementar(sector)"
                                    >+</button>
                                </div>

                                <!-- Add button -->
                                <p-button
                                    label="Agregar"
                                    icon="pi pi-cart-plus"
                                    [disabled]="sector.cantidadSeleccionada === 0"
                                    (onClick)="agregarAlCarrito(sector)"
                                    size="small"
                                    class="flex-shrink-0"
                                />
                            </div>
                        </div>
                    }
                </div>
            }

            <!-- Floating CTA when cart has items -->
            @if (totalItems > 0) {
                <div class="fixed bottom-6 right-6 z-50">
                    <p-button
                        [label]="'Ir al checkout · Bs.' + total.toFixed(2)"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        severity="danger"
                        size="large"
                        (onClick)="irAlCheckout()"
                    />
                </div>
            }
        }
    `
})
export class TiendaSectoresComponent implements OnInit {
    private tiendaService = inject(TiendaService);
    private carritoService = inject(CarritoService);
    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    evento = signal<Evento | undefined>(undefined);
    sectores = signal<SectorConCantidad[]>([]);
    loading = signal(true);

    get totalItems(): number { return this.carritoService.totalItems; }
    get total(): number { return this.carritoService.total; }

    ngOnInit(): void {
        const eventoId = Number(this.route.snapshot.paramMap.get('eventoId'));
        this.tiendaService.obtenerEvento(eventoId).subscribe(ev => this.evento.set(ev));
        this.tiendaService.listarSectores(eventoId).subscribe({
            next: (data) => {
                this.sectores.set(data.map(s => ({ ...s, cantidadSeleccionada: 0 })));
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    incrementar(sector: SectorConCantidad): void {
        this.sectores.update(list =>
            list.map(s => s.sectorId === sector.sectorId ? { ...s, cantidadSeleccionada: s.cantidadSeleccionada + 1 } : s)
        );
    }

    decrementar(sector: SectorConCantidad): void {
        this.sectores.update(list =>
            list.map(s => s.sectorId === sector.sectorId && s.cantidadSeleccionada > 0
                ? { ...s, cantidadSeleccionada: s.cantidadSeleccionada - 1 }
                : s
            )
        );
    }

    agregarAlCarrito(sector: SectorConCantidad): void {
        const ev = this.evento();
        if (!ev || sector.cantidadSeleccionada === 0) return;

        this.carritoService.agregar({
            eventoId: ev.eventoId,
            eventoNombre: ev.nombre,
            sectorId: sector.sectorId,
            sectorNombre: sector.nombreSector,
            precioBase: sector.precioBase,
            moneda: sector.moneda,
            cantidad: sector.cantidadSeleccionada,
        });

        this.messageService.add({
            severity: 'success',
            summary: 'Agregado al carrito',
            detail: `${sector.cantidadSeleccionada} entrada(s) · ${sector.nombreSector}`,
            life: 2500,
        });

        this.sectores.update(list =>
            list.map(s => s.sectorId === sector.sectorId ? { ...s, cantidadSeleccionada: 0 } : s)
        );
    }

    irAlCheckout(): void {
        this.router.navigate(['/tienda/checkout']);
    }
}

