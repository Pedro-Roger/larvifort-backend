import type { Paginated } from '../../../../core/common/pagination';
import type {
  LabOrderRow,
  LabWorkOrder,
  LabWorkOrderStatus,
} from '../../domain/lab-work-order';

export const LAB_REPOSITORY_PORT = 'LAB_REPOSITORY_PORT';

export interface CreateLabWorkOrderInput {
  id: string;
  orderId: string;
  orderNumber?: string | null;
  clientName?: string | null;
  productId?: string | null;
  productName: string;
  quantity: number;
  unit?: string;
  stockUnitId?: string | null;
  stockUnitName?: string | null;
  stockLocationId?: string | null;
  stockLocationName?: string | null;
  deliveryDate?: Date | null;
  createdById?: string | null;
}

export interface UpdateLabWorkOrderStatusInput {
  status: LabWorkOrderStatus;
  statusChangedBy: string;
  statusChangedAt: Date;
}

export interface ListLabOrdersFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export interface LabRepositoryPort {
  create(data: CreateLabWorkOrderInput): Promise<LabWorkOrder>;
  updateStatus(
    id: string,
    data: UpdateLabWorkOrderStatusInput,
  ): Promise<LabWorkOrder>;
  findById(id: string): Promise<LabWorkOrder | null>;
  findByOrderId(orderId: string): Promise<LabWorkOrder[]>;
  listLabOrders(filter: ListLabOrdersFilter): Promise<Paginated<LabOrderRow>>;
  // Gerencia duplicidade: verifica si existe OS activa para el pedido.
  hasActiveForOrder(orderId: string): Promise<boolean>;
}
