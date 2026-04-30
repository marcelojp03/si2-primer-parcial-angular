import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { EmpresaInternaService } from '../data/empresa-interna.service';
import { TipoEventoInternoService } from '../data/tipo-evento-interno.service';
import { TransaccionPagoService } from '../data/transaccion-pago.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
    templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
    private empresaService = inject(EmpresaInternaService);
    private tipoEventoService = inject(TipoEventoInternoService);
    private transaccionService = inject(TransaccionPagoService);
    router = inject(Router);

    totalEmpresas = signal(0);
    totalTipos = signal(0);
    totalTransacciones = signal(0);

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.empresaService.listar().subscribe({ next: (r) => { if (r.codigo === 200) this.totalEmpresas.set(r.data?.length ?? 0); } });
        this.tipoEventoService.listar().subscribe({ next: (r) => { if (r.codigo === 200) this.totalTipos.set(r.data?.length ?? 0); } });
        this.transaccionService.listar().subscribe({ next: (r) => { if (r.codigo === 200) this.totalTransacciones.set(r.data?.length ?? 0); } });
    }
}

