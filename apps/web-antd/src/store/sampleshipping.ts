// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
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
    // 查询物流单
    const sampleShippingQueryLoading = ref(false);
    // 创建物流单
    const sampleShippingCreateLoading = ref(false);
    // 更新物流单
    const sampleShippingUpdateLoading = ref(false);

    // 显示物流单详情
    const showShippingDetails = ref(false);
    const showShippingSample = ref(false);

    // 当前选中的物流单
    const currentSampleShipping = ref<SampleShipping>({
      samples: [],
    });

    // 存储所有
    const sampleShippings = ref<Map<number, SampleShipping>>(new Map());

    // 获取列表
    const sampleShippingList = computed(() => {
      return [...sampleShippings.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
        .map(([_, sampleShipping]) => sampleShipping); // 转换为SampleShipping的list
    });

    // 机构确认收货弹窗
    const showModal = ref(false);

    // 新建和客户编辑物流单弹窗
    const showSampleShippingForm = ref(false);

    // 创建物流单
    function makeCreate() {
      showSampleShippingForm.value = true;
      currentSampleShipping.value.tracking_number = '';
    }

    // 机构确认收货
    function agencyMakeUpdate(id: number) {
      showModal.value = true;
      const sample = sampleShippings.value.get(id);
      if (sample) {
        currentSampleShipping.value = sample;
      }
    }

    // 客户编辑物流单
    function customerMakeUpdate(id: number) {
      showSampleShippingForm.value = true;
      const sample = sampleShippings.value.get(id);
      if (sample) {
        currentSampleShipping.value = sample;
      }
    }

    async function agencyUpdate() {
      try {
        sampleShippingUpdateLoading.value = true;
        // 只传递需要的字段
        const updateData = {
          id: currentSampleShipping.value.id,
          receiver_name: currentSampleShipping.value.receiver_name,
          receiver_time: currentSampleShipping.value.receiver_time,
          samples: [],
        };
        const res = await _agencyUpdate(updateData);
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
          showModal.value = false;
          sampleShippingUpdateLoading.value = false;
        }
      } finally {
        sampleShippingUpdateLoading.value = false;
      }
    }

    async function customerUpdate() {
      try {
        sampleShippingUpdateLoading.value = true;
        const updateData = {
          agency_id: currentSampleShipping.value.agency_id,
          express_company: currentSampleShipping.value.express_company,
          id: currentSampleShipping.value.id,
          receiver_address: currentSampleShipping.value.receiver_address,
          samples: [],
          sender_name: currentSampleShipping.value.sender_name,
          sender_time: currentSampleShipping.value.sender_time,
          tracking_number: currentSampleShipping.value.tracking_number,
        };
        const res = await _customerUpdate(updateData);
        if (res && res.success && res.data.id) {
          const existingShipping = sampleShippings.value.get(res.data.id);
          if (existingShipping) {
            Object.assign(existingShipping, {
              express_company: res.data.express_company,
              sender_name: res.data.sender_name,
              sender_time: res.data.sender_time,
              tracking_number: res.data.tracking_number,
            });
          }
          showSampleShippingForm.value = false;
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
      q_size: 9999,
    });

    function $reset() {
      sampleShippingQueryLoading.value = false;
      sampleShippingCreateLoading.value = false;
      sampleShippingQuery.value.q_id = -1;

      sampleShippingQuery.value = {
        q_id: -1,
        q_order: 'desc',
        q_size: 9999,
      };
      sampleShippings.value = new Map();
    }

    function sampleShippingById(id: number) {
      return sampleShippings.value.get(id);
    }

    // methods
    async function querySampleShipping() {
      try {
        sampleShippingQueryLoading.value = true;
        const res = await _getAllSampleShipping(sampleShippingQuery.value);
        if (res && res.success) {
          if (res.data.length > 0) {
            // const lastSampleShipping = res.data.at(-1);
            // if (lastSampleShipping && lastSampleShipping.id) {
            //   sampleShippingQuery.value.q_id = lastSampleShipping.id;
            // }
          }
          res.data.forEach((sampleShipping) => {
            if (sampleShipping.id) {
              sampleShippings.value.set(sampleShipping.id, sampleShipping);
            }
          });
        }
      } finally {
        sampleShippingQueryLoading.value = false;
      }
    }

    async function createSampleShipping() {
      try {
        sampleShippingCreateLoading.value = true;
        // 只保留需要的字段
        const simplifiedSamples = currentSampleShipping.value.samples.map(
          (sample) => ({
            id: sample.id,
            sample_count: sample.sample_count,
          }),
        );

        const res = await _newSampleShipping({
          ...currentSampleShipping.value,
          samples: simplifiedSamples,
        });

        if (res && res.success && res.data.id) {
          showSampleShippingForm.value = false;
          sampleShippings.value.set(res.data.id, res.data);
          notification.success({
            description: res.message,
            message: $t('createshippingsuccess'),
          });
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
      agencyMakeUpdate,

      agencyUpdate,
      createSampleShipping,
      currentSampleShipping,
      customerMakeUpdate,
      customerUpdate,
      makeCreate,
      querySampleShipping,
      sampleShippingById,
      sampleShippingCreateLoading,
      sampleShippingList,
      sampleShippingQuery,
      sampleShippingQueryLoading,
      sampleShippings,
      sampleShippingUpdateLoading,
      showModal,
      showSampleShippingForm,
      showShippingDetails,
      showShippingSample,
    };
  },
);
