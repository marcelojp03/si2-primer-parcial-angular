import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { CarritoService } from '../services/carrito.service';
import { QrService } from '../services/qr.service';
import { CarritoItem, DatosComprador } from '../models/carrito.model';

@Component({
    selector: 'app-tienda-confirmacion',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, DividerModule, ToastModule, ProgressSpinnerModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />

        <div class="max-w-sm mx-auto text-center py-4">

            <!-- VPay Logo -->
            <div class="mb-6">
                <img src="/logovpay.png" alt="VPay" class="h-12 mx-auto object-contain dark:brightness-0 dark:invert" />
            </div>

            <!-- Bank -->
            <p class="font-bold text-surface-800 dark:text-surface-100 mb-6 text-base tracking-wide">
                BANCO MERCANTIL SANTA CRUZ
            </p>

            <!-- QR Image / Placeholder -->
            <div class="inline-flex items-center justify-center bg-white border-2 border-surface-300 rounded-xl p-4 mb-4 shadow-sm">
                @if (pagado) {
                    <div class="w-48 h-48 flex flex-col items-center justify-center">
                        <i class="pi pi-check-circle text-7xl text-green-500 mb-2"></i>
                        <span class="text-green-600 font-bold text-sm">¡Pago confirmado!</span>
                    </div>
                } @else if (qrBase64) {
                    <img [src]="'data:image/png;base64,' + qrBase64" alt="QR de pago" class="w-48 h-48 object-contain" />
                } @else {
                    <div class="w-48 h-48 flex items-center justify-center bg-surface-100 rounded">
                        <i class="pi pi-qrcode text-7xl text-surface-300"></i>
                    </div>
                }
            </div>

            <!-- Amount info line -->
            <p class="text-xs text-surface-400 mb-2">
                {{ monto.toFixed(2) }} BOB &nbsp;·&nbsp; VCTO. {{ fechaVcto }}
            </p>

            @if (idQr && !pagado) {
                <p class="text-xs text-surface-400 mb-4">
                    <i class="pi pi-spin pi-spinner mr-1"></i> Verificando pago…
                </p>
            }

            @if (pagado) {
                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                    <p class="text-green-700 dark:text-green-300 font-semibold mb-1">
                        <i class="pi pi-check-circle mr-1"></i> Pago confirmado
                    </p>
                    <p class="text-green-600 dark:text-green-400 text-sm leading-relaxed">
                        Tus entradas han sido enviadas al correo <strong>{{ datosComprador?.correo }}</strong>.
                        Revisa tu bandeja de entrada.
                    </p>
                </div>
            } @else {
                <p-divider />

                <!-- Amount -->
                <p class="text-surface-500 dark:text-surface-400 text-sm mt-4 mb-1">Monto a pagar</p>
                <p class="text-primary font-bold mb-6" style="font-size: 2.5rem">
                    Bs.{{ monto.toFixed(2) }}
                </p>

                <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed mb-8">
                    Debe escanear el código QR con su aplicación de pago y podrá completar la compra.
                </p>
            }

            <!-- Generate QR button (only before generation) -->
            @if (!qrBase64 && !pagado) {
                <p-button
                    label="Generar QR De Pago"
                    styleClass="w-full mb-3"
                    [loading]="loadingQr"
                    (onClick)="generarQR()"
                    [style]="{ background: '#0d9488', border: 'none' }"
                />
            }

            <p-button
                [label]="pagado ? 'Volver a eventos' : 'Cancelar'"
                styleClass="w-full"
                [severity]="pagado ? 'success' : 'secondary'"
                [outlined]="!pagado"
                routerLink="/tienda"
                (onClick)="limpiarCarrito()"
            />
        </div>
    `
})
export class TiendaConfirmacionComponent implements OnInit, OnDestroy {
    private carritoService = inject(CarritoService);
    private qrService = inject(QrService);
    private messageService = inject(MessageService);

    monto = 0;
    loadingQr = false;
    qrBase64 = '';
    idQr = '';
    pagado = false;
    datosComprador: DatosComprador | null = null;
    items: CarritoItem[] = [];
    fechaVcto = new Date().toISOString().slice(0, 10);

    private pollSub?: Subscription;

    ngOnInit(): void {
        const state = history.state ?? {};
        this.monto = state.monto ?? this.carritoService.total;
        this.datosComprador = state.datos ?? null;
        this.items = state.items ?? [];
    }

    ngOnDestroy(): void {
        this.pollSub?.unsubscribe();
    }

    generarQR(): void {
        if (!this.datosComprador || this.items.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin datos',
                detail: 'No se encontraron datos del pedido. Vuelve al checkout.',
                life: 4000,
            });
            return;
        }

        this.loadingQr = true;

        this.qrService.generarQr(this.monto, this.datosComprador, this.items).subscribe({
            next: (res) => {
                this.loadingQr = false;
                this.idQr = res.idQr;
                this.qrBase64 = res.qrBase64;
                this.messageService.add({
                    severity: 'success',
                    summary: 'QR generado',
                    detail: 'Escanea el código QR con tu aplicación bancaria',
                    life: 4000,
                });
                this.iniciarPolling();
            },
            error: () => {
                this.loadingQr = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo generar el QR. Intenta nuevamente.',
                    life: 5000,
                });
            },
        });
    }

    limpiarCarrito(): void {
        this.carritoService.limpiar();
    }

    private iniciarPolling(): void {
        this.pollSub?.unsubscribe();
        this.pollSub = interval(5000)
            .pipe(
                switchMap(() => this.qrService.consultarEstado(this.idQr)),
                takeWhile((estado) => estado !== 'PAG', true),
            )
            .subscribe({
                next: (estado) => {
                    if (estado === 'PAG') {
                        this.pagado = true;
                        this.carritoService.limpiar();
                        this.messageService.add({
                            severity: 'success',
                            summary: '¡Pago exitoso!',
                            detail: 'Tus entradas han sido enviadas a tu correo electrónico.',
                            life: 8000,
                        });
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Error de verificación',
                        detail: 'No se pudo verificar el estado del pago. El QR sigue activo.',
                        life: 5000,
                    });
                },
            });
    }
}

