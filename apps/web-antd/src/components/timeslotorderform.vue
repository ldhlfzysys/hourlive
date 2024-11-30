/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { TimeslotModel } from '#/types';

import { computed, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Card,
  DatePicker,
  Form,
  FormItem,
  List,
  ListItem,
  RangePicker,
  Select,
  Tag,
  Timeline,
  TimelineItem,
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

const visible = ref(false);

function addTimeslot() {
  if (orderStore.formState.timeslots!.length === 0) {
    return;
  }
  const lastTimeslot =
    orderStore.formState.timeslots![orderStore.formState.timeslots!.length - 1];
  orderStore.formState.timeslots!.push({
    canEdit: true,
    date: lastTimeslot!.date.add(1, 'day'),
    slot: lastTimeslot!.slot,
  });
}

function deleteTimeslot(index: number) {
  orderStore.formState.timeslots!.splice(index, 1);
}

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
              <RangePicker
                v-model:value="orderStore.formState.liveTime"
                class="w-[65%]"
                @change="orderStore.generateTimeslots"
              />
              <TimeRangePicker
                v-model:value="orderStore.formState.timeslot"
                class="w-[40%]"
                format="HH:mm"
                @change="orderStore.generateTimeslots"
              />
            </div>
            <br />

            <div>
              <Timeline>
                <TimelineItem
                  v-for="(timeslot, index) in orderStore.formState.timeslots"
                  :key="index"
                >
                  {{ generateTimelineText(timeslot) }}
                </TimelineItem>
              </Timeline>
            </div>
          </div>

          <div v-if="orderStore.formState.formType === 'apend'">
            <List
              :bordered="true"
              :data-source="orderStore.formState.timeslots"
              item-layout="horizontal"
              size="small"
              style="max-height: 400px; overflow: auto"
            >
              <!-- <template #header>

                  <Popover v-model:open="visible" :title="$t('bulkAddDates')" trigger="click" placement="bottom" width="300">
                    <template #content>
                      <Row>
                        <Col :span="12">
                          <RangePicker v-model:value="" />
                        </Col>
                        <Col :span="9" :offset="1">
                          <TimeRangePicker v-model:value=""/>
                        </Col>
                      </Row>

                      <br/>

                      <Row justify="center">
                        <Button type="primary"  @click="">
                            {{ $t('confirm') }}
                        </Button>

                      </Row>
                      
                    </template>
                    <Button type="primary"  @click="">
                        {{ $t('bulkAdd') }}
                    </Button>
                  </Popover>
                </template> -->
              <template #renderItem="{ item, index }">
                <ListItem>
                  <div class="flex gap-2">
                    <DatePicker
                      v-model:value="item.date"
                      :allow-clear="false"
                      :disabled="!item.canEdit"
                    />
                    <TimeRangePicker
                      v-model:value="item.slot"
                      :allow-clear="false"
                      :disabled="!item.canEdit"
                      format="HH:mm"
                    />
                    <span
                      v-if="
                        orderStore.formState.timeslots!.length > 1 &&
                        item.canEdit
                      "
                      class="icon-[mdi--minus] size-6"
                      @click="deleteTimeslot(index)"
                    ></span>
                    <span
                      v-if="
                        index === orderStore.formState.timeslots!.length - 1
                      "
                      class="icon-[mdi--plus] size-6"
                      @click="addTimeslot"
                    ></span>
                  </div>
                </ListItem>
              </template>
            </List>
          </div>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<style scoped></style>
