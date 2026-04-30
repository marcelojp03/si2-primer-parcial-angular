export interface Sector {
    sectorId: number;
    nombreSector: string;
    capacidad: number;
    precioBase: number;
    moneda: string;
    asientosNumerados: boolean;
    evento?: any;
    usuarioAlta?: string;
    fechaAlta?: string;
}

export interface SectorRequest {
    nombreSector: string;
    capacidad: number;
    precioBase: number;
    moneda: string;
    asientosNumerados: boolean;
}

