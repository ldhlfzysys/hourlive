import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type {
  IdQuery,
  SampleShipping,
  SampleShippingCreate,
  SampleShippingQuery,
  SampleShippingUpdateByAgency,
  ShippingAddress,
  StanderResult,
} from '#/types';

// Query

// API
enum SampleShippingApi {
  AllSampleShipping = 'getallsampleshippings',
  CreateSampleShipping = 'createsampleshipping',
  CreateShippingAddress = 'createshippingaddress',

  DeleteShippingAddress = 'deleteshippingaddress',
  GetShippingAddresss = 'getshippingaddresss',
  UpdateSampleShipping = 'updatesampleshipping',
  UpdateShippingAddress = 'updateshippingaddress',
}

export function getAllSampleShippings(params?: SampleShippingQuery) {
  return requestClient.post<StanderResult<SampleShipping[]>>(
    SampleShippingApi.AllSampleShipping,
    params,
  );
}

export function createSampleShipping(params: SampleShippingCreate) {
  return requestClient.post<StanderResult<SampleShipping>>(
    SampleShippingApi.CreateSampleShipping,
    params,
  );
}

export function updateSampleShipping(params: SampleShippingUpdateByAgency) {
  return requestClient.post<StanderResult<SampleShipping>>(
    SampleShippingApi.UpdateSampleShipping,
    params,
  );
}

export async function getShippingAddresss() {
  return requestClient.post<StanderResult<ShippingAddress[]>>(
    SampleShippingApi.GetShippingAddresss,
  );
}

export async function createShippingAddress(params: ShippingAddress) {
  return requestClient.post<StanderResult<ShippingAddress>>(
    SampleShippingApi.CreateShippingAddress,
    params,
  );
}

export async function updateShippingAddress(params: ShippingAddress) {
  return requestClient.post<StanderResult<ShippingAddress>>(
    SampleShippingApi.UpdateShippingAddress,
    params,
  );
}

export async function deleteShippingAddress(params: IdQuery) {
  return requestClient.post<StanderResult<any>>(
    SampleShippingApi.DeleteShippingAddress,
    params,
  );
}

// store
export const useSampleShippingStore = defineStore(
  'sample-shipping-store',
  () => {
    const sampleShippingMap = ref<Map<number, SampleShipping>>(new Map());
    const shippingAddressList = computed(() => {
      return [...sampleShippingMap.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
        .map(([_, shippingAddress]) => shippingAddress); // 转换为ShippingAddress的list
    });

    function $reset() {}

    return {
      $reset,

      shippingAddressList,
    };
  },
);
