<script lang="ts" setup>
import type { TimeslotModel } from '#/types';

import {
  Button,
  DatePicker,
  InputNumber,
  Modal,
  Select,
  TimePicker,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import { MinusCircle, Plus } from 'lucide-vue-next';

import { useHourLivePackageStore } from '#/store';
import { useRoomStore } from '#/store/room';
import { useStreamerStore } from '#/store/streamer';

defineOptions({
  name: 'HourLivePackageForm',
});

const hourLivePackageStore = useHourLivePackageStore();
const roomStore = useRoomStore();
const streamerStore = useStreamerStore();

// 添加时间段
const addTimeSlot = () => {
  if (!hourLivePackageStore.formState.timeslots) {
    hourLivePackageStore.formState.timeslots = [];
  }

  hourLivePackageStore.formState.timeslots.push({
    canEdit: true,
    date: dayjs(),
    slot: [dayjs().hour(0).minute(0), dayjs().hour(1).minute(0)],
    streamerId: hourLivePackageStore.formState.defaultStreamerId,
  } as TimeslotModel);
};

// 删除时间段
const removeTimeSlot = (index: number) => {
  hourLivePackageStore.formState.timeslots?.splice(index, 1);
};

// 提交表单
const handleOk = () => {
  hourLivePackageStore.makeOrders();
};
</script>

<template>
  <Modal
    v-model:open="hourLivePackageStore.showModal"
    :confirm-loading="hourLivePackageStore.packageCreateLoading"
    centered
    title="创建时间包"
    width="800px"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col gap-4 p-6">
        <!-- 房间选择 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            选择房间
          </span>
          <Select
            v-model:value="hourLivePackageStore.formState.roomId"
            class="flex-1"
            placeholder="请选择直播间"
          >
            <Select.Option
              v-for="room in roomStore.roomList"
              :key="room.id"
              :value="room.id"
            >
              {{ room.name }}
            </Select.Option>
          </Select>
        </div>

        <!-- 价格设置 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            价格设置
          </span>
          <InputNumber
            v-model:value="hourLivePackageStore.formState.orderPrice"
            :min="0"
            :precision="2"
            class="flex-1"
            placeholder="请输入价格"
          />
        </div>

        <!-- 默认主播 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            默认主播
          </span>
          <Select
            v-model:value="hourLivePackageStore.formState.defaultStreamerId"
            class="flex-1"
            placeholder="请选择默认主播"
          >
            <Select.Option
              v-for="streamer in streamerStore.streamerList"
              :key="streamer.id"
              :value="streamer.id"
            >
              {{ streamer.name }}
            </Select.Option>
          </Select>
        </div>

        <!-- 时间段列表 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-500">时间段列表</span>
            <Button size="small" type="primary" @click="addTimeSlot">
              <Plus class="h-4 w-4" />
              添加时间段
            </Button>
          </div>

          <div
            v-for="(slot, index) in hourLivePackageStore.formState.timeslots"
            :key="index"
            class="flex items-center gap-4"
          >
            <DatePicker
              v-model:value="slot.date"
              :disabled="!slot.canEdit"
              class="flex-1"
            />
            <TimePicker
              v-model:value="slot.slot"
              :disabled="!slot.canEdit"
              :range-picker="true"
              class="flex-1"
              format="HH:mm"
            />
            <Select
              v-model:value="slot.streamerId"
              :disabled="!slot.canEdit"
              class="flex-1"
              placeholder="选择主播"
            >
              <Select.Option
                v-for="streamer in streamerStore.streamerList"
                :key="streamer.id"
                :value="streamer.id"
              >
                {{ streamer.name }}
              </Select.Option>
            </Select>
            <MinusCircle
              v-if="slot.canEdit"
              class="h-5 w-5 cursor-pointer text-red-500"
              @click="removeTimeSlot(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
