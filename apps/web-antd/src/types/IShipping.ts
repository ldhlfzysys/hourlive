import type { Sample } from './ISample';
import type { BaseQuery } from './ISystem';
import type { Agency, Customer } from './IUser';

export interface AgencyShippingQuery {
  customer_id: number;
  delivery_approval: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SampleShippingQuery extends BaseQuery {}

export interface SampleShipping {
  id?: number;
  update_time?: string; // DateTime in ISO format
  status?: number; // 0未发货 1配送中 2已送达 3异常
  shipping_time?: string; // DateTime in ISO format
  express_company?: string;
  tracking_number?: string;
  sender_name?: string;
  sender_time?: string; // DateTime in ISO format
  receiver_name?: string;
  receiver_time?: string; // DateTime in ISO format
  delivery_approval?: string;
  customer_id?: number;
  agency_id?: number;
  allsamples?: Sample[];
  samples?: Sample[];
  customer?: Customer;
  agency?: Agency;
}

export interface SampleShippingSample {
  sampleshipping_id: number;
  sample_id: number;
}
export interface SampleShippingCreate {
  shipping_time?: string; // DateTime in ISO format
  express_company?: string;
  tracking_number?: string;
  sender_name?: string;
  sender_time?: string; // DateTime in ISO format
  receiver_name?: string;
  receiver_time?: string; // DateTime in ISO format
  receiver_address?: string;
  samples: SampleShippingSample[];
  agency_id: number;
}

export interface SampleShippingUpdateByAgency {
  id: number;
  receiver_name?: string;
  delivery_approval: string;
}
