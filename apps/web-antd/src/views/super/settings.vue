<script lang="ts" setup>
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { message as antMessage, Button, Card, Input } from 'ant-design-vue';

import { useSuperStore } from '#/store';

const superStore = useSuperStore();
const cookieValue = ref('');
const loading = ref(false);

async function updateCookie() {
  if (!cookieValue.value) {
    antMessage.warning('请输入Cookie');
    return;
  }

  try {
    loading.value = true;
    await superStore.updateTikTokCookie(cookieValue.value);
    antMessage.success('Cookie更新成功');
    cookieValue.value = '';
  } catch (error) {
    antMessage.error(
      `更新失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="settings-container">
    <Card :bordered="false" class="settings-card" title="系统设置">
      <div class="setting-item">
        <h3 class="setting-title">
          {{ $t('update_tiktok_cookie') || 'TikTok Cookie 设置' }}
        </h3>
        <p class="setting-description">
          更新系统使用的TikTok Cookie，用于访问TikTok API
        </p>
        <div class="setting-control">
          <Input
            v-model:value="cookieValue"
            :placeholder="$t('enter_cookie') || '请输入Cookie值'"
            allow-clear
            class="cookie-input"
          />
          <Button :loading="loading" type="primary" @click="updateCookie">
            {{ '更新' }}
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.settings-container {
  min-height: 100%;
  padding: 24px;
  background-color: #f5f5f5;
}

.settings-card {
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.setting-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.setting-description {
  margin-bottom: 16px;
  font-size: 14px;
  color: #8c8c8c;
}

.setting-control {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cookie-input {
  flex: 1;
}
</style>
