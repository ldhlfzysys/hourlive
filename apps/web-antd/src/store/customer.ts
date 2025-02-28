import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model
import type {
  BaseQuery,
  CustomerRead,
  StandardResponse,
} from '#/types/schemas';

// 更新类型引用
async function _queryCustomer() {
  return requestClient.get<StandardResponse>(`customer/query`);
}

async function _queryCustomerByIds(params: BaseQuery) {
  return requestClient.post<StandardResponse>(`customer/query/ids`, params);
}

async function _hideCustomer(params: BaseQuery) {
  return requestClient.post<StandardResponse>(`customer/hide`, params);
}

// async function _getCustomerHomeInfo() {
//   return requestClient.post<StandardResponse>('home/customerhome');
// }

// Store
export const useCustomerStore = defineStore('customer-store', () => {
  // data
  const customers = ref<Map<number, CustomerRead>>(new Map());
  const customerList = computed(() => {
    return [...customers.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, customer]) => customer);
  });
  // const customerHomeInfo = ref<CustomerHomeInfo>();

  // UI - loading
  const queryCustomerLoading = ref(false);
  const hideCustomerLoading = ref(false);

  // 适配select组件
  const customerOptions = computed(() => {
    return customerList.value.map((item: CustomerRead) => ({
      label: item.code,
      value: item.id,
    }));
  });

  async function customerById(id: number) {
    const customer = customers.value.get(id);
    if (customer) {
      return customer;
    } else {
      queryCustomerLoading.value = true;
      const res = await _queryCustomerByIds({ ids: [id] });
      if (res.success && res.data && res.data.length > 0) {
        res.data.forEach((customer: CustomerRead) => {
          if (customer.id) {
            customers.value.set(customer.id, customer);
          }
        });
      }
      queryCustomerLoading.value = false;
      return customers.value.get(id);
    }
  }

  async function hideCustomer(id: number) {
    hideCustomerLoading.value = true;
    const res = await _hideCustomer({ id });
    if (res.success) {
      customers.value.delete(id);
    }
    hideCustomerLoading.value = false;
  }

  async function fetchCustomers() {
    queryCustomerLoading.value = true;
    const res = await _queryCustomer();
    if (res.success && res.data) {
      res.data.forEach((customer: CustomerRead) => {
        if (customer.id) {
          customers.value.set(customer.id, customer);
        }
      });
    }
    queryCustomerLoading.value = false;
  }

  async function fetchCustomerHomeInfo() {
    // const res = await _getCustomerHomeInfo();
    // customerHomeInfo.value = res.data;
  }

  function $reset() {
    customers.value.clear();
    // customerHomeInfo.value = undefined;
  }
  function setCustomers(cs: CustomerRead[]) {
    cs.forEach((c) => {
      if (c.id) {
        customers.value.set(c.id, c);
      }
    });
  }

  return {
    $reset,
    customerById,
    // customerHomeInfo,
    customerList,
    customerOptions,
    customers,
    fetchCustomerHomeInfo,
    fetchCustomers,
    hideCustomer,
    hideCustomerLoading,
    queryCustomerLoading,
    setCustomers,
  };
});
