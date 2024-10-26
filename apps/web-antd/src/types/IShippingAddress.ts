import type { BaseQuery } from '#/types/ISystem';

export interface ShippingAddressCreate {
  address: string;
  remark: string;
}

export interface ShippingAddressUpdate {
  id: number;
  address: string;
  remark: string;
}

export interface ShippingAddress {
  id: number;
  address: string;
  remark: string;
  hide?: number;
}

export interface ShippingAddressQuery extends BaseQuery {
  agency_id: number;
}
