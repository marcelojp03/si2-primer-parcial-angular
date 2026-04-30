import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TooltipModule } from 'primeng/tooltip';
import { Ticket, EstadoTicket } from './models/ticket.model';
import { TicketEventoService } from './data/ticket-evento.service';
import { Evento } from '@/features/empresa/eventos/models/evento.model';
import { EventoService } from '@/features/empresa/eventos/data/evento.service';
import { EmpresaService } from '@/core/services/empresa.service';

@Component({
    selector: 'app-tickets-evento',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule,
        ToastModule, ToolbarModule, InputTextModule, SelectModule,
        TagModule, InputIconModule, IconFieldModule, TooltipModule,
    ],
    templateUrl: './tickets-evento.component.html',
    providers: [MessageService],
})
export class TicketsEventoComponent implements OnInit {
    private ticketService = inject(TicketEventoService);
    private eventoService = inject(EventoService);
    private empresaService = inject(EmpresaService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    eventos = signal<Evento[]>([]);
    tickets = signal<Ticket[]>([]);
    loading = true;
    loadingEventos = true;

    eventoSeleccionado: Evento | null = null;
    filtroEstado: EstadoTicket | null = null;

    estados = [
        { label: 'Todos', value: null },
        { label: 'Activo', value: 'ACTIVO' },
        { label: 'Usado', value: 'USADO' },
        { label: 'Anulado', value: 'ANULADO' },
    ];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.loadEventos();
    }

    loadEventos(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loadingEventos = true;
        this.eventoService.listar(empresaId).subscribe({
            next: (res) => {
                this.loadingEventos = false;
                if (res.codigo === 200) {
                    this.eventos.set(res.data ?? []);
                    if (this.eventos().length > 0) {
                        this.eventoSeleccionado = this.eventos()[0];
                        this.loadTickets();
                    }
                }
            },
            error: () => (this.loadingEventos = false),
        });
    }

    onEventoChange(): void {
        this.tickets.set([]);
        this.filtroEstado = null;
        if (this.eventoSeleccionado) this.loadTickets();
    }

    onEstadoChange(): void {
        if (this.eventoSeleccionado) this.loadTickets();
    }

    loadTickets(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId || !this.eventoSeleccionado) return;
        this.loading = true;
        const filtros: { estado?: EstadoTicket } = {};
        if (this.filtroEstado) filtros.estado = this.filtroEstado;
        this.ticketService.listar(this.eventoSeleccionado.eventoId, empresaId, filtros).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) {
                    this.tickets.set(res.data ?? []);
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                }
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'No se pudieron cargar los tickets', life: 3000 });
            },
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getEstadoSeverity(estado: string): 'success' | 'info' | 'danger' | 'warn' {
        switch (estado) {
            case 'ACTIVO': return 'success';
            case 'USADO': return 'info';
            case 'ANULADO': return 'danger';
            default: return 'warn';
        }
    }
}

