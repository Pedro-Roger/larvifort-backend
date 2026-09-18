export type DeliveryStatus =
  | 'AGUARDANDO_MOTORISTA'
  | 'MOTORISTA_DEFINIDO'
  | 'SAIU_PARA_ENTREGA'
  | 'EM_ROTA'
  | 'ENTREGUE'
  | 'PROBLEMA'
  | 'REAGENDADO';

export interface Delivery {
  id: string;
  orderId: string;
  driverId: string | null;
  vehicleId: string | null;
  status: DeliveryStatus;
  predictedAt: Date | null;
  completedAt: Date | null;
  proofUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
