import type { Content } from './IContent';
import type { HourliveMoneyRecord } from './IHourliveMoneyRecord';
import type { Recharge } from './IRecharge';
import type { Room } from './IRoom';
import type { Sample } from './ISample';
import type { SampleShipping } from './IShipping';
import type { ShippingAddress } from './IShippingAddress';
import type { TimeslotOrder } from './ITimeslotOrder';

export interface Auth {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  name: string;
  code: string;
  role_id: number;
}

export interface Role {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  name: string;
  auths: Auth[];
}

export interface User {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  account: string;
  hashed_password: string;
  user_type: number; // 0普通用户 1机构主体 2顾客主体 8管理员
  role: Role;
  role_id?: number;
  customer?: Customer;
  agency?: Agency;
  home?: string;
  /**
   * 用户姓名
   */
  name?: string;
  /**
   * 用户头像
   */
  avatar?: string;
  /**
   * 用户手机号
   */
  mobile?: string;
  /**
   * 用户邮箱
   */
  email?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  account: string;
  password: string;
  user_type: number; // 0普通 1机构 2客户 8管理员
  name?: string; // 机构名称
  shipping_address?: string; // 机构收货地址
  code?: string; // 客户号
}

export interface SuperContentQuery {
  customer_id: number;
  liveaccount_id: number;
}

export interface CustomerAndAgencyQuery {
  customer_id: number;
  agency_id: number;
  delivery_approval: string;
}

export interface Customer {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  code?: string;
  hourlive_money: number;
  user_id: number;
  user: User;
  hide: number;
  source: string;
  timeslotorders: TimeslotOrder[];
  recharges: Recharge[];
  contents: Content[];
  hourlivemoneyrecords: HourliveMoneyRecord[];
  samples: Sample[];
  sampleshippings: SampleShipping[];
}

export interface Agency {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  name: string;
  shipping_address?: string;
  user_id: number;
  rooms: Room[];
  samples?: Sample[];
  status?: number;
  shippingaddress?: ShippingAddress[];
}

export interface AgencyUpdate {
  id: number;
  name: string;
  shipping_address?: string;
  shipping_address_list?: ShippingAddress[];
}

export interface CustomerUpdate {
  id: number;
  code?: string;
  hide: number;
  source: string;
}

export interface UserResetpassword {
  id: number;
  password: string; // base64 encoded
  password_confirm: string;
}
