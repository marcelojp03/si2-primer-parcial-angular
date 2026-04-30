export interface TransaccionPago {
    id: number;
    idqr: string;
    tipoTransaccionCodigo: string;
    estadoTransaccionCodigo: string;
    montoOriginal: number;
    comision: number;
    montoTotal: number;
    moneda: string;
    cantidadTickets: number;
    estadoLiquidacion: string | null;
    fechaConfirmacion: string | null;
    usuarioAlta: string | null;
    fechaAlta: string | null;
}

