<script lang="ts" setup>
import type { UserInfo } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, Input, message, Upload } from 'ant-design-vue';

import { useAuthStore } from '#/store';
import { useOSSFileStore } from '#/store/ossfile';
import HourLivePage from '#/views/template/common.vue';

// 账号绑定列表
const accountBindList = ref([
  // {
  //   avatar: 'ri:taobao-fill',
  //   color: '#ff4000',
  //   description: '当前未绑定淘宝账号',
  //   extra: '绑定',
  //   key: '1',
  //   title: '绑定淘宝',
  // },
  // {
  //   avatar: 'fa-brands:alipay',
  //   color: '#2eabff',
  //   description: '当前未绑定支付宝账号',
  //   extra: '绑定',
  //   key: '2',
  //   title: '绑定支付宝',
  // },
  // {
  //   avatar: 'bi:tiktok',
  //   description: '当前未绑定钉钉账号',
  //   extra: '绑定',
  //   key: '3',
  //   title: '绑定钉钉',
  // },
  {
    avatar: 'ri:feishu-fill',
    description: '当前未绑定飞书账号',
    extra: '绑定',
    key: '4',
    title: '绑定飞书',
  },
]);

const authStore = useAuthStore();
const userStore = useUserStore();
const userInfo = ref<UserInfo>({ avatar: '', username: '' });

const ossFileStore = useOSSFileStore();

// 计算属性：头像URL
const avatarSrc = computed(() => {
  return (
    userInfo.value.avatar ||
    'https://hourlive-image.oss-ap-southeast-1.aliyuncs.com/avatar/avatar_default.png'
  );
});

// 组件挂载时初始化
onMounted(() => {
  console.log('onMounted');
  initScripot();
  // userInfo.value = authStore.fetchUserInfo() || {};
  userInfo.value = userStore.getUserInfo() || {};
  console.log(`userInfo : ${JSON.stringify(userInfo.value)}`);
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
    if (result && result.success) {
      userInfo.value.avatar = result.data.avatar; // 假设后端返回新的头像URL
    }
  } catch (error) {
    console.error('Avatar upload failed:', error);
  }
};

// 修改名称
const handleNameChange = (event) => {
  userInfo.value.name = event.target.value;
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

  QRLoginObj.value = QRLogin({
    goto,
    height: '300',
    id: 'login_container',
    style: 'width:500px;height:300px',
    width: '500',
  });

  // 处理消息事件
  const handleMessage = (event) => {
    if (
      QRLoginObj.value.matchOrigin(event.origin) &&
      QRLoginObj.value.matchData(event.data)
    ) {
      const loginTmpCode = event.data.tmp_code;
      console.log(`loginTmpCode : ${loginTmpCode}`);
      const newWindow = window.open(
        `${goto}&temp_code=${loginTmpCode}`,
        '_blank',
      );
      if (newWindow) {
        newWindow.focus();
      } else {
        alert('请允许弹出窗口以继续操作。');
      }
    }
  };

  // 添加消息事件监听器
  if (!isListenerAdded.value) {
    isListenerAdded.value = true;
    if (window.addEventListener !== undefined) {
      window.addEventListener('message', handleMessage, false);
    } else if (window.attachEvent !== undefined) {
      window.attachEvent('onmessage', handleMessage);
    }
  }

  modalOpen.value = true;
};

// 初始化脚本
const initScripot = () => {
  const script = document.createElement('script');
  script.src =
    'https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js';
  document.head.append(script);

  script.addEventListener('load', () => {
    console.log('飞书 LarkSSOSDKWebQRCode 加载完成');
  });
};

// 处理模态框关闭
const handleModalClose = () => {
  modalOpen.value = false;
  const triggerElement = document.querySelector('.focus-element');
  if (triggerElement) {
    (triggerElement as HTMLElement).focus();
  }
};

// 处理模态框打开
const handleModalOpen = () => {
  modalOpen.value = true;
  // setTimeout(() => {
  //   const modalElement = document.querySelector('.modal-focus-element');
  //   if (modalElement) {
  //     (modalElement as HTMLElement).focus();
  //   }
  // }, 0);

  // const modalElement = document.querySelector('.modal-focus-element');
  // if (modalElement) {
  //   (modalElement as HTMLElement).focus();
  // }
};
</script>
<template>
  <HourLivePage :content-overflow="true">
    <template #content>
      <div class="user-profile">
        <Upload
          :before-upload="() => false"
          :show-upload-list="false"
          accept=".jpg, .jpeg, .png"
          @change="handleAvatarChange"
        >
          <img :src="avatarSrc" alt="avatar" class="avatar-img" />
        </Upload>
        <Input
          v-model="userInfo.username"
          class="name-input"
          placeholder="输入名称"
          @change="handleNameChange"
        />
      </div>
      <div class="account-bind-list">
        <div
          v-for="item in accountBindList"
          :key="item.key"
          class="account-item"
        >
          <div :style="{ color: item.color }" class="avatar">
            <Icon :icon="item.avatar" />
          </div>
          <div class="details">
            <div class="title">{{ item.title }}</div>
            <div class="description">{{ item.description }}</div>
          </div>
          <Button class="focus-element" type="primary" @click="bindClick(item)">
            {{ item.extra }}
          </Button>
        </div>
      </div>
      <div id="login_container"></div>
    </template>
  </HourLivePage>
</template>
<style lang="less" scoped>
.account-bind-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.avatar {
  font-size: 40px;
  margin-right: 20px;
}

.details {
  flex-grow: 1;
}

.title {
  font-weight: bold;
  font-size: 16px;
}

.description {
  color: #888;
  font-size: 14px;
}

.bind-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.bind-button:hover {
  background-color: #0056b3;
}

.custom-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.custom-modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
  cursor: pointer;
}

.name-input {
  font-size: 16px;
  width: 200px;
}
</style>
