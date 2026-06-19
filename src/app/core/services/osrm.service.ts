import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface OsrmRoute {
  points: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  eta: Date;
}

@Injectable({ providedIn: 'root' })
export class OsrmService {
  private readonly baseUrl = 'https://router.project-osrm.org';

  constructor(private http: HttpClient) {}

  getRoute(from: [number, number], to: [number, number]): Observable<OsrmRoute | null> {
    // OSRM: longitud,latitud first
    const url =
      `${this.baseUrl}/route/v1/driving/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}` +
      `?overview=full&geometries=geojson&steps=false`;

    return this.http.get<any>(url).pipe(
      map(data => {
        if (data.code !== 'Ok') return null;
        const route = data.routes[0];
        const coords = route.geometry.coordinates as number[][];
        const points: [number, number][] = coords.map((c: number[]) => [c[1], c[0]]);
        const distM = route.distance;
        const durS = route.duration;
        return {
          points,
          distanceKm: distM / 1000,
          durationMinutes: Math.round(durS / 60),
          eta: new Date(Date.now() + durS * 1000),
        };
      })
    );
  }
}
