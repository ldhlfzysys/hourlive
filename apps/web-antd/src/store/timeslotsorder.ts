import type {
  CancelTimeSlot,
  OrderQuery,
  StanderResult,
  TimeslotCreateInMany,
  TimeslotModel,
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
  CancelTimeslotOrder = 'timeslotorder/cancel',
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

// 取消时段订单
function cancelTimeslotOrder(params: CancelTimeSlot) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    TimeslotOrderApi.CancelTimeslotOrder,
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
  const confirmLoading = ref(false);
  // const formRef = ref<FormInstance>();

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
        res.data.forEach((timeslotOrder: TimeslotOrder) => {
          timeslotOrders.value.set(timeslotOrder.id, timeslotOrder);
        });
      }
    } finally {
      timeslotOrderLoading.value = false;
    }
  }

  function generateTimeslots() {
    if (
      formState.value.liveTime === undefined ||
      formState.value.timeslot === undefined
    ) {
      return;
    }
    let startTime = formState.value.liveTime[0];
    const endTime = formState.value.liveTime[1];
    const timeslots: TimeslotModel[] = [];

    while (startTime.isSame(endTime) || startTime.isBefore(endTime)) {
      timeslots.push({
        canEdit: true,
        date: startTime.clone(),
        slot: formState.value.timeslot,
      });
      startTime = startTime.add(1, 'day');
    }

    formState.value.timeslots = timeslots;
  }

  async function deleteOrders(slot: CancelTimeSlot) {
    const res = await cancelTimeslotOrder(slot);
    if (res.success) {
      notification.success({
        description: $t('deleteorder'),
        message: $t('success'),
      });
    }
  }

  async function makeOrders() {
    if (formState.value.timeslots === undefined) {
      return;
    }

    // await formRef.value?.validateFields().then((values) => {
    //   console.log(values);
    // });

    const timeslots: TimeslotCreateInMany[] = [];

    formState.value.timeslots.forEach((slot) => {
      if (slot.canEdit) {
        const startDate = Array.isArray(slot.date) ? slot.date[0] : slot.date;
        const endDate = Array.isArray(slot.date) ? slot.date[1] : slot.date;
        const timeslot: TimeslotCreateInMany = {
          date: startDate.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD'),
          end_time: slot.slot[1].format('HH:mm'),
          hourlive_money_cost: 0,
          start_time: slot.slot[0].format('HH:mm'),
        };
        timeslots.push(timeslot);
      }
    });

    if (timeslots.length === 0) {
      confirmLoading.value = false;
      notification.warning({
        description: $t('currentnochange'),
        message: $t('warning'),
      });
      return;
    }

    const params: TimeslotOrderCreate = {
      content_id: formState.value.contentId ?? -1,
      room_id: formState.value.roomId ?? -1,
      timeslots,
    };

    params.id =
      formState.value.orderId === undefined ? -1 : formState.value.orderId;

    timeslotOrderCreate.value = params;
    createTimeslotOrder();
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
      if (res && res.success) {
        timeslotOrders.value.set(res.data.id, res.data);
        showModal.value = false;
        timeslotOrderCreate.value = {
          content_id: -1,
          room_id: -1,
          timeslots: [],
        };
        formState.value = {};
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

  async function deleteTimeslotOrders() {
    try {
      timeslotOrderLoading.value = true;
      const res = await cancelTimeslotOrder(timeslotOrderCreate.value);
    } finally {
      timeslotOrderLoading.value = false;
    }
  }

  async function modifyTimeslotOrder(updatedOrder: TimeslotOrder) {
    try {
      timeslotOrderLoading.value = true;
      const res = await updateTimeslotOrder(updatedOrder);
      if (res && res.success) {
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
    confirmLoading,
    createTimeslotOrder,
    deleteOrders,
    deleteTimeslotOrders,
    formState,
    generateTimeslots,
    isEditing,
    makeOrders,
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
