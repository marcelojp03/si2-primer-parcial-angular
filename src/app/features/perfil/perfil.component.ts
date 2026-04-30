import { Component, OnInit, inject } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '@/core/services/auth.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { UsuarioAuth, EmpresaRol } from '@/core/models/auth.model';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CardModule, TagModule, DividerModule],
    templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {
    private authService = inject(AuthService);
    private empresaService = inject(EmpresaService);

    user: UsuarioAuth | null = null;
    empresaActiva: EmpresaRol | null = null;

    ngOnInit(): void {
        this.authService.currentUser$.subscribe((u) => (this.user = u));
        this.empresaService.empresaActiva$.subscribe((e) => (this.empresaActiva = e));
    }
}

