export interface UsuarioInfo {
    id: number;
    nombre: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    correo: string;
    celular?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    rolCodigo: string;
    origenUsuarioCodigo?: string;
    correoVerificado?: boolean;
    debeConfigurarClave?: boolean;
    activo: boolean;
    ultimoAcceso?: string;
}

export interface UsuarioEmpresa {
    id: number;
    usuario: UsuarioInfo;
    empresa: any;
    rolEmpresaCodigo: string;
    activo: boolean;
    usuarioAlta?: string;
    fechaAlta?: string;
}

export interface CrearUsuarioEmpresaRequest {
    correo: string;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    empresaId: number;
    rolEmpresaCodigo?: string;
}

export interface EditarUsuarioEmpresaRequest {
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    celular?: string;
    nuevoRol?: string;
}

