import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MetricsService } from '@/core/services/metrics.service';
import { AuthService } from '@/core/services/auth.service';
import { DashboardMetrics } from '@/core/models/metrics.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, SkeletonModule, TagModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                    Bienvenido, {{ userName }}
                </h1>
                <p class="text-surface-500 mt-1">Resumen de actividad de tu taller</p>
            </div>

            @if (loading) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    @for (i of [1,2,3,4]; track i) {
                        <p-skeleton height="120px" borderRadius="12px" />
                    }
                </div>
            } @else if (metrics) {
                <!-- Tarjetas de métricas -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                    <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-surface-500">Incidentes totales</span>
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                                <i class="pi pi-list text-blue-600 dark:text-blue-400"></i>
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ metrics.total_incidents }}</div>
                    </div>

                    <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-surface-500">Pendientes</span>
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900">
                                <i class="pi pi-clock text-orange-600 dark:text-orange-400"></i>
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ metrics.incidents_by_status['PENDIENTE'] }}</div>
                    </div>

                    <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-surface-500">En proceso</span>
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-900">
                                <i class="pi pi-spin pi-cog text-yellow-600 dark:text-yellow-400"></i>
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ metrics.incidents_by_status['EN_PROCESO'] }}</div>
                    </div>

                    <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-surface-500">Calificación</span>
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900">
                                <i class="pi pi-star-fill text-green-600 dark:text-green-400"></i>
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                            {{ metrics.average_rating | number:'1.1-1' }}
                        </div>
                        <span class="text-xs text-surface-400">/ 5.0 estrellas</span>
                    </div>
                </div>

                <!-- Segunda fila -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-surface-500">Atendidos</span>
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-100 dark:bg-teal-900">
                                <i class="pi pi-check-circle text-teal-600 dark:text-teal-400"></i>
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-teal-600 dark:text-teal-400">{{ metrics.incidents_by_status['ATENDIDO'] }}</div>
                    </div>

                    <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-surface-500">Ingresos totales</span>
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900">
                                <i class="pi pi-dollar text-purple-600 dark:text-purple-400"></i>
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            Bs. {{ metrics.total_revenue | number:'1.0-0' }}
                        </div>
                    </div>

                    @if (metrics.total_technicians !== undefined) {
                        <div class="rounded-xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-surface-500">Técnicos totales</span>
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
                                    <i class="pi pi-wrench text-indigo-600 dark:text-indigo-400"></i>
                                </div>
                            </div>
                            <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ metrics.total_technicians }}</div>
                        </div>
                    }
                </div>
            } @else {
                <div class="flex flex-col items-center justify-center h-64 text-surface-400">
                    <i class="pi pi-exclamation-circle text-4xl mb-3"></i>
                    <p>No se pudieron cargar las métricas</p>
                </div>
            }
        </div>
    `
})
export class DashboardComponent implements OnInit {
    private metricsService = inject(MetricsService);
    private authService = inject(AuthService);

    metrics: DashboardMetrics | null = null;
    loading = true;
    userName = '';

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        this.userName = user?.full_name ?? 'Administrador';
        this.loadMetrics();
    }

    private loadMetrics(): void {
        this.loading = true;
        this.metricsService.getDashboard().subscribe({
            next: data => {
                this.metrics = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}

