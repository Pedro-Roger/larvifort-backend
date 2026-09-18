export type OrderStatus = 'ORCAMENTO' | 'PEDIDO';

export type OrderPhase =
  | 'DRAFT'
  | 'ABERTO'
  | 'PENDING'
  | 'APROVADO'
  | 'FATURADO'
  | 'ENTREGUE'
  | 'CANCELLED';

export type OrderItemType = 'PRODUCT' | 'SERVICE';

export type OrderCustomerEventType = 'CONFIRMACION' | 'SOLICITUD_CAMBIO';

export interface OrderCustomerEvent {
  id: string;
  orderId: string;
  type: OrderCustomerEventType;
  note: string | null;
  createdById: string | null;
  createdAt: Date;
}

export type OrderOperationalStatus =
  | 'RASCUNHO'
  | 'AGUARDANDO_ESTOQUE'
  | 'ESTOQUE_RESERVADO'
  | 'AGUARDANDO_CONFIRMACION'
  | 'CONFIRMADO'
  | 'FECHADO'
  | 'CANCELADO'
  | 'AGUARDANDO_SEPARACAO'
  | 'AGUARDANDO_MOTORISTA';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productCode?: string | null;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string | null;
  type: OrderItemType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface OrderTask {
  id: string;
  orderId: string;
  taskId: string;
  taskTitle?: string | null;
  taskStatus?: string | null;
  relationshipType: string;
  autoCreated: boolean;
  notes?: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  phase: OrderPhase;
  operationalStatus?: OrderOperationalStatus;
  clientId: string;
  clientName?: string | null;
  clientCpfCnpj?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  salesRepUserId?: string | null;
  salesRepName?: string | null;
  creatorId?: string | null;
  creatorName?: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string | null;
  paymentCondition?: string | null;
  paymentDate?: Date | null;
  shippingMethod?: string | null;
  trackingCode?: string | null;
  deliveryInstructions?: string | null;
  deliveryShift?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  closedAt?: Date | null;
  closedBy?: string | null;
  customerConfirmedBy?: string | null;
  customerConfirmedAt?: Date | null;
  customerConfirmationNote?: string | null;
  orderDate: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  items: OrderItem[];
  tasks?: OrderTask[];
  customerEvents?: OrderCustomerEvent[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface OrderStats {
  totalOrders: number;
  totalOrcamentos: number;
  totalPedidos: number;
  totalCancelled: number;
  totalRevenue: number;
  averageTicket: number;
  phaseCounts: Record<string, number>;
}
