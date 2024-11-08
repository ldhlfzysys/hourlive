import { ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type {
  OrderQuery,
  StanderResult,
  TimeslotCreate,
  TimeslotOrder,
  TimeslotOrderFormState,
} from '#/types';

// API
const API_PREFIX = '/timeslotorder';
enum OrderApi {
  AllOrders = 'query',
  CancelOrders = 'cancelorders',
  MakeOrders = 'makeorders',
}

export function getAllOrder(params: OrderQuery) {
  return requestClient.post<StanderResult<TimeslotOrder[]>>(
    `${API_PREFIX}/${OrderApi.AllOrders}`,
    params,
  );
}

export function makeOrders(params: TimeslotCreate) {
  return requestClient.post<StanderResult<any>>(OrderApi.MakeOrders, params);
}

export function cancelOrder(params: { order_id: number }) {
  return requestClient.post<StanderResult<any>>(OrderApi.CancelOrders, params);
}

// Store Define
export const useTimeslotOrderStore = defineStore('timeslot-order-store', () => {
  const timeslotOrderMap = ref<Map<number, TimeslotOrder>>(new Map());
  const formState = ref<TimeslotOrderFormState>({});

  function clearCache() {
    timeslotOrderMap.value = new Map();
  }

  function resetFormState() {
    formState.value = {};
  }

  function $reset() {
    clearCache();
  }

  async function fetchOrders(params: OrderQuery) {
    params.q_size = 999_999;
    const res = await getAllOrder(params);
    res.data.forEach((order) => {
      timeslotOrderMap.value.set(order.id, order);
    });
  }

  function filterOrders(params?: OrderQuery): TimeslotOrder[] {
    return params ? [] : [...timeslotOrderMap.value.values()];
  }

  return {
    $reset,
    clearCache,
    fetchOrders,
    filterOrders,
    formState,
    resetFormState,
    timeslotOrderMap,
  };
});
