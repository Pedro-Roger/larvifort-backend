import type { Paginated } from '../../../../core/common/pagination';
import type {
  Order,
  OrderItemType,
  OrderPhase,
  OrderStats,
  OrderStatus,
} from '../../domain/order';

export const ORDER_REPOSITORY_PORT = 'ORDER_REPOSITORY_PORT';

export interface CreateOrderItemInput {
  productId?: string | null;
  productCode?: string | null;
  productName: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice?: number;
  notes?: string | null;
  type?: OrderItemType;
}

export interface CreateOrderInput {
  orderNumber?: string | null;
  status?: OrderStatus;
  phase?: OrderPhase;
  clientId: string;
  companyId?: string | null;
  projectId?: string | null;
  salesRepUserId?: string | null;
  creatorId?: string | null;
  discount?: number;
  shippingCost?: number;
  taxAmount?: number;
  paymentMethod?: string | null;
  paymentCondition?: string | null;
  shippingMethod?: string | null;
  trackingCode?: string | null;
  deliveryInstructions?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  orderDate?: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  items: CreateOrderItemInput[];
  linkTaskId?: string | null;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  phase?: OrderPhase;
  clientId?: string;
  companyId?: string | null;
  projectId?: string | null;
  salesRepUserId?: string | null;
  discount?: number;
  shippingCost?: number;
  taxAmount?: number;
  paymentMethod?: string | null;
  paymentCondition?: string | null;
  shippingMethod?: string | null;
  trackingCode?: string | null;
  deliveryInstructions?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  orderDate?: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  items?: CreateOrderItemInput[];
}

export interface FindOrdersFilter {
  status?: OrderStatus;
  phase?: OrderPhase;
  clientId?: string;
  projectId?: string;
  salesRepUserId?: string;
  search?: string;
  de?: Date;
  ate?: Date;
  page?: number;
  limit?: number;
}

export interface OrderRepositoryPort {
  create(data: CreateOrderInput): Promise<Order>;
  update(id: string, data: UpdateOrderInput): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findMany(filter: FindOrdersFilter): Promise<Paginated<Order>>;
  cancel(id: string, reason: string, cancelledAt: Date): Promise<Order>;
  delete(id: string): Promise<void>;
  getStats(filter?: Partial<FindOrdersFilter>): Promise<OrderStats>;
  generateNextOrderNumber(): Promise<string>;
}
