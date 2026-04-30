import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { WorkshopService } from '@/core/services/workshop.service';
import { Workshop } from '@/core/models/workshop.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-workshop-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule, TagModule, ToastModule, DialogModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Talleres registrados</h1>
                    <p class="text-sm text-surface-500 mt-1">Vista de solo lectura — SUPERADMIN</p>
                </div>
            </div>

            <p-table [value]="workshops" [paginator]="workshops.length > 15" [rows]="15"
                     [rowHover]="true" styleClass="p-datatable-sm"
                     emptyMessage="No hay talleres registrados" [loading]="loading">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th style="width: 100px">Remolque</th>
                        <th style="width: 100px">24h</th>
                        <th style="width: 110px">Estado</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-ws>
                    <tr>
                        <td class="font-medium">{{ ws.name }}</td>
                        <td class="text-surface-500 text-sm">{{ ws.address ?? '—' }}</td>
                        <td class="text-surface-500 text-sm">{{ ws.phone ?? '—' }}</td>
                        <td>
                            @if (ws.has_tow) {
                                <span class="text-orange-500 text-sm font-medium">Sí</span>
                            } @else {
                                <span class="text-surface-400 text-sm">No</span>
                            }
                        </td>
                        <td>
                            @if (ws.is_24_hours) {
                                <span class="text-green-600 text-sm font-medium">Sí</span>
                            } @else {
                                <span class="text-surface-400 text-sm">No</span>
                            }
                        </td>
                        <td>
                            <p-tag [value]="ws.status" [severity]="ws.status === 'ACTIVO' ? 'success' : 'secondary'" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class WorkshopListComponent implements OnInit {
    private workshopService = inject(WorkshopService);

    workshops: Workshop[] = [];
    loading = true;

    ngOnInit(): void {
        this.workshopService.getAllWorkshops().subscribe({
            next: ws => { this.workshops = ws; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }
}

