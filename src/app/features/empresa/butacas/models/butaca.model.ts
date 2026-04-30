export interface Butaca {
    id: number;
    codigoButaca: string;
    fila: string;
    numero: number;
    activa: boolean;
    sector?: any;
    usuarioAlta?: string;
    fechaAlta?: string;
}

export interface ButacaRequest {
    codigoButaca: string;
    fila: string;
    numero: number;
}

