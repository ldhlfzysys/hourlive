import type {
  Customer,
  CustomerUpdate,
  StanderResult,
  Timeslot,
  TimeslotQuery,
  TimeslotSave,
  TimeslotUpdate,
} from '#/types';

import { computed, ref, watch } from 'vue';

import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

import { useRoomStore } from './room';
import { useStreamerStore } from './streamer';

// API 封装
function _queryCustomers() {
  return requestClient.post<StanderResult<Customer[]>>(
    'timeslots/querycustomers',
  );
}

function _updateCustomer(params: CustomerUpdate) {
  return requestClient.post<StanderResult<Customer>>(
    'timeslots/updatecustomer',
    params,
  );
}

function _hideCustomer(params: CustomerUpdate) {
  return requestClient.post<StanderResult<Customer>>(
    'timeslots/hidecustomer',
    params,
  );
}

function _queryTimeslots(params: TimeslotQuery) {
  return requestClient.post<StanderResult<Timeslot[]>>(
    'timeslots/query',
    params,
  );
}

function _saveTimeslots(params: TimeslotSave[]) {
  return requestClient.post<StanderResult<Timeslot[]>>(
    'timeslots/save',
    params,
  );
}

export const useSchedulingStore = defineStore('scheduling-store', () => {
  // ui
  const customerModalVisible = ref(false);
  const customerModalLoading = ref(false);

  // streamer来自streamerStore，直播间来自roomStore

  // 品牌方;
  const customers = ref<Record<number, Customer>>({});
  const customerList = computed(() => {
    return Object.values(customers.value);
  });
  const customerOptions = computed(() => {
    return customerList.value.map((customer) => ({
      label: customer.code,
      value: customer.id,
    }));
  });

  // filter选中的内容（过滤效果）
  const selectedCustomerIds = ref<number[]>([]);
  const selectedStreamerIds = ref<number[]>([]);
  const selectedRoomIds = ref<number[]>([]);

  // 当前选中的品牌和streamer
  const selectedBrandId = ref<number | undefined>();
  const selectedStreamId = ref<number | undefined>();

  // 时间段
  const timeslots = ref<Map<number, TimeslotUpdate>>(new Map());
  const timeslotList = ref<TimeslotUpdate[]>([]);

  // 用于记录发生变化的timeslot
  const changedTimeslots = ref<Map<number, TimeslotUpdate>>(new Map());

  // 左边栏目
  // 左边栏是日期和直播间
  const resources = ref<any[]>([]);
  watch(resources, (newVal) => {
    filteredResources.value = newVal;
  });
  const filteredResources = ref<any[]>([]);
  watch(filteredResources, (newVal) => {
    calendarOptions.value.resources = newVal;
  });
  const resourceAreaColumns = ref<any[]>([
    { field: 'date', group: true, headerContent: '日期' },
    { field: 'rooms', headerContent: '直播间' },
  ]);
  watch(resourceAreaColumns, (newVal) => {
    calendarOptions.value.resourceAreaColumns = newVal;
  });

  // 总的日期范围
  const dateRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs()]);
  watch(dateRange, (newVal) => {
    const resourceList = [];
    const startDate = newVal[0];
    const endDate = newVal[1];
    let currentDate = startDate;

    while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
      const dateStr = currentDate.format('YYYY-MM-DD');

      // 如果是单日,忽略日期显示
      const dateDisplay = isOneDay.value ? '' : dateStr;

      // 获取直播间列表
      const rooms = useRoomStore().roomList;

      for (const room of rooms) {
        // 如果选中了特定直播间,只显示该直播间
        if (
          selectedRoomIds.value.length > 0 &&
          !selectedRoomIds.value.includes(room.id ?? 0)
        ) {
          continue;
        }

        resourceList.push({
          date: dateDisplay,
          id: `${dateStr}_${room.id}`,
          rooms: room.name,
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    resources.value = resourceList;
  });

  const allDates = computed(() => {
    const allDateList = [];

    let startDate = dateRange.value[0];
    const endDate = dateRange.value[1];

    while (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
      allDateList.push(startDate.format('YYYY-MM-DD'));
      startDate = startDate.add(1, 'day');
    }

    return allDateList;
  });

  const isOneDay = computed(() => {
    return dateRange.value[0].isSame(dateRange.value[1], 'day');
  });

  const calendarOptions = ref({
    dateClick: null,
    editable: true,
    eventClick: handleEventClick,
    eventContent: handleEventContent,
    eventDrop: handleEventDropChange,
    eventResize: handleEventChange,
    events: timeslotList,
    expandRows: true,
    headerToolbar: {
      center: '',
      end: '',
      start: '',
    },
    height: 'auto',
    initialDate: dateRange.value[0].format('YYYY-MM-DD'),
    initialView: 'resourceTimelineDay',
    plugins: [resourceTimelinePlugin, interactionPlugin],
    resourceAreaColumns: resourceAreaColumns.value,
    resourceAreaWidth: '20%',
    resources: resources.value,
    select: handleSelect,
    selectable: true,
    selectMirror: true,
    slotDuration: '00:30:00',
    snapDuration: '00:30:00',
    stickyHeaderDates: true,
  });

  // loading states
  const customerQueryLoading = ref(false);
  const customerUpdateLoading = ref(false);
  const timeslotQueryLoading = ref(false);
  const timeslotSaveLoading = ref(false);

  const brandMap = ref<Record<string, any>>({});

  // 添加两个数组来记录最近使用顺序
  const recentStreamers = ref<number[]>([]);
  const recentBrands = ref<number[]>([]);

  // 更新选中的主播时，更新最近使用顺序
  watch(
    () => selectedStreamId.value,
    (newId) => {
      if (newId) {
        // 从数组中移除当前ID（如果存在）
        recentStreamers.value = recentStreamers.value.filter(
          (id) => id !== newId,
        );
        // 将当前ID添加到数组开头
        recentStreamers.value.unshift(newId);
      }
    },
  );

  // 更新选中的品牌时，更新最近使用顺序
  watch(
    () => selectedBrandId.value,
    (newId) => {
      if (newId) {
        // 从数组中移除当前ID（如果存在）
        recentBrands.value = recentBrands.value.filter((id) => id !== newId);
        // 将当前ID添加到数组开头
        recentBrands.value.unshift(newId);
      }
    },
  );

  function handleEventContent(arg: any) {
    const timeslot = timeslots.value.get(Number(arg.event.id));
    if (!timeslot) return null;

    // 添加类型检查和空值判断
    const customer =
      timeslot.customer_id && timeslot.customer_id > 0
        ? customers.value[timeslot.customer_id]
        : null;
    const streamer =
      timeslot.streamer_id && timeslot.streamer_id > 0
        ? useStreamerStore().getStreamerById(timeslot.streamer_id)
        : null;

    const startTime = dayjs(timeslot.begin_date).format('HH:mm');
    const endTime = dayjs(timeslot.finish_date).format('HH:mm');

    const a = {
      html: `
        <div class="event-container p-2 bg-blue-50 rounded shadow-sm">
          ${
            customer
              ? `
            <div class="flex items-center gap-2 mb-1">
              ${customer.avatar ? `<img src="${customer.avatar}" class="w-5 h-5 rounded-full object-cover"/>` : ''}
              <span class="text-base font-medium text-gray-800">${customer.code}</span>
            </div>
          `
              : ''
          }
          ${
            streamer
              ? `
            <div class="flex items-center gap-2 bg-blue-50 p-1 rounded mb-1">
              <img src="${streamer.avatar}" class="w-5 h-5 rounded-full object-cover"/>
              <span class="text-sm text-gray-700">${streamer.name}</span>
            </div>
          `
              : ''
          }
          <div class="text-xs text-gray-500">${startTime} - ${endTime}</div>
        </div>
      `,
    };

    return a;
  }

  async function initCalendar() {
    useStreamerStore().queryStreamer();
    queryCustomers();
    await useRoomStore().queryRoom();
    dateRange.value = [dayjs(), dayjs().add(7, 'days')];
  }

  function handleEventClick(arg: any) {
    const timeslotId = Number(arg.event.id);
    const currentTimeslot = timeslots.value.get(timeslotId);

    if (!currentTimeslot) return;

    // 创建更新后的时间段对象
    const updatedTimeslot: TimeslotUpdate = {
      ...currentTimeslot,
      customer_id: selectedBrandId.value,
      streamer_id: selectedStreamId.value,
    };

    // 更新 timeslots
    timeslots.value.set(timeslotId, updatedTimeslot);

    // 记录变更
    changedTimeslots.value.set(timeslotId, updatedTimeslot);
  }

  function handleEventDropChange(arg: any) {
    const timeslotId = Number(arg.event.id);
    const currentTimeslot = timeslots.value.get(timeslotId);

    if (!currentTimeslot) return;

    // 计算新的开始和结束时间
    const originalStart = dayjs(currentTimeslot.begin_date);
    const originalEnd = dayjs(currentTimeslot.finish_date);
    const deltaMs = arg.delta?.milliseconds || 0;

    const newStart = originalStart.add(deltaMs, 'millisecond');
    const newEnd = originalEnd.add(deltaMs, 'millisecond');

    // 如果resource没有改变，使用当前timeslot的resourceId
    const resourceId = arg.newResource
      ? arg.newResource.id
      : currentTimeslot.resourceId;
    const [dateStr, roomId] = resourceId.split('_');

    // 使用新的日期和时间
    const newStartTime = newStart.format('HH:mm:ss');
    const newEndTime = newEnd.format('HH:mm:ss');

    const newStartDate = `${dateStr} ${newStartTime}`;
    const newEndDate = `${dateStr} ${newEndTime}`;

    // 使用日期范围的开始日期（用于显示）
    const rangeStartDate = dateRange.value[0].format('YYYY-MM-DD');

    // 创建更新后的时间段对象
    const updatedTimeslot: TimeslotUpdate = {
      ...currentTimeslot,
      begin_date: newStartDate,
      end: `${rangeStartDate} ${newEndTime}`, // 用于显示
      finish_date: newEndDate,
      resourceId, // 更新为新的resourceId
      room_id: Number(roomId), // 更新为新的room_id
      start: `${rangeStartDate} ${newStartTime}`, // 用于显示
    };

    // 更新 timeslots
    timeslots.value.set(timeslotId, updatedTimeslot);

    // 记录变更
    changedTimeslots.value.set(timeslotId, updatedTimeslot);
  }

  function handleEventChange(arg: any) {
    const timeslotId = Number(arg.event.id);
    const currentTimeslot = timeslots.value.get(timeslotId);

    if (!currentTimeslot) return;

    // 计算新的开始和结束时间
    const originalStart = dayjs(currentTimeslot.begin_date);
    const originalEnd = dayjs(currentTimeslot.finish_date);

    // 根据 delta 调整时间
    const startDeltaMs = arg.startDelta?.milliseconds || 0;
    const endDeltaMs = arg.endDelta?.milliseconds || 0;

    const newStart = originalStart.add(startDeltaMs, 'millisecond');
    const newEnd = originalEnd.add(endDeltaMs, 'millisecond');

    // 保持原始日期，只更新时间部分
    const originalDate = originalStart.format('YYYY-MM-DD');
    const newStartTime = newStart.format('HH:mm:ss');
    const newEndTime = newEnd.format('HH:mm:ss');

    const newStartDate = `${originalDate} ${newStartTime}`;
    const newEndDate = `${originalDate} ${newEndTime}`;

    // 使用日期范围的开始日期（用于显示）
    const rangeStartDate = dateRange.value[0].format('YYYY-MM-DD');

    // 创建更新后的时间段对象
    const updatedTimeslot: TimeslotUpdate = {
      ...currentTimeslot,
      begin_date: newStartDate,
      end: `${rangeStartDate} ${newEndTime}`, // 用于显示
      finish_date: newEndDate,
      // 保持原有的 resourceId
      resourceId: currentTimeslot.resourceId,
      room_id: currentTimeslot.room_id,
      start: `${rangeStartDate} ${newStartTime}`, // 用于显示
    };

    // 更新 timeslots
    timeslots.value.set(timeslotId, updatedTimeslot);

    // 记录变更
    changedTimeslots.value.set(timeslotId, updatedTimeslot);
  }

  function handleSelect(selectInfo: any) {
    // 从 resource 获取实际日期和房间ID
    const resourceId = selectInfo.resource.id;
    const [dateStr, roomId] = resourceId.split('_');

    // 获取当前视图的时间
    const viewStartTime = dayjs(selectInfo.start).format('HH:mm:ss');
    const viewEndTime = dayjs(selectInfo.start)
      .add(2, 'hours')
      .format('HH:mm:ss');

    // 使用 dateStr（实际日期）构建完整的日期时间
    const actualStartDate = dayjs(`${dateStr} ${viewStartTime}`);
    const actualEndDate = actualStartDate.add(2, 'hours');

    // 创建新的时间段
    const newTimeslot: TimeslotUpdate = {
      // 用于数据库的实际日期时间
      begin_date: actualStartDate.format('YYYY-MM-DD HH:mm:ss'),
      create: 1,
      customer_id: selectedBrandId.value,
      end: dayjs(selectInfo.start)
        .add(2, 'hours')
        .format('YYYY-MM-DD HH:mm:ss'),
      finish_date: actualEndDate.format('YYYY-MM-DD HH:mm:ss'),
      resourceId,
      room_id: Number.parseInt(roomId),
      // 用于 FullCalendar 显示的当前视图时间
      start: dayjs(selectInfo.start).format('YYYY-MM-DD HH:mm:ss'),
      streamer_id: selectedStreamId.value,
    };

    // 如果有选中的主播和品牌，则将主播和品牌id赋值给timeslot
    if (selectedStreamId.value) {
      newTimeslot.streamer_id = Number(selectedStreamId.value);
    }
    if (selectedBrandId.value) {
      newTimeslot.customer_id = Number(selectedBrandId.value);
    }

    // 检查时间冲突
    const hasConflict = checkTimeConflict(newTimeslot);
    if (hasConflict) {
      message.error('当前时间段已被占用');
      return;
    }

    // 使用 begin_date 转换为时间戳作为临时 id
    const tempId = dayjs(newTimeslot.begin_date).valueOf();
    if (tempId) {
      const newSlot = {
        ...newTimeslot,
        id: tempId,
      };
      // 创建新的 Map 并设置值
      timeslots.value.set(tempId, newSlot);

      changedTimeslots.value.set(tempId, newSlot);
    }
  }

  // 检查时间冲突
  function checkTimeConflict(newSlot: TimeslotUpdate): boolean {
    return [...timeslots.value.values()].some((slot) => {
      if (slot.room_id !== newSlot.room_id) return false;

      const start1 = dayjs(newSlot.begin_date);
      const end1 = dayjs(newSlot.finish_date);
      const start2 = dayjs(slot.begin_date);
      const end2 = dayjs(slot.finish_date);

      return !(
        end1.isBefore(start2) ||
        end1.isSame(start2) ||
        start1.isAfter(end2) ||
        start1.isSame(end2)
      );
    });
  }

  function $reset() {
    brandMap.value = {};
  }

  // 查询品牌方列表
  async function queryCustomers() {
    try {
      customerQueryLoading.value = true;
      const res = await _queryCustomers();
      if (res && res.success) {
        res.data.forEach((customer) => {
          if (customer.id) {
            customers.value[customer.id] = customer;
          }
        });
      }
    } finally {
      customerQueryLoading.value = false;
    }
  }

  // 更新品牌方
  async function updateCustomer(customer: CustomerUpdate) {
    try {
      customerUpdateLoading.value = true;
      const res = await _updateCustomer(customer);
      if (res && res.success && res.data.id) {
        customers.value[res.data.id] = res.data;
      }
    } finally {
      customerUpdateLoading.value = false;
    }
  }

  // 查询时间段
  async function queryTimeslots(query: TimeslotQuery) {
    try {
      timeslotQueryLoading.value = true;
      const res = await _queryTimeslots(query);
      if (res && res.success) {
        const newTimeslots = new Map(timeslots.value);
        res.data.forEach((result) => {
          if (result.id) {
            // 从 begin_date 获取实际日期用于 resourceId
            const actualDate = dayjs(result.begin_date).format('YYYY-MM-DD');

            // 获取时间部分
            const startTime = dayjs(result.begin_date).format('HH:mm:ss');
            const endTime = dayjs(result.finish_date).format('HH:mm:ss');

            // 使用当天日期 + 原始时间
            const today = dayjs().format('YYYY-MM-DD');

            // 组装完整的时间段数据
            const enrichedResult = {
              ...result,
              // 保持原始的数据库时间
              begin_date: result.begin_date,
              customer_id: result.customers?.[0]?.id,
              end: `${today} ${endTime}`,
              finish_date: result.finish_date,
              // 使用实际日期（来自 begin_date）构建 resourceId
              resourceId: `${actualDate}_${result.room_id}`,
              // 使用当天日期 + 原始时间
              start: `${today} ${startTime}`,
              streamer_id: result.streamers?.[0]?.id,
            };
            newTimeslots.set(result.id, enrichedResult);
          }
        });
        timeslots.value = newTimeslots;
      }
    } finally {
      timeslotQueryLoading.value = false;
    }
  }

  // 保存时间段
  async function saveTimeslots(timeslotSaves: TimeslotSave[]) {
    try {
      timeslotSaveLoading.value = true;
      const res = await _saveTimeslots(timeslotSaves);
      if (res && res.success) {
        const newTimeslots = new Map(timeslots.value);

        // 删除临时数据
        for (const [key, changedSlot] of changedTimeslots.value.entries()) {
          if (changedSlot.create === 1) {
            newTimeslots.delete(key);
          }
        }

        // 更新新数据
        res.data.forEach((result) => {
          if (result.id) {
            // 从 begin_date 获取实际日期用于 resourceId
            const actualDate = dayjs(result.begin_date).format('YYYY-MM-DD');

            // 获取时间部分
            const startTime = dayjs(result.begin_date).format('HH:mm:ss');
            const endTime = dayjs(result.finish_date).format('HH:mm:ss');

            // 使用当天日期 + 原始时间
            const today = dayjs().format('YYYY-MM-DD');

            // 组装完整的时间段数据
            const enrichedResult = {
              ...result,
              end: `${today} ${endTime}`,
              resourceId: `${actualDate}_${result.room_id}`,
              // 使用当天日期 + 原始时间
              start: `${today} ${startTime}`,
            };
            newTimeslots.set(result.id, enrichedResult);
          }
        });

        timeslots.value = newTimeslots;
        changedTimeslots.value = new Map(); // 清空变更记录
      }
    } finally {
      timeslotSaveLoading.value = false;
    }
  }

  // 主播相关计算属性
  const streamerList = computed(() => {
    const list = useStreamerStore().streamerList;
    const mappedList = list.map((streamer) => ({
      ...streamer,
      workingHours: calculateStreamerWorkingHours(streamer.id ?? 0),
    }));

    // 根据最近使用顺序排序
    return mappedList.sort((a, b) => {
      const indexA = recentStreamers.value.indexOf(a.id ?? -1);
      const indexB = recentStreamers.value.indexOf(b.id ?? -1);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  });

  // 计算主播工作时长
  function calculateStreamerWorkingHours(streamerId: number): number {
    let totalHours = 0;
    const slots = [...timeslots.value.values()].filter((slot) =>
      slot.streamers?.some((s) => s.id === streamerId),
    );

    for (const slot of slots) {
      const duration = dayjs(slot.end_date).diff(
        dayjs(slot.begin_date),
        'hour',
        true,
      );
      totalHours += duration;
    }
    return totalHours;
  }

  // 品牌相关计算属性
  const brandList = computed(() => {
    const list = customerList.value.map((customer) => ({
      avatar: customer.avatar,
      id: customer.id ?? 0,
      name: customer.code,
      scheduledHours: calculateBrandScheduledHours(customer.id ?? 0),
    }));

    // 根据最近使用顺序排序
    return list.sort((a, b) => {
      const indexA = recentBrands.value.indexOf(a.id);
      const indexB = recentBrands.value.indexOf(b.id);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  });

  // 计算品牌已排班时长
  function calculateBrandScheduledHours(customerId: number): number {
    let totalHours = 0;
    const slots = [...timeslots.value.values()].filter((slot) =>
      slot.customers?.some((c) => c.id === customerId),
    );

    for (const slot of slots) {
      const duration = dayjs(slot.end_date).diff(
        dayjs(slot.begin_date),
        'hour',
        true,
      );
      totalHours += duration;
    }
    return totalHours;
  }

  // 添加对 timeslots 的监听
  watch(
    timeslots,
    (newTimeslots) => {
      timeslotList.value = [...newTimeslots.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
        .map(([_, timeslot]) => ({ ...timeslot })); // 使用展开运算符创建普通对象
    },
    { deep: true },
  );

  function handleBrandClick(brandId: number) {
    selectedBrandId.value =
      selectedBrandId.value === brandId ? undefined : brandId;
  }

  return {
    brandList,
    brandMap,
    calendarOptions,
    changedTimeslots,
    customerList,
    customerModalVisible,
    customerOptions,
    customerQueryLoading,
    customers,
    customerUpdateLoading,
    dateRange,
    filteredResources,
    handleBrandClick,
    handleEventChange,
    handleEventClick,
    handleEventContent,
    handleSelect,
    initCalendar,
    isOneDay,
    queryCustomers,
    queryTimeslots,
    recentBrands,
    recentStreamers,
    resourceAreaColumns,
    resources,
    saveTimeslots,
    selectedBrandId,
    selectedCustomerIds,
    selectedRoomIds,
    selectedStreamerIds,
    selectedStreamId,
    streamerList,
    timeslotList,
    timeslotQueryLoading,
    timeslots,
    timeslotSaveLoading,
    updateCustomer,
  };
});
