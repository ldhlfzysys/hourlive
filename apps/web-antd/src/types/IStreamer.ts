import type { User } from './IUser';

import type { BaseQuery } from '#/types/ISystem';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Streamer {
  id?: number;
  name?: string;
  account?: string;
  password?: string;
  hide?: number;
  create_time?: string;
  user?: User;
  country?: string;
  desc?: string;
  avatar?: string;
  tags?: Tag[];
}

export interface StreamerQuery extends BaseQuery {
  ids: number[];
  agency_id: number;
}
