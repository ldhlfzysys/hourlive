<script lang="ts" setup>
import type { Streamer } from '#/types/IStreamer';

import { computed, onMounted, ref } from 'vue';

import { Button, Popconfirm, Tag } from 'ant-design-vue';
import { Pencil, Trash2 } from 'lucide-vue-next';

import { useStreamerStore } from '#/store';

import { type CountryCode, countryMap } from './country';

const props = defineProps<{
  streamer: Streamer;
}>();

const streamerStore = useStreamerStore();

const countryDisplay = computed(() => {
  const country = props.streamer.country;
  return country && (country as CountryCode) in countryMap
    ? countryMap[country as CountryCode]
    : null;
});

const isExpanded = ref(false);
const descRef = ref<HTMLElement | null>(null);
const showExpandButton = ref(false);

function handleEdit() {
  streamerStore.isEditing = true;
  streamerStore.showModal = true;
  streamerStore.streamerCreate = { ...props.streamer };
}

function handleDelete() {
  if (props.streamer.id) {
    streamerStore.deleteStreamer(props.streamer.id);
  }
}

function toggleDescription() {
  isExpanded.value = !isExpanded.value;
}

onMounted(() => {
  if (descRef.value) {
    // 检查内容是否超过3行（假设每行20px）
    const lineHeight = Number.parseInt(
      window.getComputedStyle(descRef.value).lineHeight,
    );
    showExpandButton.value = descRef.value.scrollHeight > lineHeight * 3;
  }
});
</script>

<template>
  <div
    class="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
  >
    <!-- 主播信息区域 -->
    <div class="flex items-start space-x-3">
      <img
        :alt="streamer.name"
        :src="
          streamer.avatar ||
          'https://hourlive-image.oss-ap-southeast-1.aliyuncs.com/avatar/avatar_default.png'
        "
        class="h-12 w-12 rounded-full object-cover"
      />
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-medium text-gray-900">{{ streamer.name }}</h3>
          <span v-if="countryDisplay" class="text-lg">{{
            countryDisplay.flag
          }}</span>
        </div>
        <div class="mt-1 flex flex-wrap gap-2">
          <Tag v-for="tag in streamer.tags" :key="tag.id" :color="tag.color">
            {{ tag.name }}
          </Tag>
        </div>
      </div>
    </div>

    <!-- 描述信息 -->
    <div class="mt-4 flex flex-col space-y-2 text-sm">
      <div class="flex items-start">
        <span class="min-w-[50px] text-gray-500">账号：</span>
        <span>{{ streamer.user?.account }}</span>
      </div>

      <div v-if="streamer.desc" class="flex items-start">
        <span class="min-w-[50px] text-gray-500">描述：</span>
        <div class="flex flex-col">
          <span
            ref="descRef"
            :class="{ 'line-clamp-3': !isExpanded }"
            class="text-gray-600"
          >
            {{ streamer.desc }}
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
          @click="handleEdit"
        >
          <Pencil class="mr-1 h-3 w-3" />
          编辑
        </Button>
        <Popconfirm title="确定要删除吗？" @confirm="handleDelete">
          <Button
            class="flex items-center"
            danger
            ghost
            size="small"
            type="primary"
          >
            <Trash2 class="mr-1 h-3 w-3" />
            删除
          </Button>
        </Popconfirm>
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
