import type {
  ShippingAddress,
  ShippingAddressCreate,
  ShippingAddressQuery,
  StanderResult,
} from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

enum ShippingAddressApi {
  CreateShippingAddress = 'shipping_address/create',
  QueryShippingAddress = 'shipping_address/query',
  UpdateShippingAddress = 'shipping_address/update',
}

function getAllShippingAddress(params?: ShippingAddressQuery) {
  return requestClient.post<StanderResult<ShippingAddress[]>>(
    ShippingAddressApi.QueryShippingAddress,
    params,
  );
}

function newShippingAddress(params: ShippingAddressCreate) {
  return requestClient.post<StanderResult<ShippingAddress>>(
    ShippingAddressApi.CreateShippingAddress,
    params,
  );
}

function updateShippingAddress(params: ShippingAddress) {
  return requestClient.post<StanderResult<ShippingAddress>>(
    ShippingAddressApi.UpdateShippingAddress,
    params,
  );
}

export const useShippingAddressStore = defineStore(
  'shippingaddress-store',
  () => {
    const shippingAddressLoading = ref(false);
    const shippingAddressCreateLoading = ref(false);
    const shippingAddressCreate = ref<ShippingAddressCreate>({
      address: '',
      remark: '',
    });

    const shippingAddresses = ref<Map<number, ShippingAddress>>(new Map());

    const shippingAddressList = computed(() => {
      return [...shippingAddresses.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA)
        .map(([_, shippingAddress]) => shippingAddress);
    });

    const showModal = ref(false);

    const shippingAddressQuery = ref<ShippingAddressQuery>({
      agency_id: -1,
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    });

    function $reset() {
      shippingAddressLoading.value = false;
      shippingAddressCreateLoading.value = false;
      shippingAddressQuery.value.q_id = -1;

      shippingAddressQuery.value = {
        agency_id: -1,
        q_id: -1,
        q_order: 'desc',
        q_size: 5,
      };
      shippingAddresses.value = new Map();
    }

    async function queryShippingAddress() {
      try {
        shippingAddressLoading.value = true;
        const res = await getAllShippingAddress(shippingAddressQuery.value);
        if (res.success) {
          if (res.data.length > 0) {
            const lastShippingAddress = res.data.at(-1);
            if (lastShippingAddress) {
              shippingAddressQuery.value.q_id = lastShippingAddress.id;
            }
          }
          res.data.forEach((shippingAddress) => {
            shippingAddresses.value.set(shippingAddress.id, shippingAddress);
          });
        }
      } finally {
        shippingAddressLoading.value = false;
      }
    }

    async function createShippingAddress() {
      try {
        shippingAddressCreateLoading.value = true;
        const res = await newShippingAddress(shippingAddressCreate.value);
        if (res.success) {
          shippingAddresses.value.set(res.data.id, res.data);
        } else {
          notification.error({
            description: res.message,
            message: $t('addfail'),
          });
        }
      } finally {
        shippingAddressCreateLoading.value = false;
      }
    }

    async function modifyShippingAddress(updatedAddress: ShippingAddress) {
      try {
        shippingAddressLoading.value = true;
        const res = await updateShippingAddress(updatedAddress);
        if (res.success) {
          shippingAddresses.value.set(res.data.id, res.data);
        } else {
          notification.error({
            description: res.message,
            message: $t('updatefail'),
          });
        }
      } finally {
        shippingAddressLoading.value = false;
      }
    }

    return {
      $reset,
      createShippingAddress,
      modifyShippingAddress,
      queryShippingAddress,
      shippingAddressCreate,
      shippingAddressCreateLoading,
      shippingAddresses,
      shippingAddressList,
      shippingAddressLoading,
      shippingAddressQuery,
      showModal,
    };
  },
);
