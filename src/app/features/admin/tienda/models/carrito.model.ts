export interface CarritoItem {
    eventoId: number;
    eventoNombre: string;
    sectorId: number;
    sectorNombre: string;
    precioBase: number;
    moneda: string;
    cantidad: number;
}

export interface DatosComprador {
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    ciudad: string;
    nombreFactura: string;
    numeroDocumento: string;
    notas: string;
}

