/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import { $t } from '@vben/locales';

import {
  Form,
  FormItem,
  Input,
  RangePicker,
  Select,
  Tag,
  TimeRangePicker,
} from 'ant-design-vue';

import {
  useAgencyStore,
  useCustomerStore,
  useRoomStore,
  useTimeslotOrderStore,
} from '#/store';
// Data

defineOptions({
  name: 'TimeslotOrderForm',
});

const orderStore = useTimeslotOrderStore();
const agencyStore = useAgencyStore();
const roomStore = useRoomStore();

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

const roomOptions = computed(() => {
  if (orderStore.formState.agency === undefined) {
    return [];
  }
  return agencyStore.roomOptionsByAgencyIds([
    Number.parseInt(orderStore.formState.agency),
  ]);
});
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

    <FormItem
      :label="$t('agency')"
      :rules="[{ required: true, message: $t('agencyrequired') }]"
      name="agency"
    >
      <div class="w-[60%] max-w-[300px]">
        <Tag v-if="!enableEdit">{{ orderStore.formState.agency }}</Tag>
        <Select
          v-else
          v-model:value="orderStore.formState.agency"
          :options="agencyStore.agencyOptions"
          :placeholder="$t('selectagency')"
          show-search
        />
      </div>
    </FormItem>

    <FormItem
      :label="$t('room')"
      :rules="[{ required: true, message: $t('roomrequired') }]"
      name="roomId"
    >
      <div class="w-[60%] max-w-[300px]">
        <Tag v-if="!enableEdit">{{ orderStore.formState.roomId }}</Tag>
        <Select
          v-else
          v-model:value="orderStore.formState.roomId"
          :options="roomOptions"
          :placeholder="$t('selectroom')"
          show-search
        />
      </div>
    </FormItem>

    <FormItem
      :label="$t('content')"
      :rules="[{ required: true, message: $t('contentrequired') }]"
      name="contentId"
    >
      <div class="w-[80%] max-w-[400px]">
        <Tag v-if="!enableEdit">{{ orderStore.formState.contentId }}</Tag>
        <Select
          v-else
          v-model:value="orderStore.formState.contentId"
          :options="customerStore.contentOptions"
          :placeholder="$t('selectcontent')"
          show-search
        />
      </div>
    </FormItem>

    <FormItem :label="$t('livetime')">
      <div class="flex gap-2">
        <RangePicker
          v-model:value="orderStore.formState.liveTime"
          class="w-[60%]"
          @change="orderStore.generateTimeslots"
        />
        <TimeRangePicker
          v-model:value="orderStore.formState.timeslot"
          class="w-[40%]"
          format="HH:mm"
          @change="orderStore.generateTimeslots"
        />
      </div>
    </FormItem>
  </Form>
</template>

<style scoped></style>
