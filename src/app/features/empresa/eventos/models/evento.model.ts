export interface TipoEvento {
    tipoEventoId: number;
    nombre: string;
    descripcion?: string;
    activo?: boolean;
}

export interface Evento {
    eventoId: number;
    nombre: string;
    lugar: string;
    ciudad: string;
    fechaInicio: string;
    fechaFin: string;
    timezone: string;
    estadoEvento: string;
    tipoEvento: TipoEvento;
    usuarioAlta?: string;
    fechaAlta?: string;
}

export interface EventoRequest {
    empresaId: number;
    tipoEventoId: number;
    nombreEvento: string;
    lugar: string;
    ciudad: string;
    fechaInicio: string;
    fechaFin: string;
    timezone: string;
    rolEmpresa?: string;
    participacion?: number;
    reventaPermitida?: boolean;
    maxReventasPorTicket?: number;
    precioMin?: number;
    precioMax?: number;
    requiereAceptacion?: boolean;
    ventanaReventaInicio?: string;
    ventanaReventaFin?: string;
    ventanaValidacionInicio?: string;
    ventanaValidacionFin?: string;
}

