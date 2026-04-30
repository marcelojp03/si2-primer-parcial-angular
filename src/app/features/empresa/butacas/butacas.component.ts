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
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Butaca, ButacaRequest } from './models/butaca.model';
import { ButacaService } from './data/butaca.service';
import { EmpresaService } from '@/core/services/empresa.service';

@Component({
    selector: 'app-butacas',
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
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TooltipModule,
    ],
    templateUrl: './butacas.component.html',
    providers: [MessageService, ConfirmationService],
})
export class ButacasComponent implements OnInit {
    private butacaService = inject(ButacaService);
    private empresaService = inject(EmpresaService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    butacas = signal<Butaca[]>([]);
    loading = true;
    sectorId!: number;
    eventoId!: number;

    // Single butaca dialog
    butacaDialog = false;
    submitted = false;
    isEdit = false;
    form: Partial<ButacaRequest> & { _butacaId?: number } = {};

    // Bulk create dialog
    loteDialog = false;
    loteForm = { fila: '', desde: 1, hasta: 10 };

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.eventoId = +this.route.snapshot.paramMap.get('eventoId')!;
        this.sectorId = +this.route.snapshot.paramMap.get('sectorId')!;
        this.loadButacas();
    }

    loadButacas(): void {
        const empresaId = this.empresaService.getEmpresaId();
        if (!empresaId) return;
        this.loading = true;
        this.butacaService.listar(this.sectorId, empresaId).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) this.butacas.set(res.data ?? []);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las butacas', life: 3000 });
            },
        });
    }

    openNew(): void {
        this.form = {};
        this.submitted = false;
        this.isEdit = false;
        this.butacaDialog = true;
    }

    openLoteDialog(): void {
        this.loteForm = { fila: '', desde: 1, hasta: 10 };
        this.loteDialog = true;
    }

    editButaca(butaca: Butaca): void {
        this.isEdit = true;
        this.form = {
            _butacaId: butaca.id,
            codigoButaca: butaca.codigoButaca,
            fila: butaca.fila,
            numero: butaca.numero,
        };
        this.submitted = false;
        this.butacaDialog = true;
    }

    saveButaca(): void {
        this.submitted = true;
        if (!this.form.fila?.trim()) return;

        const empresaId = this.empresaService.getEmpresaId()!;
        const request: ButacaRequest = {
            codigoButaca: this.form.codigoButaca || `${this.form.fila}-${this.form.numero}`,
            fila: this.form.fila!,
            numero: this.form.numero ?? 0,
        };

        if (this.isEdit) {
            this.butacaService.actualizar(this.form._butacaId!, empresaId, request).subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Butaca actualizada', life: 3000 });
                        this.butacaDialog = false;
                        this.loadButacas();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar', life: 3000 }),
            });
        } else {
            this.butacaService.crear(this.sectorId, empresaId, request).subscribe({
                next: (res) => {
                    if (res.codigo === 200 || res.codigo === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Butaca creada', life: 3000 });
                        this.butacaDialog = false;
                        this.loadButacas();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                    }
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear', life: 3000 }),
            });
        }
    }

    crearLote(): void {
        if (!this.loteForm.fila?.trim() || this.loteForm.desde > this.loteForm.hasta) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese fila y rango válido', life: 3000 });
            return;
        }

        const empresaId = this.empresaService.getEmpresaId()!;
        const lote: ButacaRequest[] = [];
        for (let i = this.loteForm.desde; i <= this.loteForm.hasta; i++) {
            lote.push({
                codigoButaca: `${this.loteForm.fila}-${i}`,
                fila: this.loteForm.fila,
                numero: i,
            });
        }

        this.butacaService.crearLote(this.sectorId, empresaId, lote).subscribe({
            next: (res) => {
                if (res.codigo === 200 || res.codigo === 201) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `${lote.length} butacas creadas`, life: 3000 });
                    this.loteDialog = false;
                    this.loadButacas();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje, life: 3000 });
                }
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear lote', life: 3000 }),
        });
    }

    desactivarButaca(butaca: Butaca): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de desactivar la butaca "${butaca.fila}-${butaca.numero}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const empresaId = this.empresaService.getEmpresaId()!;
                this.butacaService.desactivar(butaca.id, empresaId).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Butaca desactivada', life: 3000 });
                        this.loadButacas();
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al desactivar', life: 3000 }),
                });
            },
        });
    }

    hideDialog(): void {
        this.butacaDialog = false;
        this.submitted = false;
    }

    volverASectores(): void {
        this.router.navigate(['/eventos', this.eventoId, 'sectores']);
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}

