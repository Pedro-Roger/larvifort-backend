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
  shippingMethod?: string | null;
  trackingCode?: string | null;
  deliveryInstructions?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  orderDate: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  items: OrderItem[];
  tasks?: OrderTask[];
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
