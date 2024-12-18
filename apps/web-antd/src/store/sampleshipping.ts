// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  Sample,
  SampleShipping,
  SampleShippingQuery,
  StanderResult,
} from '#/types';

function _getAllSampleShipping(params?: SampleShippingQuery) {
  return requestClient.post<StanderResult<SampleShipping[]>>(
    'shipping/query',
    params,
  );
}

function _newSampleShipping(params: SampleShipping) {
  return requestClient.post<StanderResult<SampleShipping>>(
    'shipping/create',
    params,
  );
}

function _agencyUpdate(params: SampleShipping) {
  return requestClient.post<StanderResult<SampleShipping>>(
    'shipping/agencyupdate',
    params,
  );
}

function _customerUpdate(params: SampleShipping) {
  return requestClient.post<StanderResult<SampleShipping>>(
    'shipping/customerupdate',
    params,
  );
}
// store
export const useSampleShippingStore = defineStore(
  'sampleshipping-store',
  () => {
    // loading

    const sampleShippingLoading = ref(false);
    const sampleShippingCreateLoading = ref(false);
    const sampleShippingUpdateLoading = ref(false);
    const sampleShippingCreate = ref<SampleShipping>({});
    // liveaccounts
    const sampleShippings = ref<Map<number, SampleShipping>>(new Map());

    const sampleShippingList = computed(() => {
      return [...sampleShippings.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
        .map(([_, sampleShipping]) => sampleShipping); // 转换为SampleShipping的list
    });

    const showModal = ref(false);
    const showSampleShippingForm = ref(false);

    function makeCreate() {
      showModal.value = true;
      sampleShippingCreate.value = {};
    }

    function makeUpdate(id: number) {
      showModal.value = true;
      const sample = sampleShippings.value.get(id);
      if (sample) {
        sampleShippingCreate.value = sample;
      }
    }

    function contentById(id: number) {
      return sampleShippings.value.get(id);
    }

    async function agencyUpdate(sampleShipping: SampleShipping) {
      try {
        sampleShippingUpdateLoading.value = true;
        const res = await _agencyUpdate(sampleShipping);
        if (res && res.success && res.data.id) {
          const existingShipping = sampleShippings.value.get(res.data.id);
          if (existingShipping) {
            Object.assign(existingShipping, {
              delivery_approval: res.data.delivery_approval,
              receiver_name: res.data.receiver_name,
              receiver_time: res.data.receiver_time,
              status: res.data.status,
            });
          }
          sampleShippingUpdateLoading.value = false;
        }
      } finally {
        sampleShippingUpdateLoading.value = false;
      }
    }

    async function customerUpdate(sampleShipping: SampleShipping) {
      try {
        sampleShippingUpdateLoading.value = true;
        const res = await _customerUpdate(sampleShipping);
        if (res && res.success && res.data.id) {
          sampleShippings.value.set(res.data.id, res.data);
          sampleShippingUpdateLoading.value = false;
        }
      } finally {
        sampleShippingUpdateLoading.value = false;
      }
    }

    // query
    const sampleShippingQuery = ref<SampleShippingQuery>({
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    });

    function $reset() {
      sampleShippingLoading.value = false;
      sampleShippingCreateLoading.value = false;
      sampleShippingQuery.value.q_id = -1;

      sampleShippingQuery.value = {
        q_id: -1,
        q_order: 'desc',
        q_size: 5,
      };
      sampleShippings.value = new Map();
    }

    function sampleShippingById(id: number) {
      return sampleShippings.value.get(id);
    }

    // methods
    async function querySampleShipping() {
      try {
        sampleShippingLoading.value = true;
        const res = await _getAllSampleShipping(sampleShippingQuery.value);
        if (res && res.success) {
          if (res.data.length > 0) {
            const lastSampleShipping = res.data.at(-1);
            if (lastSampleShipping && lastSampleShipping.id) {
              sampleShippingQuery.value.q_id = lastSampleShipping.id;
            }
          }
          res.data.forEach((sampleShipping) => {
            if (sampleShipping.id) {
              sampleShippings.value.set(sampleShipping.id, sampleShipping);
            }
          });
        }
      } finally {
        sampleShippingLoading.value = false;
      }
    }

    async function createSampleShipping(samples: Sample[]) {
      try {
        sampleShippingCreateLoading.value = true;
        // 只保留需要的字段
        const simplifiedSamples = samples.map((sample) => ({
          id: sample.id,
          sample_count: sample.sample_count,
        }));

        const res = await _newSampleShipping({
          ...sampleShippingCreate.value,
          samples: simplifiedSamples,
        });

        if (res && res.success && res.data.id) {
          showSampleShippingForm.value = false;
          sampleShippings.value.set(res.data.id, res.data);
        } else {
          notification.error({
            description: res.message,
            message: $t('addfail'),
          });
        }
      } finally {
        sampleShippingCreateLoading.value = false;
      }
    }

    return {
      $reset,
      agencyUpdate,
      contentById,
      createSampleShipping,
      customerUpdate,
      makeCreate,
      makeUpdate,
      querySampleShipping,
      sampleShippingById,
      sampleShippingCreate,
      sampleShippingCreateLoading,
      sampleShippingList,
      sampleShippingLoading,
      sampleShippingQuery,
      sampleShippings,
      sampleShippingUpdateLoading,
      showModal,
      showSampleShippingForm,
    };
  },
);
