<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Col,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useAgencyStore, useSampleShippingStore } from '#/store';

defineOptions({
  name: 'SampleShippingForm',
});

const emit = defineEmits(['update:visible']);

const sender_time = ref(dayjs());
const sampleShippingStore = useSampleShippingStore();
// 添加 watch 监听器来同步更新 currentSampleShipping
watch(
  sender_time,
  (newValue) => {
    sampleShippingStore.currentSampleShipping.sender_time = newValue.format(
      'YYYY-MM-DD HH:mm:ss',
    );
  },
  { immediate: true },
);

const agencyStore = useAgencyStore();

const selectedAgency = computed(() => {
  console.log('update selected agency');

  return agencyStore.agencyById(
    sampleShippingStore.currentSampleShipping.agency_id!,
  );
});

const shippingAddress = computed(() => {
  if (selectedAgency.value) {
    return selectedAgency.value.shippingaddress;
  }
  return [];
});

const formRef = ref();

const rules = {
  agency_id: [{ message: $t('selectagency'), required: true }],
  express_company: [{ message: $t('selectexpress'), required: true }],
  receiver_address: [
    { message: $t('select_shipping_address'), required: true },
  ],
  sender_name: [{ message: $t('inputsendername'), required: true }],
  tracking_number: [{ message: $t('inputtracking'), required: true }],
};

const handleOk = async () => {
  try {
    if (sampleShippingStore.currentSampleShipping.id) {
      sampleShippingStore.customerUpdate();
    } else {
      await formRef.value.validate();
      sampleShippingStore.createSampleShipping();
    }
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

const handleCancel = () => {
  sampleShippingStore.showSampleShippingForm = false;
};

const getTotalSamples = () => {
  return sampleShippingStore.currentSampleShipping.samples.reduce(
    // eslint-disable-next-line no-constant-binary-expression
    (total, item) => total + (Number(item.sample_count) ?? 0),
    0,
  );
};

// 计算 Modal 宽度
const modalWidth = `${Math.min(90, Math.max(800, window.innerWidth * 0.75))}px`;

const handleAgencyChange = (value) => {
  // 清空收货地址
  sampleShippingStore.currentSampleShipping.receiver_address = '';
};
</script>

<template>
  <Modal
    :confirm-loading="
      sampleShippingStore.sampleShippingCreateLoading ||
      sampleShippingStore.sampleShippingUpdateLoading
    "
    :open="sampleShippingStore.showSampleShippingForm"
    :style="{ top: '20px' }"
    :title="
      sampleShippingStore.currentSampleShipping.id
        ? $t('updateshipping')
        : $t('createshipping')
    "
    width="90%"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <Form
      ref="formRef"
      :model="sampleShippingStore.currentSampleShipping"
      :rules="rules"
    >
      <Row :gutter="16">
        <Col :span="12">
          <Form.Item :label="$t('selectagency')" name="agency_id" required>
            <Select
              v-model:value="
                sampleShippingStore.currentSampleShipping.agency_id
              "
              :filter-option="
                (input, option) => {
                  return (
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  );
                }
              "
              show-search
              @change="handleAgencyChange"
            >
              <Select.Option
                v-for="agency in agencyStore.allAgency"
                :key="agency.id"
                :label="agency.name"
                :value="agency.id"
              >
                {{ agency.name }}
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item
            :label="$t('shipping_address')"
            name="receiver_address"
            required
          >
            <Select
              v-model:value="
                sampleShippingStore.currentSampleShipping.receiver_address
              "
              :custom-height="true"
              :dropdown-match-select-width="false"
              :style="{ width: '100%' }"
            >
              <Select.Option
                v-for="address in shippingAddress ?? []"
                :key="address.id"
                :label="address.address"
                :value="address.address"
              >
                <div class="address-option">{{ address.address }}</div>
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <Form.Item
            :label="$t('express_company')"
            name="express_company"
            required
          >
            <Input
              v-model:value="
                sampleShippingStore.currentSampleShipping.express_company
              "
            />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item
            :label="$t('tracking_number')"
            name="tracking_number"
            required
          >
            <Input
              v-model:value="
                sampleShippingStore.currentSampleShipping.tracking_number
              "
            />
          </Form.Item>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <Form.Item :label="$t('sender_name')" name="sender_name" required>
            <Input
              v-model:value="
                sampleShippingStore.currentSampleShipping.sender_name
              "
            />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item :label="$t('sender_time')" name="sendDate">
            <DatePicker
              v-model:value="sender_time"
              :default-value="dayjs()"
              :show-time="true"
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </Form.Item>
        </Col>
      </Row>

      <div class="sample-list">
        <h3>
          {{ $t('sampleinshipping') }}
          <span class="sample-summary">
            ({{ sampleShippingStore.currentSampleShipping.samples.length
            }}{{ $t('sample') }}，{{ $t('total') }}{{ getTotalSamples()
            }}{{ $t('piece') }})
          </span>
        </h3>
        <div class="sample-scroll">
          <List
            :data-source="sampleShippingStore.currentSampleShipping.samples"
          >
            <template #renderItem="{ item }">
              <List.Item>
                <div class="sample-item">
                  <img :src="item.product_image" class="sample-image" />
                  <div class="sample-info">
                    <div class="sample-name">{{ item.product_name }}</div>
                    <div class="sample-mark">
                      备注:
                      <Input
                        v-model:value="item.sample_mark"
                        :style="{ width: '200px' }"
                        placeholder="请输入备注"
                      />
                    </div>
                    <div class="sample-quantity">
                      数量:
                      <Input
                        v-model:value="item.sample_count"
                        :style="{ width: '100px' }"
                        placeholder="请输入数量"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              </List.Item>
            </template>
          </List>
        </div>
      </div>
    </Form>
  </Modal>
</template>

<style scoped>
.sample-list {
  margin-top: 20px;
}

.sample-scroll {
  height: 50vh; /* 使用视高度的50% */
  padding: 10px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
}

.sample-item {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.sample-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.sample-info {
  flex: 1;
}

.sample-name {
  margin-bottom: 4px;
  font-weight: 500;
}

.sample-mark,
.sample-quantity {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.sample-summary {
  margin-left: 8px;
  font-size: 14px;
  font-weight: normal;
  color: #666;
}

:deep(.ant-modal-content) {
  max-height: 85vh; /* Modal 内容区域最大高度为视窗高度的85% */
  overflow-y: auto;
}

:deep(.ant-modal) {
  top: 5vh; /* Modal 距离顶部为屏幕高度的5% */
  padding-bottom: 0;
}

.address-option {
  max-width: 500px;
  padding: 4px 0;
  word-wrap: break-word;
  white-space: normal;
}

:deep(.ant-select-selector) {
  height: auto !important;
  padding: 2px 4px !important;
}

:deep(.ant-select-selection-search) {
  height: auto !important;
  line-height: 1.5 !important;
}

:deep(.ant-select-selection-item) {
  height: auto !important;
  min-height: 24px !important;
  padding: 2px 4px !important;
  line-height: 1.4 !important;
  white-space: normal !important;
}

:deep(.ant-form-item-control-input) {
  min-height: auto;
}

:deep(.ant-select-single .ant-select-selector) {
  height: auto !important;
}
</style>
