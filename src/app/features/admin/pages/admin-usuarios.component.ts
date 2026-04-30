import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsuarioInterno, UsuarioDetalle, UsuarioEmpresaResumen, CrearUsuarioInternoRequest } from '../models/usuario-interno.model';
import { UsuarioInternoService } from '../data/usuario-interno.service';
import { UsuarioEmpresaInternoService } from '../data/usuario-empresa-interno.service';
import { EmpresaInternaService } from '../data/empresa-interna.service';
import { Empresa } from '../models/empresa.model';

@Component({
    selector: 'app-admin-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule, InputTextModule, InputIconModule, IconFieldModule, DialogModule, SelectModule, PasswordModule, FloatLabelModule, CheckboxModule, TooltipModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-usuarios.component.html'
})
export class AdminUsuariosComponent implements OnInit {
    private usuarioService = inject(UsuarioInternoService);
    private ueService = inject(UsuarioEmpresaInternoService);
    private empresaService = inject(EmpresaInternaService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    usuarios = signal<UsuarioInterno[]>([]);
    loading = true;

    // Crear usuario
    crearVisible = false;
    savingCrear = false;
    asignarClave = false;
    crearForm: CrearUsuarioInternoRequest = { correo: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '', rolCodigo: 'USER', clave: '' };

    // Detalle
    detalleVisible = false;
    usuarioDetalle = signal<UsuarioInterno | null>(null);

    // Empresas
    empresasVisible = false;
    loadingEmpresas = false;
    empresasUsuario: UsuarioInterno | null = null;
    empresasDelUsuario = signal<UsuarioEmpresaResumen[]>([]);
    todasEmpresas = signal<Empresa[]>([]);
    asociarEmpresaId: number | null = null;
    asociarRol = '';
    savingAsociar = false;

    // Editar rol inline
    editandoRolId: number | null = null;
    editandoRolValor = '';
    savingRol = false;

    rolesSistema = [
        { label: 'Usuario', value: 'USER' },
        { label: 'Staff', value: 'STAFF' },
        { label: 'Superadmin', value: 'SUPERADMIN' },
    ];

    rolesEmpresa = [
        { label: 'Owner', value: 'OWNER' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Operador', value: 'OPERADOR' },
    ];

    detalleFields = [
        { key: 'id', label: 'ID' },
        { key: 'correo', label: 'Correo' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellidoPaterno', label: 'Apellido Paterno' },
        { key: 'apellidoMaterno', label: 'Apellido Materno' },
        { key: 'celular', label: 'Celular' },
        { key: 'rolCodigo', label: 'Rol' },
        { key: 'origenUsuarioCodigo', label: 'Origen' },
        { key: 'correoVerificado', label: 'Correo Verificado' },
        { key: 'debeConfigurarClave', label: 'Debe Configurar Clave' },
        { key: 'activo', label: 'Activo' },
        { key: 'ultimoAcceso', label: 'Último Acceso' },
        { key: 'fechaAlta', label: 'Fecha Alta' },
    ];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.loading = true;
        this.usuarioService.listar().subscribe({
            next: (r) => { this.loading = false; if (r.codigo === 200) this.usuarios.set(r.data ?? []); },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios', life: 3000 }); }
        });
    }

    // ─── Crear ───

    abrirCrear(): void {
        this.crearForm = { correo: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '', rolCodigo: 'USER', clave: '' };
        this.asignarClave = false;
        this.crearVisible = true;
    }

    crearUsuario(): void {
        if (!this.crearForm.correo.trim() || !this.crearForm.nombre.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Correo y nombre son requeridos', life: 3000 });
            return;
        }
        const req: CrearUsuarioInternoRequest = {
            correo: this.crearForm.correo,
            nombre: this.crearForm.nombre,
            rolCodigo: this.crearForm.rolCodigo,
            ...(this.crearForm.apellidoPaterno ? { apellidoPaterno: this.crearForm.apellidoPaterno } : {}),
            ...(this.crearForm.apellidoMaterno ? { apellidoMaterno: this.crearForm.apellidoMaterno } : {}),
            ...(this.asignarClave && this.crearForm.clave ? { clave: this.crearForm.clave } : {}),
        };
        this.savingCrear = true;
        this.usuarioService.crear(req).subscribe({
            next: (r) => {
                this.savingCrear = false;
                if (r.codigo === 201 || r.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Usuario creado exitosamente', life: 3000 });
                    this.crearVisible = false;
                    this.cargarUsuarios();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo crear', life: 3000 });
                }
            },
            error: (err) => {
                this.savingCrear = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear usuario', life: 3000 });
            }
        });
    }

    // ─── Detalle ───

    verDetalle(u: UsuarioInterno): void {
        this.usuarioDetalle.set(u);
        this.detalleVisible = true;
    }

    // ─── Gestionar Empresas ───

    abrirEmpresas(u: UsuarioInterno): void {
        this.empresasUsuario = u;
        this.empresasDelUsuario.set([]);
        this.asociarEmpresaId = null;
        this.asociarRol = '';
        this.editandoRolId = null;
        this.loadingEmpresas = true;
        this.empresasVisible = true;

        // Cargar detalle del usuario (con empresas) y lista de empresas en paralelo
        this.usuarioService.obtener(u.id).subscribe({
            next: (r) => {
                if (r.codigo === 200 && r.data) {
                    this.empresasDelUsuario.set(r.data.empresas ?? []);
                }
                this.loadingEmpresas = false;
            },
            error: () => {
                this.loadingEmpresas = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle', life: 3000 });
            }
        });

        // Cargar todas las empresas para el selector
        if (this.todasEmpresas().length === 0) {
            this.empresaService.listar().subscribe({
                next: (r) => { if (r.codigo === 200) this.todasEmpresas.set(r.data ?? []); }
            });
        }
    }

    asociarEmpresa(): void {
        if (!this.empresasUsuario || !this.asociarEmpresaId || !this.asociarRol) return;
        this.savingAsociar = true;
        this.ueService.asociar({ usuarioId: this.empresasUsuario.id, empresaId: this.asociarEmpresaId, rolEmpresaCodigo: this.asociarRol }).subscribe({
            next: (r) => {
                this.savingAsociar = false;
                if (r.codigo === 200 || r.codigo === 201) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Empresa asociada', life: 3000 });
                    this.asociarEmpresaId = null;
                    this.asociarRol = '';
                    this.recargarEmpresas();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo asociar', life: 3000 });
                }
            },
            error: (err) => { this.savingAsociar = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al asociar', life: 3000 }); }
        });
    }

    iniciarEditarRol(ue: UsuarioEmpresaResumen): void {
        this.editandoRolId = ue.usuarioEmpresaId;
        this.editandoRolValor = ue.rolEmpresaCodigo;
    }

    cancelarEditarRol(): void {
        this.editandoRolId = null;
    }

    guardarRol(ue: UsuarioEmpresaResumen): void {
        if (!this.empresasUsuario) return;
        this.savingRol = true;
        this.ueService.actualizarRol({ usuarioId: this.empresasUsuario.id, empresaId: ue.empresaId, rolEmpresaCodigo: this.editandoRolValor }).subscribe({
            next: (r) => {
                this.savingRol = false;
                if (r.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Rol actualizado', life: 3000 });
                    this.editandoRolId = null;
                    this.recargarEmpresas();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo actualizar', life: 3000 });
                }
            },
            error: (err) => { this.savingRol = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar rol', life: 3000 }); }
        });
    }

    confirmarDesasociar(ue: UsuarioEmpresaResumen): void {
        this.confirmationService.confirm({
            message: `¿Desasociar de "${ue.nombreEmpresa}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!this.empresasUsuario) return;
                this.ueService.desasociar({ usuarioId: this.empresasUsuario.id, empresaId: ue.empresaId }).subscribe({
                    next: (r) => {
                        if (r.codigo === 200) {
                            this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Desasociado correctamente', life: 3000 });
                            this.recargarEmpresas();
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudo desasociar', life: 3000 });
                        }
                    },
                    error: (err) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desasociar', life: 3000 }); }
                });
            }
        });
    }

    private recargarEmpresas(): void {
        if (!this.empresasUsuario) return;
        this.usuarioService.obtener(this.empresasUsuario.id).subscribe({
            next: (r) => { if (r.codigo === 200 && r.data) this.empresasDelUsuario.set(r.data.empresas ?? []); }
        });
    }

    // ─── Helpers ───

    rolSeverity(rol: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (rol) {
            case 'SUPERADMIN': return 'danger';
            case 'STAFF': return 'warn';
            case 'USER': return 'info';
            default: return 'secondary';
        }
    }

    getField(obj: any, key: string): string {
        const val = obj?.[key];
        if (val === null || val === undefined) return '-';
        if (typeof val === 'boolean') return val ? 'Sí' : 'No';
        return val.toString();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}

