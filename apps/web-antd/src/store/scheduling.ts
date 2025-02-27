import { computed, ref, watch } from 'vue';

import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayjs, { Dayjs } from 'dayjs';
import { defineStore } from 'pinia';

import { useAIBotStore } from './aibot';
import { useRoomStore } from './room';
import { useStreamerStore } from './streamer';

function _queryBrand() {
  return {
    1: {
      desc: '品牌1描述',
      id: 1,
      name: '品牌1',
    },
    2: {
      desc: '品牌2描述',
      id: 2,
      name: '品牌2',
    },
    3: {
      desc: '品牌3描述',
      id: 3,
      name: '品牌3',
    },
    4: {
      desc: '品牌4描述',
      id: 4,
      name: '品牌4',
    },
    5: {
      desc: '品牌5描述',
      id: 5,
      name: '品牌5',
    },
    6: {
      desc: '品牌6描述',
      id: 6,
      name: '品牌6',
    },
    7: {
      desc: '品牌7描述',
      id: 7,
      name: '品牌7',
    },
    8: {
      desc: '品牌8描述',
      id: 8,
      name: '品牌8',
    },
    9: {
      desc: '品牌9描述',
      id: 9,
      name: '品牌9',
    },
    10: {
      desc: '品牌10描述',
      id: 10,
      name: '品牌10',
    },
  };
}

