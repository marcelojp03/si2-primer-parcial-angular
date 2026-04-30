import { Sector } from '../models/sector.model';

export const SECTORES_MOCK: Sector[] = [
    { id: 1, nombre: 'VIP', descripcion: 'Sector preferencial', eventoId: 1, capacidad: 100, precioBase: 500, estado: 'ACTIVO' },
    { id: 2, nombre: 'General', descripcion: 'Sector general', eventoId: 1, capacidad: 2000, precioBase: 100, estado: 'ACTIVO' },
    { id: 3, nombre: 'Platea', descripcion: 'Sector platea baja', eventoId: 2, capacidad: 300, precioBase: 250, estado: 'ACTIVO' },
    { id: 4, nombre: 'Palco', descripcion: 'Palcos privados', eventoId: 2, capacidad: 50, precioBase: 800, estado: 'INACTIVO' },
];

