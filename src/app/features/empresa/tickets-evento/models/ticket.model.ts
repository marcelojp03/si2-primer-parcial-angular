export interface Ticket {
    ticketId: number;
    codigoTicket: string;
    sectorId: number;
    sectorNombre: string;
    butaca: string | null;
    fechaEmision: string;
    estado: EstadoTicket;
    ownerCorreo: string;
    ownerNombre: string;
    consumidoPor: string | null;
    fechaConsumo: string | null;
}

export type EstadoTicket = 'ACTIVO' | 'USADO' | 'ANULADO' | 'DESCONOCIDO';

export interface TicketResumen {
    totalTickets: number;
    porEstado: Record<string, number>;
    porSector: Record<string, number>;
    porSectorEstado: Record<string, Record<string, number>>;
}

