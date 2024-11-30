/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {
  CancelTimeSlot,
  Content,
  OrderQuery,
  SlotEvent,
  StanderResult,
  TableInfo,
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
import { useDownloaderStore, useOSSFileStore, useSampleStore } from '#/store';

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
  const downloadLoading = ref(false);
  const timeslotOrders = ref<Map<number, TimeslotOrder>>(new Map());

  const orderById = computed(() => {
    return (id: number) => timeslotOrders.value.get(id);
  });

  const orderFilters = ref<{ key: string; value: number[] }[]>([]);

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

  async function downloadTimeslotOrder(slot: SlotEvent) {
    downloadLoading.value = true;
    const order = slot;
    const tableInfoList: TableInfo[] = [];
    const content: Content = order.contents[0]!;
    const liveaccount = content.liveaccount!;

    const orderInfo: TableInfo = {
      data: [
        {
          agency: order.agency,
          content_id: `${liveaccount?.name}-${liveaccount?.live_account}`,
          customer: order.customer,
          id: order.id,
          room_id: order.room_id,
          timeslot: `${order.start} - ${order.end}`,
        },
      ],
      title: [
        $t('timeslotorder_id'),
        $t('agency'),
        $t('room_id'),
        $t('customer'),
        $t('content_id'),
        $t('timeslot'),
      ],
    };
    tableInfoList.push(orderInfo);

    const liveInfo: TableInfo = {
      data: [
        {
          content_id: content.id,
          content_link: content.content_link,
          content_text: content.content_text,
          create_time: content.create_time,
          customer_id: content.customer_id,
          update_time: content.update_time,
        },
      ],
      title: [
        $t('content_id'),
        $t('create_time'),
        $t('update_time'),
        $t('customer_id'),
        $t('content_link'),
        $t('content_text'),
      ],
    };
    tableInfoList.push(liveInfo);

    const liveAccountInfo: TableInfo = {
      data: [
        {
          code: liveaccount.code,
          create_time: liveaccount.create_time,
          customer_id: liveaccount.customer_id,
          live_account: liveaccount.live_account,
          live_uid: liveaccount.live_uid,
          liveaccount_id: liveaccount.id,
          mobile: liveaccount.mobile,
          name: liveaccount.name,
          platform: liveaccount.platform,
          update_time: liveaccount.update_time,
        },
      ],
      title: [
        $t('liveaccount_id'),
        $t('create_time'),
        $t('update_time'),
        $t('name'),
        $t('code'),
        $t('platform'),
        $t('live_account'),
        $t('live_uid'),
        $t('mobile'),
        $t('customer_id'),
      ],
    };
    tableInfoList.push(liveAccountInfo);
    const all_samples: any[] = [];

    for (const sample of useSampleStore().sampleList) {
      if (Object.keys(sample.id!).length === 0) {
        useOSSFileStore().currentProductId = sample.id!;
        await useOSSFileStore().fetchFile();
      }

      const fileList = useOSSFileStore()
        .getFileList(sample.id!)
        .map((file) => {
          return {
            name: file[0],
            path: file[1],
          };
        });

      // let shipping_status : number = -1
      // if (sample.agencys && sample.agencys.length > 0) {
      //   shipping_status = 0;
      // }
      const sample_info: object = {
        attachment: fileList,
        customer_id: sample.customer_id!,
        product_discount: sample.product_discount,
        product_final_price: sample.product_final_price!,
        product_image: sample.product_image,
        product_ksp: sample.product_ksp,
        product_link: sample.product_link,
        product_name: sample.product_name,
        product_script: sample.product_script,
        product_srp: sample.product_srp,
        sample_id: sample.id!,
        shipping_status_text: '',
      };

      all_samples.push(sample_info);
    }

    const samplesInfo: TableInfo = {
      data: all_samples,
      imageColumns: [
        {
          columnIndex: 2,
          key: 'product_image',
        },
      ],
      title: [
        $t('customer_id'),
        $t('sample_id'),
        $t('product_image'),
        $t('product_name'),
        $t('hourlive.info.repostatus'),
        $t('product_srp'),
        $t('product_final_price'),
        $t('product_discount'),
        $t('product_link'),
        $t('product_ksp'),
        $t('customscript'),
        $t('scripfile'),
      ],
    };
    tableInfoList.push(samplesInfo);

    const download_name = `${order.room_id!}_${order.customer.code!}_${
      liveaccount.name
    }_${liveaccount.live_account}_${order.start}-${order.end}`;

    await useDownloaderStore().downloadExcel(tableInfoList, download_name);

    downloadLoading.value = false;
  }

  return {
    $reset,
    confirmLoading,
    createTimeslotOrder,
    deleteOrders,
    deleteTimeslotOrders,
    downloadLoading,
    downloadTimeslotOrder,
    formState,
    generateTimeslots,
    isEditing,
    makeOrders,
    modifyTimeslotOrder,
    orderById,
    orderFilters,
    queryTimeslotOrder,
    showApendModal,
    showEventDetails,
    showModal,
    timeslotOrderCreate,
    timeslotOrderCreateLoading,
    timeslotOrderList,
    timeslotOrderLoading,
    timeslotOrderQuery,
    timeslotOrders,
  };
});
