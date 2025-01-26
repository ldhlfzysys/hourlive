<script lang="ts" setup>
import type { Sample } from '#/types';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button, Image, Modal, Tooltip } from 'ant-design-vue';
import { Trash2 } from 'lucide-vue-next';

import { useOSSFileStore, useSampleStore } from '#/store';

defineOptions({
  name: 'SampleCard',
});

const props = withDefaults(
  defineProps<{
    sample: Sample;
  }>(),
  {},
);

const sampleStore = useSampleStore();
const userStore = useUserStore();
const ossFileStore = useOSSFileStore();

const type = computed(() => {
  switch (props.sample.is_main) {
    case '1': {
      return 'sample_main';
    }
    case '0': {
      return 'sample_welfare';
    }
    case '2': {
      return 'sample_deal';
    }
    case '3': {
      return 'sample_normal';
    }
    case '4': {
      return 'sample_new';
    }
    default: {
      return '';
    }
  }
});

const canEdit = computed(() => {
  return userStore.userRoles.includes('customer');
});

const showDeleteConfirm = ref(false);
const deletingId = ref<null | number>(null);

const handleDelete = (id: number) => {
  deletingId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (deletingId.value) {
    await sampleStore.deleteSample(deletingId.value);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="w-full p-3">
    <div
      class="group relative flex h-[240px] w-full transform rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      <div class="relative h-full w-[200px]">
        <Image
          :height="200"
          :src="props.sample.product_image"
          :width="200"
          alt="商品图片"
          class="h-full w-full rounded-lg object-cover"
        />
        <div
          :class="[type === 'sample_main' ? 'bg-red-500/60' : 'bg-black/60']"
          class="absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
        >
          {{ $t(type) }}
        </div>
      </div>

      <div class="ml-6 flex flex-1 flex-col justify-between">
        <div>
          <h2 class="line-clamp-2 text-lg font-medium text-gray-900">
            <a
              :href="props.sample.product_link"
              class="hover:text-blue-600"
              target="_blank"
            >
              {{ props.sample.product_name }}
            </a>
          </h2>

          <div class="mt-3 flex items-center space-x-4 text-sm">
            <span class="text-gray-500">ID: {{ props.sample.product_id }}</span>
            <div class="flex space-x-3">
              <Tooltip
                placement="top"
                title="卖点是主播在介绍商品时会额外关注的内容，保证主播在介绍商品时，不错过重要内容。"
              >
                <span
                  class="transform cursor-pointer text-blue-600 transition-colors hover:text-blue-800"
                  @click="
                    canEdit
                      ? sampleStore.makeUpdate(props.sample.id!)
                      : sampleStore.makeKSPUpdate(props.sample.id!)
                  "
                  ><span
                    v-if="!props.sample.product_ksp?.length"
                    class="mr-1 text-red-500"
                    >❗️</span
                  >{{ $t('product_ksp')
                  }}{{ !props.sample.product_ksp?.length ? '[无]' : '' }}</span
                >
              </Tooltip>
              <span
                class="transform cursor-pointer text-blue-600 transition-colors hover:text-blue-800"
                @click="ossFileStore.showOSSFileModal(props.sample.id!)"
                >{{ $t('scriptmanager') }}</span
              >
            </div>
          </div>

          <div class="mt-4 flex items-baseline space-x-3">
            <span class="text-xl font-bold text-blue-600">{{
              props.sample.product_final_price
            }}</span>
            <span class="text-sm text-gray-400 line-through">{{
              props.sample.product_srp
            }}</span>
            <span
              class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
            >
              {{ props.sample.product_discount }}
            </span>
          </div>
        </div>

        <div v-if="canEdit" class="mt-auto flex justify-end space-x-2">
          <Button
            type="primary"
            @click="sampleStore.makeUpdate(props.sample.id!)"
          >
            {{ $t('edit') }}
          </Button>

          <Button danger type="primary" @click="handleDelete(props.sample.id!)">
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>

        <div
          v-if="
            props.sample.sample_count &&
            props.sample.sample_count > 0 &&
            !canEdit
          "
          class="mt-auto"
        >
          <span
            class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10"
          >
            {{ $t('sample_count') }}: {{ props.sample.sample_count }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <Modal
    :title="$t('delete_confirm_title')"
    :visible="showDeleteConfirm"
    @cancel="showDeleteConfirm = false"
  >
    <template #footer>
      <Button @click="showDeleteConfirm = false">{{ $t('cancel') }}</Button>
      <Button
        :loading="sampleStore.sampleUpdateLoading"
        danger
        type="primary"
        @click="confirmDelete"
      >
        {{ $t('confirm') }}
      </Button>
    </template>
    <p>{{ $t('delete_confirm_content') }}</p>
  </Modal>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

.card-container {
  border-bottom: 1px solid #f0f0f0;
}

.card-container:last-child {
  border-bottom: none;
}
</style>
