export interface UsuarioInterno {
    id: number;
    correo: string;
    nombre: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    celular: string | null;
    tipoDocumento: string | null;
    numeroDocumento: string | null;
    rolCodigo: string;
    origenUsuarioCodigo: string | null;
    correoVerificado: boolean;
    debeConfigurarClave: boolean;
    activo: boolean;
    ultimoAcceso: string | null;
    usuarioAlta: string | null;
    fechaAlta: string | null;
    usuarioModificacion: string | null;
    fechaModificacion: string | null;
    usuarioBaja: string | null;
    fechaBaja: string | null;
}

export interface UsuarioEmpresaResumen {
    usuarioEmpresaId: number;
    empresaId: number;
    nombreEmpresa: string;
    rolEmpresaCodigo: string;
    activo: boolean;
}

export interface UsuarioDetalle extends UsuarioInterno {
    empresas: UsuarioEmpresaResumen[];
}

export interface CrearUsuarioInternoRequest {
    correo: string;
    nombre: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    rolCodigo: string;
    clave?: string;
}

