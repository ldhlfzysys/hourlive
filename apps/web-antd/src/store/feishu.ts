import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model
import type { StanderResult } from '#/types';

// Query

// API
enum FeishuApi {
  AUTH_LOGIN = '/feishu/authLogin',
  GET_APPID = '/feishu/getappid',
}

export async function getFeishuAppid() {
  return requestClient.post<StanderResult<string>>(FeishuApi.GET_APPID);
}

export async function feishuAuthLogin(code: string) {
  return requestClient.post<StanderResult<string>>(FeishuApi.AUTH_LOGIN, {
    code,
  });
}

export const useFeishuStore = defineStore('feishu-store', () => {
  function $reset() {}

  return {
    $reset,
  };
});
