import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, Observable, timer, EMPTY } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, switchMap, tap, filter, share, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  WsMessage,
  WsEventType,
  AssignmentInvitedPayload,
  AssignmentAcceptedPayload,
  AssignmentRejectedPayload,
  IncidentStatusChangedPayload,
  LocationUpdatedPayload,
  NotificationPayload,
} from '../models/ws.model';

@Injectable({ providedIn: 'root' })
export class WsService implements OnDestroy {
  private authService = inject(AuthService);

  private socket$!: WebSocketSubject<WsMessage>;
  private messages$ = new Subject<WsMessage>();
  private destroy$ = new Subject<void>();
  private reconnectDelay = 1000;
  private readonly MAX_DELAY = 30000;
  private connected = false;

  /** Stream compartido de todos los mensajes WS */
  readonly events$ = this.messages$.asObservable().pipe(share());

  connect(): void {
    const token = this.authService.getAccessToken();
    if (!token || this.connected) return;

    const url = `${environment.api.wsUrl}?token=${token}`;
    this.socket$ = webSocket<WsMessage>({
      url,
      openObserver: {
        next: () => {
          this.connected = true;
          this.reconnectDelay = 1000;
        },
      },
      closeObserver: {
        next: () => {
          this.connected = false;
          this._scheduleReconnect();
        },
      },
    });

    this.socket$
      .pipe(
        takeUntil(this.destroy$),
        tap((msg) => {
          if (msg.type === 'ping') {
            this.send({ type: 'pong', version: 1, payload: {}, ts: new Date().toISOString() });
          } else {
            this.messages$.next(msg);
          }
        }),
        catchError(() => {
          this.connected = false;
          this._scheduleReconnect();
          return EMPTY;
        })
      )
      .subscribe();
  }

  disconnect(): void {
    this.socket$?.complete();
    this.connected = false;
  }

  send(msg: Partial<WsMessage>): void {
    this.socket$?.next(msg as WsMessage);
  }

  /** Filtra eventos por tipo */
  on<T = unknown>(type: WsEventType): Observable<WsMessage<T>> {
    return this.events$.pipe(
      filter((m): m is WsMessage<T> => m.type === type)
    );
  }

  /** Atajos tipados por evento */
  get invitations$(): Observable<WsMessage<AssignmentInvitedPayload>> {
    return this.on<AssignmentInvitedPayload>('assignment.invited');
  }

  get assignmentAccepted$(): Observable<WsMessage<AssignmentAcceptedPayload>> {
    return this.on<AssignmentAcceptedPayload>('assignment.accepted');
  }

  get assignmentRejected$(): Observable<WsMessage<AssignmentRejectedPayload>> {
    return this.on<AssignmentRejectedPayload>('assignment.rejected');
  }

  get incidentStatus$(): Observable<WsMessage<IncidentStatusChangedPayload>> {
    return this.on<IncidentStatusChangedPayload>('incident.status_changed');
  }

  get locationUpdated$(): Observable<WsMessage<LocationUpdatedPayload>> {
    return this.on<LocationUpdatedPayload>('incident.location_updated');
  }

  get notifications$(): Observable<WsMessage<NotificationPayload>> {
    return this.on<NotificationPayload>('notification.new');
  }

  get isConnected(): boolean {
    return this.connected;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  private _scheduleReconnect(): void {
    timer(this.reconnectDelay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.MAX_DELAY);
        this.connect();
      });
  }
}
