import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TiendaService } from '../services/tienda.service';
import { Evento } from '@/features/empresa/eventos/models/evento.model';

@Component({
    selector: 'app-tienda-eventos',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, SkeletonModule],
    template: `
        <div>
            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-1">Eventos disponibles</h2>
            <p class="text-surface-400 text-sm mb-8">Selecciona un evento para ver sus entradas disponibles</p>

            @if (loading()) {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (n of [1, 2, 3]; track n) {
                        <p-skeleton height="280px" borderRadius="12px" />
                    }
                </div>
            } @else if (eventos().length === 0) {
                <div class="text-center py-20 text-surface-400">
                    <i class="pi pi-calendar-times text-5xl block mb-4"></i>
                    <p class="text-lg">No hay eventos disponibles en este momento</p>
                </div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (evento of eventos(); track evento.eventoId) {
                        <div
                            class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            (click)="verEvento(evento)"
                        >
                            <!-- Banner -->
                            <div class="h-40 flex items-center justify-center relative overflow-hidden"
                                 [style.background]="gradients[evento.eventoId % gradients.length]">
                                <i class="pi pi-ticket text-white opacity-20 absolute" style="font-size: 8rem"></i>
                                <div class="relative z-10 text-center px-4">
                                    <p class="text-white font-bold text-sm leading-tight">{{ evento.nombre }}</p>
                                </div>
                            </div>

                            <!-- Info -->
                            <div class="p-5">
                                <div class="mb-3">
                                    <p-tag [value]="evento.tipoEvento.nombre" />
                                </div>
                                <h3 class="font-bold text-surface-900 dark:text-surface-0 text-base leading-tight mb-3">
                                    {{ evento.nombre }}
                                </h3>
                                <div class="flex items-center gap-2 text-surface-500 text-sm mb-1">
                                    <i class="pi pi-map-marker text-xs"></i>
                                    <span>{{ evento.lugar }} · {{ evento.ciudad }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-surface-500 text-sm mb-5">
                                    <i class="pi pi-calendar text-xs"></i>
                                    <span>{{ evento.fechaInicio | date:'dd/MM/yyyy · HH:mm' }}</span>
                                </div>
                                <p-button
                                    label="Ver entradas"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    styleClass="w-full"
                                    (onClick)="verEvento(evento); $event.stopPropagation()"
                                />
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    `
})
export class TiendaEventosComponent implements OnInit {
    private tiendaService = inject(TiendaService);
    private router = inject(Router);

    eventos = signal<Evento[]>([]);
    loading = signal(true);

    gradients = [
        'linear-gradient(135deg, #1a56db 0%, #0e3a8a 100%)',
        'linear-gradient(135deg, #c81e1e 0%, #7e1a1a 100%)',
        'linear-gradient(135deg, #057a55 0%, #03543f 100%)',
    ];

    ngOnInit(): void {
        this.tiendaService.listarEventos().subscribe({
            next: (data) => { this.eventos.set(data); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    verEvento(evento: Evento): void {
        this.router.navigate(['/tienda/evento', evento.eventoId]);
    }
}

