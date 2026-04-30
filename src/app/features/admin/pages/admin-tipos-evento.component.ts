import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TipoEvento, CrearTipoEventoRequest, EditarTipoEventoRequest } from '../models/tipo-evento.model';
import { TipoEventoInternoService } from '../data/tipo-evento-interno.service';

@Component({
    selector: 'app-admin-tipos-evento',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule, InputTextModule, InputIconModule, IconFieldModule, DialogModule, TextareaModule, ConfirmDialogModule, TooltipModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-tipos-evento.component.html'
})
export class AdminTiposEventoComponent implements OnInit {
    private service = inject(TipoEventoInternoService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    tipos = signal<TipoEvento[]>([]);
    loading = true;
    saving = false;

    dialogVisible = false;
    editando = false;
    editandoId: number | null = null;
    form: { nombre: string; descripcion: string } = { nombre: '', descripcion: '' };

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.loading = true;
        this.service.listar().subscribe({
            next: (r) => { this.loading = false; if (r.codigo === 200) this.tipos.set(r.data ?? []); },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tipos', life: 3000 }); }
        });
    }

    abrirNuevo(): void {
        this.editando = false;
        this.editandoId = null;
        this.form = { nombre: '', descripcion: '' };
        this.dialogVisible = true;
    }

    abrirEdicion(t: TipoEvento): void {
        this.editando = true;
        this.editandoId = t.tipoEventoId;
        this.form = { nombre: t.nombre, descripcion: t.descripcion ?? '' };
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.nombre.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es requerido', life: 3000 });
            return;
        }
        this.saving = true;
        if (this.editando && this.editandoId) {
            const req: EditarTipoEventoRequest = { nombre: this.form.nombre, descripcion: this.form.descripcion || undefined };
            this.service.actualizar(this.editandoId, req).subscribe({
                next: (r) => {
                    this.saving = false;
                    if (r.codigo === 200) { this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Tipo actualizado', life: 3000 }); this.dialogVisible = false; this.cargar(); }
                    else this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo actualizar', life: 3000 });
                },
                error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar', life: 3000 }); }
            });
        } else {
            const req: CrearTipoEventoRequest = { nombre: this.form.nombre, descripcion: this.form.descripcion || undefined };
            this.service.crear(req).subscribe({
                next: (r) => {
                    this.saving = false;
                    if (r.codigo === 201 || r.codigo === 200) { this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Tipo creado', life: 3000 }); this.dialogVisible = false; this.cargar(); }
                    else this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo crear', life: 3000 });
                },
                error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear', life: 3000 }); }
            });
        }
    }

    confirmarEliminar(t: TipoEvento): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar "${t.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.service.eliminar(t.tipoEventoId).subscribe({
                    next: (r) => {
                        if (r.codigo === 200) { this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Tipo eliminado', life: 3000 }); this.cargar(); }
                        else this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo eliminar', life: 3000 });
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar', life: 3000 }); }
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}

