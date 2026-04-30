import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { UsuarioEmpresaInterno, AsociarUsuarioEmpresaRequest } from '../models/usuario-empresa-interno.model';

@Injectable({ providedIn: 'root' })
export class UsuarioEmpresaInternoService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    asociar(request: AsociarUsuarioEmpresaRequest): Observable<ApiResponse<UsuarioEmpresaInterno>> {
        return this.http.post<ApiResponse<UsuarioEmpresaInterno>>(`${this.apiUrl}/interno/usuarios-empresa`, request);
    }

    actualizarRol(request: AsociarUsuarioEmpresaRequest): Observable<ApiResponse<UsuarioEmpresaInterno>> {
        return this.http.put<ApiResponse<UsuarioEmpresaInterno>>(`${this.apiUrl}/interno/usuarios-empresa`, request);
    }

    desasociar(body: { usuarioId: number; empresaId: number }): Observable<ApiResponse<UsuarioEmpresaInterno>> {
        return this.http.delete<ApiResponse<UsuarioEmpresaInterno>>(`${this.apiUrl}/interno/usuarios-empresa`, { body });
    }
}

