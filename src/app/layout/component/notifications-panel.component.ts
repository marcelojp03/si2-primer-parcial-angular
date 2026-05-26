import {
  Component, inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { TagModule } from 'primeng/tag';
import { WsService } from '@/core/services/ws.service';
import { MetricsService } from '@/core/services/metrics.service';
import { Notification } from '@/core/models/metrics.model';
import { NotificationPayload } from '@/core/models/ws.model';

interface InAppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  ts: string;
}

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, BadgeModule, ButtonModule, Popover, TagModule],
  template: `
    <div class="relative">
      <button
        class="layout-topbar-action relative"
        (click)="panel.toggle($event)"
        [attr.aria-label]="'Notificaciones (' + unreadCount + ')'"
      >
        <i class="pi pi-bell"></i>
        @if (unreadCount > 0) {
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full
                       w-5 h-5 flex items-center justify-center font-bold leading-none">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        }
      </button>

      <p-popover #panel [style]="{width: '360px', maxHeight: '480px'}">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-surface-200 dark:border-surface-700">
          <span class="font-semibold text-surface-900 dark:text-surface-0">Notificaciones</span>
          @if (unreadCount > 0) {
            <p-button label="Marcar todas" size="small" text
                      (onClick)="markAllRead()" />
          }
        </div>

        <div class="flex flex-col gap-2 overflow-y-auto" style="max-height: 380px">
          @if (notifications.length === 0) {
            <div class="py-8 text-center text-surface-400">
              <i class="pi pi-bell-slash text-3xl mb-2 block"></i>
              <p class="text-sm">Sin notificaciones</p>
            </div>
          }
          @for (n of notifications; track n.id) {
            <div
              class="rounded-lg p-3 cursor-pointer transition-colors"
              [class]="n.read
                ? 'bg-surface-50 dark:bg-surface-800'
                : 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'"
              (click)="markRead(n)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">
                    {{ n.title }}
                  </p>
                  <p class="text-xs text-surface-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                </div>
                @if (!n.read) {
                  <span class="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                }
              </div>
              <p class="text-xs text-surface-400 mt-1">{{ formatTs(n.ts) }}</p>
            </div>
          }
        </div>
      </p-popover>
    </div>
  `
})
export class NotificationsPanelComponent implements OnInit, OnDestroy {
  private wsService = inject(WsService);
  private metricsService = inject(MetricsService);
  private destroy$ = new Subject<void>();

  notifications: InAppNotification[] = [];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  ngOnInit(): void {
    // Cargar historial inicial
    this.metricsService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        this.notifications = list.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.status === 'READ',
          ts: n.created_at ?? new Date().toISOString(),
        }));
      });

    // Escuchar nuevas notificaciones en tiempo real
    this.wsService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => this._addFromWs(msg.payload, msg.ts));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markRead(n: InAppNotification): void {
    n.read = true;
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  formatTs(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
  }

  private _addFromWs(payload: NotificationPayload, ts: string): void {
    this.notifications.unshift({
      id: payload.notification_id,
      title: payload.title,
      message: payload.message,
      read: false,
      ts,
    });
    // Mantener máximo 50 notificaciones
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }
}
