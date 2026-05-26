import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant, TenantCreate, TenantUpdate } from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);
  private apiUrl = environment.api.baseUrl;

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.apiUrl}/tenants`);
  }

  getById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/tenants/${id}`);
  }

  create(data: TenantCreate): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/tenants`, data);
  }

  update(id: number, data: TenantUpdate): Observable<Tenant> {
    return this.http.patch<Tenant>(`${this.apiUrl}/tenants/${id}`, data);
  }
}
