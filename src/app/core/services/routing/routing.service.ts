import { Observable } from 'rxjs';
import { RouteResult } from '../../models/route-result.model';

export abstract class RoutingService {
  abstract getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Observable<RouteResult | null>;
}
