import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
    ApexNonAxisChartSeries,
    ApexAxisChartSeries,
    ApexChart,
    ApexTitleSubtitle,
    ApexDataLabels,
    ApexResponsive,
    ApexLegend,
    ApexXAxis,
    ApexFill,
    ApexTooltip,
    ApexPlotOptions,
} from 'ng-apexcharts';
import { SkeletonModule } from 'primeng/skeleton';
import { MetricsService } from '@/core/services/metrics.service';
import { DashboardMetrics } from '@/core/models/metrics.model';

// ─── Tipos públicos de opciones de chart ─────────────────────────────────────

export interface DonutChartOptions {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    responsive: ApexResponsive[];
    title: ApexTitleSubtitle;
}

export interface BarChartOptions {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    colors: string[];
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    fill: ApexFill;
    tooltip: ApexTooltip;
    title: ApexTitleSubtitle;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_PROCESO: 'En proceso',
    ATENDIDO: 'Atendido',
    CANCELADO: 'Cancelado',
    RECHAZADO: 'Rechazado',
};

const STATUS_COLORS: Record<string, string> = {
    PENDIENTE: '#f97316',
    EN_PROCESO: '#eab308',
    ATENDIDO: '#22c55e',
    CANCELADO: '#94a3b8',
    RECHAZADO: '#ef4444',
};

const PRIORITY_LABELS: Record<string, string> = {
    BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica', INCIERTA: 'Incierta',
};

const PRIORITY_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#94a3b8'];

// ─── Componente ──────────────────────────────────────────────────────────────

@Component({
    selector: 'app-charts-dashboard',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule, SkeletonModule],
    template: `
        <div class="mt-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">
                <i class="pi pi-chart-pie mr-2 text-primary"></i>Distribución de Incidentes
            </h2>

            @if (loading) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p-skeleton height="300px" borderRadius="10px" />
                    <p-skeleton height="300px" borderRadius="10px" />
                </div>
            } @else if (statusChart && priorityChart) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Donut: por estado -->
                    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
                        <apx-chart
                            [series]="statusChart.series"
                            [chart]="statusChart.chart"
                            [labels]="statusChart.labels"
                            [colors]="statusChart.colors"
                            [dataLabels]="statusChart.dataLabels"
                            [legend]="statusChart.legend"
                            [responsive]="statusChart.responsive"
                            [title]="statusChart.title"
                        />
                    </div>

                    <!-- Bar: por prioridad -->
                    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
                        <apx-chart
                            [series]="priorityChart.series"
                            [chart]="priorityChart.chart"
                            [xaxis]="priorityChart.xaxis"
                            [colors]="priorityChart.colors"
                            [plotOptions]="priorityChart.plotOptions"
                            [dataLabels]="priorityChart.dataLabels"
                            [fill]="priorityChart.fill"
                            [tooltip]="priorityChart.tooltip"
                            [title]="priorityChart.title"
                        />
                    </div>
                </div>

                <!-- Estadísticas de asignaciones -->
                @if (assignmentsData) {
                    <div class="mt-4 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
                        <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                            <i class="pi pi-list-check mr-1"></i>Asignaciones por estado
                        </h3>
                        <div class="flex flex-wrap gap-4">
                            @for (entry of assignmentsData; track entry.label) {
                                <div class="flex flex-col items-center px-4 py-2 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                                    <span class="text-xl font-bold text-surface-800 dark:text-surface-200">{{ entry.value }}</span>
                                    <span class="text-xs text-surface-500 mt-0.5">{{ entry.label }}</span>
                                </div>
                            }
                        </div>
                    </div>
                }
            }
        </div>
    `
})
export class ChartsDashboardComponent implements OnInit {
    private metricsService = inject(MetricsService);

    loading = true;
    statusChart: DonutChartOptions | null = null;
    priorityChart: BarChartOptions | null = null;
    assignmentsData: { label: string; value: number }[] | null = null;

    ngOnInit(): void {
        this.metricsService.getDashboard().subscribe({
            next: (data) => {
                this.buildStatusChart(data);
                this.buildPriorityChart(data);
                this.buildAssignments(data);
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    private buildStatusChart(data: DashboardMetrics): void {
        const statusKeys = Object.keys(data.incidents_by_status);
        const labels = statusKeys.map(k => STATUS_LABELS[k] ?? k);
        const colors = statusKeys.map(k => STATUS_COLORS[k] ?? '#94a3b8');
        const series = statusKeys.map(k => data.incidents_by_status[k]);

        this.statusChart = {
            series,
            labels,
            colors,
            chart: { type: 'donut', height: 280, toolbar: { show: false } },
            dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
            legend: { position: 'bottom', fontSize: '12px' },
            responsive: [{ breakpoint: 480, options: { chart: { height: 240 }, legend: { position: 'bottom' } } }],
            title: { text: 'Por estado', align: 'left', style: { fontSize: '13px', fontWeight: '600' } },
        };
    }

    private buildPriorityChart(data: DashboardMetrics): void {
        const priorityKeys = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA', 'INCIERTA'];
        const categories = priorityKeys.map(k => PRIORITY_LABELS[k]);
        const values = priorityKeys.map(k => data.incidents_by_priority[k] ?? 0);

        this.priorityChart = {
            series: [{ name: 'Incidentes', data: values }],
            chart: { type: 'bar', height: 280, toolbar: { show: false } },
            xaxis: { categories },
            colors: PRIORITY_COLORS,
            plotOptions: { bar: { distributed: true, borderRadius: 4, columnWidth: '55%' } },
            dataLabels: { enabled: true },
            fill: { opacity: 0.9 },
            tooltip: { y: { formatter: (val: number) => `${val} incidentes` } },
            title: { text: 'Por prioridad', align: 'left', style: { fontSize: '13px', fontWeight: '600' } },
        };
    }

    private buildAssignments(data: DashboardMetrics): void {
        const ASSIGN_LABELS: Record<string, string> = {
            INVITADO: 'Invitados', ACEPTADO: 'Aceptados', EN_CAMINO: 'En camino',
            ATENDIENDO: 'Atendiendo', COMPLETADO: 'Completados', RECHAZADO: 'Rechazados',
        };
        this.assignmentsData = Object.entries(data.assignments_by_status)
            .map(([k, v]) => ({ label: ASSIGN_LABELS[k] ?? k, value: v }));
    }
}
