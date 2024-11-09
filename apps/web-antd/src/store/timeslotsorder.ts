import type {
  OrderQuery,
  StanderResult,
  TimeslotOrder,
  TimeslotOrderCreate,
  TimeslotOrderFormState,
} from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// 定义API端点的枚举
enum TimeslotOrderApi {
  CreateTimeslotOrder = 'timeslotorder/create',
  QueryTimeslotOrder = 'timeslotorder/query',
  UpdateTimeslotOrder = 'timeslotorder/update',
}

// 获取所有时段订单
function getAllTimeslotOrders(params?: OrderQuery) {
  return requestClient.post<StanderResult<TimeslotOrder[]>>(
    TimeslotOrderApi.QueryTimeslotOrder,
    params,
  );
}

// 创建新的时段订单
function newTimeslotOrder(params: TimeslotOrderCreate) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    TimeslotOrderApi.CreateTimeslotOrder,
    params,
  );
}

// 更新现有的时段订单
function updateTimeslotOrder(params: TimeslotOrder) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    TimeslotOrderApi.UpdateTimeslotOrder,
    params,
  );
}

// 定义Pinia store
export const useTimeslotOrderStore = defineStore('timeslotorder-store', () => {
  const timeslotOrderLoading = ref(false);
  const timeslotOrderCreateLoading = ref(false);
  const timeslotOrderCreate = ref<TimeslotOrderCreate>({
    content_id: 0,
    room_id: 0,
    timeslots: [],
  });

  const isEditing = ref(false);
  const timeslotOrders = ref<Map<number, TimeslotOrder>>(new Map());

  const orderById = computed(() => {
    return (id: number) => timeslotOrders.value.get(id);
  });

  const timeslotOrderList = computed(() => {
    return [...timeslotOrders.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, timeslotOrder]) => timeslotOrder);
  });

  const showModal = ref(false);

  const formState = ref<TimeslotOrderFormState>({});

  const timeslotOrderQuery = ref<OrderQuery>({
    agency_id: -1,
    begin_date: '',
    content_id: -1,
    customer_id: -1,
    finish_date: '',
    room_id: -1,
  });

  function $reset() {
    timeslotOrderLoading.value = false;
    timeslotOrderCreateLoading.value = false;
    timeslotOrderQuery.value = {
      agency_id: -1,
      begin_date: '',
      content_id: -1,
      customer_id: -1,
      finish_date: '',
      room_id: -1,
    };
    timeslotOrders.value = new Map();
    formState.value = {};
  }

  async function queryTimeslotOrder() {
    try {
      timeslotOrderLoading.value = true;
      timeslotOrderQuery.value.q_size = 99_999;
      const res = await getAllTimeslotOrders(timeslotOrderQuery.value);
      if (res.success) {
        res.data.forEach((timeslotOrder) => {
          timeslotOrders.value.set(timeslotOrder.id, timeslotOrder);
        });
      }
    } finally {
      timeslotOrderLoading.value = false;
    }
  }

  async function createTimeslotOrder() {
    try {
      if (!timeslotOrderCreate.value.room_id) {
        notification.error({
          description: $t('请输入房间ID'),
          message: $t('验证失败'),
        });
        return;
      }
      timeslotOrderCreateLoading.value = true;

      const res = await newTimeslotOrder(timeslotOrderCreate.value);
      if (res.success) {
        timeslotOrders.value.set(res.data.id, res.data);
        showModal.value = false;
        timeslotOrderCreate.value = {
          content_id: 0,
          room_id: 0,
          timeslots: [],
        };
        notification.success({
          description: $t('新增时段订单成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      timeslotOrderCreateLoading.value = false;
    }
  }

  async function modifyTimeslotOrder(updatedOrder: TimeslotOrder) {
    try {
      timeslotOrderLoading.value = true;
      const res = await updateTimeslotOrder(updatedOrder);
      if (res.success) {
        timeslotOrders.value.set(res.data.id, res.data);
        showModal.value = false;
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      timeslotOrderLoading.value = false;
    }
  }

  return {
    $reset,
    createTimeslotOrder,
    formState,
    isEditing,
    modifyTimeslotOrder,
    orderById,
    queryTimeslotOrder,
    showModal,
    timeslotOrderCreate,
    timeslotOrderCreateLoading,
    timeslotOrderList,
    timeslotOrderLoading,
    timeslotOrderQuery,
    timeslotOrders,
  };
});
