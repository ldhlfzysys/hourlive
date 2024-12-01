<script setup>
import { computed, defineProps, ref } from 'vue';

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

const props = defineProps({
  sampleList: {
    required: true,
    type: Array,
  },
});

const emit = defineEmits(['update:visible']);

const agencyStore = useAgencyStore();
const sampleShippingStore = useSampleShippingStore();

const selectedAgency = computed(() => {
  console.log('update selected agency');

  return agencyStore.agencyById(
    sampleShippingStore.sampleShippingCreate.agency_id,
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
    await formRef.value.validate();
    sampleShippingStore.createSampleShipping(props.sampleList);
    // 处理表单提交逻辑
    // emit('update:visible', false);
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

const handleCancel = () => {
  sampleShippingStore.showSampleShippingForm = false;
};

const getTotalSamples = () => {
  return props.sampleList.reduce((total, item) => total + item.sample_count, 0);
};

// 计算 Modal 宽度
const modalWidth = `${Math.min(90, Math.max(800, window.innerWidth * 0.75))}px`;

const handleAgencyChange = (value) => {
  // 清空收货地址
  sampleShippingStore.sampleShippingCreate.receiver_address = '';
};
</script>

<template>
  <Modal
    :confirm-loading="sampleShippingStore.sampleShippingCreateLoading"
    :open="sampleShippingStore.showSampleShippingForm"
    :style="{ top: '20px' }"
    :title="$t('createshipping')"
    width="90%"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <Form
      ref="formRef"
      :model="sampleShippingStore.sampleShippingCreate"
      :rules="rules"
    >
      <Row :gutter="16">
        <Col :span="12">
          <Form.Item :label="$t('selectagency')" name="agency_id" required>
            <Select
              v-model:value="sampleShippingStore.sampleShippingCreate.agency_id"
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
                sampleShippingStore.sampleShippingCreate.receiver_address
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
                sampleShippingStore.sampleShippingCreate.express_company
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
                sampleShippingStore.sampleShippingCreate.tracking_number
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
                sampleShippingStore.sampleShippingCreate.sender_name
              "
            />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item :label="$t('sender_time')" name="sendDate">
            <DatePicker
              v-model:value="
                sampleShippingStore.sampleShippingCreate.shipping_time
              "
              :default-value="dayjs()"
              style="width: 100%"
            />
          </Form.Item>
        </Col>
      </Row>

      <div class="sample-list">
        <h3>
          {{ $t('sampleinshipping') }}
          <span class="sample-summary">
            ({{ sampleList.length }}{{ $t('sample') }}，{{ $t('total')
            }}{{ getTotalSamples() }}{{ $t('piece') }})
          </span>
        </h3>
        <div class="sample-scroll">
          <List :data-source="sampleList">
            <template #renderItem="{ item }">
              <List.Item>
                <div class="sample-item">
                  <img :src="item.product_image" class="sample-image" />
                  <div class="sample-info">
                    <div class="sample-name">{{ item.product_name }}</div>
                    <div class="sample-quantity">
                      数量: {{ item.sample_count }}
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

.sample-quantity {
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
