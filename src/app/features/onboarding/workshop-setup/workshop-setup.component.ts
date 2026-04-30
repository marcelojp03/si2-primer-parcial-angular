import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { StepperModule } from 'primeng/stepper';
import { MessageService } from 'primeng/api';
import { WorkshopService } from '@/core/services/workshop.service';
import { Workshop, Specialty, WorkshopSchedule } from '@/core/models/workshop.model';

interface DaySchedule {
    dia: string;
    label: string;
    activo: boolean;
    start_time: string;
    end_time: string;
}

@Component({
    selector: 'app-workshop-setup',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, CheckboxModule, MultiSelectModule, ToastModule, StepperModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />
        <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
            <div class="w-full max-w-2xl">

                <div class="text-center mb-8">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                         style="background: linear-gradient(135deg, #ff8c00, #ff4500)">
                        <i class="pi pi-building text-white text-2xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Configura tu taller</h1>
                    <p class="text-surface-500 mt-1">Completa los 4 pasos para empezar a recibir solicitudes</p>
                </div>

                <!-- Indicador de pasos -->
                <div class="flex items-center justify-center gap-2 mb-8">
                    @for (s of [1,2,3,4]; track s) {
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                                 [class]="step >= s ? 'bg-orange-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'">
                                {{ s }}
                            </div>
                            @if (s < 4) {
                                <div class="w-12 h-0.5" [class]="step > s ? 'bg-orange-500' : 'bg-surface-200 dark:bg-surface-700'"></div>
                            }
                        </div>
                    }
                </div>

                <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-8">

                    <!-- PASO 1: Datos básicos del taller -->
                    @if (step === 1) {
                        <h2 class="text-lg font-semibold mb-6 text-surface-900 dark:text-surface-0">Datos del taller</h2>
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium">Nombre del taller *</label>
                                <input pInputText [(ngModel)]="workshopForm.name" placeholder="Taller Mecánico Central" class="w-full" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium">Descripción</label>
                                <textarea pTextarea [(ngModel)]="workshopForm.description"
                                          placeholder="Describe los servicios que ofrece tu taller"
                                          rows="3" class="w-full resize-none"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Teléfono</label>
                                    <input pInputText [(ngModel)]="workshopForm.phone" placeholder="70012345" class="w-full" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Correo de contacto</label>
                                    <input pInputText [(ngModel)]="workshopForm.email" type="email" placeholder="taller@ejemplo.com" class="w-full" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium">Dirección</label>
                                <input pInputText [(ngModel)]="workshopForm.address" placeholder="Av. Principal #123" class="w-full" />
                            </div>
                            <div class="flex gap-6 mt-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <p-checkbox [(ngModel)]="workshopForm.has_tow" [binary]="true" />
                                    <span class="text-sm">Servicio de remolque</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <p-checkbox [(ngModel)]="workshopForm.is_24_hours" [binary]="true" />
                                    <span class="text-sm">Atención 24 horas</span>
                                </label>
                            </div>
                        </div>
                    }

                    <!-- PASO 2: Ubicación -->
                    @if (step === 2) {
                        <h2 class="text-lg font-semibold mb-6 text-surface-900 dark:text-surface-0">Ubicación del taller</h2>
                        <div class="flex flex-col gap-4">
                            <p class="text-sm text-surface-500">
                                Ingresa las coordenadas de tu taller. Puedes obtenerlas en
                                <a href="https://maps.google.com" target="_blank" class="text-orange-500 hover:underline">Google Maps</a>
                                haciendo clic derecho → "¿Qué hay aquí?".
                            </p>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Latitud *</label>
                                    <input pInputText [(ngModel)]="workshopForm.latitude" type="number"
                                           step="0.000001" placeholder="-17.783721" class="w-full" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-medium">Longitud *</label>
                                    <input pInputText [(ngModel)]="workshopForm.longitude" type="number"
                                           step="0.000001" placeholder="-63.182141" class="w-full" />
                                </div>
                            </div>
                            <p-button label="Usar mi ubicación actual" icon="pi pi-map-marker"
                                      severity="secondary" size="small" (onClick)="useCurrentLocation()" />
                        </div>
                    }

                    <!-- PASO 3: Horarios -->
                    @if (step === 3) {
                        <h2 class="text-lg font-semibold mb-6 text-surface-900 dark:text-surface-0">Horarios de atención</h2>
                        <div class="flex flex-col gap-3">
                            @for (day of days; track day.dia) {
                                <div class="flex items-center gap-4 p-3 rounded-lg border"
                                     [class]="day.activo ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800' : 'border-surface-200 dark:border-surface-700'">
                                    <p-checkbox [(ngModel)]="day.activo" [binary]="true" />
                                    <span class="text-sm font-medium w-24">{{ day.label }}</span>
                                    @if (day.activo) {
                                        <div class="flex items-center gap-2 flex-1">
                                            <input pInputText [(ngModel)]="day.start_time" type="time"
                                                   class="flex-1" style="min-width: 0" />
                                            <span class="text-surface-400 text-sm">–</span>
                                            <input pInputText [(ngModel)]="day.end_time" type="time"
                                                   class="flex-1" style="min-width: 0" />
                                        </div>
                                    } @else {
                                        <span class="text-sm text-surface-400">Cerrado</span>
                                    }
                                </div>
                            }
                        </div>
                    }

                    <!-- PASO 4: Especialidades -->
                    @if (step === 4) {
                        <h2 class="text-lg font-semibold mb-6 text-surface-900 dark:text-surface-0">Especialidades</h2>
                        <div class="flex flex-col gap-4">
                            <p class="text-sm text-surface-500">Selecciona los tipos de servicio que ofrece tu taller.</p>
                            @if (specialtiesLoading) {
                                <div class="text-center py-4 text-surface-400">
                                    <i class="pi pi-spin pi-spinner mr-2"></i>Cargando especialidades...
                                </div>
                            } @else {
                                <p-multiSelect
                                    [options]="specialties"
                                    [(ngModel)]="selectedSpecialties"
                                    optionLabel="name"
                                    placeholder="Selecciona especialidades"
                                    [filter]="true"
                                    filterPlaceholder="Buscar..."
                                    styleClass="w-full"
                                    display="chip" />
                            }
                        </div>
                    }

                    <!-- Botones de navegación -->
                    <div class="flex justify-between mt-8">
                        <p-button label="Anterior" icon="pi pi-arrow-left"
                                  severity="secondary"
                                  [disabled]="step === 1"
                                  (onClick)="prevStep()" />
                        @if (step < 4) {
                            <p-button label="Siguiente" icon="pi pi-arrow-right" iconPos="right"
                                      severity="warn"
                                      [loading]="saving"
                                      (onClick)="nextStep()" />
                        } @else {
                            <p-button label="Finalizar configuración" icon="pi pi-check" iconPos="right"
                                      severity="warn"
                                      [loading]="saving"
                                      (onClick)="finish()" />
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class WorkshopSetupComponent implements OnInit {
    private workshopService = inject(WorkshopService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    step = 1;
    saving = false;
    specialtiesLoading = false;
    workshopId: number | null = null;

    workshopForm: Partial<Workshop> = {
        name: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        has_tow: false,
        is_24_hours: false,
        latitude: undefined,
        longitude: undefined,
    };

    days: DaySchedule[] = [
        { dia: 'LUNES',     label: 'Lunes',     activo: false, start_time: '08:00', end_time: '18:00' },
        { dia: 'MARTES',    label: 'Martes',    activo: false, start_time: '08:00', end_time: '18:00' },
        { dia: 'MIERCOLES', label: 'Miércoles', activo: false, start_time: '08:00', end_time: '18:00' },
        { dia: 'JUEVES',    label: 'Jueves',    activo: false, start_time: '08:00', end_time: '18:00' },
        { dia: 'VIERNES',   label: 'Viernes',   activo: false, start_time: '08:00', end_time: '18:00' },
        { dia: 'SABADO',    label: 'Sábado',    activo: false, start_time: '08:00', end_time: '13:00' },
        { dia: 'DOMINGO',   label: 'Domingo',   activo: false, start_time: '08:00', end_time: '13:00' },
    ];

    specialties: Specialty[] = [];
    selectedSpecialties: Specialty[] = [];

    ngOnInit(): void {}

    nextStep(): void {
        if (this.step === 1) {
            if (!this.workshopForm.name) {
                this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'Ingresa el nombre del taller.' });
                return;
            }
            this.saving = true;
            this.workshopService.create(this.workshopForm).subscribe({
                next: ws => {
                    this.workshopId = ws.id;
                    this.saving = false;
                    this.step = 2;
                },
                error: () => { this.saving = false; }
            });
        } else if (this.step === 2) {
            if (!this.workshopForm.latitude || !this.workshopForm.longitude) {
                this.messageService.add({ severity: 'warn', summary: 'Ubicación requerida', detail: 'Ingresa latitud y longitud.' });
                return;
            }
            this.saving = true;
            this.workshopService.update(this.workshopId!, {
                latitude: Number(this.workshopForm.latitude),
                longitude: Number(this.workshopForm.longitude)
            }).subscribe({
                next: () => {
                    this.saving = false;
                    this.step = 3;
                },
                error: () => { this.saving = false; }
            });
        } else if (this.step === 3) {
            this.saveSchedules();
        }
    }

    prevStep(): void {
        if (this.step > 1) this.step--;
    }

    private saveSchedules(): void {
        const active = this.days.filter(d => d.activo);
        if (active.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Horarios', detail: 'Selecciona al menos un día de atención.' });
            return;
        }
        this.saving = true;
        const requests = active.map(d =>
            this.workshopService.createSchedule({
                workshop_id: this.workshopId!,
                weekday: d.dia as WorkshopSchedule['weekday'],
                start_time: d.start_time,
                end_time: d.end_time
            })
        );

        let completed = 0;
        requests.forEach(req => {
            req.subscribe({
                next: () => {
                    completed++;
                    if (completed === requests.length) {
                        this.saving = false;
                        this.loadSpecialties();
                        this.step = 4;
                    }
                },
                error: () => {
                    this.saving = false;
                }
            });
        });
    }

    private loadSpecialties(): void {
        this.specialtiesLoading = true;
        this.workshopService.getAllSpecialties().subscribe({
            next: data => {
                this.specialties = data;
                this.specialtiesLoading = false;
            },
            error: () => { this.specialtiesLoading = false; }
        });
    }

    finish(): void {
        if (this.selectedSpecialties.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Especialidades', detail: 'Selecciona al menos una especialidad.' });
            return;
        }
        this.saving = true;
        const requests = this.selectedSpecialties.map(s =>
            this.workshopService.addSpecialty({ workshop_id: this.workshopId!, specialty_id: s.id })
        );

        let completed = 0;
        requests.forEach(req => {
            req.subscribe({
                next: () => {
                    completed++;
                    if (completed === requests.length) {
                        this.saving = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: '¡Listo!',
                            detail: 'Tu taller ha sido configurado correctamente.',
                            life: 2000
                        });
                        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
                    }
                },
                error: () => { this.saving = false; }
            });
        });
    }

    useCurrentLocation(): void {
        if (!navigator.geolocation) {
            this.messageService.add({ severity: 'warn', summary: 'Geolocalización', detail: 'Tu navegador no soporta geolocalización.' });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos => {
                this.workshopForm.latitude = pos.coords.latitude;
                this.workshopForm.longitude = pos.coords.longitude;
                this.messageService.add({ severity: 'success', summary: 'Ubicación obtenida', detail: 'Coordenadas cargadas correctamente.' });
            },
            () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la ubicación. Ingresa las coordenadas manualmente.' });
            }
        );
    }
}

