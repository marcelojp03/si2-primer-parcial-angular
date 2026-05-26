import {
  Component, inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { WsService } from '@/core/services/ws.service';
import { AssignmentService } from '@/core/services/assignment.service';
import { AssignmentCandidate } from '@/core/models/assignment.model';
import { AssignmentInvitedPayload } from '@/core/models/ws.model';

interface InvitationItem {
  candidate: AssignmentCandidate;
  deadlineDate: Date;
  secondsLeft: number;
  expired: boolean;
  responding: boolean;
  rejectNote: string;
  showRejectForm: boolean;
}

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, CardModule,
    TagModule, TextareaModule, ProgressBarModule
  ],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
          <i class="pi pi-bell mr-2 text-orange-500"></i>Invitaciones de Servicio
        </h1>
        <p class="text-surface-500 mt-1">
          Solicitudes de asignación con tiempo límite de respuesta
        </p>
      </div>

      @if (invitations.length === 0) {
        <div class="flex flex-col items-center justify-center h-64 text-surface-400">
          <i class="pi pi-inbox text-5xl mb-4 text-surface-300"></i>
          <p class="text-lg">No hay invitaciones pendientes</p>
          <p class="text-sm text-surface-400 mt-1">Las nuevas solicitudes aparecerán aquí en tiempo real</p>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (item of invitations; track item.candidate.id) {
          <div class="rounded-xl border p-5 flex flex-col gap-3"
               [class]="item.expired
                 ? 'border-surface-300 bg-surface-50 dark:bg-surface-800 opacity-60'
                 : 'border-orange-300 bg-orange-50 dark:bg-orange-950'">

            <!-- Header -->
            <div class="flex items-start justify-between">
              <div>
                <span class="font-semibold text-surface-900 dark:text-surface-0">
                  Incidente #{{ item.candidate.incident_id }}
                </span>
                <p-tag [severity]="item.expired ? 'secondary' : 'warn'"
                       [value]="item.expired ? 'EXPIRADA' : 'PENDIENTE'"
                       class="ml-2" />
              </div>
              <div class="text-right">
                @if (!item.expired) {
                  <span class="text-2xl font-bold"
                        [class]="item.secondsLeft <= 60 ? 'text-red-600' : 'text-orange-600'">
                    {{ formatTime(item.secondsLeft) }}
                  </span>
                }
              </div>
            </div>

            <!-- Progress bar de TTL -->
            @if (!item.expired) {
              <div>
                <p-progressBar
                  [value]="getProgress(item)"
                  [showValue]="false"
                  styleClass="h-2"
                  [style]="{'height': '6px'}" />
              </div>
            }

            <!-- Detalles -->
            <div class="grid grid-cols-2 gap-2 text-sm text-surface-600 dark:text-surface-400">
              <div>
                <i class="pi pi-car mr-1"></i>
                Taller #{{ item.candidate.workshop_id }}
              </div>
              @if (item.candidate.distance_km) {
                <div>
                  <i class="pi pi-map-marker mr-1"></i>
                  {{ item.candidate.distance_km | number:'1.1-1' }} km
                </div>
              }
              @if (item.candidate.score) {
                <div>
                  <i class="pi pi-star mr-1"></i>
                  Score: {{ item.candidate.score | number:'1.0-1' }}
                </div>
              }
              @if (item.candidate.estimated_arrival_minutes) {
                <div>
                  <i class="pi pi-clock mr-1"></i>
                  ~{{ item.candidate.estimated_arrival_minutes }} min
                </div>
              }
            </div>

            <!-- Formulario de rechazo -->
            @if (item.showRejectForm) {
              <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-600">Motivo de rechazo (opcional)</label>
                <textarea pInputTextarea [(ngModel)]="item.rejectNote"
                          rows="2" placeholder="Ej: Sin disponibilidad de grúa..."
                          class="w-full text-sm"></textarea>
              </div>
            }

            <!-- Acciones -->
            @if (!item.expired) {
              <div class="flex gap-2 mt-auto">
                @if (!item.showRejectForm) {
                  <p-button label="Aceptar" icon="pi pi-check" severity="success"
                            size="small" [loading]="item.responding"
                            (onClick)="respond(item, 'ACEPTADO')" />
                  <p-button label="Rechazar" icon="pi pi-times" severity="danger"
                            size="small" outlined
                            (onClick)="item.showRejectForm = true" />
                } @else {
                  <p-button label="Confirmar rechazo" icon="pi pi-times" severity="danger"
                            size="small" [loading]="item.responding"
                            (onClick)="respond(item, 'RECHAZADO')" />
                  <p-button label="Cancelar" severity="secondary" size="small" outlined
                            (onClick)="item.showRejectForm = false; item.rejectNote = ''" />
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class InvitationsComponent implements OnInit, OnDestroy {
  private wsService = inject(WsService);
  private assignmentService = inject(AssignmentService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  invitations: InvitationItem[] = [];

  ngOnInit(): void {
    // Conectar WS si no está activo
    this.wsService.connect();

    // Escuchar nuevas invitaciones por WS
    this.wsService.invitations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => this._addFromWs(msg.payload));

    // Ticker de cuenta regresiva cada segundo
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this._tickCountdowns());

    // Polling fallback cada 30s si WS está caído (carga candidatos pendientes)
    interval(30000)
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => this.assignmentService.getPendingInvitations())
      )
      .subscribe(candidates => this._mergeFromPoll(candidates));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  respond(item: InvitationItem, status: 'ACEPTADO' | 'RECHAZADO'): void {
    item.responding = true;
    this.assignmentService
      .respond(item.candidate.incident_id, item.candidate.workshop_id, status, item.rejectNote || undefined)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: status === 'ACEPTADO' ? 'success' : 'info',
            summary: status === 'ACEPTADO' ? 'Solicitud aceptada' : 'Solicitud rechazada',
            detail: `Incidente #${item.candidate.incident_id}`,
            life: 4000
          });
          this.invitations = this.invitations.filter(i => i.candidate.id !== item.candidate.id);
        },
        error: () => {
          item.responding = false;
        }
      });
  }

  formatTime(seconds: number): string {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  getProgress(item: InvitationItem): number {
    const total = (item.deadlineDate.getTime() - new Date(item.candidate.notified_at ?? item.deadlineDate.toISOString()).getTime()) / 1000;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (item.secondsLeft / total) * 100));
  }

  private _addFromWs(payload: AssignmentInvitedPayload): void {
    // Evitar duplicados
    if (this.invitations.some(i => i.candidate.incident_id === payload.incident_id &&
        i.candidate.workshop_id === payload.workshop_id)) return;

    const deadline = new Date(payload.deadline);
    const secondsLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));

    const candidate: AssignmentCandidate = {
      id: payload.candidate_id,
      incident_id: payload.incident_id,
      workshop_id: payload.workshop_id,
      invitation_deadline: payload.deadline,
      response_status: 'PENDIENTE',
    };

    this.invitations.unshift({
      candidate,
      deadlineDate: deadline,
      secondsLeft,
      expired: secondsLeft <= 0,
      responding: false,
      rejectNote: '',
      showRejectForm: false,
    });
  }

  private _mergeFromPoll(candidates: AssignmentCandidate[]): void {
    for (const c of candidates) {
      if (this.invitations.some(i => i.candidate.id === c.id)) continue;
      if (!c.invitation_deadline) continue;

      const deadline = new Date(c.invitation_deadline);
      const secondsLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      if (secondsLeft <= 0) continue; // ya expirada, no mostrar

      this.invitations.push({
        candidate: c,
        deadlineDate: deadline,
        secondsLeft,
        expired: false,
        responding: false,
        rejectNote: '',
        showRejectForm: false,
      });
    }
  }

  private _tickCountdowns(): void {
    for (const item of this.invitations) {
      if (item.expired) continue;
      item.secondsLeft = Math.max(0, Math.floor((item.deadlineDate.getTime() - Date.now()) / 1000));
      if (item.secondsLeft === 0) {
        item.expired = true;
      }
    }
  }
}