export const useSchedulingStore = defineStore('scheduling-store', () => {
  const showAISchedulingModal = ref(false);

  const inputValue = ref('');

  watch(showAISchedulingModal, (newVal) => {
    if (newVal) {
      schedulingResult.value = '';
      inputValue.value = '';
    }
  });

  const brandMap = ref<
    Record<number, { desc: string; id: number; name: string }>
  >({});

  const filterBrandIds = ref<number[]>([]);
  watch(filterBrandIds, (newVal) => {
    filterData();
  });

  const brandOptions = computed(() => {
    return Object.values(brandMap.value).map((brand) => ({
      label: brand.name,
      value: brand.id,
    }));
  });

  const dateRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs()]);

  watch(dateRange, (newVal) => {
    const resourceList = [];

    for (const dateString of allDates.value) {
      for (const room of useRoomStore().roomList) {
        resourceList.push({
          date: dateString,
          id: `${dateString}_${room.id}`,
          rooms: room.name,
        });
      }
    }

    resources.value = resourceList;
    filteredDates.value = [];
    filteredRooms.value = [];
  });

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

  function filterData() {
    // 过滤品牌
    filteredAllEvents.value =
      filterBrandIds.value.length > 0
        ? allEvents.value.filter((event) =>
            filterBrandIds.value.includes(event.brandId),
          )
        : allEvents.value;
    let storedFilteredAllEvents = filteredAllEvents.value;
    // 过滤日期
    filteredAllEvents.value =
      filteredDates.value.length > 0
        ? storedFilteredAllEvents.filter((event) =>
            filteredDates.value.includes(event.resourceId.split('_')[0]),
          )
        : storedFilteredAllEvents;
    storedFilteredAllEvents = filteredAllEvents.value;

    filteredResources.value =
      filteredDates.value.length > 0
        ? resources.value.filter((resource) =>
            filteredDates.value.includes(resource.date),
          )
        : resources.value;

    // 过滤直播间
    filteredAllEvents.value =
      filteredRooms.value.length > 0
        ? storedFilteredAllEvents.filter((event) =>
            filteredRooms.value.includes(event.roomId.toString()),
          )
        : storedFilteredAllEvents;

    // 处理resourceAreaColumns
    if (filteredDates.value.length === 1 || filteredRooms.value.length === 1) {
      if (
        filteredDates.value.length === 1 &&
        filteredRooms.value.length === 1
      ) {
        resourceAreaColumns.value = [];
      } else if (filteredDates.value.length === 1) {
        resourceAreaColumns.value = [
          { field: 'rooms', headerContent: '直播间' },
        ];
      } else if (filteredRooms.value.length === 1) {
        resourceAreaColumns.value = [{ field: 'date', headerContent: '日期' }];
      }
    } else {
      resourceAreaColumns.value = [
        { field: 'date', group: true, headerContent: '日期' },
        { field: 'rooms', headerContent: '直播间' },
      ];
    }
  }

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
  const filteredDates = ref<string[]>([]);
  watch(filteredDates, (newVal) => {
    filterData();
  });

  const filteredDatesOptions = computed(() => {
    return allDates.value.map((date) => ({
      label: date,
      value: date,
    }));
  });

  const filteredRooms = ref<any[]>([]);
  watch(filteredRooms, (newVal) => {
    filterData();
  });

  const filteredRoomsOptions = computed(() => {
    return useRoomStore().roomList.map((room) => ({
      label: room.name,
      value: room.id?.toString() || '',
    }));
  });
  const allEvents = ref<any[]>([]);
  const filteredAllEvents = ref<any[]>([]);
  watch(filteredAllEvents, (newVal) => {
    calendarOptions.value.events = newVal;
  });

  watch(allEvents, (newVal) => {
    filteredAllEvents.value = allEvents.value;
  });

  const calendarOptions = ref({
    dateClick: null,
    editable: true,
    eventClick: handleEventClick,
    eventContent: handleEventContent,
    eventDrop: handleEventChange,
    eventResize: handleEventChange,
    events: allEvents.value,
    expandRows: true,
    headerToolbar: {
      center: '',
      end: '',
      start: 'title',
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
  });

  const brandList = computed(() => {
    return Object.values(brandMap.value);
  });

  const selectedBrandId = ref<string | undefined>();

  const selectedStreamId = ref<number | undefined>();

  function queryBrand() {
    brandMap.value = _queryBrand();
  }

  const schedulingResult = ref<string>('');

  function handleEventContent(arg: any) {
    const event = allEvents.value.find((ev: any) => ev.id === arg.event.id);
    const roomId = event.roomId;
    const roomName = useRoomStore().getRoomById(Number(roomId))?.name;

    const streamerId = event.streamerId;
    let streamer;
    if (streamerId) {
      streamer = useStreamerStore().getStreamerById(Number(streamerId));
    }

    const brandId = event.brandId;
    let brand;
    if (brandId) {
      brand = brandMap.value[brandId];
    }

    return {
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 8px;
          gap: 6px;
          background-color: #f5f5f5;
          
        ">
          <!-- 品牌名称 -->
          ${
            brand
              ? `
            <div style="
              font-size: 14px;
              font-weight: bold;
              color: #262626;
            ">${brand.name}</div>
          `
              : ''
          }
          
          <!-- 时间 -->
          <div style="
            font-size: 12px;
            color: #595959;
          ">${arg.event.title}</div>
          
          <!-- 主播信息 -->
          ${
            streamer
              ? `
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              background-color: rgba(255, 255, 255, 0.8);
              padding: 4px 6px;

            ">
              <img 
                src="${streamer.avatar}" 
                alt="Avatar" 
                style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  object-fit: cover;
                "
              >
              <span style="
                font-size: 12px;
                color: #434343;
              ">${streamer.name || '未知主播'}</span>
            </div>
          `
              : ''
          }
        </div>
      `,
    };
  }

  async function handleAIScheduling() {
    schedulingResult.value = '';
    useAIBotStore().queryScheduling(inputValue.value, (chunk) => {
      schedulingResult.value += chunk;
    });
  }

  async function initCalendar() {
    useStreamerStore().queryStreamer();
    queryBrand();
    await useRoomStore().queryRoom();
    dateRange.value = [dayjs(), dayjs().add(7, 'days')];
  }

  function handleEventClick(arg: any) {
    console.log('handleEventClick', arg);
    const event = allEvents.value.find((ev: any) => ev.id === arg.event.id);
    if (event) {
      event.streamerId = selectedStreamId.value
        ? selectedStreamId.value.toString()
        : undefined;
      event.brandId = selectedBrandId.value ?? undefined;

      // 更新标题显示
      const startTime = dayjs(event.start).format('HH:mm');
      const endTime = dayjs(event.end).format('HH:mm');
      event.title = `${startTime} - ${endTime}`;

      // 强制更新事件显示
      arg.event.setProp('title', event.title);
    }
  }

  function handleEventChange(arg: any) {
    const event = allEvents.value.find((ev: any) => ev.id === arg.event.id);
    if (event) {
      event.start = arg.event.start;
      event.end = arg.event.end;
      // 更新标题显示
      const startTime = dayjs(event.start).format('HH:mm');
      const endTime = dayjs(event.end).format('HH:mm');
      event.title = `${startTime} - ${endTime}`;

      // 强制更新事件显示
      arg.event.setProp('title', event.title);
    }
  }

  let eventCount = 0;

  function handleSelect(selectInfo: any) {
    const resourceId = selectInfo.resource.id;
    const startDate = dayjs(selectInfo.start);
    let endDate = dayjs(selectInfo.end);

    // 如果时间差小于等于30分钟（说明是点击），则设置为2小时
    if (endDate.diff(startDate, 'minutes') <= 30) {
      endDate = startDate.add(2, 'hour');
    }

    addEventWithTime(resourceId, startDate, endDate);
  }

  function addEventWithTime(
    resourceId: string,
    startDate: Dayjs,
    endDate: Dayjs,
  ) {
    const roomId = `${resourceId.split('_')[1]}`;
    const start_time = startDate.format('HH:mm');
    const end_time = endDate.format('HH:mm');
    const streamerId = selectedStreamId.value;
    const brandId = selectedBrandId.value;

    const newEvent = {
      brandId,
      end: endDate.format('YYYY-MM-DD HH:mm'),
      id: eventCount.toString(),
      resourceId,
      roomId,
      start: startDate.format('YYYY-MM-DD HH:mm'),
      streamerId,
      title: `${start_time} - ${end_time}`,
    };

    allEvents.value.push(newEvent);
    eventCount++;
  }

  function findAvailableRoomId(start: Dayjs, end: Dayjs) {
    const events = allEvents.value;

    const occupiedRoomIds: string[] = [];
    for (const event of events) {
      const eventDate = event.resourceId.split('_')[0];
      if (
        eventDate === start.format('YYYY-MM-DD') ||
        eventDate === end.format('YYYY-MM-DD')
      ) {
        const eventStart = dayjs(
          `${eventDate} ${dayjs(event.start).format('HH:mm')}`,
        );
        const eventEnd = dayjs(
          `${eventDate} ${dayjs(event.end).format('HH:mm')}`,
        );
        if (
          !(
            (
              end.isBefore(eventStart) ||
              end.isSame(eventStart) || // 结束时间在事件开始之前
              start.isAfter(eventEnd) ||
              start.isSame(eventEnd)
            ) // 开始时间在事件结束之后
          ) &&
          event.resourceId
        ) {
          occupiedRoomIds.push(event.resourceId.split('_')[1]);
        }
      }
    }
    const availableRoomIds = useRoomStore().roomList.filter(
      (room) => room.id && !occupiedRoomIds.includes(room.id.toString()),
    );

    return availableRoomIds.length > 0 ? availableRoomIds[0].id : undefined;
  }

  function addEventsToCalendar() {
    const aiSchedulingResult = JSON.parse(schedulingResult.value);
    for (const result of aiSchedulingResult) {
      const date = dateRange.value[0].format('YYYY-MM-DD');
      const start = dayjs(result.start);
      const end = dayjs(result.end);
      const availableRoomId = findAvailableRoomId(start, end);
      if (!availableRoomId) {
        continue;
      }
      const resourceId = `${start.format('YYYY-MM-DD')}_${availableRoomId}`;
      addEventWithTime(resourceId, start, end);
    }
    showAISchedulingModal.value = false;
  }

  function $reset() {
    showAISchedulingModal.value = false;
    brandMap.value = {};
  }

  return {
    $reset,
    addEventsToCalendar,
    brandList,
    brandMap,
    brandOptions,
    calendarOptions,
    dateRange,
    filterBrandIds,
    filteredDates,
    filteredDatesOptions,
    filteredRooms,
    filteredRoomsOptions,
    handleAIScheduling,
    initCalendar,
    inputValue,
    queryBrand,
    schedulingResult,
    selectedBrandId,
    selectedStreamId,
    showAISchedulingModal,
  };
});
