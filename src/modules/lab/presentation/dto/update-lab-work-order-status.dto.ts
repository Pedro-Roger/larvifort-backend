import { IsEnum } from 'class-validator';
import {
  LAB_WORK_ORDER_STATUSES,
  type LabWorkOrderStatus,
} from '../../domain/lab-work-order';

export class UpdateLabWorkOrderStatusDto {
  @IsEnum(LAB_WORK_ORDER_STATUSES)
  status: LabWorkOrderStatus;
}
