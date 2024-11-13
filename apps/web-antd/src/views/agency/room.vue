<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Button } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import RoomCard from '#/components/roomcard.vue';
import RoomForm from '#/components/roomform.vue';
import { useRoomStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const roomStore = useRoomStore();

onMounted(() => {
  console.log('=====mounted=====');
  roomStore.queryRoom();
});

function onTop() {}
function onBottom() {
  roomStore.queryRoom();
}

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

function onUpdate(
  viewStartIndex: number,
  viewEndIndex: number,
  visibleStartIndex: number,
  visibleEndIndex: number,
) {
  updateParts.value.viewStartIdx = viewStartIndex;
  updateParts.value.viewEndIdx = viewEndIndex;
  updateParts.value.visibleStartIdx = visibleStartIndex;
  updateParts.value.visibleEndIdx = visibleEndIndex;
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <Button
        style="margin-top: 10px; margin-bottom: 10px"
        type="primary"
        @click="roomStore.showModal = true"
      >
        新增
      </Button>
      <br />
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <DynamicScroller
          v-if="roomStore.roomList.length > 0"
          :items="roomStore.roomList"
          :min-item-size="210"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :active="active"
              :data-index="index"
              :item="item"
              class="p-4 first:pt-4"
            >
              <RoomCard :room="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
        <Empty
          v-else
          class="flex-1"
          description="暂无房间数据，点击上方按钮添加"
        />
      </div>
      <RoomForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

:deep(.vue-recycle-scroller__item-wrapper) {
  padding: 16px;
  padding-bottom: 0;
}

:deep(.vue-recycle-scroller__item-wrapper:last-child) {
  padding-bottom: 16px;
}
</style>
