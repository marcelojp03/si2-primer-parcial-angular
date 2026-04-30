import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { Empresa } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaInternaService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.baseUrl;

    listar(): Observable<ApiResponse<Empresa[]>> {
        return this.http.get<ApiResponse<Empresa[]>>(`${this.apiUrl}/interno/empresas`);
    }

    obtener(id: number): Observable<ApiResponse<Empresa>> {
        return this.http.get<ApiResponse<Empresa>>(`${this.apiUrl}/interno/empresas/${id}`);
    }
}

