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
