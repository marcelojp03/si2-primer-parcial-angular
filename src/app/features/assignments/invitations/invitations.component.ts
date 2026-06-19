import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WsService } from '@/core/services/ws.service';
import { AssignmentService } from '@/core/services/assignment.service';
import { AssignmentCandidate } from '@/core/models/assignment.model';

interface InvitationItem {
  candidate: AssignmentCandidate;
  deadlineDate: Date;
  secondsLeft: number;
  expired: boolean;
  responding: boolean;
  rejectNote: string;
  showRejectForm: boolean;
  showQuoteForm: boolean;
  quoteCost: number;
  quoteMinutes: number;
  quoteDescription: string;
}

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, TagModule, InputNumberModule, TextareaModule, ProgressBarModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
          <i class="pi pi-bell mr-2 text-orange-500"></i>Invitaciones de Servicio
        </h1>
        <p class="text-surface-500 mt-1">Solicitudes de asignación con tiempo límite de respuesta</p>
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
               [class]="item.expired ? 'border-surface-300 bg-surface-50 dark:bg-surface-800 opacity-60' : 'border-orange-300 bg-orange-50 dark:bg-orange-950'">

            <div class="flex items-start justify-between">
              <div>
                <span class="font-semibold text-surface-900 dark:text-surface-0">Incidente #{{ item.candidate.incident_id }}</span>
                <p-tag [severity]="item.expired ? 'secondary' : 'warn'" [value]="item.expired ? 'EXPIRADA' : 'PENDIENTE'" class="ml-2" />
              </div>
              @if (!item.expired) {
                <div><span class="text-2xl font-bold" [class]="item.secondsLeft <= 60 ? 'text-red-600' : 'text-orange-600'">{{ formatTime(item.secondsLeft) }}</span></div>
              }
            </div>

            @if (!item.expired) {
              <p-progressBar [value]="getProgress(item)" [showValue]="false" styleClass="h-2" [style]="{'height': '6px'}" />
            }

            <div class="grid grid-cols-2 gap-2 text-sm text-surface-600 dark:text-surface-400">
              <div><i class="pi pi-car mr-1"></i>Taller #{{ item.candidate.workshop_id }}</div>
              @if (item.candidate.distance_km) { <div><i class="pi pi-map-marker mr-1"></i>{{ item.candidate.distance_km | number:'1.1-1' }} km</div> }
              @if (item.candidate.score) { <div><i class="pi pi-star mr-1"></i>Score: {{ item.candidate.score | number:'1.0-1' }}</div> }
              @if (item.candidate.estimated_arrival_minutes) { <div><i class="pi pi-clock mr-1"></i>~{{ item.candidate.estimated_arrival_minutes }} min</div> }
            </div>

            <!-- Formulario de cotización -->
            @if (item.showQuoteForm) {
              <div class="flex flex-col gap-2 p-3 bg-white dark:bg-surface-800 rounded-lg border border-orange-200 dark:border-orange-700">
                <p class="text-sm font-medium text-surface-700 dark:text-surface-300">Cotización del servicio</p>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="text-xs text-surface-500">Costo estimado (Bs)</label>
                    <p-inputNumber [(ngModel)]="item.quoteCost" [min]="0" [max]="99999" mode="decimal" [minFractionDigits]="2" styleClass="w-full" inputId="cost-{{item.candidate.id}}" />
                  </div>
                  <div class="flex-1">
                    <label class="text-xs text-surface-500">Tiempo (min)</label>
                    <p-inputNumber [(ngModel)]="item.quoteMinutes" [min]="1" [max]="1440" styleClass="w-full" inputId="time-{{item.candidate.id}}" />
                  </div>
                </div>
                <div>
                  <label class="text-xs text-surface-500">Descripción del trabajo</label>
                  <textarea [(ngModel)]="item.quoteDescription" rows="2" placeholder="Ej: Cambio de neumático..." class="w-full text-sm p-2 border border-surface-300 rounded-lg bg-surface-0"></textarea>
                </div>
              </div>
            }

            <!-- Formulario de rechazo -->
            @if (item.showRejectForm) {
              <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-600">Motivo de rechazo (opcional)</label>
                <textarea [(ngModel)]="item.rejectNote" rows="2" placeholder="Ej: Sin disponibilidad..." class="w-full text-sm p-2 border border-surface-300 rounded-lg"></textarea>
              </div>
            }

            <!-- Acciones -->
            @if (!item.expired) {
              <div class="flex gap-2 mt-auto">
                @if (!item.showQuoteForm && !item.showRejectForm) {
                  <p-button label="Aceptar y cotizar" icon="pi pi-check" severity="success" size="small" (onClick)="item.showQuoteForm = true" />
                  <p-button label="Rechazar" icon="pi pi-times" severity="danger" size="small" outlined (onClick)="item.showRejectForm = true" />
                } @else if (item.showQuoteForm) {
                  <p-button label="Enviar cotización y aceptar" icon="pi pi-send" severity="success" size="small" [loading]="item.responding" (onClick)="respond(item, 'ACEPTADO')" />
                  <p-button label="Cancelar" severity="secondary" size="small" outlined (onClick)="item.showQuoteForm = false" />
                } @else if (item.showRejectForm) {
                  <p-button label="Confirmar rechazo" icon="pi pi-times" severity="danger" size="small" [loading]="item.responding" (onClick)="respond(item, 'RECHAZADO')" />
                  <p-button label="Cancelar" severity="secondary" size="small" outlined (onClick)="item.showRejectForm = false; item.rejectNote = ''" />
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
    this.wsService.connect();
    this.wsService.invitations$.pipe(takeUntil(this.destroy$)).subscribe(msg => this._addFromWs(msg.payload));
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => this._tickCountdowns());
    this.wsService.assignmentAccepted$.pipe(takeUntil(this.destroy$)).subscribe(msg => {
      this.invitations = this.invitations.filter(i => i.candidate.incident_id !== msg.payload.incident_id);
    });
    this.wsService.assignmentRejected$.pipe(takeUntil(this.destroy$)).subscribe(msg => {
      this.invitations = this.invitations.filter(i => i.candidate.id !== msg.payload.candidate_id);
    });
    interval(60000).pipe(startWith(0), takeUntil(this.destroy$),
      switchMap(() => this.assignmentService.getPendingInvitations())
    ).subscribe(candidates => this._mergeFromPoll(candidates));
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  respond(item: InvitationItem, status: 'ACEPTADO' | 'RECHAZADO'): void {
    item.responding = true;
    const data: any = { response_status: status };
    if (item.rejectNote) data.response_note = item.rejectNote;
    if (status === 'ACEPTADO') {
      if (item.quoteCost > 0) data.quotation_estimated_cost = item.quoteCost;
      if (item.quoteMinutes > 0) data.quotation_completion_minutes = item.quoteMinutes;
      if (item.quoteDescription) data.quotation_description = item.quoteDescription;
    }
    this.assignmentService.respond(item.candidate.incident_id, item.candidate.workshop_id, data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: status === 'ACEPTADO' ? 'Cotización enviada' : 'Rechazada', detail: `Incidente #${item.candidate.incident_id}`, life: 3000 });
        this.invitations = this.invitations.filter(i => i.candidate.id !== item.candidate.id);
      },
      error: () => { item.responding = false; }
    });
  }

  formatTime(s: number): string {
    if (s <= 0) return '00:00';
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  getProgress(item: InvitationItem): number {
    const notifiedAt = item.candidate.notified_at ? new Date(item.candidate.notified_at + 'Z').getTime() : item.deadlineDate.getTime() - 900000;
    const total = (item.deadlineDate.getTime() - notifiedAt) / 1000;
    return total <= 0 ? 0 : Math.max(0, Math.min(100, (item.secondsLeft / total) * 100));
  }

  private _addFromWs(payload: any): void {
    if (this.invitations.some(i => i.candidate.incident_id === payload.incident_id)) return;
    const deadline = new Date(payload.deadline + 'Z');
    const secs = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
    this.invitations.unshift({
      candidate: { id: payload.candidate_id, incident_id: payload.incident_id, workshop_id: payload.workshop_id, response_status: 'PENDIENTE' } as any,
      deadlineDate: deadline, secondsLeft: secs, expired: secs <= 0,
      responding: false, rejectNote: '', showRejectForm: false,
      showQuoteForm: false, quoteCost: 0, quoteMinutes: 60, quoteDescription: '',
    });
  }

  private _mergeFromPoll(candidates: AssignmentCandidate[]): void {
    for (const c of candidates) {
      if (this.invitations.some(i => i.candidate.id === c.id)) continue;
      if (!c.invitation_deadline) continue;
      const deadline = new Date(c.invitation_deadline + 'Z');
      const secs = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      if (secs <= 0) continue;
      this.invitations.push({
        candidate: c, deadlineDate: deadline, secondsLeft: secs, expired: false,
        responding: false, rejectNote: '', showRejectForm: false,
        showQuoteForm: false, quoteCost: 0, quoteMinutes: 60, quoteDescription: '',
      });
    }
  }

  private _tickCountdowns(): void {
    for (const item of this.invitations) {
      if (item.expired) continue;
      item.secondsLeft = Math.max(0, Math.floor((item.deadlineDate.getTime() - Date.now()) / 1000));
      if (item.secondsLeft === 0) item.expired = true;
    }
  }
}
