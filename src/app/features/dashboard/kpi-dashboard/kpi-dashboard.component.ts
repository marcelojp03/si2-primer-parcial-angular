import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MetricsService } from '@/core/services/metrics.service';
import { KPIDashboard } from '@/core/models/metrics.model';

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
  imports: [CommonModule, SkeletonModule, TagModule],
  template: `
    <div class="mt-6">
      <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">
        <i class="pi pi-chart-line mr-2 text-primary"></i>KPIs del Período
      </h2>

      @if (loading) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <p-skeleton height="90px" borderRadius="10px" />
          }
        </div>
      } @else if (kpis) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

          <div class="kpi-card bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div class="text-xs text-blue-500 uppercase tracking-wide font-medium mb-1">Incidentes (30 días)</div>
            <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ kpis.incidents_last_30_days }}</div>
            <div class="text-xs text-blue-400 mt-1">Total: {{ kpis.total_incidents }}</div>
          </div>

          <div class="kpi-card bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div class="text-xs text-green-500 uppercase tracking-wide font-medium mb-1">Cumplimiento SLA</div>
            <div class="text-2xl font-bold text-green-700 dark:text-green-300">
              {{ kpis.sla_compliance_pct | number:'1.0-1' }}%
            </div>
            <div class="text-xs text-green-400 mt-1">
              <p-tag [severity]="kpis.sla_compliance_pct >= 90 ? 'success' : kpis.sla_compliance_pct >= 70 ? 'warn' : 'danger'"
                     [value]="kpis.sla_compliance_pct >= 90 ? 'Excelente' : kpis.sla_compliance_pct >= 70 ? 'Aceptable' : 'Bajo'" />
            </div>
          </div>

          <div class="kpi-card bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div class="text-xs text-orange-500 uppercase tracking-wide font-medium mb-1">T. Respuesta Promedio</div>
            <div class="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {{ kpis.avg_response_minutes | number:'1.0-1' }}
            </div>
            <div class="text-xs text-orange-400 mt-1">minutos</div>
          </div>

          <div class="kpi-card bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div class="text-xs text-purple-500 uppercase tracking-wide font-medium mb-1">Ingresos Totales</div>
            <div class="text-2xl font-bold text-purple-700 dark:text-purple-300">
              Bs. {{ kpis.total_revenue | number:'1.0-0' }}
            </div>
            <div class="text-xs text-purple-400 mt-1">Rating: {{ kpis.average_rating | number:'1.1-1' }} / 5</div>
          </div>

          <div class="kpi-card bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
            <div class="text-xs text-teal-500 uppercase tracking-wide font-medium mb-1">Asignaciones Activas</div>
            <div class="text-2xl font-bold text-teal-700 dark:text-teal-300">{{ kpis.active_assignments }}</div>
            <div class="text-xs text-teal-400 mt-1">Total: {{ kpis.total_assignments }}</div>
          </div>

          <div class="kpi-card bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div class="text-xs text-indigo-500 uppercase tracking-wide font-medium mb-1">Talleres Activos</div>
            <div class="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{{ kpis.active_workshops }}</div>
          </div>

          <div class="kpi-card bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div class="text-xs text-yellow-600 uppercase tracking-wide font-medium mb-1">Reputación Promedio</div>
            <div class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {{ kpis.avg_reputation_score | number:'1.1-2' }}
            </div>
            <div class="text-xs text-yellow-500 mt-1">puntaje de taller</div>
          </div>

        </div>
      } @else {
        <p class="text-surface-400 text-sm">No se pudieron cargar los KPIs</p>
      }
    </div>
  `
})
export class KpiDashboardComponent implements OnInit {
  private metricsService = inject(MetricsService);

  kpis: KPIDashboard | null = null;
  loading = true;

  ngOnInit(): void {
    this.metricsService.getKpis().subscribe({
      next: data => {
        this.kpis = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
