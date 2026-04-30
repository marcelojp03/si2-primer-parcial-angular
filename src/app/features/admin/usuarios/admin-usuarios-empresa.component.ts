import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsuarioEmpresaInternoService } from './data/usuario-empresa-interno.service';

@Component({
    selector: 'app-admin-usuarios-empresa',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToastModule, InputTextModule, SelectModule, CardModule, FloatLabelModule, TabsModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-usuarios-empresa.component.html'
})
export class AdminUsuariosEmpresaComponent {
    private service = inject(UsuarioEmpresaInternoService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    rolesEmpresa = [
        { label: 'Owner', value: 'OWNER' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Operador', value: 'OPERADOR' },
    ];

    // Asociar
    asociarForm = { usuarioId: null as number | null, empresaId: null as number | null, rolEmpresaCodigo: 'OPERADOR' };
    loadingAsociar = false;
    resultadoAsociar = signal<any>(null);

    // Actualizar
    actualizarForm = { usuarioId: null as number | null, empresaId: null as number | null, rolEmpresaCodigo: 'OPERADOR' };
    loadingActualizar = false;

    // Desasociar
    desasociarForm = { usuarioId: null as number | null, empresaId: null as number | null };
    loadingDesasociar = false;

    asociar(): void {
        if (!this.asociarForm.usuarioId || !this.asociarForm.empresaId) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'ID de usuario y empresa son requeridos', life: 3000 });
            return;
        }
        this.loadingAsociar = true;
        this.service.asociar({
            usuarioId: this.asociarForm.usuarioId,
            empresaId: this.asociarForm.empresaId,
            rolEmpresaCodigo: this.asociarForm.rolEmpresaCodigo,
        }).subscribe({
            next: (r) => {
                this.loadingAsociar = false;
                if (r.codigo === 200 || r.codigo === 201) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Usuario asociado correctamente', life: 3000 });
                    this.resultadoAsociar.set(r.data);
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo asociar', life: 3000 });
                }
            },
            error: (err) => {
                this.loadingAsociar = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al asociar', life: 3000 });
            }
        });
    }

    actualizarRol(): void {
        if (!this.actualizarForm.usuarioId || !this.actualizarForm.empresaId) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'ID de usuario y empresa son requeridos', life: 3000 });
            return;
        }
        this.loadingActualizar = true;
        this.service.actualizarRol({
            usuarioId: this.actualizarForm.usuarioId,
            empresaId: this.actualizarForm.empresaId,
            rolEmpresaCodigo: this.actualizarForm.rolEmpresaCodigo,
        }).subscribe({
            next: (r) => {
                this.loadingActualizar = false;
                if (r.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Rol actualizado correctamente', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo actualizar', life: 3000 });
                }
            },
            error: (err) => {
                this.loadingActualizar = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar', life: 3000 });
            }
        });
    }

    confirmarDesasociar(): void {
        if (!this.desasociarForm.usuarioId || !this.desasociarForm.empresaId) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'ID de usuario y empresa son requeridos', life: 3000 });
            return;
        }
        this.confirmationService.confirm({
            message: `¿Desasociar usuario #${this.desasociarForm.usuarioId} de empresa #${this.desasociarForm.empresaId}?`,
            header: 'Confirmar Desasociación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.desasociar(),
        });
    }

    private desasociar(): void {
        this.loadingDesasociar = true;
        this.service.desasociar({
            usuarioId: this.desasociarForm.usuarioId!,
            empresaId: this.desasociarForm.empresaId!,
        }).subscribe({
            next: (r) => {
                this.loadingDesasociar = false;
                if (r.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Usuario desasociado correctamente', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo desasociar', life: 3000 });
                }
            },
            error: (err) => {
                this.loadingDesasociar = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desasociar', life: 3000 });
            }
        });
    }
}

