import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CarritoService } from '../services/carrito.service';
import { QrService } from '../services/qr.service';
import { CarritoItem, DatosComprador } from '../models/carrito.model';

@Component({
    selector: 'app-tienda-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, DividerModule, ToastModule, DialogModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />

        <!-- ─── QR Modal ─── -->
        <p-dialog
            [(visible)]="qrDialogVisible"
            [modal]="true"
            [closable]="!loadingQr && !idQr"
            [style]="{ width: '32rem' }"
            [header]="pagado ? '¡Pago Confirmado!' : ''"
            appendTo="body"
        >
            <div class="text-center py-2">

                <!-- Logo + Bank -->
                <img src="/logovpay.png" alt="VPay" class="h-10 mx-auto object-contain dark:brightness-0 dark:invert mb-2" />
                <p class="font-bold text-sm tracking-wide text-surface-700 dark:text-surface-200 mb-4">
                    BANCO MERCANTIL SANTA CRUZ
                </p>

                <!-- QR Image area -->
                <div class="inline-flex items-center justify-center bg-white border-2 border-surface-300 rounded-xl p-3 mb-3 shadow-sm">
                    @if (pagado) {
                        <div class="w-44 h-44 flex flex-col items-center justify-center">
                            <i class="pi pi-check-circle text-6xl text-green-500 mb-2"></i>
                            <span class="text-green-600 font-bold text-sm">¡Pago confirmado!</span>
                        </div>
                    } @else if (loadingQr) {
                        <div class="w-44 h-44 flex flex-col items-center justify-center gap-3">
                            <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                            <span class="text-sm text-surface-400">Generando QR…</span>
                        </div>
                    } @else if (qrBase64) {
                        <img [src]="'data:image/png;base64,' + qrBase64" alt="QR de pago" class="w-full" />
                    } @else {
                        <div class="w-44 h-44 flex items-center justify-center bg-surface-100 rounded">
                            <i class="pi pi-qrcode text-6xl text-surface-300"></i>
                        </div>
                    }
                </div>

                <!-- Status indicator -->
                @if (idQr && !pagado) {
                    <p class="text-xs text-surface-400 mb-1">
                        <i class="pi pi-spin pi-spinner mr-1"></i> Verificando pago…
                    </p>
                }

                <!-- Amount -->
                <p class="text-xs text-surface-400 mb-1">
                    {{ monto.toFixed(2) }} BOB &nbsp;·&nbsp; VCTO. {{ fechaVcto }}
                </p>

                @if (!pagado) {
                    <p-divider />
                    <p class="text-surface-500 dark:text-surface-400 text-sm mt-1 mb-1">Monto a pagar</p>
                    <p class="text-primary font-bold text-4xl mb-3">Bs.{{ monto.toFixed(2) }}</p>
                    <p class="text-surface-400 text-xs leading-relaxed mb-4">
                        Escanea el código QR con tu aplicación bancaria para completar la compra.
                    </p>
                }

                @if (pagado) {
                    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4 mt-2 text-sm">
                        <p class="text-green-700 dark:text-green-300 leading-relaxed">
                            Tus entradas han sido enviadas al correo
                            <strong>{{ datos.correo }}</strong>.
                            Revisa tu bandeja de entrada.
                        </p>
                    </div>
                }

                <!-- Buttons -->
                @if (pagado) {
                    <p-button
                        label="Volver a eventos"
                        styleClass="w-full"
                        severity="success"
                        routerLink="/tienda"
                        (onClick)="cerrarModal()"
                    />
                } @else if (!loadingQr) {
                    <p-button
                        label="Cancelar"
                        styleClass="w-full"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="cerrarModal()"
                    />
                }
            </div>
        </p-dialog>

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-surface-400 mb-8">
            <a routerLink="/tienda" class="hover:text-primary cursor-pointer transition-colors">Eventos</a>
            <i class="pi pi-angle-right text-xs"></i>
            <span class="text-surface-600 dark:text-surface-300">Checkout</span>
        </nav>

        <div class="grid grid-cols-12 gap-8 items-start">

            <!-- ─── Left: Billing Form ─── -->
            <div class="col-span-12 lg:col-span-7">
                <h2 class="text-lg font-bold uppercase tracking-widest text-surface-800 dark:text-surface-100 mb-6 pb-2 border-b border-surface-200 dark:border-surface-700">
                    Detalles de Facturación
                </h2>

                <div class="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Nombre <span class="text-red-500">*</span>
                        </label>
                        <input pInputText [(ngModel)]="datos.nombre" class="w-full" placeholder="Juan" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Apellidos <span class="text-red-500">*</span>
                        </label>
                        <input pInputText [(ngModel)]="datos.apellidos" class="w-full" placeholder="García" />
                    </div>
                </div>

                <div class="mb-5">
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Dirección de correo electrónico <span class="text-red-500">*</span>
                    </label>
                    <input pInputText type="email" [(ngModel)]="datos.correo" class="w-full" placeholder="correo@ejemplo.com" />
                </div>

                <div class="mb-5">
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Teléfono o Móvil <span class="text-red-500">*</span>
                    </label>
                    <input pInputText type="tel" [(ngModel)]="datos.telefono" class="w-full" placeholder="70000000" />
                </div>

                <div class="mb-5">
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Ciudad / Zona / Barrio (opcional)
                    </label>
                    <input pInputText [(ngModel)]="datos.ciudad" class="w-full" placeholder="Cochabamba" />
                </div>

                <div class="mb-5">
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Nombre y Apellidos o Razón Social <span class="text-red-500">*</span>
                    </label>
                    <input pInputText [(ngModel)]="datos.nombreFactura" class="w-full" placeholder="Juan García" />
                </div>

                <div class="mb-8">
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Numero de Carnet / Numero de NIT <span class="text-red-500">*</span>
                    </label>
                    <input pInputText [(ngModel)]="datos.numeroDocumento" class="w-full" placeholder="12345678" />
                </div>

                <h2 class="text-lg font-bold uppercase tracking-widest text-surface-800 dark:text-surface-100 mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">
                    Información Adicional
                </h2>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Notas del pedido (opcional)
                    </label>
                    <textarea
                        [(ngModel)]="datos.notas"
                        rows="4"
                        class="w-full rounded-md border border-surface-300 dark:border-surface-600 bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-200 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                        placeholder="Nota Adicional"
                    ></textarea>
                </div>
            </div>

            <!-- ─── Right: Order Summary ─── -->
            <div class="col-span-12 lg:col-span-5">
                <div class="bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 sticky top-24">

                    <h2 class="text-lg font-bold uppercase tracking-widest text-center text-surface-800 dark:text-surface-100 p-5 border-b border-surface-200 dark:border-surface-700">
                        Tu Pedido
                    </h2>

                    <!-- Items -->
                    <div class="px-5">
                        <div class="grid grid-cols-2 py-2 text-xs font-bold uppercase text-surface-500 border-b border-surface-200 dark:border-surface-600">
                            <span>Producto</span>
                            <span class="text-right">Subtotal</span>
                        </div>

                        @for (item of items; track item.sectorId) {
                            <div class="grid grid-cols-2 py-3 border-b border-surface-200 dark:border-surface-600">
                                <div>
                                    <p class="text-sm font-medium text-surface-800 dark:text-surface-100 leading-tight">
                                        {{ item.eventoNombre }} - {{ item.sectorNombre }}
                                    </p>
                                    <div class="flex items-center gap-1 mt-2">
                                        <button
                                            class="w-5 h-5 rounded border border-surface-300 dark:border-surface-600 text-xs cursor-pointer bg-transparent hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 leading-none flex items-center justify-center"
                                            (click)="updateCantidad(item, item.cantidad - 1)"
                                        >−</button>
                                        <span class="text-sm text-surface-700 dark:text-surface-200 w-5 text-center">{{ item.cantidad }}</span>
                                        <button
                                            class="w-5 h-5 rounded border border-surface-300 dark:border-surface-600 text-xs cursor-pointer bg-transparent hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 leading-none flex items-center justify-center"
                                            (click)="updateCantidad(item, item.cantidad + 1)"
                                        >+</button>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-semibold text-primary">
                                        Bs.{{ (item.precioBase * item.cantidad).toFixed(2) }}
                                    </p>
                                </div>
                            </div>
                        }

                        <!-- Subtotal / Total -->
                        <div class="flex justify-between py-3 border-b border-surface-200 dark:border-surface-600">
                            <span class="font-medium text-surface-700 dark:text-surface-300">Subtotal</span>
                            <span class="font-bold text-primary">Bs.{{ subtotal.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between py-3">
                            <span class="font-bold text-surface-800 dark:text-surface-100 text-base">Total</span>
                            <span class="font-bold text-primary text-base">Bs.{{ subtotal.toFixed(2) }}</span>
                        </div>
                    </div>

                    <!-- Payment method -->
                    <div class="mx-5 mb-4 bg-surface-100 dark:bg-surface-700 rounded-lg p-4 text-sm text-surface-600 dark:text-surface-300">
                        <p class="font-semibold text-surface-800 dark:text-surface-100 mb-2">Método de pago mediante QR</p>
                        <p class="leading-relaxed mb-3">
                            Método de Pago mediante QR, cuando se realice el pago, su banco nos confirmará el pago.<br/>
                            <strong class="text-surface-700 dark:text-surface-200">+(591) 70864545</strong> ATENCIÓN AL CLIENTE.
                        </p>
                        <img src="/logovpay.png" alt="VPay" class="h-8 object-contain dark:brightness-0 dark:invert" />
                    </div>

                    <!-- Terms -->
                    <div class="text-xs text-surface-400 text-center px-5 pb-4">
                        <p class="font-semibold">TÉRMINOS Y CONDICIONES DE VENTA</p>
                        <p>*Aviso Legal y Política de Fuerza Mayor*</p>
                    </div>

                    <!-- Submit -->
                    <div class="px-5 pb-5">
                        <p-button
                            label="REALIZAR PEDIDO"
                            styleClass="w-full"
                            severity="danger"
                            size="large"
                            [loading]="loading"
                            (onClick)="realizarPedido()"
                        />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TiendaCheckoutComponent implements OnInit, OnDestroy {
    private carritoService = inject(CarritoService);
    private qrService = inject(QrService);
    private messageService = inject(MessageService);
    private router = inject(Router);
    private sub!: Subscription;
    private pollSub?: Subscription;

    items: CarritoItem[] = [];
    loading = false;

    // QR modal state
    qrDialogVisible = false;
    loadingQr = false;
    qrBase64 = '';
    idQr = '';
    pagado = false;
    monto = 0;
    fechaVcto = new Date().toISOString().slice(0, 10);

    datos: DatosComprador = {
        nombre: '',
        apellidos: '',
        correo: '',
        telefono: '',
        ciudad: '',
        nombreFactura: '',
        numeroDocumento: '',
        notas: '',
    };

    get subtotal(): number { return this.carritoService.total; }

    ngOnInit(): void {
        this.sub = this.carritoService.items$.subscribe(items => {
            this.items = items;
            if (items.length === 0 && !this.loading && !this.qrDialogVisible) {
                this.router.navigate(['/tienda']);
            }
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        this.pollSub?.unsubscribe();
    }

    updateCantidad(item: CarritoItem, cantidad: number): void {
        if (cantidad < 0) return;
        this.carritoService.actualizar(item.eventoId, item.sectorId, cantidad);
    }

    realizarPedido(): void {
        const { nombre, apellidos, correo, telefono, nombreFactura, numeroDocumento } = this.datos;
        if (!nombre || !apellidos || !correo || !telefono || !nombreFactura || !numeroDocumento) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Por favor completa todos los campos obligatorios',
                life: 3000,
            });
            return;
        }

        this.monto = this.subtotal;
        this.qrBase64 = '';
        this.idQr = '';
        this.pagado = false;
        this.loadingQr = true;
        this.qrDialogVisible = true;

        this.qrService.generarQr(this.monto, this.datos, [...this.items]).subscribe({
            next: (res) => {
                this.loadingQr = false;
                this.idQr = res.idQr;
                this.qrBase64 = res.qrBase64;
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

    cerrarModal(): void {
        this.pollSub?.unsubscribe();
        this.qrDialogVisible = false;
        if (this.pagado) {
            this.carritoService.limpiar();
            this.router.navigate(['/tienda']);
        }
    }

    private iniciarPolling(): void {
        this.pollSub?.unsubscribe();
        this.pollSub = interval(10000)
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

