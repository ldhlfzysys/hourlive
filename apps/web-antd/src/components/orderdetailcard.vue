<script lang="ts" setup>
import type { TimeslotOrder } from '#/types';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';

import { Input, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { Edit, Trash2 } from 'lucide-vue-next';

import { useOSSFileStore, useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'OrderDetailCard',
});

const props = defineProps<{
  timeslotOrder: TimeslotOrder;
}>();

const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm');
};

// 计算单个时间段的时长（小时）
const calculateDuration = (begin: string, finish: string) => {
  const beginTime = dayjs(begin);
  const finishTime = dayjs(finish);

  // 确保两个时间都是有效的
  if (!beginTime.isValid() || !finishTime.isValid()) {
    console.warn('Invalid date input:', { begin, finish });
    return '0.0';
  }

  // 计算小时差
  const duration = finishTime.diff(beginTime, 'hour', true);

  // 如果结束时间在第二天，需要计算20小时（08:00-04:00）或18小时（08:00-02:00）
  if (finishTime.format('HH:mm') === '04:00') {
    return '20.0';
  } else if (finishTime.format('HH:mm') === '02:00') {
    return '18.0';
  }

  return duration >= 0 ? duration.toFixed(1) : '0.0';
};

// 计算所有时间段的总时长
const totalDuration = computed(() => {
  let total = 0;
  for (const slot of props.timeslotOrder.timeslots) {
    total += Number(calculateDuration(slot.begin_date, slot.finish_date));
  }
  return total.toFixed(1);
});

// 判断时间段是否已过期
const isExpired = (beginDate: string) => {
  return dayjs().isAfter(dayjs(beginDate));
};

// 计算已播和未播时长
const { playedDuration, unplayedDuration } = computed(() => {
  let played = 0;
  let unplayed = 0;

  for (const slot of props.timeslotOrder.timeslots) {
    const duration = Number(
      calculateDuration(slot.begin_date, slot.finish_date),
    );
    if (isExpired(slot.begin_date)) {
      played += duration;
    } else {
      unplayed += duration;
    }
  }

  return {
    playedDuration: played,
    unplayedDuration: unplayed,
  };
}).value;

const formattedPlayedDuration = computed(() => playedDuration.toFixed(1));
const formattedUnplayedDuration = computed(() => unplayedDuration.toFixed(1));

// 合并时间段
const mergedTimeslots = computed(() => {
  const slots = [...props.timeslotOrder.timeslots].sort(
    (a, b) => dayjs(a.begin_date).valueOf() - dayjs(b.begin_date).valueOf(),
  );

  const merged: {
    beginTime: string;
    finishTime: string;
    isExpired: boolean;
    singleDuration: string;
    startDates: string[];
    totalDuration: string;
  }[] = [];

  let currentGroup = {
    beginTime: '',
    finishTime: '',
    startDates: [] as string[],
  };

  slots.forEach((slot, index) => {
    const beginTime = dayjs(slot.begin_date).format('HH:mm');
    const finishTime = dayjs(slot.finish_date).format('HH:mm');
    const dateStr = dayjs(slot.begin_date).format('YYYY-MM-DD');

    // 检查是否可以合并到当前组
    if (
      currentGroup.startDates.length > 0 &&
      (beginTime !== currentGroup.beginTime ||
        finishTime !== currentGroup.finishTime ||
        dayjs(slot.begin_date).diff(
          dayjs(currentGroup.startDates[currentGroup.startDates.length - 1]),
          'day',
        ) !== 1)
    ) {
      // 不能合并，保存当前组并开始新组
      const singleDuration = calculateDuration(
        `${currentGroup.startDates[0]} ${currentGroup.beginTime}`,
        `${dayjs(slots[index - 1].finish_date).format('YYYY-MM-DD HH:mm')}`,
      );

      merged.push({
        beginTime: currentGroup.beginTime,
        finishTime: currentGroup.finishTime,
        isExpired: isExpired(
          `${currentGroup.startDates[currentGroup.startDates.length - 1]} ${currentGroup.beginTime}`,
        ),
        singleDuration,
        startDates: currentGroup.startDates,
        totalDuration: (
          Number(singleDuration) * currentGroup.startDates.length
        ).toFixed(1),
      });

      currentGroup = {
        beginTime: '',
        finishTime: '',
        startDates: [],
      };
    }

    // 添加到当前组
    if (currentGroup.startDates.length === 0) {
      currentGroup.beginTime = beginTime;
      currentGroup.finishTime = finishTime;
    }
    currentGroup.startDates.push(dateStr);

    // 处理最后一个元素
    if (index === slots.length - 1) {
      const singleDuration = calculateDuration(
        `${currentGroup.startDates[0]} ${currentGroup.beginTime}`,
        slot.finish_date,
      );

      merged.push({
        beginTime: currentGroup.beginTime,
        finishTime: currentGroup.finishTime,
        isExpired: isExpired(
          `${currentGroup.startDates[currentGroup.startDates.length - 1]} ${currentGroup.beginTime}`,
        ),
        singleDuration,
        startDates: currentGroup.startDates,
        totalDuration: (
          Number(singleDuration) * currentGroup.startDates.length
        ).toFixed(1),
      });
    }
  });

  return merged;
});

