import type {
  StanderResult,
  Streamer,
  StreamerCreate,
  StreamerQuery,
} from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

enum StreamerApi {
  CreateStreamer = 'streamer/create',
  QueryStreamer = 'streamer/query',
  UpdateStreamer = 'streamer/update',
}

function getAllStreamer(params?: StreamerQuery) {
  return requestClient.post<StanderResult<Streamer[]>>(
    StreamerApi.QueryStreamer,
    params,
  );
}

function newStreamer(params: StreamerCreate) {
  return requestClient.post<StanderResult<Streamer>>(
    StreamerApi.CreateStreamer,
    params,
  );
}

function updateStreamer(params: Streamer) {
  return requestClient.post<StanderResult<Streamer>>(
    StreamerApi.UpdateStreamer,
    params,
  );
}

export const useStreamerStore = defineStore('streamer-store', () => {
  const streamerLoading = ref(false);
  const streamerCreateLoading = ref(false);
  const streamerCreate = ref<StreamerCreate>({
    account: '',
    name: '',
    password: '',
  });

  const isEditing = ref(false);

  const streamers = ref<Map<number, Streamer>>(new Map());

  const streamerList = computed(() => {
    return [...streamers.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, streamer]) => streamer);
  });

  const showModal = ref(false);

  const streamerQuery = ref<StreamerQuery>({
    agency_id: -1,
    ids: [],
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  function $reset() {
    streamerLoading.value = false;
    streamerCreateLoading.value = false;
    streamerQuery.value.q_id = -1;

    streamerQuery.value = {
      agency_id: -1,
      ids: [],
      q_id: -1,
      q_order: 'desc',
      q_size: 5,
    };
    streamers.value = new Map();
  }

  async function queryStreamer() {
    try {
      streamerLoading.value = true;
      const res = await getAllStreamer(streamerQuery.value);
      if (res.success) {
        if (res.data.length > 0) {
          const lastStreamer = res.data.at(-1);
          if (lastStreamer) {
            streamerQuery.value.q_id = lastStreamer.id;
          }
        }
        res.data.forEach((streamer) => {
          streamers.value.set(streamer.id, streamer);
        });
      }
    } finally {
      streamerLoading.value = false;
    }
  }

  async function createStreamer() {
    try {
      if (!streamerCreate.value.name) {
        notification.error({
          description: $t('请输入名称'),
          message: $t('验证失败'),
        });
        return;
      }
      streamerCreateLoading.value = true;

      const res = await newStreamer(streamerCreate.value);
      if (res.success) {
        streamers.value.set(res.data.id, res.data);
        showModal.value = false;
        streamerCreate.value = {
          account: '',
          name: '',
          password: '',
        };
        notification.success({
          description: $t('新增主播成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      streamerCreateLoading.value = false;
    }
  }

  async function modifyStreamer(updatedStreamer: Streamer) {
    try {
      streamerLoading.value = true;
      const res = await updateStreamer(updatedStreamer);
      if (res.success) {
        if (res.data.hide === 1) {
          streamers.value.delete(res.data.id);
        } else {
          streamers.value.set(res.data.id, res.data);
        }
        showModal.value = false;
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      streamerLoading.value = false;
    }
  }

  return {
    $reset,
    createStreamer,
    isEditing,
    modifyStreamer,
    queryStreamer,
    showModal,
    streamerCreate,
    streamerCreateLoading,
    streamerList,
    streamerLoading,
    streamerQuery,
    streamers,
  };
});
