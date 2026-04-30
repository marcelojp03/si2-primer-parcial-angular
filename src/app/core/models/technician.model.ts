export type TechnicianAvailability = 'AVAILABLE' | 'BUSY' | 'INACTIVE';

export interface Technician {
    id: number;
    workshop_id: number;
    full_name: string;
    ci?: string;
    phone?: string;
    notes?: string;
    availability_status: TechnicianAvailability;
    created_at?: string;
    updated_at?: string;
}

export interface TechnicianSpecialty {
    id: number;
    technician_id: number;
    specialty_id: number;
    created_at?: string;
}

