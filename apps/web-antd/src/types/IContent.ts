import type { LiveAccount } from './ILiveAccount';
import type { Sample } from './ISample';
import type { TimeslotOrder } from './ITimeslotOrder';
import type { Customer } from './IUser';

export interface AddSample {
  content_id: number;
  sample_ids: number[];
}

export interface Content {
  id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  customer_id: number;
  customer: Customer;
  is_feiyue: string;
  liveaccount_id?: number;
  liveaccount?: LiveAccount;
  content_link?: string;
  content_text?: string;
  content_desc?: string;
  samples: Sample[];
  timeslotorders: TimeslotOrder[];
}
