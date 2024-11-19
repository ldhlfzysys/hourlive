import type { Content } from './IContent';
import type { SampleShipping } from './IShipping';
import type { BaseQuery } from './ISystem';
import type { Agency, Customer } from './IUser';

export interface SampleQuery extends BaseQuery {
  is_main?: string;
  customer_id?: number;
  ids?: number[];
  content_ids?: number[];
}

export interface Sample {
  id?: number;
  create_time?: string; // DateTime in ISO format
  update_time?: string; // DateTime in ISO format
  customer_id?: number;
  product_count?: number;
  product_image?: string;
  product_name?: string;
  hashtag?: string;
  product_id?: string;
  product_link?: string;
  product_srp?: string;
  product_final_price?: string;
  product_discount?: string;
  product_ksp?: string;
  product_script?: string;
  product_commission?: string;
  is_main?: string;
  contents?: Content[];
  sampleshippings?: SampleShipping[];
  agencys?: Agency[];
  customer?: Customer;
  sample_count?: number; // 样品数量
  isInAgency?: number; // 0没有， 1在途， 2有
}
