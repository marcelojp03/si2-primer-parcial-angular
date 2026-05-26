export interface DashboardMetrics {
    total_incidents: number;
    incidents_by_status: Record<string, number>;
    incidents_by_priority: Record<string, number>;
    total_assignments: number;
    assignments_by_status: Record<string, number>;
    total_payments: number;
    total_revenue: number;
    average_rating: number;
    total_ratings: number;
    total_workshops: number;
    total_technicians: number;
}

export interface KPIDashboard {
    tenant_id: number | null;
    total_incidents: number;
    incidents_last_30_days: number;
    avg_response_minutes: number;
    sla_compliance_pct: number;
    total_assignments: number;
    active_assignments: number;
    active_workshops: number;
    avg_reputation_score: number;
    total_revenue: number;
    average_rating: number;
}

export interface Notification {
    id: number;
    user_id?: number;
    incident_id?: number;
    notification_type: string;
    channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
    title: string;
    message: string;
    extra_data_json?: string;
    status: 'PENDING' | 'SENT' | 'READ' | 'FAILED';
    sent_at?: string;
    read_at?: string | null;
    created_at?: string;
}

