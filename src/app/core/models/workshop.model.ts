export type WorkshopStatus = 'ACTIVO' | 'INACTIVO';

export interface Workshop {
    id: number;
    admin_user_id: number;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    has_tow: boolean;
    is_24_hours: boolean;
    status: WorkshopStatus;
    created_at?: string;
    updated_at?: string;
}

export interface WorkshopSchedule {
    id: number;
    workshop_id: number;
    weekday: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
    start_time: string;
    end_time: string;
    active?: boolean;
    created_at?: string;
}

export interface WorkshopSpecialty {
    id: number;
    workshop_id: number;
    specialty_id: number;
    created_at?: string;
}

export interface Specialty {
    id: number;
    name: string;
    description?: string;
    status?: 'ACTIVO' | 'INACTIVO';
    created_at?: string;
    updated_at?: string;
    /** id del registro WorkshopSpecialty para poder eliminarlo */
    workshopSpecialtyId?: number;
}

