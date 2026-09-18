import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  OrderOperationalStatus,
  OrderPhase,
  OrderStatus,
} from '../../domain/order';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: 'ORD-2026-0001',
    description: 'Número sequencial/código legível do pedido',
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiPropertyOptional({
    example: 'PEDIDO',
    enum: ['ORCAMENTO', 'PEDIDO'],
    description: 'Status/Tipo do documento (ORCAMENTO ou PEDIDO)',
  })
  @IsOptional()
  @IsEnum(['ORCAMENTO', 'PEDIDO'], {
    message: 'Status deve ser ORCAMENTO ou PEDIDO.',
  })
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 'ABERTO',
    enum: [
      'DRAFT',
      'ABERTO',
      'PENDING',
      'APROVADO',
      'FATURADO',
      'ENTREGUE',
      'CANCELLED',
    ],
    description: 'Fase do ciclo de vida do pedido',
  })
  @IsOptional()
  @IsEnum(
    [
      'DRAFT',
      'ABERTO',
      'PENDING',
      'APROVADO',
      'FATURADO',
      'ENTREGUE',
      'CANCELLED',
    ],
    {
      message: 'Fase inválida.',
    },
  )
  phase?: OrderPhase;

  @ApiPropertyOptional({
    example: 'RASCUNHO',
    enum: [
      'RASCUNHO',
      'AGUARDANDO_ESTOQUE',
      'ESTOQUE_RESERVADO',
      'AGUARDANDO_CONFIRMACION',
      'CONFIRMADO',
      'FECHADO',
      'CANCELADO',
    ],
    description: 'Estado operacional del pedido',
  })
  @IsOptional()
  @IsEnum(
    [
      'RASCUNHO',
      'AGUARDANDO_ESTOQUE',
      'ESTOQUE_RESERVADO',
      'AGUARDANDO_CONFIRMACION',
      'CONFIRMADO',
      'FECHADO',
      'CANCELADO',
    ],
    { message: 'Estado operacional inválido.' },
  )
  operationalStatus?: OrderOperationalStatus;

  @ApiProperty({
    example: 'client-uuid-123',
    description: 'ID do cliente cadastrado',
  })
  @IsString({ message: 'ID do cliente é obrigatório.' })
  @IsNotEmpty({ message: 'ID do cliente não pode ser vazio.' })
  clientId!: string;

  @ApiPropertyOptional({
    example: 'company-uuid-123',
    description: 'ID da empresa/fazenda',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    example: 'project-uuid-123',
    description: 'ID do projeto/quadro Kanban associado',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    example: 'user-uuid-123',
    description: 'ID do vendedor/consultor responsável',
  })
  @IsOptional()
  @IsString()
  salesRepUserId?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Desconto global no pedido',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Desconto deve ser numérico.' })
  @Min(0, { message: 'Desconto não pode ser negativo.' })
  discount?: number;

  @ApiPropertyOptional({
    example: 150,
    description: 'Custo de frete/transporte',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Frete deve ser numérico.' })
  @Min(0, { message: 'Frete não pode ser negativo.' })
  shippingCost?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Impostos ou taxas adicionais',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Taxas devem ser numéricas.' })
  @Min(0, { message: 'Taxas não podem ser negativas.' })
  taxAmount?: number;

  @ApiPropertyOptional({
    example: 'PIX',
    description: 'Forma de pagamento (PIX, Boleto, Cartão, Transferência)',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: '30/60 dias',
    description: 'Condição de pagamento',
  })
  @IsOptional()
  @IsString()
  paymentCondition?: string;

  @ApiPropertyOptional({
    example: '2026-09-25T00:00:00.000Z',
    description: 'Data prevista/real do pagamento',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de pagamento inválida.' })
  paymentDate?: Date;

  @ApiPropertyOptional({
    example: 'Transporte Próprio',
    description: 'Método de envio/transporte',
  })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @ApiPropertyOptional({
    example: 'BR123456789',
    description: 'Código de rastreamento do frete',
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiPropertyOptional({
    example: 'Descarregar próximo ao berçário 02',
    description: 'Instruções de entrega',
  })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @ApiPropertyOptional({
    example: 'MANHANA',
    description: 'Turno de entrega (MAÑANA, TARDE, NOCHE…)',
  })
  @IsOptional()
  @IsString()
  deliveryShift?: string;

  @ApiPropertyOptional({
    description: 'Endereço de entrega customizado',
  })
  @IsOptional()
  shippingAddress?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Endereço de cobrança customizado',
  })
  @IsOptional()
  billingAddress?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'Observações gerais do pedido',
    description: 'Notas gerais',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: '2026-09-15T10:00:00.000Z',
    description: 'Data do pedido',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data do pedido inválida.' })
  orderDate?: Date;

  @ApiPropertyOptional({
    example: '2026-09-20T10:00:00.000Z',
    description: 'Data de previsão de envio',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de envio inválida.' })
  shippingDate?: Date;

  @ApiPropertyOptional({
    example: '2026-09-22T10:00:00.000Z',
    description: 'Data de previsão de entrega',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de entrega inválida.' })
  deliveryDate?: Date;

  @ApiProperty({
    description: 'Lista de itens do pedido (mínimo 1)',
    type: [CreateOrderItemDto],
  })
  @IsArray({ message: 'Itens deve ser uma lista.' })
  @ArrayMinSize(1, { message: 'O pedido deve conter pelo menos 1 item.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({
    example: 'task-uuid-123',
    description:
      'ID de task Kanban existente para vincular a este pedido (evita criar 2º card)',
  })
  @IsOptional()
  @IsString()
  linkTaskId?: string;
}
