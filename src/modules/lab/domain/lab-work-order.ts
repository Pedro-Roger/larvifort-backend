export type LabWorkOrderStatus =
  | 'AGUARDANDO_LABORATORIO'
  | 'RECEBIDO'
  | 'EM_PREPARACAO'
  | 'PRONTO_PARA_SEPARACAO'
  | 'BLOQUEADO'
  | 'CANCELADO';

export const LAB_WORK_ORDER_STATUSES: LabWorkOrderStatus[] = [
  'AGUARDANDO_LABORATORIO',
  'RECEBIDO',
  'EM_PREPARACAO',
  'PRONTO_PARA_SEPARACAO',
  'BLOQUEADO',
  'CANCELADO',
];

export interface LabOrderRow {
  id: string;
  orderNumber: string | null;
  clientId: string;
  clientName: string | null;
  items: LabOrderItem[];
  deliveryDate: Date | null;
  operationalStatus: string;
}

export interface LabOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  unit: string;
  quantity: number;
}

export interface LabWorkOrder {
  id: string;
  orderId: string;
  orderNumber: string | null;
  clientName: string | null;
  productId: string | null;
  productName: string;
  quantity: number;
  unit: string;
  stockUnitId: string | null;
  stockUnitName: string | null;
  stockLocationId: string | null;
  stockLocationName: string | null;
  deliveryDate: Date | null;
  status: LabWorkOrderStatus;
  statusChangedBy: string | null;
  statusChangedAt: Date | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}
