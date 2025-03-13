import type { Agency } from './IAgency';
import type { Room } from './IRoom';
import type { Streamer } from './IStreamer';
import type { TimeslotOrder } from './ITimeslotOrder';

export interface PublicTimeslot {
  timeslots: Timeslot[];
  agencies: Agency[];
}
export interface Timeslot {
  id?: number;
  create_time?: string; // DateTime in ISO format
  update_time?: string; // DateTime in ISO format
  date?: string; // deprecated Format YYYY-MM-DD
  end_date?: string; // deprecated Format YYYY-MM-DD
  start_time?: string; // Format HH:MM
  end_time?: string; // Format HH:MM
  hourlive_money_cost?: number;
  room_id?: number;
  timeslotorders?: TimeslotOrder[];
  room?: Room;
  streamers?: Streamer[];
  customers?: Customer[];
  hide?: number;
  begin_date?: string; // Format YYYY-MM-DD
  finish_date?: string; // Format YYYY-MM-DD
}

export interface TimeslotUpdate extends Timeslot {
  // 前端使用
  streamer_id?: number;
  customer_id?: number;
  create?: number;
  remove?: number;
  // 以下内容是前端排班fullcalendar生成需要使用的必要字段
  resourceId?: string; // 前端生成，服务端不存储，是日期_直播间id
  start?: string; // Format HH:MM
  end?: string; // Format HH:MM
}

export type DateTimeslot = {
  is_conflict: boolean;
  is_create: boolean;
  key: string;
} & Pick<
  Timeslot,
  'date' | 'end_time' | 'id' | 'room_id' | 'start_time' | 'timeslotorders'
>;

export interface TimeslotQuery {
  begin_date: string; // Format: YYYY-MM-DD
  finish_date: string; // Format: YYYY-MM-DD
}

export interface DateTimeslotQuery {
  roomID: number;
  dates: string[];
}

export interface TimeslotSave {
  timeslot_id?: number;
  date: string; // Format: YYYY-MM-DD
  start: string; // Format: HH:MM
  end: string; // Format: HH:MM
  streamer_id?: number;
  room_id: number;
}

export interface TimeslotCreate {
  date: string; // Format: YYYY-MM-DD
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
  hourlive_money_cost: number; // 消耗，这个时段如果要定，需要多少平台币
  streamers?: number[];
}

export interface TimeslotCreateInMany {
  id?: number;
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  hourlive_money_cost?: number;
  streamers?: number[];
}
