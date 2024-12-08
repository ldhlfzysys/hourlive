<script lang="ts" setup>
import type { User } from '#/types';

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, Input, message, Modal, Upload } from 'ant-design-vue';
import { Check, Mail, Pencil, Phone, QrCode, X } from 'lucide-vue-next';

import { useAuthStore } from '#/store';
import { useFeishuStore } from '#/store/feishu';
import { useOSSFileStore } from '#/store/ossfile';
import HourLivePage from '#/views/template/common.vue';

// 账号绑定列表
const accountBindList = ref([
  {
    color: '#3370ff',
    description: '当前未绑定飞书账号',
    extra: '绑定',
    icon: 'Bird', // Lucide icon name for Feishu
    key: '4',
    title: '绑定飞书',
  },
]);

const authStore = useAuthStore();
const userStore = useUserStore();
const userInfo = ref<User>();

const ossFileStore = useOSSFileStore();
const feishuStore = useFeishuStore();

// 计算属性：头像URL
const avatarSrc = computed(() => {
  return (
    authStore.userInfo?.avatar ||
    'https://hourlive-image.oss-ap-southeast-1.aliyuncs.com/avatar/avatar_default.png'
  );
});

// 组件挂载时初始化
onMounted(() => {
  console.log('onMounted');
  initScripot();
  userInfo.value = authStore.fetchUserInfo();
  // userForm.value = {
  //   email: authStore.userInfo?.email || '',
  //   phone: authStore.userInfo?.mobile || '',
  //   username: authStore.userInfo?.name || '',
  // };
  console.log(` onMounted userInfo : ${JSON.stringify(userInfo.value)}`);

  // 查询绑定的飞书用户信息
  feishuStore.queryBoundFeishuUser(userInfo.value.userId);
});

// 修改头像
const handleAvatarChange = async (info) => {
  const isImage = info.file.type.startsWith('image/');
  const isLt1M = info.file.size / 1024 / 1024 < 1;

  if (!isImage) {
    message.error('文件格式不正确，请上传图片文件');
    return;
  }

  if (!isLt1M) {
    message.error('图片大小不能超过1MB');
    return;
  }

  // 手动上传头像
  try {
    const result = await ossFileStore.uploadAvatar(info.file);
    if (result && result.success && userInfo.value) {
      userInfo.value.avatar = result.data; // 假设后端返回新的头像URL
      authStore.userInfo.avatar = result.data;
    }
  } catch (error) {
    console.error('Avatar upload failed:', error);
  }
};

// 处理绑定按钮点击事件
const bindClick = (item) => {
  console.log(`bindClick : ${item.title}`);
  if (item.key === '4') {
    // handleModalOpen();
    bindFeishu(item);
  }
};

const isListenerAdded = ref(false);
const modalOpen = ref(false);
const QRLoginObj = ref(null);

