export type AssignmentStatus =
    | 'ASIGNADO'
    | 'EN_CAMINO'
    | 'EN_PROCESO'
    | 'ATENDIDO'
    | 'CANCELADO'
    | 'PENDIENTE_PAGO'
    | 'PAGADO';

export type CandidateResponseStatus = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

export interface ServiceAssignment {
    id: number;
    incident_id: number;
    workshop_id: number;
    technician_id?: number;
    specialty_id?: number;
    assigned_by_user_id?: number;
    assignment_status: AssignmentStatus;
    distance_km?: number;
    estimated_arrival_minutes?: number;
    estimated_cost?: number;
    final_cost?: number;
    performed_service_description?: string;
    final_notes?: string;
    quotation_status?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    quotation_description?: string;
    estimated_completion_minutes?: number;
    assigned_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssignmentCandidate {
    id: number;
    incident_id: number;
    workshop_id: number;
    score?: number;
    distance_km?: number;
    estimated_arrival_minutes?: number;
    notified?: boolean;
    notified_at?: string;
    invitation_deadline?: string;
    response_status: CandidateResponseStatus;
    responded_at?: string;
    response_note?: string;
}