// 格式化合并后的日期显示
const formatMergedDates = (dates: string[]) => {
  if (dates.length === 1) {
    return dayjs(dates[0]).format('YYYY-MM-DD');
  }
  const firstDate = dayjs(dates[0]);
  const lastDate = dayjs(dates[dates.length - 1]);
  if (firstDate.format('YYYY-MM') === lastDate.format('YYYY-MM')) {
    return `${firstDate.format('YYYY-MM-DD')}~${lastDate.format('DD')}`;
  }
  return `${firstDate.format('YYYY-MM-DD')}~${lastDate.format('MM-DD')}`;
};

const orderStore = useTimeslotOrderStore();
const editTitle = ref('');
const showEditModal = ref(false);
const editLoading = ref(false);

const handleEditTitle = () => {
  editTitle.value = props.timeslotOrder.order_title || '';
  showEditModal.value = true;
};

const handleUpdateTitle = async () => {
  try {
    editLoading.value = true;
    orderStore.timeslotOrderCreate.timeslots = [];
    orderStore.timeslotOrderCreate.id = props.timeslotOrder.id;
    orderStore.timeslotOrderCreate.order_title = editTitle.value;
    orderStore.timeslotOrderCreate.room_id = props.timeslotOrder.room_id;
    await orderStore.createTimeslotOrder();
    showEditModal.value = false;
  } finally {
    editLoading.value = false;
  }
};

const handleDelete = async () => {
  try {
    Modal.confirm({
      cancelText: $t('取消'),
      content: $t('确定要删除该订单吗？'),
      okText: $t('确定'),
      async onOk() {
        const timeslot_ids = props.timeslotOrder.timeslots.map(
          (slot) => slot.id,
        );
        await orderStore.deleteOrders({
          timeslot_ids,
          timeslotorder_id: props.timeslotOrder.id,
        });
      },
      title: $t('确认删除'),
    });
  } catch (error) {
    console.error('Delete order failed:', error);
  }
};

const ossFileStore = useOSSFileStore();
</script>

