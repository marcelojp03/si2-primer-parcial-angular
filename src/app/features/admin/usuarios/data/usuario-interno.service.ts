import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { UsuarioInterno, UsuarioDetalle, CrearUsuarioInternoRequest } from '../models/usuario-interno.model';

@Injectable({ providedIn: 'root' })
export class UsuarioInternoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(): Observable<ApiResponse<UsuarioInterno[]>> {
        return this.http.get<ApiResponse<UsuarioInterno[]>>(`${this.apiUrl}/interno/usuarios`);
    }

    obtener(id: number): Observable<ApiResponse<UsuarioDetalle>> {
        return this.http.get<ApiResponse<UsuarioDetalle>>(`${this.apiUrl}/interno/usuarios/${id}`);
    }

    crear(request: CrearUsuarioInternoRequest): Observable<ApiResponse<UsuarioInterno>> {
        return this.http.post<ApiResponse<UsuarioInterno>>(`${this.apiUrl}/interno/usuarios`, request);
    }
}

