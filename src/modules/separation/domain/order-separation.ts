export type SeparationStatus =
  'AGUARDANDO_SEPARACAO' | 'EM_SEPARACAO' | 'SEPARADO' | 'DIVERGENCIA';

export interface OrderSeparation {
  id: string;
  orderId: string;
  status: SeparationStatus;
  startedAt: Date | null;
  startedBy: string | null;
  completedAt: Date | null;
  completedBy: string | null;
  divergenceNote: string | null;
  divergenceAt: Date | null;
  divergenceBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
