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
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { Sector, SectorRequest } from './models/sector.model';
import { SectorService } from './data/sector.service';
import { EmpresaService } from '@/core/services/empresa.service';

@Component({
    selector: 'app-sectores',
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
        SelectModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        CheckboxModule,
        TooltipModule,
    ],
    templateUrl: './sectores.component.html',
    providers: [MessageService, ConfirmationService],
})
export class SectoresComponent implements OnInit {
    private sectorService = inject(SectorService);
    private empresaService = inject(EmpresaService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    sectores = signal<Sector[]>([]);
    loading = true;
    eventoId!: number;

    sectorDialog = false;
    submitted = false;
    isEdit = false;

    form: Partial<SectorRequest> & { _sectorId?: number } = {};
    asientosNumerados = false;

    monedas = [
        { label: 'BOB', value: 'BOB' },
        { label: 'USD', value: 'USD' },
    ];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.eventoId = +this.route.snapshot.paramMap.get('eventoId')!;
        this.loadSectores();
    }

    loadSectores(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loading = true;
        this.sectorService.listar(this.eventoId, empresaId).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) this.sectores.set(res.data ?? []);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los sectores', life: 3000 });
            },
        });
    }

    openNew(): void {
        this.form = { moneda: 'BOB' };
        this.asientosNumerados = false;
        this.submitted = false;
        this.isEdit = false;
        this.sectorDialog = true;
    }

    editSector(sector: Sector): void {
        this.isEdit = true;
        this.form = {
            _sectorId: sector.sectorId,
            nombreSector: sector.nombreSector,
            capacidad: sector.capacidad,
            precioBase: sector.precioBase,
            moneda: sector.moneda,
        };
        this.asientosNumerados = sector.asientosNumerados;
        this.submitted = false;
        this.sectorDialog = true;
    }

    saveSector(): void {
        this.submitted = true;
        if (!this.form.nombreSector?.trim()) return;

        const empresaId = this.empresaService.getEmpresaId()!;
        const request: SectorRequest = {
            nombreSector: this.form.nombreSector!,
            capacidad: this.form.capacidad ?? 0,
            precioBase: this.form.precioBase ?? 0,
            moneda: this.form.moneda ?? 'BOB',
            asientosNumerados: this.asientosNumerados,
        };

        if (this.isEdit) {
            this.sectorService.actualizar(this.form._sectorId!, empresaId, request).subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sector actualizado', life: 3000 });
                        this.sectorDialog = false;
                        this.loadSectores();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar', life: 3000 }),
            });
        } else {
            this.sectorService.crear(this.eventoId, empresaId, request).subscribe({
                next: (res) => {
                    if (res.codigo === 200 || res.codigo === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sector creado', life: 3000 });
                        this.sectorDialog = false;
                        this.loadSectores();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear', life: 3000 }),
            });
        }
    }

    desactivarSector(sector: Sector): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de desactivar el sector "${sector.nombreSector}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const empresaId = this.empresaService.getEmpresaId()!;
                this.sectorService.desactivar(sector.sectorId, empresaId).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sector desactivado', life: 3000 });
                        this.loadSectores();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desactivar', life: 3000 }),
                });
            },
        });
    }

    hideDialog(): void {
        this.sectorDialog = false;
        this.submitted = false;
    }

    irAButacas(sector: Sector): void {
        this.router.navigate(['/eventos', this.eventoId, 'sectores', sector.sectorId, 'butacas']);
    }

    volverAEventos(): void {
        this.router.navigate(['/eventos']);
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}

