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

// 定义API端点的枚举
enum ShippingAddressApi {
  CreateShippingAddress = 'shipping_address/create', // 创建地址
  QueryShippingAddress = 'shipping_address/query', // 查询地址
  UpdateShippingAddress = 'shipping_address/update', // 更新地址
}

// 获取所有收货地址
function getAllShippingAddress(params?: ShippingAddressQuery) {
  return requestClient.post<StanderResult<ShippingAddress[]>>(
    ShippingAddressApi.QueryShippingAddress,
    params,
  );
}

// 创建新的收货地址
function newShippingAddress(params: ShippingAddressCreate) {
  return requestClient.post<StanderResult<ShippingAddress>>(
    ShippingAddressApi.CreateShippingAddress,
    params,
  );
}

// 更新现有的收货地址
function updateShippingAddress(params: ShippingAddress) {
  return requestClient.post<StanderResult<ShippingAddress>>(
    ShippingAddressApi.UpdateShippingAddress,
    params,
  );
}

// 定义Pinia store
export const useShippingAddressStore = defineStore(
  'shippingaddress-store',
  () => {
    const shippingAddressLoading = ref(false); // 加载状态
    const shippingAddressCreateLoading = ref(false); // 创建加载状态
    const shippingAddressCreate = ref<ShippingAddressCreate>({
      address: '',
      remark: '',
    });

    const isEditing = ref(false); // 是否处于编辑状态

    const shippingAddresses = ref<Map<number, ShippingAddress>>(new Map()); // 存储收货地址的Map

    // 计算属性，返回排序后的收货地址列表
    const shippingAddressList = computed(() => {
      return [...shippingAddresses.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA)
        .map(([_, shippingAddress]) => shippingAddress);
    });

    const showModal = ref(false); // 控制模态框显示

    const shippingAddressQuery = ref<ShippingAddressQuery>({
      agency_id: -1,
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
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
        const res = await getAllShippingAddress(shippingAddressQuery.value);
        if (res && res.success) {
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

        const res = await newShippingAddress(shippingAddressCreate.value);
        if (res && res.success) {
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
    async function modifyShippingAddress(updatedAddress: ShippingAddress) {
      try {
        shippingAddressLoading.value = true;
        const res = await updateShippingAddress(updatedAddress);
        if (res && res.success) {
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

    // 返回store中的状态和方法
    return {
      $reset,
      createShippingAddress,
      isEditing, // 确保在返回对象中包含 isEditing
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
