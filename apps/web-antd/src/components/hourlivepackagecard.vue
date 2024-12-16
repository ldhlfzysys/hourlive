<script lang="ts" setup>
import type { TimeslotModel, TimeslotOrder } from '#/types';

import { computed } from 'vue';

import { Button, Modal, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';
import { Timer, Users } from 'lucide-vue-next';

import { useHourLivePackageStore } from '#/store';

import HourLiveAvatar from './hourliveavartar.vue';

defineOptions({
  name: 'HourLivePackageCard',
});

const props = defineProps<{
  item: TimeslotOrder;
}>();

// 计算总时长（小时）
const totalDuration = computed(() => {
  let total = 0;
  props.item.timeslots.forEach((slot) => {
    const startTime = new Date(`${slot.date} ${slot.start_time}`);
    const endTime = new Date(`${slot.date} ${slot.end_time}`);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    total += hours;
  });
  return total.toFixed(2);
});

// 获取主播标签颜色
const getTagColor = (tag: { color: string }) => {
  return tag.color || 'blue';
};

// 判断状态是否为上架
const isOnline = computed(() => props.item.status === 5);

// 获取所有时段的主播
const getAllStreamers = computed(() => {
  const streamers = new Map();
  props.item.timeslots.forEach((slot) => {
    slot.streamers?.forEach((streamer) => {
      if (streamer.id) {
        streamers.set(streamer.id, streamer);
      }
    });
  });
  return [...streamers.values()];
});

const allAvatar = computed(() => {
  return getAllStreamers.value.map((streamer) => streamer.avatar);
});

function handleSetTimeslot() {
  const timeslots = props.item.timeslots.map((slot) => {
    const startTime = dayjs(`${slot.date} ${slot.start_time}`);
    const endTime = dayjs(`${slot.date} ${slot.end_time}`);

    const timeModel: TimeslotModel = {
      canEdit: false,
      date: [startTime, endTime],
      id: slot.id,
      slot: [startTime, endTime],
      streamerId: slot.streamers?.[0]?.id,
    };
    return timeModel;
  });

  useHourLivePackageStore().formState = {
    cost: props.item.order_price,
    orderId: props.item.id,
    price: props.item.order_price,
    roomId: props.item.room_id,
    timeslots,
  };

  useHourLivePackageStore().showModal = true;
}

const hasTimeslot = computed(() => props.item.timeslots.length > 0);

function handleOnlineOrOffline() {
  if (isOnline.value) {
    // 下架
    useHourLivePackageStore().downTimePackage(props.item.id);
  } else {
    // 上架
    if (hasTimeslot.value) {
      useHourLivePackageStore().upTimePackage(props.item.id);
    } else {
      Modal.error({
        content: '当前时间包不存在时段，请先设置再上架',
        title: '无法上架',
      });
    }
  }
}
</script>

<template>
  <div
    :class="[{ 'bg-white': hasTimeslot, 'bg-gray-100': !hasTimeslot }]"
    class="group relative rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md"
  >
    <!-- 上架状态标签 -->
    <div class="absolute right-2 top-2">
      <Tag v-if="isOnline" class="flex items-center gap-1" color="success">
        <span class="relative flex h-2 w-2">
          <span
            class="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          ></span>
          <span
            class="bg-success relative inline-flex h-2 w-2 rounded-full"
          ></span>
        </span>
        直播中
      </Tag>
      <Tag v-else class="flex items-center gap-1" color="default">
        <span class="inline-block h-2 w-2 rounded-full bg-gray-300"></span>
        {{ hasTimeslot ? '未上架' : '未设置时段' }}
      </Tag>
    </div>

    <!-- 主播信息区域 -->
    <div class="flex items-start space-x-3">
      <div class="relative">
        <HourLiveAvatar :avatars="allAvatar" />
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3
              v-if="getAllStreamers.length === 0"
              class="text-lg font-medium text-gray-900"
            >
              {{ getAllStreamers[0]?.name }}
            </h3>
            <Users
              v-if="getAllStreamers.length > 1"
              class="h-4 w-4 text-gray-400"
            />
          </div>
        </div>
        <div class="mt-1 flex flex-wrap gap-2">
          <Tag
            v-for="tag in getAllStreamers[0]?.tags"
            :key="tag.id"
            :color="getTagColor(tag)"
          >
            {{ tag.name }}
          </Tag>
        </div>
      </div>
    </div>

    <!-- 描述信息 -->
    <p class="mt-4 line-clamp-2 text-sm text-gray-600">
      {{ getAllStreamers[0]?.desc }}
    </p>

    <!-- 修改操作按钮区域 -->
    <div class="mt-4 border-gray-100 pt-4">
      <!-- 套餐信息 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center text-gray-600">
            <Timer class="h-4 w-4" />
            <span class="ml-1 text-sm">{{ totalDuration }}小时</span>
          </div>
          <div class="text-primary text-lg font-medium">
            ¥{{ item.order_price }}
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-3 flex items-center justify-end space-x-2">
        <Button
          :disabled="!hasTimeslot"
          :type="isOnline ? 'default' : 'primary'"
          size="small"
          @click="handleOnlineOrOffline"
        >
          {{ isOnline ? '下架' : '上架' }}
        </Button>
        <Button
          v-if="!isOnline"
          class="flex items-center"
          ghost
          size="small"
          type="primary"
          @click="handleSetTimeslot"
        >
          <Timer class="mr-1 h-3 w-3" />
          设置时段
        </Button>
      </div>
    </div>
  </div>
</template>
