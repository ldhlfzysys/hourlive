/* eslint-disable unicorn/no-nested-ternary */
import type {
  Customer,
  CustomerUpdate,
  PublicTimeslot,
  Room,
  StanderResult,
  Streamer,
  Timeslot,
  TimeslotQuery,
  TimeslotSave,
  TimeslotUpdate,
} from '#/types';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { message, notification } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

import { useAgencyStore } from './agency';
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

function _queryPublicTimeslots(code: string) {
  return requestClient.post<StanderResult<PublicTimeslot>>(
    `timeslots/querypublic/${code}`,
  );
}

function _queryPublicTimeslotsStreamer(code: string) {
  return requestClient.post<StanderResult<PublicTimeslot>>(
    `timeslots/querypublicstreamers/${code}`,
  );
}

export const useSchedulingStore = defineStore('scheduling-store', () => {
  // 控制 CustomerModal 的显示状态和编辑数据
  const customerModalVisible = ref(false);
  const customerModalLoading = ref(false);
  const editingCustomer = ref<CustomerUpdate | undefined>();

  // 只读
  const readonly = ref(false);

  // 打开新增品牌模态框
  function showAddCustomerModal() {
    editingCustomer.value = undefined;
    customerModalVisible.value = true;
  }

  // 打开编辑品牌模态框
  function showEditCustomerModal(customer: CustomerUpdate) {
    editingCustomer.value = customer;
    customerModalVisible.value = true;
  }

  // 关闭品牌模态框
  function closeCustomerModal() {
    customerModalVisible.value = false;
    editingCustomer.value = undefined;
  }

  // streamer来自streamerStore，直播间来自roomStore

  // 品牌方;
  const customers = ref<Map<number, Customer>>(new Map());
  const customerList = computed(() => {
    return [...customers.value.values()];
  });
  const customerOptions = computed(() => {
    return customerList.value.map((customer) => ({
      label: customer.brand,
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
    filteredResources.value =
      selectedRoomIds.value.length > 0
        ? newVal.filter((resource) => {
            const roomId = Number.parseInt(resource.id.split('_')[1]);
            return selectedRoomIds.value.includes(roomId);
          })
        : newVal;
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

  const isOneDay = computed(() => {
    return dateRange.value[0].isSame(dateRange.value[1], 'day');
  });

  // 新增复制相关的状态
  const isCopying = ref(false);
  const copyingResourceId = ref<string>('');

  const calendarOptions = ref({
    dateClick: null,
    editable: true,
    eventClick: handleEventClick,
    eventContent: handleEventContent,
    eventDrop: handleEventDropChange,
    eventMouseEnter: handleEventMouseEnter,
    eventMouseLeave: handleEventMouseLeave,
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
    resourceLabelContent: (arg: any) => {
      const [dateStr, roomId] = arg.resource.id.split('_');
      const room = useRoomStore().getRoomById(Number(roomId));

      return {
        html: `
          <div class="flex flex-col p-2" onclick="event.stopPropagation();">
            ${isOneDay.value ? '' : `<div class="text-sm text-gray-600 mb-1">${dateStr}</div>`}
            <div class="flex items-center gap-2">
              
              <span class="font-medium">${room?.name || ''}</span>
            </div>
            <div class="flex gap-2 mt-2">
              ${
                isCopying.value
                  ? arg.resource.id === copyingResourceId.value
                    ? `<button
                        class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        onclick="(function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                          const evt = new CustomEvent('cancel-copy', {
                            bubbles: false
                          });
                          document.dispatchEvent(evt);
                          return false;
                        })(event)"
                      >取消</button>`
                    : `<button
                        class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        onclick="(function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                          const evt = new CustomEvent('handle-copy', {
                            detail: { 
                              targetResourceId: '${arg.resource.id}',
                              mode: 'insert'
                            },
                            bubbles: false
                          });
                          document.dispatchEvent(evt);
                          return false;
                        })(event)"
                      >插入</button>
                      <button
                        class="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        onclick="(function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                          const evt = new CustomEvent('handle-copy', {
                            detail: { 
                              targetResourceId: '${arg.resource.id}',
                              mode: 'override'
                            },
                            bubbles: false
                          });
                          document.dispatchEvent(evt);
                          return false;
                        })(event)"
                      >覆盖</button>`
                  : `<button 
                        class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        onclick="(function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                          const evt = new CustomEvent('start-copy', {
                            detail: { resourceId: '${arg.resource.id}' },
                            bubbles: false
                          });
                          document.dispatchEvent(evt);
                          return false;
                        })(event)"
                      >复制</button>`
              }
            </div>
          </div>
        `,
      };
    },
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
    const timeslotId = Number(arg.event.id);
    const timeslot = timeslots.value.get(timeslotId);
    if (!timeslot) return null;

    // 检查是否是新增或修改的时间段
    const isChanged = changedTimeslots.value.has(timeslotId);
    const isNew = isChanged && timeslot.create === 1;

    // 根据状态设置不同的背景色
    let bgColorClass = 'bg-blue-50';
    if (isNew) {
      bgColorClass = 'bg-green-100';
    } else if (isChanged) {
      bgColorClass = 'bg-yellow-100';
    }

    const customer =
      timeslot.customer_id && timeslot.customer_id > 0
        ? customers.value.get(timeslot.customer_id)
        : null;
    const streamer =
      timeslot.streamer_id && timeslot.streamer_id > 0
        ? useStreamerStore().getStreamerById(timeslot.streamer_id)
        : null;

    const startTime = dayjs(timeslot.begin_date).format('HH:mm');
    const endTime = dayjs(timeslot.finish_date).format('HH:mm');

    // 创建完整的内容用于悬浮显示
    const tooltipContent = `
      <div class="p-2 bg-white rounded shadow-lg text-sm">
        ${customer ? `<div class="mb-1">品牌：${customer.brand}</div>` : ''}
        ${streamer ? `<div class="mb-1">主播：${streamer.name}</div>` : ''}
        <div>时间：${startTime} - ${endTime}</div>
      </div>
    `;

    // 修改删除按钮的处理函数
    const deleteHandler = `
      onclick="(function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const evt = new CustomEvent('delete-timeslot', {
          detail: { id: ${timeslotId} },
          bubbles: false
        });
        document.dispatchEvent(evt);
        return false;
      })(event)"
    `;

    return {
      html: `
        <div class="h-full">
          <div 
            class="event-container h-full p-2 pt-2 pb-0 ${bgColorClass} rounded shadow-sm overflow-visible group cursor-pointer relative"
            data-tooltip="${encodeURIComponent(tooltipContent)}"
          >
            <div class="flex flex-col h-full">
              <div class="flex-grow min-w-0 mb-1">
                ${
                  customer
                    ? `
                  <div class="flex items-center gap-2 mb-1 truncate">
                    ${customer.avatar ? `<img src="${customer.avatar}" class="w-5 h-5 object-contain flex-shrink-0"/>` : ''}
                    <span class="text-base font-medium text-gray-800 truncate">${customer.brand}</span>
                  </div>
                  `
                    : ''
                }
                ${
                  streamer
                    ? `
                  <div class="flex items-center gap-2 p-1 rounded mb-1 truncate">
                    ${streamer.avatar ? `<img src="${streamer.avatar}" class="w-5 h-5 rounded-full object-cover flex-shrink-0"/>` : ''}
                    <span class="text-sm text-gray-700 truncate">${streamer.name}</span>
                  </div>
                  `
                    : ''
                }
                <div class="text-xs text-gray-500 truncate">${startTime} - ${endTime}</div>
              </div>
              
              ${
                readonly.value
                  ? ''
                  : `
              <div class="flex justify-center -mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
                <button
                  class="p-1 bg-white rounded-full shadow-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  ${deleteHandler}
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              `
              }
            </div>
          </div>
        </div>
      `,
    };
  }

  // 添加删除时间段的处理函数
  function handleDeleteTimeslot(timeslotId: number) {
    const timeslot = timeslots.value.get(timeslotId);
    if (!timeslot) return;

    if (timeslot.create === 1) {
      // 如果是新创建的时间段，直接从 maps 中删除
      timeslots.value.delete(timeslotId);
      changedTimeslots.value.delete(timeslotId);
    } else {
      // 如果是已存在的时间段，标记为删除
      const updatedTimeslot = {
        ...timeslot,
        remove: 1,
      };
      timeslots.value.delete(timeslotId);
      changedTimeslots.value.set(timeslotId, updatedTimeslot);
    }

    // 立即从视图列表中移除
    // timeslotList.value = timeslotList.value.filter((t) => t.id !== timeslotId);
  }

  // 修改事件监听器的定义部分
  const deleteEventListener = ((e: CustomEvent) => {
    e.stopPropagation();
    handleDeleteTimeslot(e.detail.id);
  }) as EventListener;

  const copyEventListener = ((e: CustomEvent) => {
    e.stopPropagation();
    startCopy(e.detail.resourceId);
  }) as EventListener;

  const handleCopyEventListener = ((e: CustomEvent) => {
    e.stopPropagation();
    const { mode, targetResourceId } = e.detail;
    handleCopy(targetResourceId, mode);
    cancelCopy();
  }) as EventListener;

  const cancelCopyEventListener = ((e: Event) => {
    e.stopPropagation();
    cancelCopy();
  }) as EventListener;

  // 修改事件绑定的方式
  onMounted(() => {
    document.addEventListener('delete-timeslot', deleteEventListener, true);
    document.addEventListener('start-copy', copyEventListener, true);
    document.addEventListener('handle-copy', handleCopyEventListener, true);
    document.addEventListener('cancel-copy', cancelCopyEventListener, true);
  });

  onUnmounted(() => {
    document.removeEventListener('delete-timeslot', deleteEventListener, true);
    document.removeEventListener('start-copy', copyEventListener, true);
    document.removeEventListener('handle-copy', handleCopyEventListener, true);
    document.removeEventListener('cancel-copy', cancelCopyEventListener, true);
  });

  async function initCalendar() {
    dateRange.value = [dayjs(), dayjs().add(7, 'days')];
  }

  function handleEventClick(arg: any) {
    const timeslotId = Number(arg.event.id);
    const currentTimeslot = timeslots.value.get(timeslotId);

    if (!currentTimeslot) return;

    // 如果customer_id和streamer_id没变化，则直接返回
    if (
      currentTimeslot.customer_id === selectedBrandId.value &&
      currentTimeslot.streamer_id === selectedStreamId.value
    ) {
      return;
    }

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
      resourceId,
      room_id: Number(roomId),
      start: `${rangeStartDate} ${newStartTime}`, // 用于显示
    };

    // 检查时间冲突，排除当前时段
    const hasConflict = [...timeslots.value.values()]
      .filter((slot) => slot.id !== timeslotId)
      .some((slot) => checkTimeConflict(updatedTimeslot));

    if (hasConflict) {
      message.error('移动后的时间段与现有时间段冲突');
      arg.revert();
      return;
    }

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

    // 检查时间冲突，排除当前时段
    const hasConflict = [...timeslots.value.values()]
      .filter((slot) => slot.id !== timeslotId)
      .some((slot) => checkTimeConflict(updatedTimeslot));

    if (hasConflict) {
      message.error('调整后的时间段与现有时间段冲突');
      arg.revert();
      return;
    }

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

    // 检查时间冲突，如果冲突了，尝试减少半小时，再冲突再减少半小时，如果最后还是冲突，则提示错误
    const hasConflict = checkTimeConflict(newTimeslot);
    if (hasConflict) {
      newTimeslot.finish_date = dayjs(newTimeslot.finish_date)
        .subtract(30, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
      newTimeslot.end = dayjs(selectInfo.start)
        .add(1.5, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    const hasConflict2 = checkTimeConflict(newTimeslot);
    if (hasConflict2) {
      newTimeslot.finish_date = dayjs(newTimeslot.finish_date)
        .subtract(30, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
      newTimeslot.end = dayjs(selectInfo.start)
        .add(1, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    const hasConflict3 = checkTimeConflict(newTimeslot);
    if (hasConflict3) {
      newTimeslot.finish_date = dayjs(newTimeslot.finish_date)
        .subtract(30, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
      newTimeslot.end = dayjs(selectInfo.start)
        .add(0.5, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    const hasConflict4 = checkTimeConflict(newTimeslot);
    if (hasConflict4) {
      message.error('当前时间段已被占用');
      return;
    }

    // 使用 begin_date 转换为时间戳作为临时 id
    const tempId = dayjs(newTimeslot.begin_date).valueOf() + Number(roomId);
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

  function handleCopy(
    targetResourceId: string,
    mode: 'insert' | 'override' = 'override',
  ) {
    // 使用当前的copyingResourceId作为源
    if (!copyingResourceId.value) return;

    // 解析源和目标的日期和房间ID
    const [sourceDate, sourceRoomId] = copyingResourceId.value.split('_');
    const [targetDate, targetRoomId] = targetResourceId.split('_');

    // 1. 处理目标位置的现有时间段
    // 找出目标位置的所有时间段
    const targetTimeslots = [...timeslots.value.values()].filter(
      (slot) => slot.resourceId === targetResourceId,
    );

    // 如果是覆盖模式，先清除目标位置的时间段
    if (mode === 'override') {
      // 处理目标位置的时间段
      for (const slot of targetTimeslots) {
        if (slot.create === 1 && slot.id) {
          // 如果是新创建的，直接从maps中删除
          timeslots.value.delete(slot.id);
          changedTimeslots.value.delete(slot.id);
        } else {
          if (slot.id) {
            // 如果是已存在的，标记为删除
            const updatedSlot = {
              ...slot,
              remove: 1,
            };
            timeslots.value.delete(slot.id);
            changedTimeslots.value.set(slot.id, updatedSlot);
          }
        }
      }
    }

    // 2. 复制源位置的时间段到目标位置
    const sourceTimeslots = [...timeslots.value.values()].filter(
      (slot) => slot.resourceId === copyingResourceId.value,
    );

    for (const sourceSlot of sourceTimeslots) {
      // 创建新的时间段（作为新增）
      // 获取源时间段的时间部分
      const startTime = dayjs(sourceSlot.begin_date).format('HH:mm:ss');
      const endTime = dayjs(sourceSlot.finish_date).format('HH:mm:ss');

      // 使用目标日期和源时间创建新的日期时间
      const newStartDate = `${targetDate} ${startTime}`;
      const newEndDate = `${targetDate} ${endTime}`;

      // 使用当前时间戳作为临时ID
      const tempId = dayjs(newStartDate).valueOf() + Number(targetRoomId);

      // 创建新的时间段
      const newSlot: TimeslotUpdate = {
        ...sourceSlot,
        begin_date: newStartDate,
        create: 1, // 标记为新创建
        finish_date: newEndDate,
        id: tempId,
        resourceId: targetResourceId,
        room_id: Number(targetRoomId),
        // 用于显示的属性
      };

      // 如果是插入模式，检查时间冲突
      if (mode === 'insert') {
        // 检查是否与目标位置的现有时间段冲突
        const hasConflict = checkTimeConflict(newSlot);
        if (hasConflict) {
          // 如果冲突，跳过此时间段
          continue;
        }
      }

      // 添加到maps
      timeslots.value.set(tempId, newSlot);
      changedTimeslots.value.set(tempId, newSlot);
    }

    // 复制完成后重置状态
    isCopying.value = false;
    copyingResourceId.value = '';

    console.log('copy', timeslots.value);
    console.log('copyend', timeslotList.value);

    // 强制更新 calendar options
    calendarOptions.value.resourceLabelContent = (arg: any) => {
      const [dateStr, roomId] = arg.resource.id.split('_');
      const room = useRoomStore().getRoomById(Number(roomId));

      return {
        html: `
            <div class="flex flex-col p-2" onclick="event.stopPropagation();">
              ${isOneDay.value ? '' : `<div class="text-sm text-gray-600 mb-1">${dateStr}</div>`}
              <div class="flex items-center gap-2">
                
                <span class="font-medium">${room?.name || ''}</span>
              </div>
              <div class="flex gap-2 mt-2">
                ${
                  isCopying.value
                    ? arg.resource.id === copyingResourceId.value
                      ? `<button
                          class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('cancel-copy', {
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >取消</button>`
                      : `<button
                          class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('handle-copy', {
                              detail: { 
                                targetResourceId: '${arg.resource.id}',
                                mode: 'insert'
                              },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >插入</button>
                        <button
                          class="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('handle-copy', {
                              detail: { 
                                targetResourceId: '${arg.resource.id}',
                                mode: 'override'
                              },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >覆盖</button>`
                    : `<button 
                          class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('start-copy', {
                              detail: { resourceId: '${arg.resource.id}' },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >复制</button>`
                }
              </div>
            </div>
          `,
      };
    };
  }

  // 检查时间冲突
  function checkTimeConflict(newSlot: TimeslotUpdate): boolean {
    return [...timeslots.value.values()].some((slot) => {
      // 排除自身
      if (slot.id === newSlot.id) return false;

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
            customers.value.set(customer.id, customer);
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
        customers.value.set(res.data.id, res.data);
      }
    } finally {
      customerUpdateLoading.value = false;
    }
  }

  // 隐藏品牌方
  async function hideCustomer(customer: CustomerUpdate) {
    const result = await _hideCustomer(customer);
    if (result && result.success && customer.id) {
      // 移除customer
      customers.value.delete(customer.id);
      notification.success({
        description: $t('操作成功'),
        message: $t('操作成功'),
      });
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
      name: customer.brand,
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

  // 修改对 timeslots 的监听
  watch(
    [timeslots, selectedCustomerIds, selectedStreamerIds],
    ([newTimeslots]) => {
      const timeslots = [...newTimeslots.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA)
        .map(([_, timeslot]) => ({ ...timeslot }))
        // 过滤掉标记为删除的时间段
        .filter((timeslot) => !timeslot.remove);

      console.log('timeslots changed by watch', timeslots);
      console.log('timeslotList changed by watch', timeslotList.value);

      // 根据选中的客户和主播进行过滤
      timeslotList.value = timeslots.filter((timeslot) => {
        // 如果有选中的客户，检查是否匹配
        if (selectedCustomerIds.value.length > 0) {
          const customerId = timeslot.customer_id;
          if (!customerId || !selectedCustomerIds.value.includes(customerId)) {
            return false;
          }
        }

        // 如果有选中的主播，检查是否匹配
        if (selectedStreamerIds.value.length > 0) {
          const streamerId = timeslot.streamer_id;
          if (!streamerId || !selectedStreamerIds.value.includes(streamerId)) {
            return false;
          }
        }

        return true;
      });
    },
    { deep: true },
  );

  function handleBrandClick(brandId: number) {
    selectedBrandId.value =
      selectedBrandId.value === brandId ? undefined : brandId;
  }

  // 添加对 selectedRoomIds 的监听
  watch(selectedRoomIds, () => {
    filteredResources.value =
      selectedRoomIds.value.length > 0
        ? resources.value.filter((resource) => {
            const roomId = Number.parseInt(resource.id.split('_')[1]);
            return selectedRoomIds.value.includes(roomId);
          })
        : resources.value;
  });

  // 查询公开时间段
  async function queryPublicTimeslots(code: string) {
    try {
      timeslotQueryLoading.value = true;
      const res = await _queryPublicTimeslots(code);
      if (res && res.success) {
        // 更新 streamers 数据
        const streamerStore = useStreamerStore();
        streamerStore.$reset();
        const roomStore = useRoomStore();
        roomStore.$reset();

        customers.value = new Map();

        // 收集所有的 streamers、rooms 和 customers 数据
        const allStreamers: Streamer[] = [];
        const allRooms: Room[] = [];
        const allCustomers: Customer[] = [];

        const newTimeslots = new Map(timeslots.value);
        const agencyStore = useAgencyStore();
        agencyStore.$reset();
        agencyStore.setAgencies(res.data.agencies);
        res.data.timeslots.forEach((result) => {
          if (result.id) {
            // 收集 streamers 数据
            if (result.streamers) {
              allStreamers.push(...result.streamers);
            }

            // 收集 rooms 数据
            if (result.room) {
              allRooms.push(result.room);
            }

            // 收集 customers 数据
            if (result.customers) {
              allCustomers.push(...result.customers);
            }

            const actualDate = dayjs(result.begin_date).format('YYYY-MM-DD');
            const startTime = dayjs(result.begin_date).format('HH:mm:ss');
            const endTime = dayjs(result.finish_date).format('HH:mm:ss');
            const today = dayjs().format('YYYY-MM-DD');

            const enrichedResult = {
              ...result,
              begin_date: result.begin_date,
              customer_id: result.customers?.[0]?.id,
              end: `${today} ${endTime}`,
              finish_date: result.finish_date,
              resourceId: `${actualDate}_${result.room_id}`,
              start: `${today} ${startTime}`,
              streamer_id: result.streamers?.[0]?.id,
            };
            newTimeslots.set(result.id, enrichedResult);
          }
        });

        // 更新 stores
        streamerStore.setStreamers(allStreamers);
        roomStore.setRooms(allRooms);
        // 更新 customers
        allCustomers.forEach((customer) => {
          if (customer.id) {
            customers.value.set(customer.id, customer);
          }
        });

        timeslots.value = newTimeslots;
      }
    } finally {
      timeslotQueryLoading.value = false;
    }
  }

  async function queryPublicTimeslotsStreamer(code: string) {
    try {
      timeslotQueryLoading.value = true;
      const res = await _queryPublicTimeslotsStreamer(code);
      if (res && res.success) {
        // 更新 streamers 数据
        const streamerStore = useStreamerStore();
        streamerStore.$reset();
        const roomStore = useRoomStore();
        roomStore.$reset();

        customers.value = new Map();

        // 收集所有的 streamers、rooms 和 customers 数据
        const allStreamers: Streamer[] = [];
        const allRooms: Room[] = [];
        const allCustomers: Customer[] = [];

        const newTimeslots = new Map(timeslots.value);
        const agencyStore = useAgencyStore();
        agencyStore.$reset();
        agencyStore.setAgencies(res.data.agencies);
        res.data.timeslots.forEach((result) => {
          if (result.id) {
            // 收集 streamers 数据
            if (result.streamers) {
              allStreamers.push(...result.streamers);
            }

            // 收集 rooms 数据
            if (result.room) {
              allRooms.push(result.room);
            }

            // 收集 customers 数据
            if (result.customers) {
              allCustomers.push(...result.customers);
            }

            const actualDate = dayjs(result.begin_date).format('YYYY-MM-DD');
            const startTime = dayjs(result.begin_date).format('HH:mm:ss');
            const endTime = dayjs(result.finish_date).format('HH:mm:ss');
            const today = dayjs().format('YYYY-MM-DD');

            const enrichedResult = {
              ...result,
              begin_date: result.begin_date,
              customer_id: result.customers?.[0]?.id,
              end: `${today} ${endTime}`,
              finish_date: result.finish_date,
              resourceId: `${actualDate}_${result.room_id}`,
              start: `${today} ${startTime}`,
              streamer_id: result.streamers?.[0]?.id,
            };
            newTimeslots.set(result.id, enrichedResult);
          }
        });

        // 更新 stores
        streamerStore.setStreamers(allStreamers);
        roomStore.setRooms(allRooms);
        // 更新 customers
        allCustomers.forEach((customer) => {
          if (customer.id) {
            customers.value.set(customer.id, customer);
          }
        });

        timeslots.value = newTimeslots;
      }
    } finally {
      timeslotQueryLoading.value = false;
    }
  }

  function handleEventMouseEnter(info: any) {
    const timeslotId = Number(info.event.id);
    const timeslot = timeslots.value.get(timeslotId);
    if (!timeslot) return;

    // 计算时间区间
    const startTime = dayjs(timeslot.begin_date);
    const endTime = dayjs(timeslot.finish_date);
    const durationHours = endTime.diff(startTime, 'hour', true);

    // 只有当时间区间小于2小时时才显示tooltip
    if (durationHours >= 2) return;

    const customer =
      timeslot.customer_id && timeslot.customer_id > 0
        ? customers.value.get(timeslot.customer_id)
        : null;
    const streamer =
      timeslot.streamer_id && timeslot.streamer_id > 0
        ? useStreamerStore().getStreamerById(timeslot.streamer_id)
        : null;

    const startTimeStr = startTime.format('HH:mm');
    const endTimeStr = endTime.format('HH:mm');

    const tooltipContent = `
      <div class="p-2 bg-white rounded shadow-lg text-sm">
        ${customer ? `<div class="mb-1">品牌：${customer.brand}</div>` : ''}
        ${streamer ? `<div class="mb-1">主播：${streamer.name}</div>` : ''}
        <div>时间：${startTimeStr} - ${endTimeStr}</div>
      </div>
    `;

    // 创建或更新 tooltip
    const tooltip = document.createElement('div');
    tooltip.innerHTML = tooltipContent;
    tooltip.className = 'fc-tooltip absolute z-50';
    tooltip.style.left = `${info.jsEvent.pageX + 10}px`;
    tooltip.style.top = `${info.jsEvent.pageY + 10}px`;
    document.body.append(tooltip);
  }

  function handleEventMouseLeave() {
    // 移除所有 tooltip
    const tooltips = document.querySelectorAll('.fc-tooltip');
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  // 添加对 readonly 的监听，更新日历选项
  watch(readonly, (newValue) => {
    calendarOptions.value.editable = !newValue;
    calendarOptions.value.selectable = !newValue;
    calendarOptions.value.eventClick = newValue ? null : handleEventClick;
    calendarOptions.value.eventDrop = newValue ? null : handleEventDropChange;
    calendarOptions.value.eventResize = newValue ? null : handleEventChange;
    calendarOptions.value.select = newValue ? null : handleSelect;
  });

  // 修改开始复制的函数
  function startCopy(resourceId: string) {
    isCopying.value = true;
    copyingResourceId.value = resourceId;
    // 强制更新 calendar options
    calendarOptions.value.resourceLabelContent = (arg: any) => {
      const [dateStr, roomId] = arg.resource.id.split('_');
      const room = useRoomStore().getRoomById(Number(roomId));

      return {
        html: `
            <div class="flex flex-col p-2" onclick="event.stopPropagation();">
              ${isOneDay.value ? '' : `<div class="text-sm text-gray-600 mb-1">${dateStr}</div>`}
              <div class="flex items-center gap-2">
                
                <span class="font-medium">${room?.name || ''}</span>
              </div>
              <div class="flex gap-2 mt-2">
                ${
                  isCopying.value
                    ? arg.resource.id === copyingResourceId.value
                      ? `<button
                          class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('cancel-copy', {
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >取消</button>`
                      : `<button
                          class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('handle-copy', {
                              detail: { 
                                targetResourceId: '${arg.resource.id}',
                                mode: 'insert'
                              },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >插入</button>
                        <button
                          class="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('handle-copy', {
                              detail: { 
                                targetResourceId: '${arg.resource.id}',
                                mode: 'override'
                              },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >覆盖</button>`
                    : `<button 
                          class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('start-copy', {
                              detail: { resourceId: '${arg.resource.id}' },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >复制</button>`
                }
              </div>
            </div>
          `,
      };
    };
  }

  // 修改取消复制的函数
  function cancelCopy() {
    isCopying.value = false;
    copyingResourceId.value = '';

    // 强制更新 calendar options
    calendarOptions.value.resourceLabelContent = (arg: any) => {
      const [dateStr, roomId] = arg.resource.id.split('_');
      const room = useRoomStore().getRoomById(Number(roomId));

      return {
        html: `
            <div class="flex flex-col p-2" onclick="event.stopPropagation();">
              ${isOneDay.value ? '' : `<div class="text-sm text-gray-600 mb-1">${dateStr}</div>`}
              <div class="flex items-center gap-2">
                
                <span class="font-medium">${room?.name || ''}</span>
              </div>
              <div class="flex gap-2 mt-2">
                ${
                  isCopying.value
                    ? arg.resource.id === copyingResourceId.value
                      ? `<button
                          class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('cancel-copy', {
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >取消</button>`
                      : `<button
                          class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('handle-copy', {
                              detail: { 
                                targetResourceId: '${arg.resource.id}',
                                mode: 'insert'
                              },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >插入</button>
                        <button
                          class="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('handle-copy', {
                              detail: { 
                                targetResourceId: '${arg.resource.id}',
                                mode: 'override'
                              },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >覆盖</button>`
                    : `<button 
                          class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          onclick="(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const evt = new CustomEvent('start-copy', {
                              detail: { resourceId: '${arg.resource.id}' },
                              bubbles: false
                            });
                            document.dispatchEvent(evt);
                            return false;
                          })(event)"
                        >复制</button>`
                }
              </div>
            </div>
          `,
      };
    };
  }

  return {
    $reset,
    brandList,
    brandMap,
    calendarOptions,
    cancelCopy,
    changedTimeslots,
    closeCustomerModal,
    copyingResourceId,
    customerList,
    customerModalLoading,
    customerModalVisible,
    customerOptions,
    customerQueryLoading,
    customers,
    customerUpdateLoading,
    dateRange,
    editingCustomer,
    filteredResources,
    handleBrandClick,
    handleCopy,
    handleDeleteTimeslot,
    handleEventChange,
    handleEventClick,
    handleEventContent,
    handleEventMouseEnter,
    handleEventMouseLeave,
    handleSelect,
    hideCustomer,
    initCalendar,
    isCopying,
    isOneDay,
    queryCustomers,
    queryPublicTimeslots,
    queryPublicTimeslotsStreamer,
    queryTimeslots,
    readonly,
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
    showAddCustomerModal,
    showEditCustomerModal,
    startCopy,
    streamerList,
    timeslotList,
    timeslotQueryLoading,
    timeslots,
    timeslotSaveLoading,
    updateCustomer,
  };
});
