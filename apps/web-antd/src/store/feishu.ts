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
  GET_BOUND_USER = '/feishu/get_bound_user',
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

async function getBoundFeishuUser(userId: number) {
  return requestClient.get<StanderResult<FeishuBindUser>>(
    FeishuApi.GET_BOUND_USER,
    {
      params: {
        userId,
      },
    },
  );
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

  // 定义一个响应式对象来存储 FeishuBindUser
  const feishuBind = ref<FeishuBindUser | null>(null);

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
      if (res && res.success) {
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
      // alert(`获取access_token：${JSON.stringify(res)}`);
      if (res && res.success) {
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

  async function queryBoundFeishuUser(userId: number) {
    try {
      const res = await getBoundFeishuUser(userId);
      if (res && res.success) {
        // 存储查询到的 FeishuBindUser 对象
        feishuBind.value = res.data;
        console.log('Bound Feishu User:', feishuBind.value);
      } else {
        notification.error({
          description: res.message,
          message: $t('queryFail'),
        });
      }
    } catch (error) {
      notification.error({
        description: error.message,
        message: $t('queryFail'),
      });
    }
  }

  return {
    $reset,
    authFeishuLogin,
    feishuBind,
    feishuCreateLoading,
    feishuData,
    feishuLoading,
    makeCreate,
    queryBoundFeishuUser,
    queryFeishuAppid,
    showModal,
  };
});
