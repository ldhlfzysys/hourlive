import type { User } from './IUser';

import type { BaseQuery } from '#/types/ISystem';

export interface Streamer {
  id: number;
  name: string;
  account: string;
  hide: number;
  create_time: string;
  user: User;
}

export interface StreamerCreate {
  name: string;
  account: string;
  password: string;
}

export interface PlatformerCreate {
  account: string;
  password: string;
}

export interface StreamerQuery extends BaseQuery {
  ids: number[];
  agency_id: number;
}
