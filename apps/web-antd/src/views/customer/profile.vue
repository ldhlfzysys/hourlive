<script lang="ts" setup>
import type { BasicUserInfo } from '@vben/types';

import { onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, TabPane, Tabs } from 'ant-design-vue';

import HourLivePage from '#/views/template/common.vue';

// const TableItem = Table.Item;
// const TableItemMeta = Table.Item.Meta;

// 账号绑定 list
const accountBindList = ref([
  {
    avatar: 'ri:taobao-fill',
    color: '#ff4000',
    description: '当前未绑定淘宝账号',
    extra: '绑定',
    key: '1',
    title: '绑定淘宝',
  },
  {
    avatar: 'fa-brands:alipay',
    color: '#2eabff',
    description: '当前未绑定支付宝账号',
    extra: '绑定',
    key: '2',
    title: '绑定支付宝',
  },
  {
    avatar: 'bi:tiktok',
    description: '当前未绑定钉钉账号',
    extra: '绑定',
    key: '3',
    title: '绑定钉钉',
  },
  {
    avatar: 'bi:tiktok',
    description: '当前未绑定飞书账号',
    extra: '绑定',
    key: '4',
    title: '绑定飞书',
  },
]);

const userStore = useUserStore();
const userInfo = ref<BasicUserInfo | null>(null);

onMounted(() => {
  initScripot();
  userInfo.value = userStore.getUserInfo();
  console.log(`userInfo : ${JSON.stringify(userInfo.value)}`);
});

const bindClick = (item) => {
  console.log(`bindClick : ${item.title}`);
  // 飞书
  if (item.key === '4') {
    bindFeishu(item);
  }
};

const isListenerAdded = ref(false);
const modalOpen = ref(false);
const QRLoginObj = ref(null);
const bindFeishu = (item) => {
  console.log('login');
  // 清除登录容器中的内容，以便重新生成二维码
  document.querySelector('#login_container').innerHTML = '';

  // 飞书
  const client_id = 'cli_a79a51e6f9fb500d'; // 飞书应用的 client_id
  const redirect_uri = 'http://localhost:9000/feishu/oauth/callbackQrcode'; // 飞书应用的 redirect_uri
  // var userInfo = getUserInfo();
  const state = userInfo.value?.userId; // 飞书应用的 state
  const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${
    client_id
  }&redirect_uri=${redirect_uri}&response_type=code&state=${state}`;

  QRLoginObj.value = QRLogin({
    goto,
    height: '300',
    id: 'login_container',
    style: 'width:500px;height:300px', // 可选的，二维码html标签的style属性
    width: '500',
  });

  const handleMessage = (event) => {
    // 使用 matchOrigin 和 matchData 方法来判断 message 和来自的页面 url 是否合法
    if (
      QRLoginObj.value.matchOrigin(event.origin) &&
      QRLoginObj.value.matchData(event.data)
    ) {
      const loginTmpCode = event.data.tmp_code;
      console.log(`loginTmpCode : ${loginTmpCode}`);
      // 在授权页面地址上拼接上参数 tmp_code，并跳转
      // window.location.href = `${redirect_uri}&tmp_code=${loginTmpCode}`;

      // 使用 window.open 在新窗口中打开链接
      const newWindow = window.open(
        `${goto}&temp_code=${loginTmpCode}`,
        '_blank',
      );
      // 确保新窗口成功打开
      if (newWindow) {
        newWindow.focus(); // 可选：将焦点移到新窗口
      } else {
        // 如果新窗口未能打开，可能是因为浏览器阻止了弹出窗口
        alert('请允许弹出窗口以继续操作。');
      }
    }
  };
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
const initScripot = () => {
  const script = document.createElement('script');
  script.src =
    'https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js';
  document.head.append(script);

  // 监听脚本加载成事件
  script.addEventListener('load', () => {
    console.log('飞书 LarkSSOSDKWebQRCode 加载完成');
    // 在这里可以调用库的 API
  });
};

const handleModalClose = () => {
  modalOpen.value = false;
  // 将焦点返回到触发模态框的元素
  const triggerElement = document.querySelector('.focus-element');
  if (triggerElement) {
    (triggerElement as HTMLElement).focus();
  }
};

const handleModalOpen = () => {
  modalOpen.value = true;
  // 在模态框打开时，将焦点设置到模态框内的一个元素
  setTimeout(() => {
    const modalElement = document.querySelector('.modal-focus-element');
    if (modalElement) {
      (modalElement as HTMLElement).focus();
    }
  }, 0);
};
</script>
<template>
  <HourLivePage :content-overflow="true">
    <template #content>
      <Tabs default-active-key="1">
        <TabPane key="1" tab="基础信息">
          <!-- 在这里添加基础信息的内容 -->
          <div class="basic-info">
            <!-- 示例内容 -->
            <h2>用户基础信息</h2>
            <p>姓名: {{ userInfo?.name }}</p>
            <p>邮箱: {{ userInfo?.email }}</p>
          </div>
        </TabPane>
        <TabPane key="2" tab="账户绑定">
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
              <Button
                class="focus-element"
                type="primary"
                @click="bindClick(item)"
              >
                {{ item.extra }}
              </Button>
            </div>
          </div>
          <div id="login_container"></div>
        </TabPane>
      </Tabs>
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
</style>
