// ─── Request ───

export interface QrHeaderAttribute {
    attribute: string;
    value: string | number;
}

export interface QrDetailItem {
    attribute: string;
    value: string;
}

export interface QrGenerateRequest {
    operation: string;
    header: QrHeaderAttribute[];
    detail: { items: QrDetailItem[] }[];
}

// ─── Response ───

export interface QrResponseItem {
    code: string;
    description: string;
    identificator: string;
}

export interface QrGenerateResponse {
    message: string;
    status: string;
    responseList: { response: QrResponseItem[] }[];
}

export interface QrStatusResponse {
    message: string;
    status: string;
    responseList: { response: QrResponseItem[] }[];
}

