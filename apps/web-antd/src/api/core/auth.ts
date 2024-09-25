import type { LoginParams, RegisterParams, StanderResult, User } from '#/types';

import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    username: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    desc: string;
    realName: string;
    userId: string;
    username: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 注册
 */
export async function registerApi(data: RegisterParams) {
  return requestClient.post<StanderResult<any>>('/user/register', data);
}

/**
 * 登录
 */
export async function loginApi(data: LoginParams) {
  return requestClient.post<StanderResult<any>>('/user/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

export async function getUserInfoApi() {
  return requestClient.get<StanderResult<User>>('/user/me');
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
