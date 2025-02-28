import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  BaseQuery,
  ShippingAddressRead,
  ShippingAddressUpdate,
  StandardResponse,
} from '#/types/schemas';

// API
function _getAllShippingAddress(params?: BaseQuery) {
  return requestClient.post<StandardResponse<ShippingAddressRead[]>>(
    'shipping_address/query',
    params,
  );
}

function _newShippingAddress(params: ShippingAddressUpdate) {
  return requestClient.post<StandardResponse<ShippingAddressRead>>(
    'shipping_address/create',
    params,
  );
}

function _updateShippingAddress(params: ShippingAddressUpdate) {
  return requestClient.post<StandardResponse<ShippingAddressRead>>(
    'shipping_address/update',
    params,
  );
}

// store
export const useShippingAddressStore = defineStore(
  'shippingaddress-store',
  () => {
    // data
    const shippingAddresses = ref<Map<number, ShippingAddressRead>>(new Map());

    const shippingAddressList = computed(() => {
      return [...shippingAddresses.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA)
        .map(([_, address]) => address);
    });

    // UI - loading
    const shippingAddressLoading = ref(false);
    const shippingAddressCreateLoading = ref(false);

    // UI - modal
    const showModal = ref(false);
    const isEditing = ref(false);

    const shippingAddressQuery = ref<BaseQuery>({
      agency_id: -1,
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    });

    const shippingAddressCreate = ref<ShippingAddressUpdate>({
      address: '',
      remark: '',
    });

    // 重置store状态
    function $reset() {
      shippingAddressLoading.value = false;
      shippingAddressCreateLoading.value = false;
      shippingAddressQuery.value.q_id = -1;

      shippingAddressQuery.value = {
        agency_id: -1,
        q_id: -1,
        q_order: 'desc',
        q_size: 30,
      };
      shippingAddresses.value = new Map();
    }

    // 查询收货地址
    async function queryShippingAddress() {
      try {
        shippingAddressLoading.value = true;
        const res = await _getAllShippingAddress(shippingAddressQuery.value);
        if (res && res.success) {
          if (res.data && res.data.length > 0) {
            const lastShippingAddress = res.data.at(-1);
            if (lastShippingAddress) {
              shippingAddressQuery.value.q_id = lastShippingAddress.id;
            }
          }
          res.data?.forEach((shippingAddress: ShippingAddressRead) => {
            if (shippingAddress.id) {
              shippingAddresses.value.set(shippingAddress.id, shippingAddress);
            }
          });
        }
      } finally {
        shippingAddressLoading.value = false;
      }
    }

    // 创建收货地址
    async function createShippingAddress() {
      try {
        if (!shippingAddressCreate.value.address) {
          notification.error({
            description: $t('请输入地址'),
            message: $t('验证失败'),
          });
          return;
        }
        shippingAddressCreateLoading.value = true;

        const res = await _newShippingAddress(shippingAddressCreate.value);
        if (res && res.success && res.data && res.data.id) {
          shippingAddresses.value.set(res.data.id, res.data);
          showModal.value = false;
          // 清空当前新增对象数据
          shippingAddressCreate.value = {
            address: '',
            remark: '',
          };
          notification.success({
            description: $t('新增收货地址成功'),
            message: $t('操作成功'),
          });
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

    // 修改收货地址
    async function modifyShippingAddress(
      updatedAddress: ShippingAddressUpdate,
    ) {
      try {
        shippingAddressLoading.value = true;
        const res = await _updateShippingAddress(updatedAddress);
        if (res && res.success && res.data && res.data.id) {
          if (res.data.hide === 1) {
            shippingAddresses.value.delete(res.data.id);
          } else {
            shippingAddresses.value.set(res.data.id, res.data);
          }
          showModal.value = false;
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
    function setShippingAddresses(rs: ShippingAddressRead[]) {
      rs.forEach((r) => {
        if (r.id) {
          shippingAddresses.value.set(r.id, r);
        }
      });
    }
    // 返回store中的状态和方法
    return {
      $reset,
      createShippingAddress,
      isEditing, // 确保在返回对象中包含 isEditing
      modifyShippingAddress,
      queryShippingAddress,
      setShippingAddresses,
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
