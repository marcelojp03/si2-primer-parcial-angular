export interface StaffEvento {
    id: number;
    usuario: {
        id: number;
        nombre: string;
        apellidoPaterno?: string;
        apellidoMaterno?: string;
        correo: string;
        celular?: string;
        rolCodigo: string;
        correoVerificado?: boolean;
        debeConfigurarClave?: boolean;
        activo: boolean;
    };
    evento: any;
    empresa: any;
    activo: boolean;
    usuarioAlta?: string;
    fechaAlta?: string;
}

export interface CrearStaffRequest {
    correo: string;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    celular?: string;
    clave?: string;
    eventoId: number;
    empresaId: number;
}

export interface EditarStaffRequest {
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    celular?: string;
    clave?: string;
    activo?: boolean;
}

export interface StaffSector {
    id: number;
    staffEvento: {
        id: number;
        usuario: { id: number; nombre: string; apellidoPaterno?: string; correo: string };
        evento: { eventoId: number; nombreEvento: string };
        activo: boolean;
    };
    sector: {
        sectorId: number;
        nombreSector: string;
        capacidad: number;
        precioBase: number;
        moneda: string;
    };
    activo: boolean;
    usuarioAlta?: string;
    fechaAlta?: string;
    usuarioBaja?: string;
    fechaBaja?: string;
    usuarioModificacion?: string;
    fechaModificacion?: string;
}

