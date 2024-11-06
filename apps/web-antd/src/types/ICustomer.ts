import type { Content } from './IContent';
import type { HourliveMoneyRecord } from './IHourliveMoneyRecord';
import type { Recharge } from './IRecharge';
import type { Sample } from './ISample';
import type { SampleShipping } from './IShipping';
import type { TimeslotOrder } from './ITimeslotOrder';
import type { User } from './IUser';

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

export interface CustomerUpdate {
  id: number;
  code?: string;
  hide: number;
  source: string;
}
