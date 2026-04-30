import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { Ticket, TicketResumen, EstadoTicket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketEventoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(eventoId: number, empresaId: number, filtros?: { sectorId?: number; estado?: EstadoTicket }): Observable<ApiResponse<Ticket[]>> {
        let params = new HttpParams().set('empresaId', empresaId);
        if (filtros?.sectorId) params = params.set('sectorId', filtros.sectorId);
        if (filtros?.estado) params = params.set('estado', filtros.estado);
        return this.http.get<ApiResponse<Ticket[]>>(`${this.apiUrl}/eventos/${eventoId}/tickets`, { params });
    }

    resumen(eventoId: number, empresaId: number): Observable<ApiResponse<TicketResumen>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<TicketResumen>>(`${this.apiUrl}/eventos/${eventoId}/tickets/resumen`, { params });
    }
}

