import type { Room } from './IRoom';
import type { Streamer } from './IStreamer';
import type { TimeslotOrder } from './ITimeslotOrder';

export interface Timeslot {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  date: string; // deprecated Format YYYY-MM-DD
  end_date: string; // deprecated Format YYYY-MM-DD
  start_time: string; // Format HH:MM
  end_time: string; // Format HH:MM
  hourlive_money_cost: number;
  room_id: number;
  timeslotorders: TimeslotOrder[];
  room: Room;
  streamers?: Streamer[];

  begin_date: string; // Format YYYY-MM-DD
  finish_date: string; // Format YYYY-MM-DD
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
  roomID: number;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
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
