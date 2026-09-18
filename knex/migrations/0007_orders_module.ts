import type { Knex } from 'knex';

const ORDER_STATUS = ['ORCAMENTO', 'PEDIDO'] as const;
const ORDER_PHASE = [
  'DRAFT',
  'ABERTO',
  'PENDING',
  'APROVADO',
  'FATURADO',
  'ENTREGUE',
  'CANCELLED',
] as const;
const ORDER_ITEM_TYPE = ['PRODUCT', 'SERVICE'] as const;

function textPk(t: Knex.CreateTableBuilder, knex: Knex): void {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
}

function timestamps(t: Knex.CreateTableBuilder, knex: Knex): void {
  t.timestamp('createdAt', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
  t.timestamp('updatedAt', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
}

export async function up(knex: Knex): Promise<void> {
  const hasOrderTable = await knex.schema.hasTable('Order');
  if (!hasOrderTable) {
    await knex.schema.createTable('Order', (t) => {
      textPk(t, knex);
      t.text('orderNumber').nullable().unique();
      t.enu('status', [...ORDER_STATUS], {
        useNative: false,
        existingType: false,
        enumName: 'Order_status',
      })
        .notNullable()
        .defaultTo('PEDIDO');
      t.enu('phase', [...ORDER_PHASE], {
        useNative: false,
        existingType: false,
        enumName: 'Order_phase',
      })
        .notNullable()
        .defaultTo('ABERTO');
      t.uuid('clientId').notNullable();
      t.foreign('clientId').references('Cliente.id').onDelete('CASCADE');
      t.uuid('companyId').nullable();
      t.foreign('companyId').references('Empresa.id').onDelete('SET NULL');
      t.uuid('projectId').nullable();
      t.foreign('projectId').references('Projeto.id').onDelete('SET NULL');
      t.uuid('salesRepUserId').nullable();
      t.foreign('salesRepUserId').references('User.id').onDelete('SET NULL');
      t.uuid('creatorId').nullable();
      t.foreign('creatorId').references('User.id').onDelete('SET NULL');

      t.double('subtotal').notNullable().defaultTo(0);
      t.double('discount').notNullable().defaultTo(0);
      t.double('shippingCost').notNullable().defaultTo(0);
      t.double('taxAmount').notNullable().defaultTo(0);
      t.double('totalAmount').notNullable().defaultTo(0);

      t.text('paymentMethod').nullable();
      t.text('paymentCondition').nullable();
      t.text('shippingMethod').nullable();
      t.text('trackingCode').nullable();
      t.text('deliveryInstructions').nullable();
      t.jsonb('shippingAddress').nullable().defaultTo('{}');
      t.jsonb('billingAddress').nullable().defaultTo('{}');
      t.text('notes').nullable();
      t.text('cancellationReason').nullable();
      t.timestamp('cancelledAt', { useTz: true }).nullable();

      t.timestamp('orderDate', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      t.timestamp('shippingDate', { useTz: true }).nullable();
      t.timestamp('deliveryDate', { useTz: true }).nullable();

      timestamps(t, knex);
      t.timestamp('deletedAt', { useTz: true }).nullable();

      t.index(['clientId']);
      t.index(['companyId']);
      t.index(['projectId']);
      t.index(['salesRepUserId']);
      t.index(['status']);
      t.index(['phase']);
      t.index(['orderNumber']);
      t.index(['orderDate']);
      t.index(['deletedAt']);
    });
  }

  const hasOrderItemTable = await knex.schema.hasTable('OrderItem');
  if (!hasOrderItemTable) {
    await knex.schema.createTable('OrderItem', (t) => {
      textPk(t, knex);
      t.uuid('orderId').notNullable();
      t.foreign('orderId').references('Order.id').onDelete('CASCADE');
      t.uuid('productId').nullable();
      t.text('productCode').nullable();
      t.text('productName').notNullable();
      t.text('unit').notNullable().defaultTo('MILHEIRO');
      t.double('quantity').notNullable();
      t.double('unitPrice').notNullable();
      t.double('discount').notNullable().defaultTo(0);
      t.double('totalPrice').notNullable();
      t.text('notes').nullable();
      t.enu('type', [...ORDER_ITEM_TYPE], {
        useNative: false,
        existingType: false,
        enumName: 'OrderItem_type',
      })
        .notNullable()
        .defaultTo('PRODUCT');

      timestamps(t, knex);
      t.timestamp('deletedAt', { useTz: true }).nullable();

      t.index(['orderId']);
      t.index(['productId']);
      t.index(['deletedAt']);
    });
  }

  const hasOrderTaskTable = await knex.schema.hasTable('OrderTask');
  if (!hasOrderTaskTable) {
    await knex.schema.createTable('OrderTask', (t) => {
      textPk(t, knex);
      t.uuid('orderId').notNullable();
      t.foreign('orderId').references('Order.id').onDelete('CASCADE');
      t.uuid('taskId').notNullable();
      t.foreign('taskId').references('Task.id').onDelete('CASCADE');
      t.text('relationshipType').notNullable().defaultTo('PRODUCT');
      t.boolean('autoCreated').notNullable().defaultTo(false);
      t.text('notes').nullable();
      t.timestamp('createdAt', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      t.unique(['orderId', 'taskId']);
      t.index(['orderId']);
      t.index(['taskId']);
    });
  }

  const hasOrderId = await knex.schema.hasColumn('Task', 'orderId');
  if (!hasOrderId) {
    await knex.schema.alterTable('Task', (t) => {
      t.uuid('orderId').nullable();
      t.text('orderNumber').nullable();
      t.double('orderTotal').nullable();
      t.index(['orderId']);
      t.index(['orderNumber']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasOrderId = await knex.schema.hasColumn('Task', 'orderId');
  if (hasOrderId) {
    await knex.schema.alterTable('Task', (t) => {
      t.dropColumn('orderTotal');
      t.dropColumn('orderNumber');
      t.dropColumn('orderId');
    });
  }

  await knex.schema.dropTableIfExists('OrderTask');
  await knex.schema.dropTableIfExists('OrderItem');
  await knex.schema.dropTableIfExists('Order');
}
