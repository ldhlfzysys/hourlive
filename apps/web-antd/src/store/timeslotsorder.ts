/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {
  CancelTimeSlot,
  OrderQuery,
  StanderResult,
  TimeslotCreateInMany,
  TimeslotModel,
  TimeslotOrder,
  TimeslotOrderCreate,
  TimeslotOrderFormState,
  TimeslotOrderSubsidy,
} from '#/types';

import { computed, ref, watch } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

function _subsidyTimeslotOrder(params: TimeslotOrderSubsidy) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    'super/subsidy',
    params,
  );
}

// 获取所有时段订单
function getAllTimeslotOrders(params?: OrderQuery) {
  return requestClient.post<StanderResult<TimeslotOrder[]>>(
    'timeslotorder/query',
    params,
  );
}

// 取消时段订单
function cancelTimeslotOrder(params: CancelTimeSlot) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    'timeslotorder/cancel',
    params,
  );
}

// 创建新的时段订单
function newTimeslotOrder(params: TimeslotOrderCreate) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    'timeslotorder/create',
    params,
  );
}

// 更新现有的时段订单
function updateTimeslotOrder(params: TimeslotOrder) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    'timeslotorder/update',
    params,
  );
}

// 定义Pinia store
export const useTimeslotOrderStore = defineStore('timeslotorder-store', () => {
  const timeslotOrderLoading = ref(false);
  const timeslotOrderCreateLoading = ref(false);
  const timeslotOrderSubsidyLoading = ref(false);
  const timeslotOrderSubsidyForm = ref<TimeslotOrderSubsidy>({
    ids: [],
    timeslotorder_id: -1,
  });
  const timeslotOrderCreate = ref<TimeslotOrderCreate>({
    content_id: 0,
    order_price: 0,
    order_title: '',
    room_id: 0,
    timeslots: [],
  });

  const currentSelectedOrder = ref<TimeslotOrder | undefined>();

  const isEditing = ref(false);
  watch(isEditing, (newVal) => {
    if (!newVal) {
      formState.value = {};
    }
  });

  const downloadLoading = ref(false);
  const timeslotOrders = ref<Map<number, TimeslotOrder>>(new Map());

  const orderById = computed(() => {
    return (id: number) => timeslotOrders.value.get(id);
  });

  const orderFilters = ref<{ key: string; value: number[] }[]>([]);

  const orderOptions = computed(() => {
    return [...timeslotOrders.value.entries()].map(([_, timeslotOrder]) => {
      const customer = timeslotOrder.customer;
      if (customer) {
        return {
          label: `${timeslotOrder.id} - ${customer.code}`,
          value: timeslotOrder.id,
        };
      }
      return {
        label: `${timeslotOrder.id}`,
        value: timeslotOrder.id,
      };
    });
  });

  const timeslotOrderList = computed(() => {
    let orders = [...timeslotOrders.value.entries()];
    if (orderFilters.value.length > 0) {
      for (const filter of orderFilters.value) {
        if (filter.key === 'agency') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return filter.value.includes(timeslotOrder.agency_id);
          });
        }
        if (filter.key === 'room') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return filter.value.includes(timeslotOrder.room_id!);
          });
        }

        if (filter.key === 'customer') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return filter.value.includes(timeslotOrder.customer_id);
          });
        }

        if (filter.key === 'content') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return timeslotOrder.contents.some((content) => {
              return filter.value.includes(content.id!);
            });
          });
        }
      }
    }

    return orders
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, timeslotOrder]) => timeslotOrder);
  });

  const showModal = ref(false);
  const confirmLoading = ref(false);
  const showEventDetails = ref(false);
  const showApendModal = ref(false);
  const showSubsidyModal = ref(false);
  // const formRef = ref<FormInstance>();

  const colorMap = ref<Map<number, string>>(new Map());

  const colorIndex = ref(0);

  function setCurrentSelectedOrder(id: number) {
    currentSelectedOrder.value = orderById.value(id);
  }

  function getEventClass(id: number, isPast: boolean) {
    const colorLength = 29;
    if (!colorMap.value.has(id)) {
      colorMap.value.set(id, `color-event-${colorIndex.value}`);
      colorIndex.value = (colorIndex.value + 1) % colorLength;
    }

    let color = colorMap.value.get(id)!;
    const order: TimeslotOrder | undefined = orderById.value(id);

    if (order && isPast) {
      color = `${color}-past`;
    }
    return color;
  }

  const canAppendOrder = computed(() => {
    return (
      formState.value.timeslots !== undefined &&
      formState.value.timeslots!.some(
        (timeslot) => timeslot.canEdit && timeslot.id === undefined,
      )
    );
  });

  const orderTotalTime = computed(() => {
    if (!formState.value.timeslots) {
      return 0;
    }
    return (
      formState.value.timeslots?.reduce((acc, timeslot) => {
        return (
          acc + Math.abs(timeslot.slot![1]!.diff(timeslot.slot![0]!, 'minutes'))
        );
      }, 0) / 60
    ).toFixed(2);
  });

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
    orderFilters.value = [];
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

  async function subsidyTimeslotOrder() {
    if (currentSelectedOrder.value) {
      timeslotOrderSubsidyForm.value.timeslotorder_id =
        currentSelectedOrder.value.id;
      timeslotOrderSubsidyForm.value.ids = [currentSelectedOrder.value.id];
    }
    if (timeslotOrderSubsidyForm.value.timeslotorder_id === -1) {
      notification.error({
        description: $t('请选择时段订单'),
        message: $t('error'),
      });
      return;
    }
    timeslotOrderSubsidyLoading.value = true;
    try {
      const res = await _subsidyTimeslotOrder(timeslotOrderSubsidyForm.value);
      if (res.success) {
        const timeslotOrder = timeslotOrders.value.get(
          timeslotOrderSubsidyForm.value.timeslotorder_id,
        );
        timeslotOrder!.ads_subsidy =
          timeslotOrderSubsidyForm.value.ads_subsidy!;
        timeslotOrder!.tts_subsidy =
          timeslotOrderSubsidyForm.value.tts_subsidy!;
        timeslotOrder!.ads_subsidy_remark =
          timeslotOrderSubsidyForm.value.ads_subsidy_remark!;
        timeslotOrder!.tts_subsidy_remark =
          timeslotOrderSubsidyForm.value.tts_subsidy_remark!;
        timeslotOrder!.subsidy_type =
          timeslotOrderSubsidyForm.value.subsidy_type!;

        notification.success({
          description: $t('操作成功'),
          message: $t('操作成功'),
        });
      }
    } finally {
      timeslotOrderSubsidyLoading.value = false;
    }
    showSubsidyModal.value = false;
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
      const timeslotOrder = timeslotOrders.value.get(slot.timeslotorder_id);
      if (timeslotOrder) {
        timeslotOrder.timeslots = timeslotOrder.timeslots.filter(
          (timeslot) => !slot.timeslot_ids.includes(timeslot.id),
        );
        if (timeslotOrder.timeslots.length === 0) {
          timeslotOrders.value.delete(slot.timeslotorder_id);
        }
      }
      showEventDetails.value = false;
      notification.success({
        description: $t('deleteorder'),
        message: $t('success'),
      });
      return res.data;
    }
    return null;
  }

  const enableOrder = computed(() => {
    return (
      formState.value.agency !== undefined &&
      formState.value.roomId !== undefined &&
      formState.value.contentId !== undefined &&
      formState.value.timeslots !== undefined
    );
  });

  function _getSlot(slot: TimeslotModel, index: number) {
    return slot.slot![index]!;
  }

  async function makeOrders() {
    if (formState.value.timeslots === undefined) {
      return;
    }
    const allTimeslots = formState.value.timeslots;

    if (allTimeslots.length > 1) {
      // 检测时间冲突
      for (let i = 0; i < allTimeslots.length; i++) {
        for (let j = i + 1; j < allTimeslots.length; j++) {
          const slotA = allTimeslots[i]!;
          const slotB = allTimeslots[j]!;

          const startA = _getSlot(slotA, 0);
          const endA = _getSlot(slotA, 1);
          const startB = _getSlot(slotB, 0);
          const endB = _getSlot(slotB, 1);

          if (
            (startA.isBefore(endB) && endA.isAfter(startB)) || // Overlapping condition
            (startB.isBefore(endA) && endB.isAfter(startA))
          ) {
            notification.error({
              description: $t('时间段冲突'),
              message: $t('error'),
            });
            return;
          }
        }
      }
    }

    const timeslots: TimeslotCreateInMany[] = [];

    formState.value.timeslots.forEach((slot) => {
      if (slot.canEdit) {
        const startDate = slot.slot![0]!;
        const endDate = slot.slot![1]!;
        const timeslot: TimeslotCreateInMany = {
          date: startDate.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD'),
          end_time: endDate.format('HH:mm'),
          hourlive_money_cost: 0,
          start_time: startDate.format('HH:mm'),
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
      order_price: 0,
      order_title: formState.value.orderTitle ?? '',
      room_id: formState.value.roomId ?? -1,
      timeslots,
    };

    params.id =
      formState.value.orderId === undefined ? -1 : formState.value.orderId;

    timeslotOrderCreate.value = params;
    createTimeslotOrder();
    showApendModal.value = false;
    isEditing.value = false;
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
          order_price: 0,
          order_title: '',
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
    canAppendOrder,
    confirmLoading,
    createTimeslotOrder,
    currentSelectedOrder,
    deleteOrders,
    deleteTimeslotOrders,
    downloadLoading,
    enableOrder,
    formState,
    generateTimeslots,
    getEventClass,
    isEditing,
    makeOrders,
    modifyTimeslotOrder,
    orderById,
    orderFilters,
    orderOptions,
    orderTotalTime,
    queryTimeslotOrder,
    setCurrentSelectedOrder,
    showApendModal,
    showEventDetails,
    showModal,
    showSubsidyModal,
    subsidyTimeslotOrder,
    timeslotOrderCreate,
    timeslotOrderCreateLoading,
    timeslotOrderList,
    timeslotOrderLoading,
    timeslotOrderQuery,
    timeslotOrders,
    timeslotOrderSubsidyForm,
    timeslotOrderSubsidyLoading,
  };
});
