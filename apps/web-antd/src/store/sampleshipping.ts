// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  BaseQuery,
  SampleShippingRead,
  SampleShippingUpdate,
  StandardResponse,
} from '#/types';

function _getAllSampleShipping(params?: BaseQuery) {
  return requestClient.post<StandardResponse>('shipping/query', params);
}

function _newSampleShipping(params: SampleShippingUpdate) {
  return requestClient.post<StandardResponse>('shipping/create', params);
}

function _agencyUpdate(params: SampleShippingUpdate) {
  return requestClient.post<StandardResponse>('shipping/agencyupdate', params);
}

function _customerUpdate(params: SampleShippingUpdate) {
  return requestClient.post<StandardResponse>(
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
    const currentSampleShipping = ref<SampleShippingUpdate>({
      samples: [],
    });

    // 存储所有
    const sampleShippings = ref<Map<number, SampleShippingRead>>(new Map());

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
      currentSampleShipping.value.id = undefined;
      currentSampleShipping.value.tracking_number = '';
    }

    // 机构确认收货
    function agencyMakeUpdate(id: number) {
      showModal.value = true;
      const sample = sampleShippings.value.get(id);
      if (sample) {
        currentSampleShipping.value.id = sample.id;
        // currentSampleShipping.value.agency_id = sample.agency_id;
        // currentSampleShipping.value.status = sample.status;
        currentSampleShipping.value.shipping_time = sample.shipping_time;
        currentSampleShipping.value.express_company = sample.express_company;
        currentSampleShipping.value.tracking_number = sample.tracking_number;
        currentSampleShipping.value.sender_name = sample.sender_name;
        currentSampleShipping.value.sender_time = sample.sender_time;
        currentSampleShipping.value.receiver_name = sample.receiver_name;
        currentSampleShipping.value.receiver_time = sample.receiver_time;
        // currentSampleShipping.value.receiver_address = sample.receiver_address;
        // currentSampleShipping.value.samples = sample.samples;
      }
    }

    // 客户编辑物流单
    function customerMakeUpdate(id: number) {
      showSampleShippingForm.value = true;
      const sample = sampleShippings.value.get(id);
      if (sample) {
        currentSampleShipping.value.id = sample.id;
        // currentSampleShipping.value.agency_id = sample.agency_id;
        // currentSampleShipping.value.status = sample.status;
        currentSampleShipping.value.shipping_time = sample.shipping_time;
        currentSampleShipping.value.express_company = sample.express_company;
        currentSampleShipping.value.tracking_number = sample.tracking_number;
        currentSampleShipping.value.sender_name = sample.sender_name;
        currentSampleShipping.value.sender_time = sample.sender_time;
        currentSampleShipping.value.receiver_name = sample.receiver_name;
        currentSampleShipping.value.receiver_time = sample.receiver_time;
        // currentSampleShipping.value.receiver_address = sample.receiver_address;
        // currentSampleShipping.value.samples = sample.samples;
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
        // 简化 samples 数据
        const simplifiedSamples = currentSampleShipping.value.samples.map(
          (sample) => ({
            id: sample.id,
            sample_count: sample.sample_count,
            sample_mark: sample.sample_mark ?? '',
          }),
        );

        const updateData = {
          agency_id: currentSampleShipping.value.agency_id,
          express_company: currentSampleShipping.value.express_company,
          id: currentSampleShipping.value.id,
          receiver_address: currentSampleShipping.value.receiver_address,
          samples: simplifiedSamples,
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
    const sampleShippingQuery = ref<BaseQuery>({
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
          // if (res.data.length > 0) {
          //   // const lastSampleShipping = res.data.at(-1);
          //   // if (lastSampleShipping && lastSampleShipping.id) {
          //   //   sampleShippingQuery.value.q_id = lastSampleShipping.id;
          //   // }
          // }
          res.data.forEach((sampleShipping: SampleShippingRead) => {
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
            sample_mark: sample.sample_mark,
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

    function setSampleShippings(ss: SampleShippingRead[]) {
      ss.forEach((s) => {
        if (s.id) {
          sampleShippings.value.set(s.id, s);
        }
      });
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
      setSampleShippings,
      showModal,
      showSampleShippingForm,
      showShippingDetails,
      showShippingSample,
    };
  },
);
