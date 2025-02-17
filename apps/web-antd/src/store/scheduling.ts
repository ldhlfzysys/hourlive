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

  const brandMap = ref({});

  const dateRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs().add(7, 'days')]);

  watch(dateRange, (newVal) => {
    calendarOptions.value.resources = resources.value;
  });

  const resources = computed(() => {
    const allDateList = [];

    let startDate = dateRange.value[0];
    const endDate = dateRange.value[1];

    while (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
      allDateList.push(startDate.format('YYYY-MM-DD'));
      startDate = startDate.add(1, 'day');
    }

    const resourceList = [];

    for (const dateString of allDateList) {
      for (const room of useRoomStore().roomList) {
        resourceList.push({
          date: dateString,
          id: `${dateString}_${room.id}`,
          rooms: room.name,
        });
      }
    }

    return resourceList;
  });

  const calendarOptions = ref({
    dateClick: addEvent,
    editable: true,
    events: [],
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
    resourceAreaColumns: [
      { field: 'date', group: true, headerContent: '日期' },
      { field: 'rooms', headerContent: '直播间' },
    ],
    resourceAreaWidth: '20%',
    resources: resources.value,
    slotLabelFormat: { hour: '2-digit', hour12: false }, // 24-hour format
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
    calendarOptions.value.resources = resources.value;
  }

  function addEvent(event: any) {
    // 创建一个新的事件
    const resourceId = event.resource.id;
    const clickDate = dayjs(event.dateStr);

    const dateStr = `${resourceId.split('_')[0]} ${clickDate.format('HH:mm')}`;
    const roomId = `${resourceId.split('_')[1]}`;

    const start_time = clickDate.format('HH:mm');
    const end_time = clickDate.add(2, 'hour').format('HH:mm');

    const newEvent = {
      end: clickDate.add(2, 'hour').format('YYYY-MM-DD HH:mm'),
      resourceId,
      start: clickDate.format('YYYY-MM-DD HH:mm'),
      title: `${start_time} - ${end_time}: ${roomId}`,
    };

    // 将新事件添加到 events 数组中
    calendarOptions.value.events.push(newEvent);
  }

  function findAvailableRoomId(start: Dayjs, end: Dayjs) {
    const events = calendarOptions.value.events;

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
      const newEvent = {
        end: `${date} ${end.format('HH:mm')}`,
        resourceId,
        start: `${date} ${start.format('HH:mm')}`,
        title: 'from ai',
      };
      calendarOptions.value.events.push(newEvent);
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
    calendarOptions,
    dateRange,
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
