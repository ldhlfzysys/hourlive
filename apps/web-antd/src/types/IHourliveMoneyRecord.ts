import type { Recharge } from './IRecharge';
import type { TimeslotOrder } from './ITimeslotOrder';
import type { Customer } from './IUser';

export interface HourliveMoneyRecord {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  amount: number;
  before_amount: number;
  after_amount: number;
  type: number; // 1：充值 2：退款 3：下单 4：退单
  recharge_id?: number;
  timeslotorder_id?: number;
  customer_id: number;
  customer: Customer;
  timeslotorder: TimeslotOrder;
  recharge: Recharge;
}
