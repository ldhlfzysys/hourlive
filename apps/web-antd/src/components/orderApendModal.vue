<!-- <script lang="ts" setup>
import type { SlotEvent } from '#/types';

import { computed, ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { AccessControl } from '@vben/access';
import { $t } from '@vben/locales';

import { useElementBounding } from '@vueuse/core';
import { Button, Descriptions, DescriptionsItem, Modal } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import SampleCard from '#/components/samplecard.vue';
import { useAgencyStore, useSampleStore, useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'OrderDetailModal',
});

const props = defineProps<{

}>();
const orderStore = useTimeslotOrderStore();

const maxHeight = computed(() => {
  return window.innerHeight * 0.7;
});

</script>

<template>
  <Modal
    v-model:open="orderStore.showApendModal"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    title="追加订单"
    style="top: 10px; width: 60%"
    @cancel="orderStore.showApendModal = false"
  >
    <div class="flex h-full flex-1 flex-col">
      
    </div>

    <template #footer>

      <AccessControl :codes="['super']">
        <Button
          key="submit"
          type="primary"
          @click=""
        >
          确认追加

        </Button>
       

      </AccessControl>
    </template>
  </Modal>
</template> -->
