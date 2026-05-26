// Modelos de eventos WebSocket del servidor (envelope versionado)

export type WsEventType =
  | 'incident.status_changed'
  | 'incident.location_updated'
  | 'assignment.invited'
  | 'assignment.accepted'
  | 'assignment.rejected'
  | 'notification.new'
  | 'ping'
  | 'pong';

export interface WsMessage<T = unknown> {
  type: WsEventType;
  version: number;
  payload: T;
  ts: string;
}

export interface IncidentStatusChangedPayload {
  incident_id: number;
  old_status: string;
  new_status: string;
}

export interface LocationUpdatedPayload {
  incident_id: number;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface AssignmentInvitedPayload {
  incident_id: number;
  candidate_id: number;
  workshop_id: number;
  deadline: string;
}

export interface AssignmentAcceptedPayload {
  incident_id: number;
  assignment_id: number;
  workshop_id: number;
}

export interface AssignmentRejectedPayload {
  incident_id: number;
  candidate_id: number;
  workshop_id: number;
}

export interface NotificationPayload {
  notification_id: number;
  title: string;
  message: string;
}
