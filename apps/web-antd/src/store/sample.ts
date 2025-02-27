// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  BaseQuery,
  SampleRead,
  SampleUpdate,
  StandardResponse,
} from '#/types';

// API
function _getAllSamples(params?: SampleRead) {
  return requestClient.post<StandardResponse>('sample/query', params);
}

function _newSamples(params: SampleUpdate) {
  return requestClient.post<StandardResponse>('sample/create', params);
}

function _updateSample(params: SampleUpdate) {
  return requestClient.post<StandardResponse>('sample/update', params);
}

function _querySampleFromIds(params: BaseQuery) {
  return requestClient.post<StandardResponse>('sample/query/ids', params);
}

function _fetchSampleInfo(url: BaseQuery) {
  return requestClient.post<StandardResponse>('sample/getProductInfo', url);
}

function _deleteSample(params: BaseQuery) {
  return requestClient.post<StandardResponse>('sample/deletesample', params);
}
// store
export const useSampleStore = defineStore('sample-store', () => {
  // loading
  const sampleQueryLoading = ref(false); // 查询loading
  const sampleFetchLoading = ref(false); // 获取详情loading
  const sampleUpdateLoading = ref(false); // 创建loading

  const showModal = ref(false); // 控制创建或更新模态框显示

  const showKSPModal = ref(false);

  const showSampleList = ref(false); // 控制样品列表显示

  // sample store
  const samples = ref<Map<number, SampleRead>>(new Map());

  const sampleList = computed(() => {
    const list = [...samples.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, sample]) => sample); // 转换为Sample的list

    // 如果有搜索关键词，进行过滤
    if (searchProductId.value) {
      return list.filter((sample) =>
        sample.product_id?.toString().includes(searchProductId.value),
      );
    }
    return list;
  });

  const sampleUpdate = ref<SampleUpdate>({});

  // query
  const sampleQuery = ref<BaseQuery>({
    is_main: -1,
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  // 添加搜索相关状态
  const searchProductId = ref('');

  function clearSamples() {
    samples.value = new Map();
    searchProductId.value = '';
    sampleQuery.value = {
      is_main: -1,
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
  }

  function $reset() {
    sampleQueryLoading.value = false;
    sampleUpdateLoading.value = false;
    showKSPModal.value = false;
    showModal.value = false;
    sampleQuery.value.q_id = -1;

    sampleQuery.value = {
      is_main: -1,
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
    samples.value = new Map();
  }

  function makeCreate() {
    showModal.value = true;
    sampleUpdate.value = {
      is_main: 3,
    };
  }
  function makeUpdate(id: number) {
    showModal.value = true;
    const sample = samples.value.get(id);
    if (sample) {
      sampleUpdate.value = {
        ...sample,
        is_main: sample.is_main || 0, // 确保 is_main 有默认值
      };
    }
  }
  function makeKSPUpdate(id: number) {
    showKSPModal.value = true;
    const sample = samples.value.get(id);
    if (sample) {
      sampleUpdate.value = {
        ...sample,
        is_main: sample.is_main || 0, // 确保 is_main 有默认值
      };
    }
  }
  // methods
  async function querySample() {
    try {
      sampleQueryLoading.value = true;
      const res = await _getAllSamples(sampleQuery.value);
      if (res && res.success) {
        if (res.data.length > 0) {
          const lastSample = res.data.at(-1);
          if (lastSample && lastSample.id) {
            sampleQuery.value.q_id = lastSample.id;
          }
        }
        res.data.forEach((sample: SampleRead) => {
          if (sample.id) {
            samples.value.set(sample.id, sample);
          }
        });
      }
    } finally {
      sampleQueryLoading.value = false;
    }
  }

  async function querySampleFromIds() {
    try {
      sampleQueryLoading.value = true;
      const res = await _querySampleFromIds(sampleQuery.value);
      if (res && res.success) {
        res.data?.forEach((sample: SampleRead) => {
          if (sample.id) {
            samples.value.set(sample.id, sample);
          }
        });
      }
    } finally {
      sampleQueryLoading.value = false;
    }
  }

  async function createSample() {
    try {
      sampleUpdateLoading.value = true;
      const res = await _newSamples(sampleUpdate.value);
      if (res && res.success && res.data.id) {
        samples.value.set(res.data.id, res.data);
        showModal.value = false;
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      sampleUpdateLoading.value = false;
    }
  }

  async function deleteSample(id: number) {
    try {
      sampleUpdateLoading.value = true;
      const res = await _deleteSample({ id });
      if (res && res.success) {
        samples.value.delete(id);
      }
    } finally {
      sampleUpdateLoading.value = false;
    }
  }

  async function updateSample() {
    try {
      sampleUpdateLoading.value = true;
      const res = await _updateSample(sampleUpdate.value);
      if (res && res.success && res.data.id) {
        samples.value.set(res.data.id, res.data);
        showModal.value = false;
        showKSPModal.value = false;
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

  async function fetechProductInfo() {
    sampleFetchLoading.value = true;
    try {
      const tempLink = sampleUpdate.value.product_link;
      if (!sampleUpdate.value.product_link) {
        sampleFetchLoading.value = false;
        return;
      }
      const res = await _fetchSampleInfo({
        url: sampleUpdate.value.product_link,
      });
      sampleFetchLoading.value = false;
      if (res && res.success) {
        Object.assign(sampleUpdate.value, res.data);
        sampleUpdate.value.product_link = tempLink;
      }
    } catch {
      sampleFetchLoading.value = false;
    } finally {
      sampleFetchLoading.value = false;
    }
  }

  return {
    $reset,
    clearSamples,
    createSample,
    deleteSample,
    fetechProductInfo,
    makeCreate,
    makeKSPUpdate,
    makeUpdate,
    querySample,
    querySampleFromIds,
    sampleFetchLoading,
    sampleList,
    sampleQuery,
    sampleQueryLoading,
    samples,
    sampleUpdate,
    sampleUpdateLoading,
    searchProductId,
    showKSPModal,
    showModal,
    showSampleList,
    updateSample,
  };
});
