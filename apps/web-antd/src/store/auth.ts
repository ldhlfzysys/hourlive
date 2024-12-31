import type { LoginAndRegisterParams } from '@vben/common-ui';
import type { UserInfo } from '@vben/types';

import type { RegisterParams, User, UserUpdate } from '#/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getUserInfoApi, loginApi, registerApi, updateUserApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  const registerLoading = ref(false);

  const userInfo = ref<User>();

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: LoginAndRegisterParams,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    const userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const result = await loginApi(params);
      console.log(result);
      if (!result || !result.success) {
        notification.error({
          description: $t('passworderror'),
          duration: 3,
          message: $t('loginError'),
        });
        return;
      }
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

  async function register(params: RegisterParams) {
    const userInfo: null | UserInfo = null;
    try {
      registerLoading.value = true;
      const result = await registerApi(params);
      console.log(` register result : ${JSON.stringify(result)}`);
      if (!result || !result.success) {
        notification.error({
          description: $t('registerErrorDesc'),
          duration: 3,
          message: $t('registerError'),
        });
        return;
      }
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
    const result = await getUserInfoApi();
    console.log(` fetchUserInfo userInfo.value : ${JSON.stringify(result)}`);
    if (result.success) {
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
      const result = await updateUserApi(userData);
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
