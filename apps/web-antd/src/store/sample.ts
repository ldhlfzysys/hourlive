// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type { Sample, SampleCreate, SampleQuery, StanderResult } from '#/types';

function getAllSamples(params?: SampleQuery) {
  return requestClient.post<StanderResult<Sample[]>>('', params);
}

function newSamples(params: SampleCreate) {
  return requestClient.post<StanderResult<Sample>>('', params);
}

// store
export const useSampleStore = defineStore('sample-store', () => {
  // loading

  const sampleLoading = ref(false);
  const sampleCreateLoading = ref(false);
  // samples
  const samples = ref<Map<number, Sample>>(new Map());

  const sampleList = computed(() => {
    return [...samples.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, sample]) => sample); // 转换为Sample的list
  });

  // query
  const sampleQuery = ref<SampleQuery>({
    is_main: '-1',
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });
  const minSampleId = ref<number>(-1);

  function $reset() {
    sampleLoading.value = false;
    sampleCreateLoading.value = false;
    minSampleId.value = -1;

    sampleQuery.value = {
      is_main: '-1',
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
    samples.value = new Map();
  }

  // methods
  async function querySample() {
    try {
      sampleLoading.value = true;
      const res = await getAllSamples(sampleQuery.value);
      if (res.success) {
        if (res.data.length > 0) {
          const lastSample = res.data[-1];
          if (lastSample) {
            minSampleId.value = lastSample.id;
          }
        }
        res.data.forEach((sample) => {
          samples.value.set(sample.id, sample);
        });
      }
    } finally {
      sampleLoading.value = false;
    }
  }

  async function createSample(params: SampleCreate) {
    try {
      sampleCreateLoading.value = true;
      const res = await newSamples(params);
      if (res.success) {
        samples.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      sampleCreateLoading.value = false;
    }
  }

  return {
    $reset,
    createSample,
    querySample,
    sampleList,
    sampleLoading,
    sampleQuery,
    samples,
  };
});
