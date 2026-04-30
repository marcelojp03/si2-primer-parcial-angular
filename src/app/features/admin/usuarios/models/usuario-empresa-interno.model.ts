export interface UsuarioEmpresaInterno {
    id: number;
    usuario: { id: number; correo: string; nombre: string };
    empresa: { idempresa: number; nombreEmpresa: string };
    rolEmpresaCodigo: string;
    activo: boolean;
    usuarioAlta?: string;
    fechaAlta?: string;
    usuarioModificacion?: string;
    fechaModificacion?: string;
    usuarioBaja?: string;
    fechaBaja?: string;
}

export interface AsociarUsuarioEmpresaRequest {
    usuarioId: number;
    empresaId: number;
    rolEmpresaCodigo: string;
}

