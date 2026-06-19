/**
 * Provider de routing usando OpenRouteService (ORS).
 *
 * Requiere API key configurada en environment.api.orsApiKey.
 *
 * ⚠ ORS_API_KEY VA EN EL FRONTEND sólo para desarrollo/demo.
 * En producción la API key debe ir del lado del servidor (FastAPI proxy).
 *
 * Plan gratuito ORS: ~2000 requests/día, 40/minuto.
 * Para uso intensivo se recomienda plan pago o migrar a OSRM propio.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, timeout, catchError, of } from 'rxjs';
import { RoutingService } from './routing.service';
import { RouteResult } from '../../models/route-result.model';
import { environment } from '../../../../environments/environment';

@Injectable()
export class OrsRoutingService extends RoutingService {
  private http = inject(HttpClient);
  private apiKey = environment.api?.orsApiKey || '';
  private baseUrl = environment.api?.orsBaseUrl || 'https://api.openrouteservice.org';
  private requestTimeout = environment.api?.routingTimeoutMs ?? 5000;

  override getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Observable<RouteResult | null> {
    if (!this.apiKey) return of(null);

    const url = `${this.baseUrl}/v2/directions/driving-car/geojson`;
    const headers = new HttpHeaders({
      Authorization: this.apiKey,
      'Content-Type': 'application/json',
    });
    const body = {
      coordinates: [
        [origin[1], origin[0]],
        [destination[1], destination[0]],
      ],
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout({ each: this.requestTimeout }),
      map(data => {
        const features = data?.features;
        if (!features?.length) return null;
        const feature = features[0];
        const geometry = feature.geometry;
        const summary = feature.properties?.summary;
        if (!geometry?.coordinates || !summary) return null;
        const coords = geometry.coordinates as number[][];
        const points: [number, number][] = coords.map(
          (c: number[]) => [c[1], c[0]]
        );
        const distM = summary.distance;
        const durS = summary.duration;
        return {
          points,
          distanceKm: distM / 1000,
          durationMinutes: Math.round(durS / 60),
          eta: new Date(Date.now() + durS * 1000),
          provider: 'ors',
        };
      }),
      catchError(() => of(null)),
    );
  }
}
