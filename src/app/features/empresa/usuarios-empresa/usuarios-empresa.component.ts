import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { UsuarioEmpresa, CrearUsuarioEmpresaRequest, EditarUsuarioEmpresaRequest } from './models/usuario-empresa.model';
import { UsuarioEmpresaService } from './data/usuario-empresa.service';
import { EmpresaService } from '@/core/services/empresa.service';

@Component({
    selector: 'app-usuarios-empresa',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, RippleModule,
        ToastModule, ToolbarModule, InputTextModule, DialogModule, SelectModule,
        TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule, TooltipModule,
    ],
    templateUrl: './usuarios-empresa.component.html',
    providers: [MessageService, ConfirmationService],
})
export class UsuariosEmpresaComponent implements OnInit {
    private service = inject(UsuarioEmpresaService);
    private empresaService = inject(EmpresaService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    usuarios = signal<UsuarioEmpresa[]>([]);
    loading = true;

    usuarioDialog = false;
    submitted = false;
    isEdit = false;

    crearForm: Partial<CrearUsuarioEmpresaRequest> = {};
    editarForm: Partial<EditarUsuarioEmpresaRequest> & { _id?: number } = {};

    roles = [
        { label: 'Owner', value: 'OWNER' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Operador', value: 'OPERADOR' },
    ];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.loadUsuarios();
    }

    loadUsuarios(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loading = true;
        this.service.listar(empresaId).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) this.usuarios.set(res.data ?? []);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios', life: 3000 });
            },
        });
    }

    openNew(): void {
        this.crearForm = {};
        this.submitted = false;
        this.isEdit = false;
        this.usuarioDialog = true;
    }

    editUsuario(ue: UsuarioEmpresa): void {
        this.isEdit = true;
        this.editarForm = {
            _id: ue.id,
            nombre: ue.usuario.nombre,
            apellidoPaterno: ue.usuario.apellidoPaterno,
            apellidoMaterno: ue.usuario.apellidoMaterno,
            celular: ue.usuario.celular,
            nuevoRol: ue.rolEmpresaCodigo,
        };
        this.submitted = false;
        this.usuarioDialog = true;
    }

    saveUsuario(): void {
        this.submitted = true;

        if (this.isEdit) {
            const req: EditarUsuarioEmpresaRequest = {
                nombre: this.editarForm.nombre,
                apellidoPaterno: this.editarForm.apellidoPaterno,
                apellidoMaterno: this.editarForm.apellidoMaterno,
                celular: this.editarForm.celular,
                nuevoRol: this.editarForm.nuevoRol,
            };
            this.service.actualizar(this.editarForm._id!, req).subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
                        this.usuarioDialog = false;
                        this.loadUsuarios();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar', life: 3000 }),
            });
        } else {
            if (!this.crearForm.correo?.trim()) return;
            const empresaId = this.empresaService.getEmpresaId()!;
            const req: CrearUsuarioEmpresaRequest = {
                correo: this.crearForm.correo!,
                nombre: this.crearForm.nombre,
                apellidoPaterno: this.crearForm.apellidoPaterno,
                apellidoMaterno: this.crearForm.apellidoMaterno,
                empresaId,
                rolEmpresaCodigo: this.crearForm.rolEmpresaCodigo,
            };
            this.service.crear(req).subscribe({
                next: (res) => {
                    if (res.codigo === 200 || res.codigo === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario agregado', life: 3000 });
                        this.usuarioDialog = false;
                        this.loadUsuarios();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear', life: 3000 }),
            });
        }
    }

    desactivarUsuario(ue: UsuarioEmpresa): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de desactivar a "${ue.usuario.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.service.desactivar(ue.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario desactivado', life: 3000 });
                        this.loadUsuarios();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desactivar', life: 3000 }),
                });
            },
        });
    }

    hideDialog(): void {
        this.usuarioDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getRolSeverity(rol: string): 'success' | 'info' | 'warn' | 'secondary' {
        switch (rol) {
            case 'OWNER': return 'success';
            case 'ADMIN': return 'info';
            case 'OPERADOR': return 'warn';
            default: return 'secondary';
        }
    }
}

