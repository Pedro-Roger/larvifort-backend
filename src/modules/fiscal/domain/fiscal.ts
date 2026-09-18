export type FiscalStatus =
  | 'NAO_SOLICITADO'
  | 'PENDENTE_DADOS'
  | 'PRONTO_EMISSAO'
  | 'NF_EMITIDA'
  | 'NF_CANCELADA';

export interface FiscalInfo {
  status: FiscalStatus;
  data: Record<string, any>;
  notes: string | null;
}
