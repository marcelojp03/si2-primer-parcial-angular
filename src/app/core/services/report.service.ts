import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NlReportResult {
  query: string;
  sql: string;
  data: Record<string, unknown>[];
  rows_count: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.api.baseUrl;

  runNlQuery(query: string): Observable<NlReportResult> {
    return this.http.post<NlReportResult>(`${this.apiUrl}/reports/nl`, { query });
  }
}
