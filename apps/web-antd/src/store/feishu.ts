import { ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// Model
import type { StanderResult } from '#/types';

// API
enum FeishuApi {
  AUTH_LOGIN = '/feishu/authLogin',
  GET_APPID = '/feishu/getappid',
}

async function getFeishuAppid() {
  return requestClient.get<StanderResult<string>>(FeishuApi.GET_APPID);
}

async function feishuAuthLogin(code: string) {
  return requestClient.get<StanderResult<string>>(FeishuApi.AUTH_LOGIN, {
    params: {
      code,
    },
  });
}

export const useFeishuStore = defineStore('feishu-store', () => {
  // loading
  const feishuLoading = ref(false);
  const feishuCreateLoading = ref(false);

  // feishu data
  const feishuData = ref({
    appid: '',
    code: '',
    token: '',
  });

  const showModal = ref(false);

  function makeCreate() {
    showModal.value = true;
    feishuData.value = {
      appid: '',
      code: '',
      token: '',
    };
  }

  function $reset() {
    feishuLoading.value = false;
    feishuCreateLoading.value = false;
    feishuData.value = {
      appid: '',
      code: '',
      token: '',
    };
  }

  // methods
  async function queryFeishuAppid() {
    try {
      feishuLoading.value = true;
      const res = await getFeishuAppid();
      if (res.success) {
        feishuData.value.appid = res.data;
      }
    } finally {
      feishuLoading.value = false;
    }
  }

  async function authFeishuLogin() {
    try {
      feishuCreateLoading.value = true;
      const res = await feishuAuthLogin(feishuData.value.code);
      console.log('authFeishuLogin', res);
      alert(`获取access_token：${JSON.stringify(res)}`);
      if (res.success) {
        feishuData.value.token = res.token.access_token;
        showModal.value = false;
        notification.success({
          message: $t('loginsuccess'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('authFail'),
        });
      }
    } finally {
      feishuCreateLoading.value = false;
    }
  }

  return {
    $reset,
    authFeishuLogin,
    feishuCreateLoading,
    feishuData,
    feishuLoading,
    makeCreate,
    queryFeishuAppid,
    showModal,
  };
});
