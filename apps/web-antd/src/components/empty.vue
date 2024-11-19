<script lang="ts" setup>
import { Empty, Spin } from 'ant-design-vue';

defineOptions({
  name: 'Empty',
});

withDefaults(
  defineProps<{
    description?: string;
    loading?: boolean;
  }>(),
  {
    description: '暂无数据',
    loading: false,
  },
);
</script>

<template>
  <div class="empty-container">
    <Spin :spinning="loading">
      <Empty :description="description" />
    </Spin>
  </div>
</template>

<style scoped>
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 0;
  color: #8c8c8c;
}
</style>
