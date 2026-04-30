import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StaffEvento, CrearStaffRequest, EditarStaffRequest, StaffSector } from './models/staff-evento.model';
import { StaffEventoService } from './data/staff-evento.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { Sector } from '@/features/empresa/sectores/models/sector.model';
import { SectorService } from '@/features/empresa/sectores/data/sector.service';

@Component({
    selector: 'app-staff-evento',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, RippleModule,
        ToastModule, ToolbarModule, InputTextModule,
        DialogModule, TagModule, InputIconModule, IconFieldModule,
        ConfirmDialogModule, ToggleSwitchModule, PasswordModule, TooltipModule,
        SelectModule, RadioButtonModule,
    ],
    templateUrl: './staff-evento.component.html',
    providers: [MessageService, ConfirmationService],
})
export class StaffEventoComponent implements OnInit {
    private service = inject(StaffEventoService);
    private sectorService = inject(SectorService);
    private empresaService = inject(EmpresaService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    staffList = signal<StaffEvento[]>([]);
    loading = true;
    eventoId!: number;

    staffDialog = false;
    submitted = false;
    modoNuevo = false; // false = asignar existente por correo, true = crear nuevo con datos
    editingStaffId: number | null = null;

    form: Partial<CrearStaffRequest> & { activo?: boolean } = {};

    // ── Sectores del Staff ──
    sectoresDialog = false;
    selectedStaff: StaffEvento | null = null;
    staffSectores = signal<StaffSector[]>([]);
    sectoresEvento = signal<Sector[]>([]);
    sectorToAdd: Sector | null = null;
    loadingSectores = false;

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.eventoId = +this.route.snapshot.paramMap.get('eventoId')!;
        this.loadStaff();
    }

