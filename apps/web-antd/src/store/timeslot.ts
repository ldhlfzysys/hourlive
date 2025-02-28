// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  BaseQuery,
  StandardResponse,
  TimeslotRead,
  TimeslotUpdate,
} from '#/types/schemas';

// API
function _getAllTimeslot(params?: BaseQuery) {
  return requestClient.post<StandardResponse<TimeslotRead[]>>(
    'timeslot/query',
    params,
  );
}

function _newTimeslot(params: TimeslotUpdate) {
  return requestClient.post<StandardResponse<TimeslotRead>>(
    'timeslot/create',
    params,
  );
}

function _updateTimeslot(params: TimeslotUpdate) {
  return requestClient.post<StandardResponse<TimeslotRead>>(
    'timeslot/update',
    params,
  );
}

function _queryTimeslotById(params: BaseQuery) {
  return requestClient.post<StandardResponse<TimeslotRead[]>>(
    'timeslot/query/ids',
    params,
  );
}

// store
export const useTimeslotStore = defineStore('timeslot-store', () => {
  // data
  const timeslots = ref<Map<number, TimeslotRead>>(new Map());

  const timeslotList = computed(() => {
    return [...timeslots.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, timeslot]) => timeslot);
  });

  const currentTimeslot = ref<TimeslotRead>({
    begin_date: '',
    finish_date: '',
    hourlive_money_cost: 0,
    type: 0,
  });

  // UI - loading
  const queryTimeslotLoading = ref(false);
  const updateTimeslotLoading = ref(false);
  const timeslotCreateLoading = ref(false);

  // UI - modal
  const showModal = ref(false);

  const timeslotQuery = ref<BaseQuery>({
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  const timeslotCreate = ref<TimeslotUpdate>({
    begin_date: '',
    finish_date: '',
    hourlive_money_cost: 0,
    streamers: [],
  });

  // 适配select组件
  const timeslotOptions = computed(() => {
    return timeslotList.value.map((item: TimeslotRead) => {
      if (item.id) {
        return {
          label: `${item.id} - ${item.begin_date} ~ ${item.finish_date}`,
          value: item.id,
        };
      }
      return { label: String(item.id), value: item.id };
    });
  });

  // methods
  function makeCreate() {
    showModal.value = true;
    timeslotCreate.value = {
      begin_date: '',
      finish_date: '',
      hourlive_money_cost: 0,
      streamers: [],
    };
  }

  function makeUpdate(id: number) {
    showModal.value = true;
    const timeslot = timeslots.value.get(id);
    if (timeslot) {
      currentTimeslot.value = timeslot;
    }
  }

  async function timeslotById(id: number) {
    const timeslot = timeslots.value.get(id);
    if (timeslot) {
      return timeslot;
    }

    queryTimeslotLoading.value = true;
    const res = await _queryTimeslotById({ ids: [id] });
    if (res && res.success && res.data && res.data.length > 0) {
      setTimeslots(res.data);
    }
    queryTimeslotLoading.value = false;
    return timeslots.value.get(id);
  }

  function $reset() {
    queryTimeslotLoading.value = false;
    updateTimeslotLoading.value = false;
    timeslotCreateLoading.value = false;
    timeslotQuery.value = {
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
    currentTimeslot.value = {
      begin_date: '',
      finish_date: '',
      hourlive_money_cost: 0,
      type: 0,
    };
    timeslots.value.clear();
  }

  async function queryTimeslot() {
    try {
      queryTimeslotLoading.value = true;
      const res = await _getAllTimeslot(timeslotQuery.value);
      if (res && res.success) {
        if (res.data && res.data.length > 0) {
          const lastTimeslot = res.data.at(-1);
          if (lastTimeslot && lastTimeslot.id) {
            timeslotQuery.value.q_id = lastTimeslot.id;
          }
        }
        res.data?.forEach((timeslot: TimeslotRead) => {
          if (timeslot.id) {
            timeslots.value.set(timeslot.id, timeslot);
          }
        });
      }
    } finally {
      queryTimeslotLoading.value = false;
    }
  }

  async function createTimeslot() {
    try {
      timeslotCreateLoading.value = true;
      const res = await _newTimeslot(timeslotCreate.value);
      if (res && res.success && res.data && res.data.id) {
        showModal.value = false;
        timeslots.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      timeslotCreateLoading.value = false;
    }
  }

  async function updateTimeslot() {
    try {
      updateTimeslotLoading.value = true;
      const res = await _updateTimeslot(timeslotCreate.value);
      if (res && res.success && res.data && res.data.id) {
        showModal.value = false;
        timeslots.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      updateTimeslotLoading.value = false;
    }
  }

  function setTimeslots(slots: TimeslotRead[]) {
    slots.forEach((slot) => {
      if (slot.id) {
        timeslots.value.set(slot.id, slot);
      }
    });
  }

  return {
    $reset,
    createTimeslot,
    makeCreate,
    makeUpdate,
    queryTimeslot,
    queryTimeslotLoading,
    setTimeslots,
    showModal,
    timeslotById,
    timeslotCreate,
    timeslotCreateLoading,
    timeslotList,
    timeslotOptions,
    timeslotQuery,
    timeslots,
    updateTimeslot,
    updateTimeslotLoading,
  };
});
