import { ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type { StanderResult, SuperHomeInfo, TikTokCookie } from '#/types';

async function getSuperHomeInfo() {
  return requestClient.post<StanderResult<SuperHomeInfo>>('home/superhome');
}

async function _updateTikTokCookie(cookie: string) {
  return requestClient.post<StanderResult<TikTokCookie>>(
    'super/updateTikTokCookie',
    {
      cookie,
    },
  );
}

// Store
export const useSuperStore = defineStore('super-store', () => {
  const superHomeInfo = ref<SuperHomeInfo>();

  async function fetchSuperHomeInfo() {
    const res = await getSuperHomeInfo();
    superHomeInfo.value = res.data;
  }

  async function updateTikTokCookie(cookie: string) {
    const res = await _updateTikTokCookie(cookie);
    return res.data;
  }

  function $reset() {}
  return {
    $reset,
    fetchSuperHomeInfo,
    superHomeInfo,
    updateTikTokCookie,
  };
});
