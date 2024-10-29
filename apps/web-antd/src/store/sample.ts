// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  Sample,
  SampleCreate,
  SampleQuery,
  StanderResult,
  Url,
} from '#/types';

// API
function _getAllSamples(params?: SampleQuery) {
  return requestClient.post<StanderResult<Sample[]>>('sample/query', params);
}

function _newSamples(params: SampleCreate) {
  return requestClient.post<StanderResult<Sample>>('sample/create', params);
}

function _updateSample(params: Sample) {
  return requestClient.post<StanderResult<Sample>>('sample/update', params);
}

function _fetchSampleInfo(url: Url) {
  return requestClient.post<StanderResult<Sample>>(
    'sample/getProductInfo',
    url,
  );
}
// store
export const useSampleStore = defineStore('sample-store', () => {
  // loading
  const sampleQueryLoading = ref(false); // 查询loading
  const sampleFetchLoading = ref(false); // 获取详情loading
  const sampleCreateLoading = ref(false); // 创建loading
  const sampleUpdateLoading = ref(false); // 创建loading

  const showModal = ref(false); // 控制创建或更新模态框显示

  // sample store
  const samples = ref<Map<number, Sample>>(new Map());

  const sampleList = computed(() => {
    return [...samples.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, sample]) => sample); // 转换为Sample的list
  });

  // others
  const sampleCreate = ref<SampleCreate>({
    is_main: '0',
  });

  const sampleUpdate = ref<SampleCreate>({
    is_main: '0',
  });

  // query
  const sampleQuery = ref<SampleQuery>({
    is_main: '-1',
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  function $reset() {
    sampleQueryLoading.value = false;
    sampleCreateLoading.value = false;
    sampleQuery.value.q_id = -1;

    sampleQuery.value = {
      is_main: '-1',
      q_id: -1,
      q_order: 'desc',
      q_size: 5,
    };
    samples.value = new Map();
  }

  // methods
  async function querySample() {
    try {
      sampleQueryLoading.value = true;
      const res = await _getAllSamples(sampleQuery.value);
      if (res.success) {
        if (res.data.length > 0) {
          const lastSample = res.data.at(-1);
          if (lastSample) {
            sampleQuery.value.q_id = lastSample.id;
          }
        }
        res.data.forEach((sample) => {
          samples.value.set(sample.id, sample);
        });
      }
    } finally {
      sampleQueryLoading.value = false;
    }
  }

  async function createSample() {
    try {
      sampleCreateLoading.value = true;
      const res = await _newSamples(sampleCreate.value);
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

  async function updateSample(params: Sample) {
    try {
      sampleUpdateLoading.value = true;
      const res = await _updateSample(params);
      if (res.success) {
        samples.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      sampleUpdateLoading.value = false;
    }
  }

  /*
  商品脚本相关
  */

  async function fetechProductInfo(product_url: string) {
    sampleFetchLoading.value = true;
    const res = await _fetchSampleInfo({ url: product_url });
    sampleFetchLoading.value = false;
    if (res.success) {
      sampleCreate.value = res.data;
    }
  }

  return {
    $reset,
    createSample,
    fetechProductInfo,
    querySample,
    sampleCreate,
    sampleCreateLoading,
    sampleFetchLoading,
    sampleList,
    sampleQuery,
    sampleQueryLoading,
    samples,
    sampleUpdate,
    sampleUpdateLoading,
    showModal,
    updateSample,
  };
});
