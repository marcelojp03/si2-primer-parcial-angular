import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { Evento, EventoRequest, TipoEvento } from './models/evento.model';
import { EventoService } from './data/evento.service';
import { EmpresaService } from '@/core/services/empresa.service';

@Component({
    selector: 'app-eventos',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        DatePickerModule,
        CheckboxModule,
        TooltipModule,
    ],
    templateUrl: './eventos.component.html',
    providers: [MessageService, ConfirmationService],
})
export class EventosComponent implements OnInit {
    private eventoService = inject(EventoService);
    private empresaService = inject(EmpresaService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private router = inject(Router);

    eventos = signal<Evento[]>([]);
    tiposEvento = signal<TipoEvento[]>([]);
    loading = true;

    eventoDialog = false;
    submitted = false;
    isEdit = false;

    // Form fields
    form: Partial<EventoRequest> = {};
    fechaInicioDate: Date | null = null;
    fechaFinDate: Date | null = null;

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.loadEventos();
        this.loadTiposEvento();
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
                }
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los eventos', life: 3000 });
            },
        });
    }

    loadTiposEvento(): void {
        this.eventoService.listarTiposEvento().subscribe({
            next: (res) => {
                if (res.codigo === 200) {
                    this.tiposEvento.set(res.data ?? []);
                }
            },
        });
    }

    openNew(): void {
        this.form = { empresaId: this.empresaService.getEmpresaId()!, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
        this.fechaInicioDate = null;
        this.fechaFinDate = null;
        this.submitted = false;
        this.isEdit = false;
        this.eventoDialog = true;
    }

    editEvento(evento: Evento): void {
        this.isEdit = true;
        this.form = {
            empresaId: this.empresaService.getEmpresaId()!,
            tipoEventoId: evento.tipoEvento?.tipoEventoId,
            nombreEvento: evento.nombre,
            lugar: evento.lugar,
            ciudad: evento.ciudad,
            timezone: evento.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        this.fechaInicioDate = evento.fechaInicio ? new Date(evento.fechaInicio) : null;
        this.fechaFinDate = evento.fechaFin ? new Date(evento.fechaFin) : null;
        (this.form as any)._eventoId = evento.eventoId;
        this.submitted = false;
        this.eventoDialog = true;
    }

    saveEvento(): void {
        this.submitted = true;
        if (!this.form.nombreEvento?.trim() || !this.form.tipoEventoId) return;

        if (this.fechaInicioDate) this.form.fechaInicio = this.fechaInicioDate.toISOString();
        if (this.fechaFinDate) this.form.fechaFin = this.fechaFinDate.toISOString();

        const empresaId = this.empresaService.getEmpresaId()!;

        if (this.isEdit) {
            const eventoId = (this.form as any)._eventoId;
            this.eventoService.actualizar(eventoId, empresaId, this.form).subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento actualizado', life: 3000 });
                        this.eventoDialog = false;
                        this.loadEventos();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar', life: 3000 }),
            });
        } else {
            this.eventoService.crear(this.form as EventoRequest).subscribe({
                next: (res) => {
                    if (res.codigo === 200 || res.codigo === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento creado', life: 3000 });
                        this.eventoDialog = false;
                        this.loadEventos();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear', life: 3000 }),
            });
        }
    }

    desactivarEvento(evento: Evento): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de desactivar el evento "${evento.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const empresaId = this.empresaService.getEmpresaId()!;
                this.eventoService.desactivar(evento.eventoId, empresaId).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento desactivado', life: 3000 });
                        this.loadEventos();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desactivar', life: 3000 }),
                });
            },
        });
    }

    hideDialog(): void {
        this.eventoDialog = false;
        this.submitted = false;
    }

    irASectores(evento: Evento): void {
        this.router.navigate(['/eventos', evento.eventoId, 'sectores']);
    }

    irAStaff(evento: Evento): void {
        this.router.navigate(['/eventos', evento.eventoId, 'staff']);
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (estado) {
            case 'ACTIVO':
                return 'success';
            case 'BORRADOR':
                return 'warn';
            case 'CANCELADO':
                return 'danger';
            case 'FINALIZADO':
                return 'info';
            default:
                return 'secondary';
        }
    }
}

