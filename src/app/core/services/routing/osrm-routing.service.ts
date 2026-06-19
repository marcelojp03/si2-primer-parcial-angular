/**
 * Provider de routing usando OSRM público o self-hosted.
 *
 * ⚠ LÍMITES DEL SERVIDOR PÚBLICO (router.project-osrm.org):
 *   - No comercial, demo only
 *   - Máximo ~1 request/segundo
 *   - Sin garantía de uptime ni latencia
 *
 * Para producción se recomienda:
 *   1. Montar OSRM propio con Docker + extracto OSM de Bolivia
 *   2. O usar proveedor comercial (Google Routes, Mapbox, GraphHopper, HERE)
 *   3. O al menos enrutar a través del backend FastAPI como proxy
 *
 * La URL base se configura desde environment.api.osrmBaseUrl.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout, catchError, of } from 'rxjs';
import { RoutingService } from './routing.service';
import { RouteResult } from '../../models/route-result.model';
import { environment } from '../../../../environments/environment';

@Injectable()
export class OsrmRoutingService extends RoutingService {
  private http = inject(HttpClient);
  private baseUrl = environment.api?.osrmBaseUrl || 'https://router.project-osrm.org';
  private requestTimeout = environment.api?.routingTimeoutMs ?? 5000;

  override getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Observable<RouteResult | null> {
    const url =
      `${this.baseUrl}/route/v1/driving/` +
      `${origin[1]},${origin[0]};${destination[1]},${destination[0]}` +
      `?overview=full&geometries=geojson&steps=false`;

    return this.http.get<any>(url).pipe(
      timeout({ each: this.requestTimeout }),
      map(data => {
        if (data.code !== 'Ok') return null;
        const route = data.routes[0];
        const coords = route.geometry.coordinates as number[][];
        const points: [number, number][] = coords.map(
          (c: number[]) => [c[1], c[0]]
        );
        const distM = route.distance;
        const durS = route.duration;
        return {
          points,
          distanceKm: distM / 1000,
          durationMinutes: Math.round(durS / 60),
          eta: new Date(Date.now() + durS * 1000),
          provider: 'osrm',
        };
      }),
      catchError(() => of(null)),
    );
  }
}
