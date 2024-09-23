import type { HourliveMoneyRecord } from './IHourliveMoneyRecord';

export interface Recharge {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  pay_time?: string; // DateTime in ISO format
  amount: number;
  gift: number;
  state: number; // 0未支付，1已支付，2退款
  customer_id: number;
  hourlivemoneyrecord?: HourliveMoneyRecord;
}

export interface CreateRecharge {
  amount: number;
  gift: number;
  customer_id: number;
}
