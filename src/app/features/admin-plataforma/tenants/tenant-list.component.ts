import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TenantService } from '@/core/services/tenant.service';
import { Tenant } from '@/core/models/tenant.model';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ButtonModule, TableModule, TagModule, DialogModule, InputTextModule, TooltipModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
            <i class="pi pi-building mr-2 text-primary"></i>Gestión de Tenants
          </h1>
          <p class="text-surface-500 mt-1">Talleres registrados en la plataforma</p>
        </div>
        <p-button label="Nuevo Tenant" icon="pi pi-plus"
                  (onClick)="openCreate()" />
      </div>

      <p-table [value]="tenants" [loading]="loading"
               styleClass="p-datatable-sm"
               [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-t>
          <tr>
            <td>{{ t.id }}</td>
            <td class="font-medium">{{ t.name }}</td>
            <td><code class="text-xs bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">{{ t.slug }}</code></td>
            <td>
              <p-tag [severity]="t.status === 'ACTIVO' ? 'success' : 'danger'"
                     [value]="t.status" />
            </td>
            <td>{{ t.created_at | date:'dd/MM/yyyy' }}</td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" size="small" text
                          pTooltip="Editar"
                          (onClick)="openEdit(t)" />
                <p-button
                  [icon]="t.status === 'ACTIVO' ? 'pi pi-ban' : 'pi pi-check'"
                  size="small" text
                  [severity]="t.status === 'ACTIVO' ? 'danger' : 'success'"
                  [pTooltip]="t.status === 'ACTIVO' ? 'Suspender' : 'Activar'"
                  (onClick)="toggleStatus(t)" />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center text-surface-400 py-8">No hay tenants registrados</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog crear/editar -->
    <p-dialog [(visible)]="dialogVisible"
              [header]="editingTenant ? 'Editar Tenant' : 'Nuevo Tenant'"
              [modal]="true" [style]="{width: '440px'}">
      <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Nombre</label>
          <input pInputText formControlName="name" placeholder="Ej: Taller San Miguel" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <small class="text-red-500">El nombre es obligatorio</small>
          }
        </div>

        @if (!editingTenant) {
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Slug</label>
            <input pInputText formControlName="slug"
                   placeholder="Ej: taller-san-miguel"
                   (input)="autoSlug()" />
            <small class="text-surface-400">Solo letras minúsculas, números y guiones</small>
            @if (form.get('slug')?.invalid && form.get('slug')?.touched) {
              <small class="text-red-500">Slug inválido (solo a-z, 0-9, -)</small>
            }
          </div>
        }
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" severity="secondary" outlined
                  (onClick)="dialogVisible = false" />
        <p-button label="Guardar" icon="pi pi-check"
                  [loading]="saving"
                  [disabled]="form.invalid"
                  (onClick)="save()" />
      </ng-template>
    </p-dialog>
  `
})
export class TenantListComponent implements OnInit {
  private tenantService = inject(TenantService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  tenants: Tenant[] = [];
  loading = true;
  dialogVisible = false;
  saving = false;
  editingTenant: Tenant | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.pattern(/^[a-z0-9-]+$/), Validators.maxLength(80)]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.tenantService.getAll().subscribe({
      next: data => {
        this.tenants = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingTenant = null;
    this.form.reset();
    this.form.get('slug')?.setValidators([
      Validators.required,
      Validators.pattern(/^[a-z0-9-]+$/),
      Validators.maxLength(80)
    ]);
    this.form.get('slug')?.updateValueAndValidity();
    this.dialogVisible = true;
  }

  openEdit(t: Tenant): void {
    this.editingTenant = t;
    this.form.patchValue({ name: t.name, slug: '' });
    this.form.get('slug')?.clearValidators();
    this.form.get('slug')?.updateValueAndValidity();
    this.dialogVisible = true;
  }

  autoSlug(): void {
    if (this.editingTenant) return;
    const name = this.form.get('name')?.value ?? '';
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    this.form.patchValue({ slug }, { emitEvent: false });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const { name, slug } = this.form.value;

    const obs = this.editingTenant
      ? this.tenantService.update(this.editingTenant.id, { name: name! })
      : this.tenantService.create({ name: name!, slug: slug! });

    obs.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: this.editingTenant ? 'Tenant actualizado' : 'Tenant creado',
          life: 3000
        });
        this.dialogVisible = false;
        this.saving = false;
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  toggleStatus(t: Tenant): void {
    const newStatus = t.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.tenantService.update(t.id, { status: newStatus }).subscribe({
      next: updated => {
        const idx = this.tenants.findIndex(x => x.id === t.id);
        if (idx !== -1) this.tenants[idx] = updated;
        this.messageService.add({
          severity: newStatus === 'ACTIVO' ? 'success' : 'warn',
          summary: newStatus === 'ACTIVO' ? 'Tenant activado' : 'Tenant suspendido',
          life: 3000
        });
      }
    });
  }
}
