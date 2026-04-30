import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TransaccionPago } from './models/transaccion-pago.model';
import { TransaccionPagoService } from './data/transaccion-pago.service';

@Component({
    selector: 'app-admin-transacciones',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, ToastModule, TagModule, InputTextModule, InputIconModule, IconFieldModule, DialogModule, TooltipModule],
    providers: [MessageService],
    templateUrl: './admin-transacciones.component.html'
})
export class AdminTransaccionesComponent implements OnInit {
    private service = inject(TransaccionPagoService);
    private messageService = inject(MessageService);

    transacciones = signal<TransaccionPago[]>([]);
    loading = true;

    detalleVisible = false;
    detalle: TransaccionPago | null = null;

    detalleFields = [
        { key: 'id', label: 'ID' },
        { key: 'idqr', label: 'ID QR' },
        { key: 'tipoTransaccionCodigo', label: 'Tipo Transacción' },
        { key: 'estadoTransaccionCodigo', label: 'Estado Transacción' },
        { key: 'montoOriginal', label: 'Monto Original' },
        { key: 'comision', label: 'Comisión' },
        { key: 'montoTotal', label: 'Monto Total' },
        { key: 'moneda', label: 'Moneda' },
        { key: 'cantidadTickets', label: 'Cantidad de Tickets' },
        { key: 'estadoLiquidacion', label: 'Estado Liquidación' },
        { key: 'fechaConfirmacion', label: 'Fecha Confirmación' },
        { key: 'usuarioAlta', label: 'Usuario Alta' },
        { key: 'fechaAlta', label: 'Fecha Alta' },
    ];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.loading = true;
        this.service.listar().subscribe({
            next: (r) => { this.loading = false; if (r.codigo === 200) this.transacciones.set(r.data ?? []); },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las transacciones', life: 3000 }); }
        });
    }

    verDetalle(t: TransaccionPago): void {
        this.detalle = t;
        this.detalleVisible = true;
    }

    estadoSeverity(estado: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (estado) {
            case 'CONFIRMADA': return 'success';
            case 'PENDIENTE': return 'warn';
            case 'RECHAZADA': case 'CANCELADA': return 'danger';
            default: return 'info';
        }
    }

    getField(obj: any, key: string): string {
        return obj?.[key]?.toString() ?? '-';
    }

    reenviando = false;

    reenviarBoletos(t: TransaccionPago): void {
        this.reenviando = true;
        this.service.reenviarBoletos(t.id).subscribe({
            next: (r) => {
                this.reenviando = false;
                if (r.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Boletos reenviados correctamente', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: r.mensaje || 'No se pudieron reenviar', life: 3000 });
                }
            },
            error: (err) => {
                this.reenviando = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al reenviar boletos', life: 3000 });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}