    loadStaff(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loading = true;
        this.service.listar(this.eventoId, empresaId).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) this.staffList.set(res.data ?? []);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el staff', life: 3000 });
            },
        });
    }

    openNew(): void {
        this.editingStaffId = null;
        this.form = {};
        this.modoNuevo = false;
        this.submitted = false;
        this.staffDialog = true;
    }

    editStaff(staff: StaffEvento): void {
        this.editingStaffId = staff.id;
        this.form = {
            correo: staff.usuario.correo,
            nombre: staff.usuario.nombre,
            apellidoPaterno: staff.usuario.apellidoPaterno ?? '',
            apellidoMaterno: staff.usuario.apellidoMaterno ?? '',
            celular: staff.usuario.celular ?? '',
            activo: staff.activo,
        };
        this.modoNuevo = false;
        this.submitted = false;
        this.staffDialog = true;
    }

    saveStaff(): void {
        this.submitted = true;

        if (this.editingStaffId) {
            // PATCH mode
            if (!this.form.nombre?.trim()) {
                this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre no puede estar vacío', life: 3000 });
                return;
            }
            const empresaId = this.empresaService.getEmpresaId()!;
            const request: EditarStaffRequest = {
                nombre: this.form.nombre,
                apellidoPaterno: this.form.apellidoPaterno || undefined,
                apellidoMaterno: this.form.apellidoMaterno || undefined,
                celular: this.form.celular || undefined,
                activo: this.form.activo,
            };
            if (this.form.clave?.trim()) {
                request.clave = this.form.clave;
            }
            this.service.actualizar(this.editingStaffId, empresaId, request).subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Staff actualizado', life: 3000 });
                        this.staffDialog = false;
                        this.loadStaff();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar staff', life: 3000 }),
            });
        } else {
            // POST mode
            if (!this.form.correo?.trim()) {
                this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese el correo', life: 3000 });
                return;
            }

            const empresaId = this.empresaService.getEmpresaId()!;
            const request: CrearStaffRequest = {
                correo: this.form.correo!,
                eventoId: this.eventoId,
                empresaId,
            };

            if (this.modoNuevo) {
                if (!this.form.clave?.trim()) {
                    this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es obligatoria para crear un staff nuevo', life: 3000 });
                    return;
                }
                request.nombre = this.form.nombre;
                request.apellidoPaterno = this.form.apellidoPaterno;
                request.apellidoMaterno = this.form.apellidoMaterno;
                request.celular = this.form.celular;
                request.clave = this.form.clave;
            }

            this.service.crear(request).subscribe({
                next: (res) => {
                    if (res.codigo === 200 || res.codigo === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Staff agregado', life: 3000 });
                        this.staffDialog = false;
                        this.loadStaff();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al agregar staff', life: 3000 }),
            });
        }
    }

    desactivarStaff(staff: StaffEvento): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de desactivar a "${staff.usuario.nombre}" del staff?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const empresaId = this.empresaService.getEmpresaId()!;
                this.service.desactivar(staff.id, empresaId).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Staff desactivado', life: 3000 });
                        this.loadStaff();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desactivar', life: 3000 }),
                });
            },
        });
    }

    hideDialog(): void {
        this.staffDialog = false;
        this.submitted = false;
    }

    volverAEventos(): void {
        this.router.navigate(['/eventos']);
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // ── Gestión de sectores del staff ──

    openSectores(staff: StaffEvento): void {
        this.selectedStaff = staff;
        this.sectorToAdd = null;
        this.sectoresDialog = true;
        this.loadSectoresEvento();
        this.loadStaffSectores();
    }

    private loadSectoresEvento(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.sectorService.listar(this.eventoId, empresaId).subscribe({
            next: (res) => {
                if (res.codigo === 200) this.sectoresEvento.set(res.data ?? []);
            },
        });
    }

    loadStaffSectores(): void {
        if (!this.selectedStaff) return;
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loadingSectores = true;
        this.service.listarSectores(this.selectedStaff.id, empresaId).subscribe({
            next: (res) => {
                this.loadingSectores = false;
                if (res.codigo === 200) this.staffSectores.set(res.data ?? []);
            },
            error: () => {
                this.loadingSectores = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los sectores del staff', life: 3000 });
            },
        });
    }

    get sectoresDisponibles(): Sector[] {
        const asignados = new Set(this.staffSectores().map(ss => ss.sector.sectorId));
        return this.sectoresEvento().filter(s => !asignados.has(s.sectorId));
    }

    asignarSector(): void {
        if (!this.selectedStaff || !this.sectorToAdd) return;
        const empresaId = this.empresaService.getEmpresaId()!;
        this.service.asignarSector(this.selectedStaff.id, empresaId, this.sectorToAdd.sectorId).subscribe({
            next: (res) => {
                if (res.codigo === 200 || res.codigo === 201) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sector asignado', life: 3000 });
                    this.sectorToAdd = null;
                    this.loadStaffSectores();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                }
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al asignar sector', life: 3000 }),
        });
    }

    quitarSector(ss: StaffSector): void {
        if (!this.selectedStaff) return;
        this.confirmationService.confirm({
            message: `¿Quitar el sector "${ss.sector.nombreSector}" de este staff?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const empresaId = this.empresaService.getEmpresaId()!;
                this.service.quitarSector(this.selectedStaff!.id, empresaId, ss.sector.sectorId).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sector quitado', life: 3000 });
                        this.loadStaffSectores();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al quitar sector', life: 3000 }),
                });
            },
        });
    }

    cambiarActivo(ss: StaffSector): void {
        if (!this.selectedStaff || ss.activo) return;
        const empresaId = this.empresaService.getEmpresaId()!;
        this.service.cambiarSectorActivo(this.selectedStaff.id, empresaId, ss.sector.sectorId).subscribe({
            next: (res) => {
                if (res.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sector activo actualizado', life: 3000 });
                    this.loadStaffSectores();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                }
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al cambiar sector activo', life: 3000 }),
        });
    }

    hideSectoresDialog(): void {
        this.sectoresDialog = false;
        this.selectedStaff = null;
        this.staffSectores.set([]);
    }
}

