<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useLiveAccountStore } from '#/store';
// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller';

import { Button, Modal } from 'ant-design-vue';

import LiveAccountCard from '#/components/liveaccountcard.vue';
import LiveAccountForm from '#/components/liveaccountform.vue';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const liveaccountStore = useLiveAccountStore();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

const showModal = ref(false);

onMounted(() => {
  liveaccountStore.queryLiveAccount();
});

function handleOk() {
  liveaccountStore.createLiveAccount();
}

function onTop() {}
function onBottom() {
  liveaccountStore.queryLiveAccount();
}

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
      <Button type="primary" @click="showModal = true">新增直播账号</Button>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :item-size="210"
          :items="liveaccountStore.liveaccountList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <LiveAccountCard :liveaccount="item" />
        </RecycleScroller>
      </div>
      <Modal
        v-model:visible="showModal"
        :confirm-loading="liveaccountStore.liveaccountCreateLoading"
        :title="$t('create')"
        centered
        width="800px"
        @ok="handleOk"
      >
        <LiveAccountForm />
      </Modal>
    </template>
    <!-- <template #footer> 123 </template> -->
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  /* height: 32%; */

  /* padding: 0 12px; */
  display: flex;
  align-items: center;
}
</style>
