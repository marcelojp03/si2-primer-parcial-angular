import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { TransaccionPago } from '../models/transaccion-pago.model';

@Injectable({ providedIn: 'root' })
export class TransaccionPagoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(): Observable<ApiResponse<TransaccionPago[]>> {
        return this.http.get<ApiResponse<TransaccionPago[]>>(`${this.apiUrl}/interno/transacciones-pago`);
    }

    obtener(id: number): Observable<ApiResponse<TransaccionPago>> {
        return this.http.get<ApiResponse<TransaccionPago>>(`${this.apiUrl}/interno/transacciones-pago/${id}`);
    }

    reenviarBoletos(id: number): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/interno/pagos/reenviar-boletos/${id}`, {});
    }
}

