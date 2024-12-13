import type { Dayjs } from 'dayjs';

import type { BaseQuery } from './IBase';
import type { Content } from './IContent';
import type { HourliveMoneyRecord } from './IHourliveMoneyRecord';
import type { Room } from './IRoom';
import type { Timeslot, TimeslotCreateInMany } from './ITimeslot';
import type { Agency, Customer } from './IUser';

export interface TimeslotModel {
  id?: number;
  date: [Dayjs, Dayjs] | Dayjs;
  slot: [Dayjs, Dayjs];
  canEdit: boolean;
}

export interface TimeslotOrderFormState {
  liveTime?: [Dayjs, Dayjs]; // 直播时段
  timeslot?: [Dayjs, Dayjs]; // 时间段
  timeslots?: TimeslotModel[]; // 时间段数组
  agency?: number; // 机构id
  roomId?: number; // 直播间id
  contentId?: number | undefined; // 直播内容
  cost?: number; // 花费
  slotId?: number; // 时间段id
  orderId?: number; // 订单id
  status?: number; // 订单状态
  customer?: string; // 客户
  enableEdit?: boolean; // 是否可编辑
  formType?: 'add' | 'apend'; // 表单类型
}

export interface TimeslotOrder {
  id: number;
  agency?: Agency;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  order_price: number;
  status: number; // 1下单 2退单
  customer_id: number;
  agency_id: number;
  customer: Customer;
  hourlivemoneyrecords: HourliveMoneyRecord[];
  contents: Content[];
  timeslots: Timeslot[];
  room_id?: number;
  room?: Room;

  // 补贴相关
  tts_subsidy: number;
  tts_subsidy_remark: string;
  ads_subsidy: number;
  ads_subsidy_remark: string;
  subsidy_type: string;

  // 前端使用的字段
  start?: string;
  end?: string;
  slotId?: number;
}

export interface TimeslotTimeslotOrder {
  timeslot_id: number;
  timeslotorder_id: number;
}

export interface Order {
  room_id: number;
  content_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hourlive_money_cost: number;
}
export interface ContentTimeslotOrder {
  content_id: number;
  timeslotorder_id: number;
}

export interface DayOrder {
  total_count: number;
  total_duration: number;
}

export interface DayOrderMap {
  [date: string]: DayOrder;
}

export interface AddSubsidy {
  ids: number[];
  tts_subsidy: number;
  tts_subsidy_remark: string;
  ads_subsidy: number;
  ads_subsidy_remark: string;
  subsidy_type: string;
}

export interface CancelTimeSlot {
  timeslotorder_id: number;
  timeslot_ids: number[];
}

// Query
export interface OrderQuery extends BaseQuery {
  agency_id?: number;
  room_id?: number;
  content_id?: number;
  customer_id?: number;
  begin_date?: string;
  finish_date?: string;
}

export interface TimeslotCreate {
  date: string; // Format: YYYY-MM-DD
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
  hourlive_money_cost: number; // 消耗，这个时段如果要定，需要多少平台币
}

export interface TimeslotOrderCreateWithContent {
  timeslotorder_id: number;
  content_id: number;
}

export interface TimeslotOrderCreate {
  id?: number;
  room_id?: number; // 必填，直播间ID
  content_id?: number;
  timeslots?: TimeslotCreateInMany[];
}

export interface TimeslotOrderSubsidy {
  ids: number[];
  timeslotorder_id: number;
  subsidy_type?: string;
  tts_subsidy?: number;
  tts_subsidy_remark?: string;
  ads_subsidy?: number;
  ads_subsidy_remark?: string;
}
