import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CarritoItem, DatosComprador } from '../models/carrito.model';
import {
    QrGenerateRequest,
    QrGenerateResponse,
    QrDetailItem,
    QrStatusResponse,
} from '../models/qr.model';

const QR_BASE_URL = '/qr-proxy';
const QR_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTRUNVUklUWSIsImlzcyI6IlZFQ09NIiwiY29tcGFueSI6IjI2NiIsImxvZ2luIjoibnV0cmlzZXIifQ.tNBl8PIf4AmK0eqSHj6U9-MOlcrCfpxHYqOPUrvciGU';
const QR_HEADERS = new HttpHeaders({ Authorization: QR_TOKEN });

/** true = formato nuevo (claves separadas); false = formato antiguo (evento*sector) */
const QR_FORMATO_NUEVO = false;

@Injectable({ providedIn: 'root' })
export class QrService {
    private http = inject(HttpClient);

    /**
     * Genera un QR de pago y devuelve { idQr, qrBase64 }
     */
    generarQr(
        monto: number,
        datos: DatosComprador,
        items: CarritoItem[],
    ): Observable<{ idQr: string; qrBase64: string }> {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const body: QrGenerateRequest = {
            operation: 'VTO041',
            header: [
                { attribute: 'currency', value: 'BOB' },
                { attribute: 'gloss', value: 'COBRO SERVICIO TICKETERA' },
                { attribute: 'amount', value: String(monto) },
                { attribute: 'singleUse', value: 'true' },
                { attribute: 'expirationDate', value: today },
                { attribute: 'additionalData', value: 'Datos Adicionales para identificar el QR' },
                { attribute: 'destinationAccountId', value: 'MASTERPASS' },
                { attribute: 'bank', value: 'MERCANTIL' },
                { attribute: 'user', value: 'masterpass.vpay' },
                { attribute: 'company', value: 192 },
            ],
            detail: [{
                items: QR_FORMATO_NUEVO
                    ? this.buildDetailItemsNuevo(datos, items)
                    : this.buildDetailItemsAntiguo(datos, items)
            }],
        };

        return this.http.put<QrGenerateResponse>(`${QR_BASE_URL}/transactions/doPayment`, body, { headers: QR_HEADERS }).pipe(
            map((res) => {
                const responses = res.responseList?.[0]?.response ?? [];
                const idQr = responses.find(r => r.code === 'idQr')?.identificator ?? '';
                const qrBase64 = responses.find(r => r.code === 'QR')?.identificator ?? '';
                console.info('[QrService] idQr obtenido:', idQr);
                return { idQr, qrBase64 };
            }),
        );
    }

    /**
     * Consulta el estado de un QR por su idQr.
     * Devuelve 'PEN' (pendiente), 'PAG' (pagado), u otro estado.
     */
    consultarEstado(idQr: string): Observable<string> {
        return this.http
            .post<QrStatusResponse>(`${QR_BASE_URL}/operations/statusQr`, { operation: idQr }, { headers: QR_HEADERS })
            .pipe(
                map((res) => {
                    const responses = res.responseList?.[0]?.response ?? [];
                    return responses.find(r => r.code === 'statusQr')?.identificator ?? 'PEN';
                }),
            );
    }

    // ─── Private ───

    /** Formato NUEVO: claves separadas por campo */
    private buildDetailItemsNuevo(datos: DatosComprador, items: CarritoItem[]): QrDetailItem[] {
        const detail: QrDetailItem[] = [
            { attribute: 'cliente_nombre', value: datos.nombre },
            { attribute: 'cliente_apellido', value: datos.apellidos },
            { attribute: 'cliente_email', value: datos.correo },
            { attribute: 'cliente_telefono', value: datos.telefono },
            { attribute: 'cliente_direccion', value: datos.ciudad },
            { attribute: 'cliente_ciudad', value: datos.ciudad },
            { attribute: 'factura_nombre_razon_social', value: datos.nombreFactura },
            { attribute: 'factura_nit_ci', value: datos.numeroDocumento },
        ];

        items.forEach((item, idx) => {
            const n = idx + 1;
            detail.push(
                { attribute: `linea_${n}_evento_nombre`, value: item.eventoNombre },
                { attribute: `linea_${n}_sector_nombre`, value: item.sectorNombre },
                { attribute: `linea_${n}_cantidad`, value: String(item.cantidad) },
                { attribute: `linea_${n}_butaca_codigo`, value: '' },
            );
        });

        return detail;
    }

    /** Formato ANTIGUO: evento*sector en identificador_item, datos de cliente con claves legacy */
    private buildDetailItemsAntiguo(datos: DatosComprador, items: CarritoItem[]): QrDetailItem[] {
        const detail: QrDetailItem[] = [];

        items.forEach((item) => {
            detail.push({
                attribute: `${item.eventoNombre}*${item.sectorNombre}`,
                value: String(item.cantidad),
            });
        });

        const nombreCompleto = `${datos.nombre} ${datos.apellidos}`.trim();
        detail.push(
            { attribute: 'nameCustomer',    value: nombreCompleto },
            { attribute: 'phoneCustomer',   value: datos.telefono },
            { attribute: 'emailCustomer',   value: datos.correo },
            { attribute: 'addressCustomer', value: datos.ciudad },
            { attribute: 'cityCustomer',    value: datos.ciudad },
        );

        return detail;
    }
}

