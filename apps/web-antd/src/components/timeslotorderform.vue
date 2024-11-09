/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import { onMounted } from 'vue';

import { $t } from '@vben/locales';

import {
  Form,
  FormItem,
  Input,
  RangePicker,
  Select,
  Tag,
} from 'ant-design-vue';

import {
  useAgencyStore,
  useCustomerStore,
  useTimeslotOrderStore,
} from '#/store';
// Data

defineOptions({
  name: 'TimeslotOrderForm',
});

const orderStore = useTimeslotOrderStore();
const agencyStore = useAgencyStore();

const customerStore = useCustomerStore();
const enableEdit = orderStore.formState.enableEdit;

const formItemLayout = {
  labelCol: {
    sm: { span: 4 },
    xs: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 20 },
    xs: { span: 24 },
  },
};
// Function

// Life Time
onMounted(() => {});
</script>

<template>
  <Form
    :model="orderStore.formState"
    name="order_live_form"
    v-bind="formItemLayout"
  >
    <FormItem
      v-if="orderStore.formState.orderId !== undefined"
      :label="$t('order_id')"
    >
      <Input v-model:value="orderStore.formState.orderId" />
    </FormItem>

    <FormItem :label="$t('agency')">
      <div class="w-[50%] max-w-[300px]">
        <Tag v-if="!enableEdit">{{ orderStore.formState.agency }}</Tag>
        <Select
          v-else
          v-model:value="orderStore.formState.agency"
          :options="agencyStore.agencyOptions"
          placeholder="请选择机构"
          show-search
        />
      </div>
    </FormItem>

    <FormItem label="商家">
      <div class="w-[50%] max-w-[300px]">
        <Tag v-if="!enableEdit">{{ orderStore.formState.contentId }}</Tag>
        <Select
          v-else
          v-model:value="orderStore.formState.contentId"
          :options="customerStore.agencyCustomerOptions"
          placeholder="请选择商家"
          show-search
        />
      </div>
    </FormItem>

    <FormItem label="直播时段">
      <RangePicker v-model:value="orderStore.formState.liveTime" />
    </FormItem>
  </Form>
</template>

<style scoped></style>
