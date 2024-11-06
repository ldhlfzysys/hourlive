<script lang="ts" setup>
import { onMounted } from 'vue';

import { Button } from 'ant-design-vue';

import RoomCard from '#/components/roomcard.vue';
import RoomForm from '#/components/roomform.vue';
import { useRoomStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller';

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
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :grid-items="2"
          :item-secondary-size="650"
          :item-size="210"
          :items="roomStore.roomList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
        >
          <RoomCard :room="item" />
        </RecycleScroller>
      </div>
      <RoomForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  display: flex;
  flex-direction: column; /* 确保子元素垂直排列 */
  height: 100%;
}

.room-card {
  margin-bottom: 10px; /* 添加间距以避免重叠 */
}
</style>
