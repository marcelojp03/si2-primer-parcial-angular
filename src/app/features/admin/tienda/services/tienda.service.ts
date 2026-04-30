import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Evento } from '@/features/empresa/eventos/models/evento.model';
import { Sector } from '@/features/empresa/sectores/models/sector.model';

// ─────────────────────────────────────────────────────────────────
// DATOS DE SIMULACIÓN
// Para conectar con la API real, inyectar HttpClient y usar:
//   this.http.get<ApiResponse<Evento[]>>(`${apiUrl}/eventos`)
//   this.http.get<ApiResponse<Sector[]>>(`${apiUrl}/eventos/${id}/sectores`)
// ─────────────────────────────────────────────────────────────────

const MOCK_EVENTOS: Evento[] = [
    {
        eventoId: 1,
        nombre: 'CARRERA PEDESTRE HERZLICH 2025',
        lugar: 'Parque Urbano Central',
        ciudad: 'Cochabamba',
        fechaInicio: '2025-08-15T08:00:00',
        fechaFin: '2025-08-15T12:00:00',
        timezone: 'America/La_Paz',
        estadoEvento: 'ACTIVO',
        tipoEvento: { tipoEventoId: 1, nombre: 'Carrera Pedestre' },
    },
    {
        eventoId: 2,
        nombre: 'FESTIVAL DE MÚSICA ANDINA 2025',
        lugar: 'Teatro Achá',
        ciudad: 'Cochabamba',
        fechaInicio: '2025-09-20T19:00:00',
        fechaFin: '2025-09-20T23:00:00',
        timezone: 'America/La_Paz',
        estadoEvento: 'ACTIVO',
        tipoEvento: { tipoEventoId: 2, nombre: 'Festival' },
    },
    {
        eventoId: 3,
        nombre: 'TORNEO DE FÚTBOL MASTERPASS CUP',
        lugar: 'Estadio Félix Capriles',
        ciudad: 'Cochabamba',
        fechaInicio: '2025-10-05T15:00:00',
        fechaFin: '2025-10-05T18:00:00',
        timezone: 'America/La_Paz',
        estadoEvento: 'ACTIVO',
        tipoEvento: { tipoEventoId: 3, nombre: 'Deportivo' },
    },
    {
        eventoId: 4,
        nombre: 'CONCIERTO BAD BUNNY',
        lugar: 'Estadio Hernando Siles',
        ciudad: 'La Paz',
        fechaInicio: '2025-11-22T21:00:00',
        fechaFin: '2025-11-23T01:00:00',
        timezone: 'America/La_Paz',
        estadoEvento: 'ACTIVO',
        tipoEvento: { tipoEventoId: 4, nombre: 'Concierto' },
    },
];

const MOCK_SECTORES: Record<number, Sector[]> = {
    1: [
        { sectorId: 1, nombreSector: 'sector1', capacidad: 500, precioBase: 1.00, moneda: 'BOB', asientosNumerados: false },
        { sectorId: 2, nombreSector: 'sector2', capacidad: 200, precioBase: 1.50, moneda: 'BOB', asientosNumerados: false },
        { sectorId: 3, nombreSector: 'sector3', capacidad: 100, precioBase: 2.00, moneda: 'BOB', asientosNumerados: true },
    ],
    2: [
        { sectorId: 4, nombreSector: 'General',     capacidad: 800, precioBase:  50.00, moneda: 'BOB', asientosNumerados: false },
        { sectorId: 5, nombreSector: 'Preferente',  capacidad: 200, precioBase: 100.00, moneda: 'BOB', asientosNumerados: true },
        { sectorId: 6, nombreSector: 'VIP',          capacidad:  50, precioBase: 200.00, moneda: 'BOB', asientosNumerados: true },
    ],
    3: [
        { sectorId: 7, nombreSector: 'Norte',            capacidad: 1000, precioBase:  30.00, moneda: 'BOB', asientosNumerados: false },
        { sectorId: 8, nombreSector: 'Sur',              capacidad: 1000, precioBase:  30.00, moneda: 'BOB', asientosNumerados: false },
        { sectorId: 9, nombreSector: 'Tribuna Central',  capacidad:  500, precioBase:  80.00, moneda: 'BOB', asientosNumerados: true },
    ],
    4: [
        { sectorId: 10, nombreSector: 'General',     capacidad: 5000, precioBase: 100.00, moneda: 'BOB', asientosNumerados: false },
        { sectorId: 11, nombreSector: 'Preferencia', capacidad: 1000, precioBase: 200.00, moneda: 'BOB', asientosNumerados: false },
    ],
};

@Injectable({ providedIn: 'root' })
export class TiendaService {
    listarEventos(): Observable<Evento[]> {
        return of(MOCK_EVENTOS);
    }

    obtenerEvento(eventoId: number): Observable<Evento | undefined> {
        return of(MOCK_EVENTOS.find(e => e.eventoId === eventoId));
    }

    listarSectores(eventoId: number): Observable<Sector[]> {
        return of(MOCK_SECTORES[eventoId] ?? []);
    }
}

