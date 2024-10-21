import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type { IdQuery, StanderResult, Streamer, StreamerCreate } from '#/types';

// API
enum StreamerApi {
  AllStreamer = 'getallstreamers',
  CreateStreamer = 'createstreamer',
  DeleteStreamer = 'deletestreamer',
  UpdateStreamer = 'updatesreamer',
}

function getAllStreamers() {
  return requestClient.post<StanderResult<Streamer[]>>(StreamerApi.AllStreamer);
}

function createStreamer(params: StreamerCreate) {
  return requestClient.post<StanderResult<Streamer>>(
    StreamerApi.CreateStreamer,
    params,
  );
}

function updateStreamer(params: StreamerCreate) {
  return requestClient.post<StanderResult<Streamer>>(
    StreamerApi.UpdateStreamer,
    params,
  );
}

function deleteStreamer(params: IdQuery) {
  return requestClient.post<StanderResult<any>>(
    StreamerApi.DeleteStreamer,
    params,
  );
}

export const useStreamerStore = defineStore('streamer-store', () => {
  const streamerMap = ref<Map<number, Streamer>>(new Map());

  const streamers = computed(() => {
    return [...streamerMap.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, streamer]) => streamer); // 转换为Streamer的list
  });

  function $reset() {}

  return {
    $reset,
    streamers,
  };
});
