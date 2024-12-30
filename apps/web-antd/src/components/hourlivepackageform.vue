<script lang="ts" setup>
import type { CancelTimeSlot, TimeSlot } from '#/types';

import { computed, ref } from 'vue';

import {
  Button,
  Collapse,
  CollapsePanel,
  InputNumber,
  List,
  ListItem,
  Modal,
  RangePicker,
  Select,
  Timeline,
  TimelineItem,
} from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';

import { useHourLivePackageStore, useTimeslotOrderStore } from '#/store';
import { useRoomStore } from '#/store/room';
import { useStreamerStore } from '#/store/streamer';

import SingleDateModal from './singleDateModal.vue';

defineOptions({
  name: 'HourLivePackageForm',
});

const hourLivePackageStore = useHourLivePackageStore();
const roomStore = useRoomStore();
const streamerStore = useStreamerStore();
const focusDate = ref<string>('');
const streamerAvatar = computed(() => {
  let avatarStr =
    'https://hourlive-image.oss-ap-southeast-1.aliyuncs.com/avatar/avatar_default.png';
  if (hourLivePackageStore.formState.streamerId) {
    const streamer = streamerStore.getStreamerById(
      hourLivePackageStore.formState.streamerId,
    );
    if (streamer) {
      avatarStr = streamer.avatar || avatarStr;
    }
  }

  return avatarStr;
});

const availableTimeslots = computed(() => {
  const availableTimeslotsMap = new Map<
    string,
    { end: Dayjs; start: Dayjs }[]
  >();
  hourLivePackageStore.dateTimeslots.forEach((timeslots, date) => {
    availableTimeslotsMap.set(date, getDateAvailableTimeslots(timeslots));
  });
  return availableTimeslotsMap;
});

function getDateAvailableTimeslots(timeslots: TimeSlot[]) {
  const startOfDay = dayjs().startOf('day');
  const endOfDay = dayjs().endOf('day');
  const availableSlots: { end: Dayjs; start: Dayjs }[] = [];

  let current = startOfDay;

  while (current.isBefore(endOfDay)) {
    const next = current.add(30, 'minute');
    const isAvailable = !timeslots.some((timeslot) => {
      const slotStart = dayjs(timeslot.start_time);
      const slotEnd = dayjs(timeslot.end_time);
      return current.isBefore(slotEnd) && next.isAfter(slotStart);
    });

    if (isAvailable) {
      availableSlots.push({
        end: next.format('HH:mm'),
        selected: false,
        start: current.format('HH:mm'),
      });
    }

    current = next;
  }

  return availableSlots;
}

// 添加时间段
function addTimeslot() {
  if (hourLivePackageStore.formState.timeslots === undefined) {
    hourLivePackageStore.formState.timeslots = [];
  }
  hourLivePackageStore.formState.timeslots!.push({
    canEdit: true,
    date: dayjs(),
    slot: undefined,
    streamerId: hourLivePackageStore.formState.streamerId,
  });
}

function deleteTimeslot(index: number) {
  const timeslot = hourLivePackageStore.formState.timeslots![index]!;
  if (timeslot.id && hourLivePackageStore.formState.orderId) {
    Modal.confirm({
      cancelText: '取消',
      content: '当前这个时间段已经创建订单，确定要删除这个时间段吗？',
      okText: '确认',
      async onOk() {
        const timeslot = hourLivePackageStore.formState.timeslots![index]!;
        if (timeslot.id && hourLivePackageStore.formState.orderId) {
          const cancelTimeSlot: CancelTimeSlot = {
            timeslot_ids: [timeslot.id],
            timeslotorder_id: hourLivePackageStore.formState.orderId,
          };
          const res =
            await useTimeslotOrderStore().deleteOrders(cancelTimeSlot);
          if (res !== null) {
            hourLivePackageStore.packages.set(res.id, res);
            hourLivePackageStore.formState.timeslots!.splice(index, 1);
            hourLivePackageStore.queryTimeslots();
          }
        }
      },
      title: '确认删除',
    });
  } else {
    hourLivePackageStore.formState.timeslots!.splice(index, 1);
    hourLivePackageStore.queryTimeslots();
  }
}

function handleSelectTimeslot(slot: {
  end: string;
  selected: boolean;
  start: string;
}) {
  slot.selected = !slot.selected;
}

// 提交表单
const handleOk = () => {
  hourLivePackageStore.makeOrders();
};

// 处理日期选择
function handleCalendarChange(dates: [Dayjs, Dayjs]) {
  hourLivePackageStore.queryTimeslots();
  focusDate.value = dates[0].format('YYYY-MM-DD');
}

function handleCalendarFocus(index: number) {
  const timeslot = hourLivePackageStore.formState.timeslots![index]!;
  if (timeslot.slot) {
    focusDate.value = timeslot.slot[0].format('YYYY-MM-DD');
  }
}

function handleStreamerSelect(value: number) {
  hourLivePackageStore.formState.timeslots!.forEach((timeslot) => {
    if (timeslot.streamerId === undefined) {
      timeslot.streamerId = value;
    }
  });
}
</script>

