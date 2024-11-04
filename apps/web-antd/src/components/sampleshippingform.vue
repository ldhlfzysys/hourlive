<script setup>
import { defineProps, ref } from 'vue';

import { Col, DatePicker, Form, Input, List, Modal, Row } from 'ant-design-vue';
import dayjs from 'dayjs';

defineOptions({
  name: 'SampleShippingForm',
});

const props = defineProps({
  receiverAddress: {
    required: true,
    type: String,
  },
  sampleList: {
    required: true,
    type: Array,
  },
  visible: {
    required: true,
    type: Boolean,
  },
});

const emit = defineEmits(['update:visible']);

const formRef = ref();

const formState = ref({
  logisticsCompany: '',
  logisticsDate: dayjs(),
  receiverAddress: props.receiverAddress,
  sendDate: dayjs(),
  sender: '',
  trackingNumber: '',
});

const rules = {
  logisticsCompany: [{ message: '请输入物流公司', required: true }],
  sender: [{ message: '请输入寄件人', required: true }],
  trackingNumber: [{ message: '请输入物流单号', required: true }],
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    // 处理表单提交逻辑
    emit('update:visible', false);
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};

const getTotalSamples = () => {
  return props.sampleList.reduce((total, item) => total + item.sample_count, 0);
};

// 计算 Modal 宽度
const modalWidth = `${Math.min(90, Math.max(800, window.innerWidth * 0.75))}px`;
</script>

<template>
  <Modal
    :open="props.visible"
    :style="{ top: '20px' }"
    title="创建包裹"
    width="90%"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <Form ref="formRef" :model="formState" :rules="rules">
      <Row :gutter="16">
        <Col :span="12">
          <Form.Item label="物流时间" name="logisticsDate">
            <DatePicker
              v-model:value="formState.logisticsDate"
              :default-value="dayjs()"
              style="width: 100%"
            />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item label="物流公司" name="logisticsCompany">
            <Input v-model:value="formState.logisticsCompany" />
          </Form.Item>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <Form.Item label="物流单号" name="trackingNumber">
            <Input v-model:value="formState.trackingNumber" />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item label="寄件人" name="sender">
            <Input v-model:value="formState.sender" />
          </Form.Item>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <Form.Item label="寄件时间" name="sendDate">
            <DatePicker
              v-model:value="formState.sendDate"
              :default-value="dayjs()"
              style="width: 100%"
            />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item label="收货地址" name="receiverAddress">
            <Input v-model:value="formState.receiverAddress" :disabled="true" />
          </Form.Item>
        </Col>
      </Row>

      <div class="sample-list">
        <h3>
          寄送样品列表
          <span class="sample-summary">
            ({{ sampleList.length }}种样品，共{{ getTotalSamples() }}件)
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
  height: 50vh; /* 使用视窗高度的50% */
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
</style>
