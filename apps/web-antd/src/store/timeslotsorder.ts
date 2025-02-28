/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {
  BaseQuery,
  StandardResponse,
  SubsidyUpdate,
  TimeslotOrderCancel,
  TimeslotOrderRead,
  TimeslotOrderUpdate,
} from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// 添加 store 引用
import {
  useAgencyStore,
  useContentStore,
  useCustomerStore,
  useRoomStore,
  useTimeslotStore,
} from '#/store';

// 补贴设置
function _subsidyTimeslotOrder(params: SubsidyUpdate) {
  return requestClient.post<StandardResponse<TimeslotOrderRead>>(
    'timeslotorder/subsidy',
    params,
  );
}

// 获取所有时段订单
function _getAllTimeslotOrders(params?: BaseQuery) {
  return requestClient.post<StandardResponse<TimeslotOrderRead[]>>(
    'timeslotorder/query',
    params,
  );
}

// 取消时段订单
function _cancelTimeslotOrder(params: TimeslotOrderCancel) {
  return requestClient.post<StandardResponse<TimeslotOrderRead>>(
    'timeslotorder/cancel',
    params,
  );
}
function _deleteTimeslotOrder(params: BaseQuery) {
  return requestClient.post<StandardResponse<TimeslotOrderRead>>(
    'timeslotorder/delete',
    params,
  );
}
// 更新现有的时段订单
function _updateTimeslotOrder(params: TimeslotOrderUpdate) {
  return requestClient.post<StandardResponse<TimeslotOrderRead>>(
    'timeslotorder/update',
    params,
  );
}