<template>
  <div class="mb-4 rounded-lg border bg-white p-6 shadow-sm">
    <div class="mb-4">
      <!-- 订单基本信息 -->
      <div class="mb-4 border-b pb-4">
        <div class="flex items-center gap-4">
          <span class="text-gray-600">{{ $t('timeslotorder_id') }}:</span>
          <span class="font-medium">{{ timeslotOrder.id }}</span>
          <span class="text-lg font-medium text-blue-600">{{
            timeslotOrder.order_title
          }}</span>
          <span
            class="ml-auto transform cursor-pointer text-blue-600 transition-colors hover:text-blue-800"
            @click="ossFileStore.showOSSFileModal(`order_${timeslotOrder.id}`)"
          >
            {{ $t('contract_files') }}
          </span>
          <button
            class="flex items-center text-gray-500 hover:text-blue-600"
            @click="handleEditTitle"
          >
            <Edit class="h-4 w-4" />
          </button>
          <button
            class="flex items-center text-gray-500 hover:text-red-600"
            @click="handleDelete"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- 时长统计、客户和代理信息 -->
      <div class="grid grid-cols-5 gap-4">
        <!-- 客户和代理信息 -->
        <div class="col-span-2 grid grid-cols-2 rounded-lg bg-gray-50">
          <div class="px-4 py-2">
            <div class="text-sm text-gray-500">{{ $t('customer') }}</div>
            <div class="font-medium">{{ timeslotOrder.customer?.code }}</div>
            <div class="mt-1 text-sm text-gray-500">
              {{ $t('content_id') }}: {{ timeslotOrder.contents[0]?.id }}
            </div>
            <div class="mt-2">
              <span
                class="transform cursor-pointer text-blue-600 transition-colors hover:text-blue-800"
                @click="
                  ossFileStore.showOSSFileModal(`order_${timeslotOrder.id}`)
                "
              >
                {{ $t('contract_files') }}
              </span>
            </div>
          </div>
          <div class="px-4 py-2">
            <div class="text-sm text-gray-500">{{ $t('agency') }}</div>
            <div class="font-medium">{{ timeslotOrder.agency?.name }}</div>
            <div class="mt-1 text-sm text-gray-500">
              {{ $t('room_id') }}: {{ timeslotOrder.room_id }}
            </div>
          </div>
        </div>

        <!-- 时长统计信息 -->
        <div class="col-span-3 rounded-lg bg-gray-50 p-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm text-gray-500"
              >{{ $t('total_duration') }}: {{ totalDuration }}
              {{ $t('hours') }}</span
            >
          </div>
          <div class="relative h-6 w-full rounded-full bg-gray-200">
            <div
              :style="{
                width: `${(playedDuration / Number(totalDuration)) * 100}%`,
              }"
              class="absolute left-0 top-0 h-full rounded-l-full bg-blue-500"
            ></div>
            <div
              :style="{
                left: `${(playedDuration / Number(totalDuration)) * 100}%`,
                width: `${(unplayedDuration / Number(totalDuration)) * 100}%`,
              }"
              class="absolute h-full rounded-r-full bg-red-500"
            ></div>
          </div>
          <div class="mt-2 flex justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-blue-500"></div>
              <span
                >{{ $t('played') }}: {{ formattedPlayedDuration }}
                {{ $t('hours') }}</span
              >
            </div>
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-red-500"></div>
              <span
                >{{ $t('unplayed') }}: {{ formattedUnplayedDuration }}
                {{ $t('hours') }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间段列表 -->
    <div class="border-t pt-4">
      <div class="mb-3 font-medium text-gray-600">{{ $t('timeslots') }}:</div>
      <div class="space-y-2">
        <div
          v-for="(slot, index) in mergedTimeslots"
          :key="index"
          :class="{ 'opacity-60': slot.isExpired }"
          class="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
        >
          <div>
            {{ formatMergedDates(slot.startDates) }}
            {{ slot.beginTime }} - {{ slot.finishTime }}
          </div>
          <div class="text-gray-600">
            <template v-if="slot.startDates.length > 1">
              {{ slot.singleDuration }} × {{ slot.startDates.length }} =
              {{ slot.totalDuration }} {{ $t('hours') }}
            </template>
            <template v-else>
              {{ slot.singleDuration }} {{ $t('hours') }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 编辑标题弹窗 -->
  <Modal
    :confirm-loading="editLoading"
    :title="$t('edit_order_title')"
    :visible="showEditModal"
    @cancel="showEditModal = false"
    @ok="handleUpdateTitle"
  >
    <Input
      v-model:value="editTitle"
      :placeholder="$t('please_input_order_title')"
      allow-clear
    />
  </Modal>
</template>

<style scoped>
.order-card {
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}

.bg-blue-500 {
  transition: width 0.3s ease;
}

.bg-red-500 {
  transition: all 0.3s ease;
}
</style>
