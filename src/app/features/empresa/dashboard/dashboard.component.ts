import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { Evento } from '@/features/empresa/eventos/models/evento.model';
import { EventoService } from '@/features/empresa/eventos/data/evento.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { TicketEventoService } from '@/features/empresa/tickets-evento/data/ticket-evento.service';
import { TicketResumen } from '@/features/empresa/tickets-evento/models/ticket.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, TableModule, TagModule, SelectModule, SkeletonModule, TooltipModule],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    private eventoService = inject(EventoService);
    private empresaService = inject(EmpresaService);
    private ticketService = inject(TicketEventoService);
    private router = inject(Router);

    eventos = signal<Evento[]>([]);
    loading = true;

    eventoSeleccionado: Evento | null = null;
    resumen: TicketResumen | null = null;
    loadingResumen = false;

    get totalEventos(): number {
        return this.eventos().length;
    }

    get eventosActivos(): number {
        return this.eventos().filter(e => e.estadoEvento === 'PUBLICADO' || e.estadoEvento === 'ACTIVO').length;
    }

    get proximosEventos(): Evento[] {
        const now = new Date();
        return this.eventos()
            .filter(e => new Date(e.fechaInicio) > now)
            .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
            .slice(0, 5);
    }

    get sectoresResumen(): { nombre: string; total: number; activos: number; usados: number; anulados: number }[] {
        if (!this.resumen) return [];
        return Object.entries(this.resumen.porSector).map(([nombre, total]) => {
            const estados = this.resumen!.porSectorEstado[nombre] ?? {};
            return {
                nombre,
                total,
                activos: estados['ACTIVO'] ?? 0,
                usados: estados['USADO'] ?? 0,
                anulados: estados['ANULADO'] ?? 0,
            };
        });
    }

    ngOnInit(): void {
        this.loadEventos();
    }

    loadEventos(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loading = true;
        this.eventoService.listar(empresaId).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) {
                    this.eventos.set(res.data ?? []);
                    if (this.eventos().length > 0) {
                        this.eventoSeleccionado = this.eventos()[0];
                        this.loadResumen();
                    }
                }
            },
            error: () => (this.loading = false),
        });
    }

    onEventoChange(): void {
        this.resumen = null;
        if (this.eventoSeleccionado) this.loadResumen();
    }

    loadResumen(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId || !this.eventoSeleccionado) return;
        this.loadingResumen = true;
        this.ticketService.resumen(this.eventoSeleccionado.eventoId, empresaId).subscribe({
            next: (res) => {
                this.loadingResumen = false;
                if (res.codigo === 200) this.resumen = res.data ?? null;
            },
            error: () => (this.loadingResumen = false),
        });
    }

    irAEventos(): void {
        this.router.navigate(['/eventos']);
    }

    irAUsuarios(): void {
        this.router.navigate(['/usuarios']);
    }

    irAEvento(evento: Evento): void {
        this.router.navigate(['/eventos', evento.eventoId, 'sectores']);
    }
}

