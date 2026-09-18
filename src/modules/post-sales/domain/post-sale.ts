export const POST_SALE_STATUSES = [
  'AGUARDANDO_CONTATO',
  'CONTATO_FEITO',
  'LARVA_OK',
  'CLIENTE_COM_PROBLEMA',
  'REVISITA_NECESSARIA',
  'FINALIZADO',
] as const;
export type PostSaleStatus = (typeof POST_SALE_STATUSES)[number];
export interface PostSale {
  id: string;
  orderId: string;
  deliveryId: string;
  clientId: string;
  status: PostSaleStatus;
  notes: string | null;
  nextAction: string | null;
  responsibleId: string | null;
  contactedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
