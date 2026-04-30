export type PriorityLevel = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'INCIERTA';

export interface Incident {
    id: number;
    client_user_id: number;
    vehicle_id?: number;
    incident_type_id?: number;
    incident_status_id: number;
    title: string;
    description_text?: string;
    reference_address?: string;
    latitude?: number;
    longitude?: number;
    priority_level?: PriorityLevel | null;
    requires_tow: boolean;
    requested_at: string;
    accepted_at?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    cancelled_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IncidentEvidence {
    id: number;
    incident_id: number;
    evidence_type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
    file_url: string;
    file_key?: string;
    mime_type?: string;
    file_name?: string;
    file_size?: number;
    uploaded_at: string;
}

export interface AiAnalysis {
    id: number;
    incident_id: number;
    transcribed_audio?: string;
    generated_summary?: string;
    predicted_incident_type_id?: number;
    predicted_priority_level?: PriorityLevel;
    suggested_specialty_id?: number;
    visible_damage_detected?: string;
    predicted_requires_tow?: boolean;
    confidence_score?: number;
    raw_response_json?: string;
    created_at: string;
    updated_at?: string;
}

export interface IncidentListResponse {
    items: Incident[];
    total: number;
    page: number;
    limit: number;
}

