import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ReportService, NlReportResult } from '@/core/services/report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-nl-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TextareaModule, TableModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
          <i class="pi pi-search-plus mr-2 text-primary"></i>Reporte en Lenguaje Natural
        </h1>
        <p class="text-surface-500 mt-1">
          Escribe una pregunta en español y el sistema generará la consulta automáticamente
        </p>
      </div>

      <!-- Entrada -->
      <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-6 mb-6">
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">
            Tu consulta
          </label>
          <textarea
            [(ngModel)]="query"
            pInputTextarea
            rows="3"
            placeholder="Ej: ¿Cuántos incidentes se atendieron este mes? ¿Cuál es el taller con mejor calificación?"
            class="w-full"
            [disabled]="loading"
          ></textarea>
          <div class="flex gap-2 flex-wrap">
            <p-button
              label="Consultar"
              icon="pi pi-play"
              [loading]="loading"
              [disabled]="!query.trim()"
              (onClick)="run()"
            />
            <p-button
              label="Limpiar"
              icon="pi pi-times"
              severity="secondary"
              outlined
              (onClick)="clear()"
            />
          </div>
        </div>

        <!-- Ejemplos -->
        <div class="mt-4">
          <p class="text-xs text-surface-400 mb-2">Ejemplos rápidos:</p>
          <div class="flex flex-wrap gap-2">
            @for (ex of examples; track ex) {
              <button
                class="text-xs px-3 py-1 rounded-full border border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                (click)="query = ex"
              >{{ ex }}</button>
            }
          </div>
        </div>
      </div>

      <!-- Resultado -->
      @if (result) {
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-6">
          <!-- SQL generado -->
          <div class="flex items-center justify-between mb-3">
            <details class="flex-1">
              <summary class="text-sm font-medium cursor-pointer text-surface-600 dark:text-surface-400 select-none">
                <i class="pi pi-code mr-1"></i>SQL generado ({{ result.rows_count }} filas)
              </summary>
              <pre class="mt-2 text-xs bg-surface-100 dark:bg-surface-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{ result.sql }}</pre>
            </details>
            @if (result.data.length > 0) {
              <p-button
                icon="pi pi-file-pdf"
                label="Descargar PDF"
                severity="danger"
                outlined
                size="small"
                (onClick)="downloadPdf()"
                class="ml-4 flex-shrink-0"
              />
            }
          </div>

          <!-- Tabla de resultados -->
          @if (result.data.length > 0) {
            <p-table [value]="result.data" [scrollable]="true" scrollHeight="400px"
                     styleClass="p-datatable-sm p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  @for (col of resultColumns; track col) {
                    <th>{{ col }}</th>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  @for (col of resultColumns; track col) {
                    <td>{{ row[col] ?? '—' }}</td>
                  }
                </tr>
              </ng-template>
            </p-table>
          } @else {
            <div class="flex items-center justify-center py-10 text-surface-400">
              <i class="pi pi-inbox text-3xl mr-3"></i>
              <span>La consulta no retornó resultados</span>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class NlReportComponent {
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);

  query = '';
  loading = false;
  result: NlReportResult | null = null;

  examples = [
    '¿Cuántos incidentes se atendieron este mes?',
    '¿Cuál es el taller con mejor calificación?',
    '¿Cuáles son los técnicos más activos?',
    'Muestra los incidentes pendientes de hoy',
    '¿Cuánto se recaudó en el último mes?',
  ];

  get resultColumns(): string[] {
    if (!this.result || this.result.data.length === 0) return [];
    return Object.keys(this.result.data[0]);
  }

  run(): void {
    if (!this.query.trim()) return;
    this.loading = true;
    this.reportService.runNlQuery(this.query).subscribe({
      next: data => {
        this.result = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const detail = err?.error?.detail ?? 'No se pudo procesar la consulta';
        this.messageService.add({ severity: 'error', summary: 'Error en reporte', detail, life: 5000 });
      }
    });
  }

  clear(): void {
    this.query = '';
    this.result = null;
  }

  downloadPdf(): void {
    if (!this.result) return;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Título
    doc.setFontSize(16);
    doc.text('Reporte en Lenguaje Natural', 14, 18);

    // Consulta
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Consulta: ${this.result.query}`, 14, 28);

    // SQL generado
    doc.setFontSize(9);
    doc.setTextColor(120);
    const sqlLines = doc.splitTextToSize(`SQL: ${this.result.sql}`, 260);
    doc.text(sqlLines, 14, 38);

    const yAfterSql = 38 + sqlLines.length * 5 + 6;

    // Tabla
    autoTable(doc, {
      startY: yAfterSql,
      head: [this.resultColumns],
      body: this.result.data.map(row =>
        this.resultColumns.map(c => String(row[c] ?? ''))
      ),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`reporte-nl-${Date.now()}.pdf`);
  }
}
