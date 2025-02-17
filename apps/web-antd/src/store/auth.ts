import type { UserInfo } from '@vben/types';

import type {
  StandardResponse,
  UserCreate,
  UserLogin,
  UserRead,
  UserUpdate,
} from '#/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

function _registerApi(data: UserCreate) {
  return requestClient.post<StandardResponse>('/user/register', data);
}

async function _updateUserApi(data: UserUpdate) {
  return requestClient.post<StandardResponse>('/user/update_user', data);
}
async function _getUserInfoApi() {
  return requestClient.get<StandardResponse>('/user/userInfo');
}

async function _loginApi(data: UserLogin) {
  return requestClient.post<StandardResponse>('/user/login', data);
}

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  // data
  const userInfo = ref<UserRead>();

  // UI - loading
  const loginLoading = ref(false);
  const registerLoading = ref(false);

  // API

  async function authLogin(
    params: UserLogin,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    const userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const result = await _loginApi(params);
      console.log(result);
      if (!result || !result.success) {
        notification.error({
          description: $t('passworderror'),
          duration: 3,
          message: $t('loginError'),
        });
        return;
      }
      if (result.token) {
        const accessToken = result.token.access_token;
        if (accessToken) {
          accessStore.setAccessToken(accessToken);

          // 获取用户信息并存储到 accessStore 中
          const fetchUserInfoResult = await fetchUserInfo();
          const userInfo = fetchUserInfoResult;

          userStore.setUserInfo(userInfo);

          if (accessStore.loginExpired) {
            accessStore.setLoginExpired(false);
          } else {
            onSuccess
              ? await onSuccess?.()
              : await router.push(userInfo.homePath || DEFAULT_HOME_PATH);
          }

          if (userInfo?.realName) {
            notification.success({
              description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
              duration: 3,
              message: $t('authentication.loginSuccess'),
            });
          }
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  // 飞书免登录
  async function loginByToken(
    token: string,
    onSuccess?: () => Promise<void> | void,
  ): Promise<null | UserInfo> {
    // 异步处理用户登录操作并获取 accessToken
    const userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const accessToken = token;

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        const fetchUserInfoResult = await fetchUserInfo();
        const userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        // accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(userInfo.homePath || DEFAULT_HOME_PATH);
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }
    return userInfo;
  }

  async function register(params: UserCreate) {
    const userInfo: null | UserInfo = null;
    try {
      registerLoading.value = true;
      const result = await _registerApi(params);
      console.log(` register result : ${JSON.stringify(result)}`);
      if (!result || !result.success) {
        notification.error({
          description: $t('registerErrorDesc'),
          duration: 3,
          message: $t('registerError'),
        });
        return;
      }
      if (result.token) {
        const accessToken = result.token.access_token;

        // 如果成功获取到 accessToken
        if (accessToken) {
          accessStore.setAccessToken(accessToken);

          // 获取用户信息并存储到 accessStore 中
          const fetchUserInfoResult = await fetchUserInfo();
          const userInfo = fetchUserInfoResult;

          userStore.setUserInfo(userInfo);
          // accessStore.setAccessCodes(accessCodes);

          if (accessStore.loginExpired) {
            accessStore.setLoginExpired(false);
          } else {
            await router.push(userInfo.homePath || DEFAULT_HOME_PATH);
          }

          if (userInfo?.realName) {
            notification.success({
              description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
              duration: 3,
              message: $t('authentication.loginSuccess'),
            });
          }
        }
      }
    } finally {
      registerLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    // await logoutApi();
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登陆页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const result = await _getUserInfoApi();
    console.log(` fetchUserInfo userInfo.value : ${JSON.stringify(result)}`);
    if (
      result.success &&
      result.data &&
      result.data.id &&
      result.data.role &&
      result.data.role.auths
    ) {
      userInfo.value = result.data;
      const userInfo2: UserInfo = {
        avatar: result.data.avatar ?? '',
        desc: '',
        homePath: result.data.home ?? '',
        realName: result.data.account,
        roles: result.data.role.auths.map((item) => item.code),
        token: '',
        userId: result.data.id.toString(),
        username: result.data.name ?? result.data.account,
      };
      userStore.setUserInfo(userInfo2);
      return userInfo2;
    }
  }
  async function updateUser(userData: Partial<UserUpdate>) {
    try {
      const result = await _updateUserApi(userData);
      if (result.success) {
        const updatedUserInfo = await fetchUserInfo();
        userStore.setUserInfo(updatedUserInfo);
        notification.success({
          // description: $t('modifysuccess'),
          duration: 3,
          message: $t('modifysuccess'),
        });
      } else {
        notification.error({
          description: $t('updatefail'),
          duration: 3,
          message: $t('user.updateFailed'),
        });
      }
    } catch {
      notification.error({
        description: $t('error'),
        duration: 3,
        message: $t('user.updateError'),
      });
    }
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginByToken,
    loginLoading,
    logout,
    register,
    registerLoading,
    updateUser,
    userInfo,
  };
});
