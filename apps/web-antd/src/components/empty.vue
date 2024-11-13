<script lang="ts" setup>
import { Empty } from 'ant-design-vue';

defineOptions({
  name: 'Empty',
});

withDefaults(
  defineProps<{
    description?: string;
  }>(),
  {
    description: '暂无数据',
  },
);
</script>

<template>
  <div class="empty-container">
    <Empty :description="description" />
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
