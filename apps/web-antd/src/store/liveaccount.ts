// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  BaseQuery,
  LiveAccountRead,
  LiveAccountUpdate,
  StandardResponse,
} from '#/types/schemas';

// API
function _getAllLiveAccount(params?: BaseQuery) {
  return requestClient.post<StandardResponse<LiveAccountRead[]>>(
    'live_account/query',
    params,
  );
}

function _newLiveAccount(params: LiveAccountRead) {
  return requestClient.post<StandardResponse<LiveAccountRead>>(
    'live_account/create',
    params,
  );
}

function _updateLiveAccount(params: LiveAccountUpdate) {
  return requestClient.post<StandardResponse<LiveAccountRead>>(
    'live_account/update',
    params,
  );
}

function _queryLiveAccountById(params: BaseQuery) {
  return requestClient.post<StandardResponse<LiveAccountRead[]>>(
    'live_account/query/ids',
    params,
  );
}

// store
export const useLiveAccountStore = defineStore('liveaccount-store', () => {
  // data
  const liveaccounts = ref<Map<number, LiveAccountRead>>(new Map());

  const liveaccountList = computed(() => {
    return [...liveaccounts.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, liveaccount]) => liveaccount);
  });

  const currentLiveAccount = ref<LiveAccountRead>({
    code: '',
    email: '',
    live_account: '',
    live_uid: '',
    mobile: '',
    name: '',
    platform: 'TikTok',
  });

  // UI - loading
  const queryLiveAccountLoading = ref(false);
  const updateLiveAccountLoading = ref(false);
  const liveaccountCreateLoading = ref(false);

  // UI - modal
  const showModal = ref(false);

  const liveaccountQuery = ref<BaseQuery>({
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  const liveaccountCreate = ref<LiveAccountUpdate>({
    code: '',
    email: '',
    live_account: '',
    live_uid: '',
    mobile: '',
    name: '',
    password: '',
    platform: '',
  });

  // 适配select组件
  const liveaccountOptions = computed(() => {
    return liveaccountList.value.map((item: LiveAccountRead) => {
      if (item.name && item.live_account && item.id) {
        return {
          label: `${item.id} - ${item.name} - ${item.live_account}`,
          value: item.id,
        };
      }
      return { label: String(item.id), value: item.id };
    });
  });

  // methods
  function makeCreate() {
    showModal.value = true;
    liveaccountCreate.value = {
      platform: 'TikTok',
    };
  }

  function makeUpdate(id: number) {
    showModal.value = true;
    const liveaccount = liveaccounts.value.get(id);
    if (liveaccount) {
      currentLiveAccount.value = liveaccount;
    }
  }

  async function liveaccountById(id: number) {
    const liveaccount = liveaccounts.value.get(id);
    if (liveaccount) {
      return liveaccount;
    }

    queryLiveAccountLoading.value = true;
    const res = await _queryLiveAccountById({ ids: [id] });
    if (res && res.success && res.data && res.data.length > 0) {
      setLiveAccounts(res.data);
    }
    queryLiveAccountLoading.value = false;
    return liveaccounts.value.get(id);
  }

  function $reset() {
    queryLiveAccountLoading.value = false;
    updateLiveAccountLoading.value = false;
    liveaccountCreateLoading.value = false;
    liveaccountQuery.value = {
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
    currentLiveAccount.value = {
      platform: 'TikTok',
    };
    liveaccounts.value.clear();
  }

  async function queryLiveAccount() {
    try {
      queryLiveAccountLoading.value = true;
      const res = await _getAllLiveAccount(liveaccountQuery.value);
      if (res && res.success) {
        if (res.data && res.data.length > 0) {
          const lastLiveAccount = res.data.at(-1);
          if (lastLiveAccount && lastLiveAccount.id) {
            liveaccountQuery.value.q_id = lastLiveAccount.id;
          }
        }
        res.data?.forEach((liveaccount: LiveAccountRead) => {
          if (liveaccount.id) {
            liveaccounts.value.set(liveaccount.id, liveaccount);
          }
        });
      }
    } finally {
      queryLiveAccountLoading.value = false;
    }
  }

  async function createLiveAccount() {
    try {
      liveaccountCreateLoading.value = true;
      const res = await _newLiveAccount(liveaccountCreate.value);
      if (res && res.success && res.data && res.data.id) {
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
      updateLiveAccountLoading.value = true;
      const res = await _updateLiveAccount(liveaccountCreate.value);
      if (res && res.success && res.data && res.data.id) {
        showModal.value = false;
        liveaccounts.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      updateLiveAccountLoading.value = false;
    }
  }
  function setLiveAccounts(accounts: LiveAccountRead[]) {
    accounts.forEach((account) => {
      if (account.id) {
        liveaccounts.value.set(account.id, account);
      }
    });
  }
  return {
    $reset,
    createLiveAccount,
    liveaccountById,
    liveaccountCreate,
    liveaccountCreateLoading,
    liveaccountList,
    liveaccountOptions,
    liveaccountQuery,
    liveaccounts,
    makeCreate,
    makeUpdate,
    queryLiveAccount,
    queryLiveAccountLoading,
    setLiveAccounts,
    showModal,
    updateLiveAccount,
    updateLiveAccountLoading,
  };
});
