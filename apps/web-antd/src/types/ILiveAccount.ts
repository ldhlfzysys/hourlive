import type { BaseQuery } from './ISystem';
import type { Customer } from './IUser';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LiveAccountQuery extends BaseQuery {}

export interface LiveAccount {
  id?: number;
  create_time?: string;
  update_time?: string;
  name?: string; // 店铺名
  code?: string; // 店铺code
  platform?: string;
  live_account?: string; // 直播账号
  live_uid?: string; // 直播uid
  mobile?: string;
  email?: string;
  password?: string;
  customer_id?: number;
  customer?: Customer;
}

export interface LiveAccountDelete {
  id: number;
}
