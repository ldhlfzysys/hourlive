<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, onMounted } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore, useFeishuStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const feishuStore = useFeishuStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];
});

onMounted(() => {
  console.log('mounted');
  initScripot();
});

const initScripot = () => {
  const script = document.createElement('script');
  script.src =
    'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.26.js';
  document.head.append(script);

  const script2 = document.createElement('script');
  script2.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
  document.head.append(script2);

  // 监听脚本加载完成事件
  script.addEventListener('load', () => {
    console.log('飞书 h5 sdk 加载完成');
    // alert('飞书 h5 sdk 加载完成');
    // 在这里可以调用库的 API
    getFeishuCode();
  });
};
const getFeishuCode = async () => {
  if (!window.h5sdk) {
    console.log('invalid h5sdk');
    // alert('invalid h5sdk');
    return;
  }
  await feishuStore.queryFeishuAppid();
  console.log(feishuStore.feishuData);
  // alert(`获取飞书 app_id ：${JSON.stringify(feishuStore.feishuData)}`);
  // alert("获取飞书 app_id ：" + JSON.stringify(data))
  if (!feishuStore.feishuData.appid) {
    return;
  }
  const app_id = feishuStore.feishuData.appid;

  // 通过error接口处理API验证失败后的回调
  window.h5sdk.error((err) => {
    throw `h5sdk error:${JSON.stringify(err)}`;
  });
  // 通过ready接口确认环境准备就绪后才能调用API
  window.h5sdk.ready(() => {
    // alert('window.h5sdk.ready');
    console.log('window.h5sdk.ready');
    console.log('url:', window.location.href);
    // 调用JSAPI tt.requestAccess 获取 authorization code
    tt.requestAccess({
      appID: app_id,
      // 获取失败后的回调
      fail(err) {
        console.log(`getAuthCode failed, err:`, JSON.stringify(err));
        // alert(`授权失败：${JSON.stringify(err)}`);
      },
      scopeList: ['im:message:send', 'im:message', 'im:message:send_as_bot'],
      // 获取成功后的回调
      success(res) {
        console.log(`getAuthCode succeed${JSON.stringify(res)}`);
        // alert(`授权成功：${JSON.stringify(res)}`);
        // authorization code 存储在 res.code
        // 此处通过fetch把code传递给接入方服务端Route: callback，并获得user_info
        // 服务端Route: callback的具体内容请参阅服务端模块server.py的callback()函数

        // fetch(`/callback?code=${res.code}`).then(response2 => response2.json().then(res2 => {
        //     console.log("getUserInfo succeed");
        //     // 示例Demo中单独定义的函数showUser，用于将用户信息展示在前端页面上
        //     showUser(res2);}
        //   )
        // ).catch(function (e) {console.error(e)})
        autoLogin(res.code);
      },
    });
  });
};

const autoLogin = async (code: string) => {
  feishuStore.feishuData.code = code;
  await feishuStore.authFeishuLogin();
  if (!feishuStore.feishuData.token) {
    console.log(`登录失败：${feishuStore.feishuData.token}`);
    // alert(`登录失败：${feishuStore.feishuData}`);
    return;
  }
  const userInfo = await authStore.loginByToken(feishuStore.feishuData.token);
  console.log(`用户信息：${JSON.stringify(userInfo)}`);
  // alert(`用户信息：${JSON.stringify(userInfo)}`);
};
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="false"
    :show-forget-password="false"
    :show-qrcode-login="false"
    :show-third-party-login="false"
    @submit="authStore.authLogin"
  />
</template>
