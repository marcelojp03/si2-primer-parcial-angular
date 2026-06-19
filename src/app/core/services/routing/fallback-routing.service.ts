/**
 * Servicio de routing con fallback entre providers + caché por ruta + throttle.
 *
 * Orden de providers: OSRM → ORS (si tiene API key).
 * Si todos fallan devuelve un RouteResult con errorMessage = "ETA no disponible".
 *
 * Throttle: no recalcula si:
 *   - Pasaron menos de routingMinIntervalMs desde la última llamada para la misma ruta
 *   - Y el origen/destino no se movieron más de routingMinDistanceM metros
 *
 * La caché es PER RUTA (key = "lat,lng-lat,lng"), no global.
 * Si se pide una ruta diferente, se calcula sin esperar el throttle.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, from, of, lastValueFrom } from 'rxjs';
import { RoutingService } from './routing.service';
import { OsrmRoutingService } from './osrm-routing.service';
import { OrsRoutingService } from './ors-routing.service';
import { RouteResult } from '../../models/route-result.model';
import { environment } from '../../../../environments/environment';

interface CacheEntry {
  result: RouteResult;
  timestamp: number;
  originKey: string;
  destKey: string;
}

@Injectable({ providedIn: 'root' })
export class FallbackRoutingService extends RoutingService {
  private osrm = inject(OsrmRoutingService);
  private ors = inject(OrsRoutingService);

  private minIntervalMs = environment.api?.routingMinIntervalMs ?? 30000;
  private minDistanceM = environment.api?.routingMinDistanceM ?? 50;

  private cache = new Map<string, CacheEntry>();

  override getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Observable<RouteResult | null> {
    const key = this.routeKey(origin, destination);
    const cached = this.cache.get(key);

    if (cached && this.shouldSkip(cached, origin, destination)) {
      return of(cached.result);
    }

    return from(this.fetchRoute(key, origin, destination));
  }

  private async fetchRoute(
    key: string,
    origin: [number, number],
    destination: [number, number]
  ): Promise<RouteResult | null> {
    const providers: RoutingService[] = [this.osrm, this.ors];

    for (const provider of providers) {
      try {
        const result = await lastValueFrom(
          provider.getRoute(origin, destination)
        );
        if (result) {
          const entry: CacheEntry = {
            result,
            timestamp: Date.now(),
            originKey: this.coordKey(origin),
            destKey: this.coordKey(destination),
          };
          this.cache.set(key, entry);
          return result;
        }
      } catch {
        continue;
      }
    }

    const errorResult: RouteResult = {
      points: [],
      distanceKm: 0,
      durationMinutes: 0,
      eta: new Date(),
      provider: 'fallback',
      errorMessage: 'ETA no disponible',
    };
    const entry: CacheEntry = {
      result: errorResult,
      timestamp: Date.now(),
      originKey: this.coordKey(origin),
      destKey: this.coordKey(destination),
    };
    this.cache.set(key, entry);
    return errorResult;
  }

  private shouldSkip(
    entry: CacheEntry,
    origin: [number, number],
    destination: [number, number]
  ): boolean {
    if (entry.result.errorMessage) return false;
    if (Date.now() - entry.timestamp >= this.minIntervalMs) return false;

    const dOrigin = this.haversine(
      this.parseCoord(entry.originKey),
      origin
    );
    const dDest = this.haversine(
      this.parseCoord(entry.destKey),
      destination
    );
    if (dOrigin >= this.minDistanceM || dDest >= this.minDistanceM) return false;

    return true;
  }

  private routeKey(origin: [number, number], destination: [number, number]): string {
    return `${this.coordKey(origin)}-${this.coordKey(destination)}`;
  }

  private coordKey(c: [number, number]): string {
    return `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
  }

  private parseCoord(key: string): [number, number] {
    const [lat, lng] = key.split(',').map(Number);
    return [lat, lng];
  }

  private haversine(a: [number, number], b: [number, number]): number {
    const R = 6371000;
    const dLat = this.toRad(b[0] - a[0]);
    const dLon = this.toRad(b[1] - a[1]);
    const lat1 = this.toRad(a[0]);
    const lat2 = this.toRad(b[0]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
