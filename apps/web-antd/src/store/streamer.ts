import type { StanderResult, Streamer, StreamerQuery, Tag } from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

enum StreamerApi {
  CreateStreamer = 'streamer/create',
  GetTags = 'streamer/gettags',
  QueryStreamer = 'streamer/query',
  UpdateStreamer = 'streamer/update',
}

function _getAllStreamer(params?: StreamerQuery) {
  return requestClient.post<StanderResult<Streamer[]>>(
    StreamerApi.QueryStreamer,
    params,
  );
}

function _getAllTags() {
  return requestClient.get<StanderResult<Tag[]>>(StreamerApi.GetTags);
}

function _newStreamer(params: Streamer) {
  return requestClient.post<StanderResult<Streamer>>(
    StreamerApi.CreateStreamer,
    params,
  );
}

function _updateStreamer(params: Streamer) {
  return requestClient.post<StanderResult<Streamer>>(
    StreamerApi.UpdateStreamer,
    params,
  );
}

export const useStreamerStore = defineStore('streamer-store', () => {
  const streamerLoading = ref(false);
  const streamerCreateLoading = ref(false);
  const streamerCreate = ref<Streamer>({});

  const isEditing = ref(false);

  const streamers = ref<Map<number, Streamer>>(new Map());
  const tags = ref<Tag[]>([]);

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

  function makeCreate() {
    showModal.value = true;
    if (streamerCreate.value.id) {
      streamerCreate.value = {};
    }
  }

  async function queryStreamer() {
    try {
      streamerLoading.value = true;
      const res = await _getAllStreamer(streamerQuery.value);
      if (res && res.success) {
        res.data.forEach((streamer) => {
          if (streamer.id) {
            streamers.value.set(streamer.id, streamer);
          }
        });
      }
      queryTags();
    } finally {
      streamerLoading.value = false;
    }
  }

  async function queryTags() {
    try {
      const res = await _getAllTags();
      if (res && res.success) {
        tags.value = res.data;
      }
    } finally {
      // streamerLoading.value = false;
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

      if (Array.isArray(streamerCreate.value.tags)) {
        // @ts-ignore 接口tags是number[]
        streamerCreate.value.tags = streamerCreate.value.tags.map(
          (tag) => tag.id,
        );
      }

      const res = await _newStreamer(streamerCreate.value);
      if (res && res.success && res.data.id) {
        streamers.value.set(res.data.id, res.data);
        showModal.value = false;
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

  async function updateStreamer() {
    try {
      streamerLoading.value = true;
      if (Array.isArray(streamerCreate.value.tags)) {
        // @ts-ignore 接口tags是number[]
        streamerCreate.value.tags = streamerCreate.value.tags.map(
          (tag) => tag.id,
        );
      }
      const res = await _updateStreamer(streamerCreate.value);
      if (res && res.success && res.data.id) {
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
    makeCreate,
    queryStreamer,
    queryTags,
    showModal,
    streamerCreate,
    streamerCreateLoading,
    streamerList,
    streamerLoading,
    streamerQuery,
    streamers,
    tags,
    updateStreamer,
  };
});
