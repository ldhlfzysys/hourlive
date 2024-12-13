<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, InputNumber, Modal, Select } from 'ant-design-vue';

import { useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'SubsidyForm',
});

const timeslotOrderStore = useTimeslotOrderStore();

function handleOk() {
  timeslotOrderStore.subsidyTimeslotOrder();
}

function handleCancel() {
  timeslotOrderStore.showSubsidyModal = false;
  timeslotOrderStore.timeslotOrderSubsidyForm = {
    timeslotorder_id: -1,
  };
}

const subsidyTypeOptions = [
  { label: '广告补贴', value: 1 },
  { label: '达人补贴', value: 2 },
];
</script>

<template>
  <Modal
    v-model:open="timeslotOrderStore.showSubsidyModal"
    :confirm-loading="timeslotOrderStore.timeslotOrderSubsidyLoading"
    :title="$t('补贴设置')"
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="modal-content">
      <div class="input-container">
        <Select
          v-model:value="
            timeslotOrderStore.timeslotOrderSubsidyForm.subsidy_type
          "
          :options="subsidyTypeOptions"
          :placeholder="$t('请选择补贴类型')"
          class="subsidy-input"
        />

        <InputNumber
          v-model:value="
            timeslotOrderStore.timeslotOrderSubsidyForm.ads_subsidy
          "
          :placeholder="$t('广告补贴金额')"
          class="subsidy-input"
        />

        <Input
          v-model:value="
            timeslotOrderStore.timeslotOrderSubsidyForm.ads_subsidy_remark
          "
          :placeholder="$t('广告补贴备注')"
          class="subsidy-input"
        />

        <InputNumber
          v-model:value="
            timeslotOrderStore.timeslotOrderSubsidyForm.tts_subsidy
          "
          :placeholder="$t('达人补贴金额')"
          class="subsidy-input"
        />

        <Input
          v-model:value="
            timeslotOrderStore.timeslotOrderSubsidyForm.tts_subsidy_remark
          "
          :placeholder="$t('达人补贴备注')"
          class="subsidy-input"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.modal-content {
  overflow: hidden;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
}

.subsidy-input {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  color: #1f2937;
}
</style>
