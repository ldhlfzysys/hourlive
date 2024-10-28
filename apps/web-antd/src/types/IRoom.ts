import type { BaseQuery } from './ISystem';
import type { Timeslot, TimeslotCreate } from './ITimeslot';

export interface Room {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  name: string;
  agency_id: number;
  timeslots: Timeslot[];
}

export interface RoomCreate {
  name: string;
  timeslots?: TimeslotCreate[];
  agency_id: number;
}

export interface RoomUpdate {
  id: number;
  name: string;
}

export interface RoomDelete {
  id: number;
}

export interface RoomList {
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
}

export interface RoomQuery extends BaseQuery {
  agency_id: number;
  ids: number[];
}
