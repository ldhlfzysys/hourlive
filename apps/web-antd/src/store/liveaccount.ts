// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type { LiveAccount, LiveAccountQuery, StanderResult } from '#/types';

function _getAllLiveAccount(params?: LiveAccountQuery) {
  return requestClient.post<StanderResult<LiveAccount[]>>(
    'live_account/query',
    params,
  );
}

function _newLiveAccount(params: LiveAccount) {
  return requestClient.post<StanderResult<LiveAccount>>(
    'live_account/create',
    params,
  );
}

function _updateLiveAccount(params: LiveAccount) {
  return requestClient.post<StanderResult<LiveAccount>>(
    'live_account/update',
    params,
  );
}

// store
export const useLiveAccountStore = defineStore('liveaccount-store', () => {
  // loading

  const liveaccountLoading = ref(false);
  const liveaccountCreateLoading = ref(false);
  const liveaccountCreate = ref<LiveAccount>({
    code: '',
    email: '',
    live_account: '',
    live_uid: '',
    mobile: '',
    name: '',
    platform: 'TikTok',
  });
  // liveaccounts
  const liveaccounts = ref<Map<number, LiveAccount>>(new Map());

  const liveaccountList = computed(() => {
    return [...liveaccounts.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, liveaccount]) => liveaccount); // 转换为LiveAccount的list
  });

  const showModal = ref(false);

  function makeCreate() {
    showModal.value = true;
    liveaccountCreate.value = {
      platform: 'TikTok',
    };
  }
  function makeUpdate(id: number) {
    showModal.value = true;
    const sample = liveaccounts.value.get(id);
    if (sample) {
      liveaccountCreate.value = sample;
    }
  }

  // query
  const liveaccountQuery = ref<LiveAccountQuery>({
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  function $reset() {
    liveaccountLoading.value = false;
    liveaccountCreateLoading.value = false;
    liveaccountQuery.value.q_id = -1;

    liveaccountQuery.value = {
      q_id: -1,
      q_order: 'desc',
      q_size: 5,
    };
    liveaccounts.value = new Map();
  }

  // methods
  async function queryLiveAccount() {
    try {
      liveaccountLoading.value = true;
      const res = await _getAllLiveAccount(liveaccountQuery.value);
      if (res.success) {
        if (res.data.length > 0) {
          const lastLiveAccount = res.data.at(-1);
          if (lastLiveAccount && lastLiveAccount.id) {
            liveaccountQuery.value.q_id = lastLiveAccount.id;
          }
        }
        res.data.forEach((liveaccount) => {
          if (liveaccount.id) {
            liveaccounts.value.set(liveaccount.id, liveaccount);
          }
        });
      }
    } finally {
      liveaccountLoading.value = false;
    }
  }

  async function createLiveAccount() {
    try {
      liveaccountCreateLoading.value = true;
      const res = await _newLiveAccount(liveaccountCreate.value);
      if (res.success && res.data.id) {
        showModal.value = false;
        liveaccounts.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      liveaccountCreateLoading.value = false;
    }
  }

  async function updateLiveAccount() {
    try {
      liveaccountCreateLoading.value = true;
      const res = await _updateLiveAccount(liveaccountCreate.value);
      if (res.success && res.data.id) {
        showModal.value = false;
        liveaccounts.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      liveaccountCreateLoading.value = false;
    }
  }

  return {
    $reset,
    createLiveAccount,
    liveaccountCreate,
    liveaccountCreateLoading,
    liveaccountList,
    liveaccountLoading,
    liveaccountQuery,
    liveaccounts,
    makeCreate,
    makeUpdate,
    queryLiveAccount,
    showModal,
    updateLiveAccount,
  };
});
