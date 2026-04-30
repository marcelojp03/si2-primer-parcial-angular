import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { UsuarioEmpresa, CrearUsuarioEmpresaRequest, EditarUsuarioEmpresaRequest } from '../models/usuario-empresa.model';

@Injectable({ providedIn: 'root' })
export class UsuarioEmpresaService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(empresaId: number): Observable<ApiResponse<UsuarioEmpresa[]>> {
        const params = new HttpParams().set('empresaId', empresaId);
        return this.http.get<ApiResponse<UsuarioEmpresa[]>>(`${this.apiUrl}/mi-empresa/usuarios`, { params });
    }

    obtener(id: number): Observable<ApiResponse<UsuarioEmpresa>> {
        return this.http.get<ApiResponse<UsuarioEmpresa>>(`${this.apiUrl}/usuarios-empresa/${id}`);
    }

    crear(request: CrearUsuarioEmpresaRequest): Observable<ApiResponse<UsuarioEmpresa>> {
        return this.http.post<ApiResponse<UsuarioEmpresa>>(`${this.apiUrl}/usuarios-empresa`, request);
    }

    actualizar(id: number, request: EditarUsuarioEmpresaRequest): Observable<ApiResponse<UsuarioEmpresa>> {
        return this.http.patch<ApiResponse<UsuarioEmpresa>>(`${this.apiUrl}/usuarios-empresa/${id}`, request);
    }

    desactivar(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/usuarios-empresa/${id}`);
    }
}

