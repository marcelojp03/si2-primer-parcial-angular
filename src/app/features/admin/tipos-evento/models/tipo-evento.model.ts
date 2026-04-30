export interface TipoEvento {
    tipoEventoId: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    usuarioAlta: string | null;
    fechaAlta: string | null;
    usuarioModificacion: string | null;
    fechaModificacion: string | null;
    usuarioBaja: string | null;
    fechaBaja: string | null;
}

export interface CrearTipoEventoRequest {
    nombre: string;
    descripcion?: string;
}

export interface EditarTipoEventoRequest {
    nombre?: string;
    descripcion?: string;
}

