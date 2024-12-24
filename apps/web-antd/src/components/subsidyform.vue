<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, InputNumber, Modal } from 'ant-design-vue';

import { useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'SubsidyForm',
});

const { TextArea } = Input;

const timeslotOrderStore = useTimeslotOrderStore();

function handleOk() {
  timeslotOrderStore.subsidyTimeslotOrder();
}

function handleCancel() {
  timeslotOrderStore.showSubsidyModal = false;
  timeslotOrderStore.timeslotOrderSubsidyForm = {
    ids: [],
    timeslotorder_id: -1,
  };
}

const subsidyTypeOptions = [
  { label: '广告补贴', value: '1' },
  { label: '优惠券补贴', value: '2' },
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
        <!-- <div class="form-item horizontal">
          <div class="label">补贴类型</div>
          <Select
            v-model:value="
              timeslotOrderStore.timeslotOrderSubsidyForm.subsidy_type
            "
            :field-names="{ label: 'label', value: 'value' }"
            :options="subsidyTypeOptions"
            :placeholder="$t('请选择补贴类型')"
            class="subsidy-input"
          />
        </div> -->

        <div class="form-item horizontal">
          <div class="label">广告补贴金额</div>
          <InputNumber
            v-model:value="
              timeslotOrderStore.timeslotOrderSubsidyForm.ads_subsidy
            "
            :placeholder="$t('请输入广告补贴金额')"
            class="subsidy-input number-input"
            prefix="$"
          />
        </div>

        <div class="form-item">
          <div class="label">广告补贴备注</div>
          <TextArea
            v-model:value="
              timeslotOrderStore.timeslotOrderSubsidyForm.ads_subsidy_remark
            "
            :placeholder="$t('请输入广告补贴备注')"
            :rows="3"
            class="subsidy-input"
          />
        </div>

        <div class="form-item horizontal">
          <div class="label">优惠券补贴金额</div>
          <InputNumber
            v-model:value="
              timeslotOrderStore.timeslotOrderSubsidyForm.tts_subsidy
            "
            :placeholder="$t('请输入优惠券补贴金额')"
            class="subsidy-input number-input"
            prefix="$"
          />
        </div>

        <div class="form-item">
          <div class="label">优惠券补贴备注</div>
          <TextArea
            v-model:value="
              timeslotOrderStore.timeslotOrderSubsidyForm.tts_subsidy_remark
            "
            :placeholder="$t('请输入优惠券补贴备注')"
            :rows="3"
            class="subsidy-input"
          />
        </div>
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

.form-item {
  margin-bottom: 1rem;
}

.label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.subsidy-input {
  width: 100%;
  font-size: 14px;
  color: #1f2937;
}

.number-input {
  width: 400px !important;
}

.form-item.horizontal {
  display: flex;
  gap: 12px;
  align-items: center;
}

.horizontal .label {
  min-width: 80px;
  margin-bottom: 0;
}

.subsidy-type-text {
  font-size: 14px;
  color: #1f2937;
}
</style>