// 处理飞书绑定
const bindFeishu = (item) => {
  console.log('login');
  const loginContainer = document.querySelector('#login_container');
  if (loginContainer) {
    loginContainer.innerHTML = '';
  }

  const client_id = 'cli_a79a51e6f9fb500d';
  const redirect_uri = 'http://localhost:9000/feishu/oauth/callbackQrcode';
  const state = userInfo.value?.userId;
  const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`;

  // 确保 DOM 元素存在后再初始化
  nextTick(() => {
    if (
      document.querySelector('#login_container') && // QRLoginObj.value = QRLogin({
      //   goto,
      //   height: '300',
      //   id: 'login_container',
      //   style: 'width:500px;height:300px',
      //   width: '500',
      // });

      // 添加消息事件监听器
      !isListenerAdded.value
    ) {
      const handleMessage = (event) => {
        if (
          QRLoginObj.value?.matchOrigin(event.origin) &&
          QRLoginObj.value?.matchData(event.data)
        ) {
          const loginTmpCode = event.data.tmp_code;
          console.log(`loginTmpCode : ${loginTmpCode}`);
          const newWindow = window.open(
            `${goto}&temp_code=${loginTmpCode}`,
            '_blank',
          );
          if (newWindow) {
            newWindow.focus();
          }
        }
      };

      window.addEventListener('message', handleMessage);
      isListenerAdded.value = true;

      // 保存清理函数
      onBeforeUnmount(() => {
        window.removeEventListener('message', handleMessage);
        isListenerAdded.value = false;
      });
    }
  });

  modalOpen.value = true;
};

// 处理模态框关闭
const handleModalClose = () => {
  modalOpen.value = false;
  // 清理二维码容器
  const loginContainer = document.querySelector('#login_container');
  if (loginContainer) {
    loginContainer.innerHTML = '';
  }
  QRLoginObj.value = null;
};

// 初始化脚本
const initScripot = () => {
  // 检查是否已经加载过脚本
  if (document.querySelector('script[src*="LarkSSOSDKWebQRCode"]')) {
    return;
  }

  const script = document.createElement('script');
  script.src =
    'https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js';
  document.head.append(script);

  script.addEventListener('load', () => {
    console.log('飞书 LarkSSOSDKWebQRCode 加载完成');
  });
};

// 处理模态框打开
const handleModalOpen = () => {
  modalOpen.value = true;
  nextTick(() => {
    const focusableElement = document.querySelector('#login_container button');
    if (focusableElement) {
      focusableElement.focus();
    }
  });
};

const isEditModalOpen = ref(false);
const tempUsername = ref('');

// 打开编辑模态框
const openEditModal = () => {
  console.log(`输入更新的新名称: ${tempUsername.value}`);
  tempUsername.value = userInfo.value.username;
  isEditModalOpen.value = true;
};

// 保存用户名
const saveUsername = () => {
  console.log(`保存用户名: ${tempUsername.value}`);
  userInfo.value.username = tempUsername.value;
  isEditModalOpen.value = false;
  authStore.updateUser({ username: tempUsername.value });
};

// 表单验证
const validateEmail = (email: string) => {
  // 正则表达式解释：以非空格非@字符开头，后跟@符号，接着是非空格非@字符，后跟点号，最后是非空格字符
  const regex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  return regex.test(email);
};

const validatePhone = (mobile: string) => {
  // 正则表达式解释：以1开头，第二位是3到9中的任意一个数字，然后是9个任意数字
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(mobile);
};

// 保存个人信息
const saveUserInfo = async (field: string) => {
  try {
    const value = authStore.userInfo[field];

    // 表单验证
    if (field === 'email' && !validateEmail(value)) {
      message.error('请输入有效的邮箱地址');
      return;
    }
    if (field === 'mobile' && !validatePhone(value)) {
      message.error('请输入有效的手机号');
      return;
    }

    await authStore.updateUser({ [field]: value });
    editState.value[field] = false;
    message.success('保存成功');
  } catch {
    message.error('保存失败');
  }
};

const userForm = ref({
  email: '',
  mobile: '',
  username: '',
});

const editState = ref({
  email: false,
  mobile: false,
  username: false,
});
</script>
<template>
  <HourLivePage :content-overflow="true">
    <template #content>
      <div class="mx-auto max-w-4xl space-y-6 p-6">
        <!-- 个人信息卡片 -->
        <div class="rounded-lg bg-white p-6 shadow-md">
          <!-- 头像区域 -->
          <div class="mb-8 flex justify-center">
            <Upload
              :before-upload="() => false"
              :show-upload-list="false"
              accept=".jpg, .jpeg, .png"
              @change="handleAvatarChange"
            >
              <div class="group relative">
                <img
                  :src="avatarSrc"
                  alt="avatar"
                  class="h-32 w-32 rounded-full object-cover"
                />
                <div
                  class="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <Pencil class="h-6 w-6 text-white" />
                </div>
              </div>
            </Upload>
          </div>

          <!-- 个人信息表单 -->
          <div class="space-y-4">
            <!-- 用户名 -->
            <div
              class="flex items-center justify-between rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex items-center gap-2 text-gray-500">
                <User class="h-5 w-5" />
                <span>用户名</span>
              </div>
              <div class="flex items-center">
                <template v-if="!editState.username">
                  <span class="mr-3">{{
                    authStore.userInfo?.name || '未设置'
                  }}</span>
                  <Pencil
                    class="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-600"
                    @click="editState.username = true"
                  />
                </template>
                <template v-else>
                  <div class="flex items-center space-x-2">
                    <Input
                      v-model:value="authStore.userInfo.name"
                      class="w-48"
                      @press-enter="saveUserInfo('username')"
                    />
                    <Check
                      class="h-5 w-5 cursor-pointer text-green-500"
                      @click="saveUserInfo('username')"
                    />
                    <X
                      class="h-5 w-5 cursor-pointer text-red-500"
                      @click="editState.username = false"
                    />
                  </div>
                </template>
              </div>
            </div>

            <!-- 手机号 -->
            <div
              class="flex items-center justify-between rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex items-center gap-2 text-gray-500">
                <Phone class="h-5 w-5" />
                <span>手机号</span>
              </div>
              <div class="flex items-center">
                <template v-if="!editState.mobile">
                  <span class="mr-3">{{
                    authStore.userInfo?.mobile || '未设置'
                  }}</span>
                  <Pencil
                    class="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-600"
                    @click="editState.mobile = true"
                  />
                </template>
                <template v-else>
                  <div class="flex items-center space-x-2">
                    <Input
                      v-model:value="authStore.userInfo.mobile"
                      class="w-48"
                      @press-enter="saveUserInfo('mobile')"
                    />
                    <Check
                      class="h-5 w-5 cursor-pointer text-green-500"
                      @click="saveUserInfo('mobile')"
                    />
                    <X
                      class="h-5 w-5 cursor-pointer text-red-500"
                      @click="editState.mobile = false"
                    />
                  </div>
                </template>
              </div>
            </div>

            <!-- 邮箱 -->
            <div
              class="flex items-center justify-between rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex items-center gap-2 text-gray-500">
                <Mail class="h-5 w-5" />
                <span>邮箱</span>
              </div>
              <div class="flex items-center">
                <template v-if="!editState.email">
                  <span class="mr-3">{{
                    authStore.userInfo?.email || '未设置'
                  }}</span>
                  <Pencil
                    class="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-600"
                    @click="editState.email = true"
                  />
                </template>
                <template v-else>
                  <div class="flex items-center space-x-2">
                    <Input
                      v-model:value="authStore.userInfo.email"
                      class="w-48"
                      @press-enter="saveUserInfo('email')"
                    />
                    <Check
                      class="h-5 w-5 cursor-pointer text-green-500"
                      @click="saveUserInfo('email')"
                    />
                    <X
                      class="h-5 w-5 cursor-pointer text-red-500"
                      @click="editState.email = false"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号绑定卡片 -->
        <div class="rounded-lg bg-white p-6 shadow-md">
          <h2 class="mb-6 text-lg font-medium">账号绑定</h2>
          <div class="space-y-4">
            <div
              v-for="item in accountBindList"
              :key="item.key"
              class="flex items-center justify-between rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex items-center space-x-4">
                <div
                  :style="{ backgroundColor: `${item.color}10` }"
                  class="flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <component
                    :is="item.icon"
                    :style="{ color: item.color }"
                    class="h-6 w-6"
                  />
                </div>
                <div>
                  <div class="font-medium">{{ item.title }}</div>
                  <div class="text-sm text-gray-500">
                    {{
                      item.key === '4' && feishuStore.feishuBind
                        ? `已绑定: ${feishuStore.feishuBind.name}`
                        : item.description
                    }}
                  </div>
                </div>
              </div>
              <Button
                class="flex items-center gap-2"
                ghost
                type="primary"
                @click="bindClick(item)"
              >
                <QrCode class="h-4 w-4" />
                {{ feishuStore.feishuBind ? '重新绑定' : '绑定' }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 二维码弹窗 -->
      <Modal
        v-model:visible="modalOpen"
        :destroy-on-close="true"
        :footer="null"
        title="扫码绑定飞书"
        @cancel="handleModalClose"
      >
        <div
          id="login_container"
          class="flex min-h-[300px] items-center justify-center"
          inert
          tabindex="-1"
        >
          <button
            aria-hidden="true"
            style="position: absolute; opacity: 0"
          ></button>
        </div>
      </Modal>
    </template>
  </HourLivePage>
</template>
