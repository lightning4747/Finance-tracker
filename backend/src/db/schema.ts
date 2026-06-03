import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
  id:          text('id').primaryKey(),
  setuTxnId:   text('setu_txn_id').unique().notNull(),
  amount:      real('amount').notNull(),
  type:        text('type', { enum: ['DEBIT', 'CREDIT'] }).notNull(),
  mode:        text('mode').notNull(),
  narration:   text('narration').notNull(),
  sender:      text('sender'),
  receiver:    text('receiver'),
  balance:     real('balance').notNull(),
  timestamp:   text('timestamp').notNull(),
  valueDate:   text('value_date').notNull(),
  tags:        text('tags', { mode: 'json' }).$type<string[]>().notNull(),
  isOutlier:   integer('is_outlier', { mode: 'boolean' }).notNull().default(false),
  accountId:   text('account_id').notNull(),
  createdAt:   text('created_at').notNull(),
});

export const tags = sqliteTable('tags', {
  id:    text('id').primaryKey(),
  name:  text('name').unique().notNull(),
  color: text('color').notNull().default('#6366f1'),
});

export const accounts = sqliteTable('accounts', {
  id:                text('id').primaryKey(),
  maskedAccNumber:   text('masked_acc_number').notNull(),
  fipId:             text('fip_id').notNull(),
  linkRefNumber:     text('link_ref_number').notNull(),
  lastFetchedAt:     text('last_fetched_at'),
});