<template>
  <Modal
    v-model:open="hourLivePackageStore.showModal"
    :confirm-loading="hourLivePackageStore.packageCreateLoading"
    centered
    title="创建时间包"
    width="70%"
    @ok="handleOk"
  >
    <div
      class="flex h-full flex-row space-x-2 overflow-hidden rounded-lg border bg-white shadow"
    >
      <div class="flex flex-1 flex-col gap-4 p-6">
        <!-- 房间选择 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            选择房间
          </span>
          <Select
            v-model:value="hourLivePackageStore.formState.roomId"
            class="max-w-[500px] flex-1"
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

        <!-- 默认主播 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            默认主播
          </span>
          <Select
            v-model:value="hourLivePackageStore.formState.streamerId"
            class="max-w-[500px] flex-1"
            placeholder="请选择默认主播"
            @select="handleStreamerSelect"
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

        <!-- 价格设置 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            价格设置
          </span>
          <InputNumber
            v-model:value="hourLivePackageStore.formState.price"
            :min="0"
            :precision="2"
            class="max-w-[500px] flex-1"
            placeholder="请输入价格"
          />
        </div>

        <!-- 时间段列表 -->
        <div
          v-if="hourLivePackageStore.formState.roomId"
          class="flex flex-row items-center"
        >
          <span class="mr-2 w-24 text-sm font-medium text-gray-500"
            >时间段</span
          >
          <div
            v-if="
              hourLivePackageStore.formState.timeslots === undefined ||
              hourLivePackageStore.formState.timeslots!.length === 0
            "
            class="flex w-[500px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-blue-500"
            @click="addTimeslot"
          >
            <div
              class="flex h-full w-full items-center justify-center gap-2 text-gray-500 hover:text-blue-500"
            >
              <span class="icon-[mdi--plus] size-6"></span>
              <span>请添加时间段</span>
            </div>
          </div>
          <List
            v-else
            :bordered="true"
            :data-source="hourLivePackageStore.formState.timeslots"
            class="max-w-[500px] flex-1"
            item-layout="horizontal"
            size="small"
            style="max-height: 400px; overflow: auto"
          >
            <template #renderItem="{ item, index }">
              <ListItem>
                <div class="flex gap-2">
                  <Select
                    v-model:value="item.streamerId"
                    class="max-w-[200px] flex-1"
                    placeholder="请选择主播"
                  >
                    <Select.Option
                      v-for="streamer in streamerStore.streamerList"
                      :key="streamer.id"
                      :value="streamer.id"
                    >
                      {{ streamer.name }}
                    </Select.Option>
                  </Select>
                  <RangePicker
                    v-model:value="item.slot"
                    :allow-clear="true"
                    :disabled="!item.canEdit"
                    :status="item.is_conflict ? 'error' : undefined"
                    format="YYYY/MM/DD HH:mm"
                    show-time
                    @change="handleCalendarChange"
                    @focus="handleCalendarFocus(index)"
                  />

                  <span
                    class="icon-[mdi--minus] size-6"
                    @click="deleteTimeslot(index)"
                  ></span>
                  <span
                    v-if="
                      index ===
                      hourLivePackageStore.formState.timeslots!.length - 1
                    "
                    class="icon-[mdi--plus] size-6"
                    @click="addTimeslot"
                  ></span>
                </div>
              </ListItem>
            </template>
          </List>
        </div>
      </div>
      <div class="flex max-h-[500px] w-[40%] flex-col overflow-y-auto">
        <Collapse
          v-if="hourLivePackageStore.dateTimeslots.size > 0"
          v-model:active-key="focusDate"
          :bordered="false"
        >
          <CollapsePanel
            v-for="date in hourLivePackageStore.dateTimeslots.keys()"
            :key="date"
            :header="date"
          >
            <Timeline class="ml-4">
              <TimelineItem
                v-for="(
                  timeslot, index
                ) in hourLivePackageStore.dateTimeslots.get(date)"
                :key="index"
                :color="
                  timeslot.is_conflict
                    ? 'red'
                    : timeslot.is_create
                      ? 'green'
                      : 'blue'
                "
              >
                {{ timeslot.start_time }} - {{ timeslot.end_time }}
                {{ timeslot.is_create ? '(新增)' : '' }}
                {{
                  timeslot.timeslotorders && timeslot.timeslotorders.length > 0
                    ? `订单id: ${timeslot.timeslotorders![0].id.toString()}`
                    : ''
                }}
              </TimelineItem>
              <Button
                type="primary"
                @click="
                  hourLivePackageStore.currentSlotsMap.set(
                    date,
                    hourLivePackageStore.dateTimeslots.get(date)!,
                  );
                  hourLivePackageStore.showAvailableTimeslotsModal = true;
                "
              >
                选择当日可用时间段
              </Button>
              <SingleDateModal
                v-if="hourLivePackageStore.showAvailableTimeslotsModal"
              />
            </Timeline>
          </CollapsePanel>
        </Collapse>
      </div>
    </div>
  </Modal>
</template>
