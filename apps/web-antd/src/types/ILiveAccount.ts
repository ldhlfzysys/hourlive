import type { Customer } from './IUser';

export interface LiveAccount {
  id: number;
  create_time: string;
  update_time: string;
  name: string; // 店铺名
  code: string; // 店铺code
  platform: string;
  live_account: string; // 直播账号
  live_uid: string; // 直播uid
  mobile: string;
  email: string;
  password: string;
  customer_id: number;
  customer?: Customer;
}

export interface LiveAccountCreate {
  name: string;
  mobile: string;
  platform: string;
  live_account: string;
  password: string;
}

export interface LiveAccountUpdate {
  id: number;
  name: string;
  mobile: string;
  platform: string;
  live_account: string;
  password: string;
}

export interface LiveAccountDelete {
  id: number;
}