// 定义Pinia store
export const useTimeslotOrderStore = defineStore('timeslotorder-store', () => {
  // State 状态管理
  const timeslotOrders = ref<Map<number, TimeslotOrderRead>>(new Map());
  const orderFilters = ref<{ key: string; value: number[] }[]>([]);
  const timeslotOrderQuery = ref<BaseQuery>();
  const currentSelectedOrder = ref<TimeslotOrderRead | undefined>();
  const colorMap = ref<Map<number, string>>(new Map());
  const colorIndex = ref(0);

  // Loading 状态
  const timeslotOrderLoading = ref(false);
  const timeslotOrderCreateLoading = ref(false);
  const timeslotOrderSubsidyLoading = ref(false);
  const downloadLoading = ref(false);
  const confirmLoading = ref(false);

  // Modal 状态
  const showModal = ref(false);
  const showEventDetails = ref(false);
  const showApendModal = ref(false);
  const showSubsidyModal = ref(false);

  // 表单状态
  const timeslotOrderSubsidyForm = ref<SubsidyUpdate>({
    ids: [],
  });
  const timeslotOrderUpdate = ref<TimeslotOrderUpdate>({
    content_id: -1,
    order_price: 0,
    order_title: '',
    room_id: -1,
    timeslots: [],
  });

  // Computed 属性
  const timeslotOrderList = computed(() => {
    let orders = [...timeslotOrders.value.entries()];
    if (orderFilters.value.length > 0) {
      for (const filter of orderFilters.value) {
        if (filter.key === 'agency') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return filter.value.includes(timeslotOrder.agency!.id!);
          });
        }
        if (filter.key === 'room') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return filter.value.includes(timeslotOrder.room!.id!);
          });
        }

        if (filter.key === 'customer') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return filter.value.includes(timeslotOrder.customer!.id!);
          });
        }

        if (filter.key === 'content') {
          orders = orders.filter(([_, timeslotOrder]) => {
            return timeslotOrder.contents!.some((content) => {
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

  const orderById = computed(() => {
    return (id: number) => timeslotOrders.value.get(id);
  });

  // 订单选项
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

  const orderTotalTime = computed(() => {
    if (!timeslotOrderUpdate.value.timeslots) {
      return 0;
    }
    let totalHours = 0;
    for (const timeslot of timeslotOrderUpdate.value.timeslots) {
      if (timeslot.begin_date && timeslot.finish_date) {
        const startTime = dayjs(`${timeslot.begin_date}`);
        const endTime = dayjs(`${timeslot.finish_date}`);
        const diffHours = endTime.diff(startTime, 'hour', true);
        totalHours += diffHours;
      }
    }
    return totalHours.toFixed(1);
  });

  // Methods
  async function deleteTimeslotOrder() {
    if (!currentSelectedOrder.value?.id) {
      return null;
    }
    const res = await _deleteTimeslotOrder({
      id: currentSelectedOrder.value.id,
    });
    if (res.success && res.data?.id) {
      setTimeslotOrders([res.data]);
      timeslotOrders.value.delete(currentSelectedOrder.value.id!);
      showEventDetails.value = false;
      notification.success({
        description: $t('deleteorder'),
        message: $t('success'),
      });
    }
  }

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
    const order: TimeslotOrderRead | undefined = orderById.value(id);

    if (order && isPast) {
      color = `${color}-past`;
    }
    return color;
  }

  // 是否可以添加时段，目前不做限制，都可以添加
  const canAppendOrder = true;

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
  }

  async function queryTimeslotOrder() {
    try {
      timeslotOrderLoading.value = true;
      const res = await _getAllTimeslotOrders(timeslotOrderQuery.value);
      if (res.success && res.data) {
        setTimeslotOrders(res.data);
      }
    } finally {
      timeslotOrderLoading.value = false;
    }
  }

  async function subsidyTimeslotOrder() {
    if (currentSelectedOrder.value) {
      timeslotOrderSubsidyForm.value.ids = [currentSelectedOrder.value.id!];
    }
    if (timeslotOrderSubsidyForm.value.ids.length === 0) {
      notification.error({
        description: $t('请选择时段订单'),
        message: $t('error'),
      });
      return;
    }
    timeslotOrderSubsidyLoading.value = true;
    try {
      const res = await _subsidyTimeslotOrder(timeslotOrderSubsidyForm.value);
      if (res && res.success && res.data) {
        setTimeslotOrders([res.data]);
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

  // 删除时段订单，删除当前就是选中的时段，删除所有就是订单下所有的时段
  async function cancelTimeslot(timeslot_id: number) {
    if (!currentSelectedOrder.value?.id) {
      return null;
    }
    const res = await _cancelTimeslotOrder({
      id: currentSelectedOrder.value.id,
      timeslot_id,
    });
    if (res.success && res.data?.id) {
      setTimeslotOrders([res.data]);
      showEventDetails.value = false;
      notification.success({
        description: $t('deleteorder'),
        message: $t('success'),
      });
      return res.data;
    }
    return null;
  }

  function makeCreate() {
    showModal.value = true;
    timeslotOrderUpdate.value = {
      content_id: -1,
      order_price: 0,
      order_title: '',
      room_id: -1,
      timeslots: [],
    };
  }

  async function makeOrder() {
    timeslotOrderCreateLoading.value = true;
    try {
      const res = await _updateTimeslotOrder(timeslotOrderUpdate.value);
      if (res && res.success && res.data?.id) {
        setTimeslotOrders([res.data]);
        showModal.value = false;
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

  function makeUpdate(id: number) {
    showModal.value = true;
    const order = timeslotOrders.value.get(id);
    if (order) {
      timeslotOrderUpdate.value = {
        content_id: order.contents![0]!.id!,
        id: order.id!,
        order_price: order.order_price!,
        order_title: order.order_title!,
        room_id: order.room!.id!,
        timeslots: [...(order.timeslots || [])],
      };
    }
  }

  // 添加 setTimeslotOrders 方法
  function setTimeslotOrders(orders: TimeslotOrderRead[]) {
    orders.forEach((order) => {
      if (order.id) {
        // 更新 timeslotorder
        timeslotOrders.value.set(order.id, order);

        // 同步更新 agency
        if (order.agency) {
          useAgencyStore().setAgencies([order.agency]);
        }

        // 同步更新 customer
        if (order.customer) {
          useCustomerStore().setCustomers([order.customer]);
        }

        // 同步更新 room
        if (order.room) {
          useRoomStore().setRooms([order.room]);
        }

        // 同步更新 contents
        if (order.contents && order.contents.length > 0) {
          useContentStore().setContents(order.contents);
        }

        // 同步更新 timeslots
        if (order.timeslots && order.timeslots.length > 0) {
          useTimeslotStore().setTimeslots(order.timeslots);
        }
      }
    });
  }

  return {
    // Methods
    $reset,
    canAppendOrder,
    cancelTimeslot,
    confirmLoading,

    currentSelectedOrder,
    deleteTimeslotOrder,
    downloadLoading,
    getEventClass,
    makeCreate,

    makeOrder,
    makeUpdate,
    // Computed
    orderById,
    orderFilters,

    orderOptions,
    orderTotalTime,
    queryTimeslotOrder,

    setCurrentSelectedOrder,
    setTimeslotOrders, // 导出新方法
    showApendModal,
    showEventDetails,
    // Modal states
    showModal,
    showSubsidyModal,
    subsidyTimeslotOrder,
    timeslotOrderCreateLoading,
    timeslotOrderList,

    // Loading states
    timeslotOrderLoading,
    timeslotOrderQuery,
    // State
    timeslotOrders,
    // Forms
    timeslotOrderSubsidyForm,
    timeslotOrderSubsidyLoading,
    timeslotOrderUpdate,
  };
});
