import { Butaca } from '../models/butaca.model';

export const BUTACAS_MOCK: Butaca[] = [
    { id: 1, fila: 'A', numero: 1, sectorId: 1, estado: 'DISPONIBLE', precio: 500 },
    { id: 2, fila: 'A', numero: 2, sectorId: 1, estado: 'RESERVADA', precio: 500 },
    { id: 3, fila: 'A', numero: 3, sectorId: 1, estado: 'VENDIDA', precio: 500 },
    { id: 4, fila: 'B', numero: 1, sectorId: 2, estado: 'DISPONIBLE', precio: 100 },
    { id: 5, fila: 'B', numero: 2, sectorId: 2, estado: 'BLOQUEADA', precio: 100 },
];

