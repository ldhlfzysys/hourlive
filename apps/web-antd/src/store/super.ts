import { ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type { StanderResult, SuperHomeInfo } from '#/types';

async function getSuperHomeInfo() {
  return requestClient.post<StanderResult<SuperHomeInfo>>('home/superhome');
}

function _resetPassword(params: { id: number; password: string }) {
  return requestClient.post<StandardResponse<CustomerRead>>(
    `super/resetUserPassword`,
    params,
  );
}

// Store
export const useSuperStore = defineStore('super-store', () => {
  const superHomeInfo = ref<SuperHomeInfo>();

  async function fetchSuperHomeInfo() {
    const res = await getSuperHomeInfo();
    superHomeInfo.value = res.data;
  }

  async function resetPassword(params: { id: number; password: string }) {
    return _resetPassword(params);
  }

  function $reset() {}
  return {
    $reset,
    fetchSuperHomeInfo,
    superHomeInfo,
  };
});
