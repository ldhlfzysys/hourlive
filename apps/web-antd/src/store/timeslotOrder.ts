import { ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type {
  OrderQuery,
  StanderResult,
  TimeslotCreate,
  TimeslotOrder,
} from '#/types';

// API
enum OrderApi {
  AllOrders = 'getallorders',
  CancelOrders = 'cancelorders',
  MakeOrders = 'makeorders',
}

export function getAllOrder(params: OrderQuery) {
  return requestClient.post<StanderResult<TimeslotOrder[]>>(
    OrderApi.AllOrders,
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

  function $reset() {
    timeslotOrderMap.value = new Map();
  }

  function fetchOrders(params: OrderQuery) {
    getAllOrder(params).then((res) => {
      console.log(res);
    });
  }

  return {
    $reset,
    fetchOrders,
    timeslotOrderMap,
  };
});
