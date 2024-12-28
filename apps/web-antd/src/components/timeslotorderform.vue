/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { TimeslotModel } from '#/types';

import { computed, onMounted } from 'vue';

import { $t } from '@vben/locales';

import { Card, Form, FormItem, Select, Tag } from 'ant-design-vue';

import {
  useAgencyStore,
  useCustomerStore,
  useRoomStore,
  useTimeslotOrderStore,
} from '#/store';

import TimeslotsControl from './timeslotscontrol.vue';
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

function generateTimelineText(timeslot: TimeslotModel) {
  return `${timeslot.date.format('YYYY-MM-DD')}  ${timeslot.slot[0].format('HH:mm')} - ${timeslot.slot[1].format('HH:mm')}`;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <Card>
      <Form
        :model="orderStore.formState"
        name="order_live_form"
        v-bind="formItemLayout"
      >
        <FormItem
          v-if="orderStore.formState.orderId !== undefined"
          :label="$t('timeslotorder_id')"
        >
          <Tag v-if="!enableEdit">{{ orderStore.formState.orderId }}</Tag>
        </FormItem>

        <FormItem
          :label="$t('agency')"
          :rules="[{ required: true, message: $t('agencyrequired') }]"
          name="agency"
        >
          <div class="w-[60%] max-w-[300px]">
            <Select
              v-model:value="orderStore.formState.agency"
              :disabled="!enableEdit"
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
            <Select
              v-model:value="orderStore.formState.roomId"
              :disabled="!enableEdit"
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
            <Select
              v-model:value="orderStore.formState.contentId"
              :disabled="!enableEdit"
              :options="customerStore.contentOptions"
              :placeholder="$t('selectcontent')"
              show-search
            />
          </div>
        </FormItem>

        <FormItem :label="$t('livetime')">
          <div v-if="orderStore.formState.formType === 'add'">
            <div class="flex gap-2">
              <TimeslotsControl />
            </div>
            <br />
          </div>

          <div v-if="orderStore.formState.formType === 'apend'">
            <TimeslotsControl />
          </div>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<style scoped></style>
