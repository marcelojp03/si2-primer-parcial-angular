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
import { Empresa } from '../models/empresa.model';
import { EmpresaInternaService } from '../data/empresa-interna.service';

@Component({
    selector: 'app-admin-empresas',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, ToastModule, TagModule, InputTextModule, InputIconModule, IconFieldModule, DialogModule, TooltipModule],
    providers: [MessageService],
    templateUrl: './admin-empresas.component.html'
})
export class AdminEmpresasComponent implements OnInit {
    private service = inject(EmpresaInternaService);
    private messageService = inject(MessageService);

    empresas = signal<Empresa[]>([]);
    loading = true;

    detalleVisible = false;
    empresaDetalle: Empresa | null = null;

    detalleFields = [
        { key: 'idempresa', label: 'ID' },
        { key: 'nombreEmpresa', label: 'Nombre' },
        { key: 'razonSocial', label: 'Razón Social' },
        { key: 'nit', label: 'NIT' },
        { key: 'emisionNit', label: 'Emisión NIT' },
        { key: 'rubro', label: 'Rubro' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'correos', label: 'Correos' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'telefonoFijo', label: 'Teléfono Fijo' },
        { key: 'telefonoMovil', label: 'Teléfono Móvil' },
        { key: 'paginaWeb', label: 'Página Web' },
        { key: 'estado', label: 'Estado' },
    ];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.loadEmpresas();
    }

    loadEmpresas(): void {
        this.loading = true;
        this.service.listar().subscribe({
            next: (res) => {
                this.loading = false;
                if (res.codigo === 200) this.empresas.set(res.data ?? []);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las empresas', life: 3000 });
            },
        });
    }

    verDetalle(empresa: Empresa): void {
        this.empresaDetalle = empresa;
        this.detalleVisible = true;
    }

    getField(obj: any, key: string): string {
        return obj?.[key]?.toString() ?? '';
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}

