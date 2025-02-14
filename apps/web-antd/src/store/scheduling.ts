import { computed, ref } from 'vue';

import timelinePlugin from '@fullcalendar/resource-timeline';
import dayjs, { Dayjs } from 'dayjs';
import { defineStore } from 'pinia';

import { useRoomStore } from './room';

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

  const brandMap = ref({});

  const dateRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs().add(7, 'days')]);

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

  const calendarOptions = computed(() => ({
    editable: true,
    events: [],
    headerToolbar: {
      center: '',
      end: '',
      start: 'title',
    },
    height: 'auto',
    initialDate: dateRange.value[0].format('YYYY-MM-DD'),
    initialView: 'resourceTimelineDay',
    plugins: [timelinePlugin],
    resourceAreaColumns: [
      { field: 'date', group: true, headerContent: '日期' },
      { field: 'rooms', headerContent: '直播间' },
    ],
    resourceAreaWidth: '20%',
    resources: resources.value,
    slotLabelFormat: { hour: '2-digit', hour12: false }, // 24-hour format
  }));

  const brandList = computed(() => {
    return Object.values(brandMap.value);
  });

  const selectedBrandId = ref<string | undefined>();

  function queryBrand() {
    brandMap.value = _queryBrand();
  }

  function $reset() {
    showAISchedulingModal.value = false;
    brandMap.value = {};
  }

  return {
    $reset,
    brandList,
    brandMap,
    calendarOptions,
    dateRange,
    queryBrand,
    selectedBrandId,
    showAISchedulingModal,
  };
});
