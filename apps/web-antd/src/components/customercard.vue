<script lang="ts" setup>
import type { Customer } from '#/types';

import { createVNode, onMounted, ref } from 'vue';

import { Button, message, Modal } from 'ant-design-vue';
import { AlertCircle, Pencil, Share2, Trash2 } from 'lucide-vue-next';

import { useSchedulingStore } from '#/store';

const props = defineProps<{
  customer: Customer;
}>();

defineEmits<{
  (e: 'click'): void;
}>();

const schedulingStore = useSchedulingStore();

const isExpanded = ref(false);
const descRef = ref<HTMLElement | null>(null);
const showExpandButton = ref(false);
const showModal = ref(false);

function handleEdit(e: Event) {
  e.stopPropagation();
  schedulingStore.showEditCustomerModal({
    avatar: props.customer.avatar,
    brand: props.customer.brand,
    desc: props.customer.desc,
    id: props.customer.id,
  });
}

function toggleDescription() {
  isExpanded.value = !isExpanded.value;
}

// 修改分享功能
async function handleShare(e: Event) {
  e.stopPropagation();
  const shareUrl = `${window.location.origin}/#/public/scheduling/${props.customer.code}`;
  const fullText = `${shareUrl}`;

  try {
    await navigator.clipboard.writeText(fullText);
    message.success('分享链接已复制到剪贴板');
  } catch (error) {
    message.error('复制失败，请手动复制');
    console.error('复制失败:', error);
  }
}

const handleDelete = (e: Event) => {
  e.stopPropagation();
  Modal.confirm({
    cancelText: '取消',
    content: '确定要删除该品牌吗？',
    icon: createVNode(AlertCircle),
    okText: '确认',
    async onOk() {
      if (props.customer.id) {
        await schedulingStore.hideCustomer({ id: props.customer.id });
        await schedulingStore.queryCustomers();
      }
    },
    title: '确认删除',
  });
};

onMounted(() => {
  if (descRef.value) {
    const lineHeight = Number.parseInt(
      window.getComputedStyle(descRef.value).lineHeight,
    );
    showExpandButton.value = descRef.value.scrollHeight > lineHeight * 3;
  }
});
</script>

<template>
  <div
    class="relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    @click="$emit('click')"
  >
    <!-- 品牌信息区域 -->
    <div class="flex items-center justify-between gap-4">
      <!-- Logo区域 -->
      <div class="w-1/2">
        <div class="flex h-16 w-full items-center justify-center">
          <img
            v-if="customer.avatar && customer.avatar.length > 0"
            :alt="customer.brand"
            :src="customer.avatar"
            class="h-16 w-full rounded-md object-contain"
          />
          <div
            v-else
            class="flex h-16 w-full items-center justify-center rounded-md bg-gray-200 text-2xl text-gray-500"
          >
            {{ customer.brand.substring(0, 1) }}
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="h-16 w-px bg-gray-200"></div>

      <!-- 品牌名称区域 -->
      <div class="flex w-1/2 items-center justify-center">
        <h3 class="break-all text-center text-lg font-medium text-gray-900">
          {{ customer.brand }}
        </h3>
      </div>
    </div>

    <!-- 描述信息 -->
    <div class="mt-4 flex flex-col space-y-2 text-sm">
      <div v-if="customer.desc" class="flex items-start">
        <span class="min-w-[50px] text-gray-500">描述：</span>
        <div class="flex flex-col">
          <span
            ref="descRef"
            :class="{ 'line-clamp-3': !isExpanded }"
            class="text-gray-600"
          >
            {{ customer.desc }}
          </span>
          <span
            v-if="showExpandButton"
            class="mt-1 cursor-pointer text-sm text-blue-600 hover:text-blue-700"
            @click="toggleDescription"
          >
            {{ isExpanded ? '收起' : '展开' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-4 border-t border-gray-100 pt-4">
      <div class="flex items-center justify-end space-x-2">
        <Button
          class="flex items-center"
          ghost
          size="small"
          type="primary"
          @click="handleShare"
        >
          <Share2 class="mr-1 h-3 w-3" />
          分享排期
        </Button>
        <Button
          class="flex items-center"
          ghost
          size="small"
          type="primary"
          @click="handleEdit"
        >
          <Pencil class="mr-1 h-3 w-3" />
          编辑
        </Button>
        <Button
          class="flex items-center"
          danger
          ghost
          size="small"
          type="primary"
          @click="handleDelete"
        >
          <Trash2 class="mr-1 h-3 w-3" />
          删除
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
