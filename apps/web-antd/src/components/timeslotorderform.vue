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

import { useAgencyStore, useTimeslotOrderStore } from '#/store';
// Data

defineOptions({
  name: 'TimeslotOrderForm',
});

const orderStore = useTimeslotOrderStore();
const agencyStore = useAgencyStore();
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
          class="w-[100px]"
          placeholder="请选择机构"
          show-search
        />
      </div>
    </FormItem>

    <FormItem label="直播时段">
      <RangePicker v-model:value="orderStore.formState.liveTime" />
    </FormItem>
  </Form>

  <!-- <FormItem
    v-for="formItem in formItems"
    label-align="left"
    :key="formItem.key"
    :name="formItem.key"
    :label="formItem.label"
    :rules="formItem.rules"
  >
    <RangePicker
      v-if="formItem.type == FormItemType.RangeTimePicker"
      v-model:value="useTimeslotOrderStore().formState[formItem.key]"
      style="width: 380px"
      :format="format"
      :show-time="{
        hideDisabledOptions: true,
        defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')],
      }"
    />


    <RangePicker 
        v-if="formItem.type == FormItemType.RangeTimePickerDate"
        v-model:value="formState[formItem.key]"/>

    <TimeRangePicker
      v-if="formItem.type == FormItemType.RangeTimePickerTimeslot"
      v-model:value="formState[formItem.key]"
      format="HH:mm"
      /> 

    <List 
      v-if="formItem.type == FormItemType.RangeTimePickerList" 
      :bordered="true" 
      size="small" 
      item-layout="horizontal" 
      style="overflow: auto; max-height: 400px;"
      :data-source="formState[formItem.key]">
      <template #header>

        <Popover v-model:open="visible" :title="t('hourlive.action.bulkAddDates')" trigger="click" placement="bottom" width="300">
          <template #content>
            <Row>
              <Col :span="12">
                <RangePicker v-model:value="batchTimeslots['dates']" />
              </Col>
              <Col :span="9" :offset="1">
                <TimeRangePicker v-model:value="batchTimeslots['slots']" format="HH:mm"/>
              </Col>
            </Row>

            <br/>

            <Row justify="center">
              <Button type="primary"  @click="addTimeslots">
                  {{ t('hourlive.action.confirm') }}
              </Button>

            </Row>
            
          </template>
          <Button type="primary"  @click="visible=true">
              {{ t('hourlive.action.bulkAdd') }}
          </Button>
        </Popover>
      </template>
      <template #renderItem="{ item, index }">
        <ListItem>
          <Row>
            <Col :span="8">
              <DatePicker v-model:value="item.date" :allowClear="false" :disabled="!item.canEdit"/>
            </Col>
            <Col :span="11" :offset="1">
              <TimeRangePicker
                v-model:value="item.slot"
                format="HH:mm"
                :allowClear="false"
                :disabled="!item.canEdit"
                /> 
            </Col>
            <Col :span="2" v-if="formState[formItem.key].length > 1 && item.canEdit">
              <Button  size="small" type="text"  shape="circle" :icon="h(MinusOutlined)" @click="deleteTimeslot(index)"></Button>
            </Col>
            <Col :span="2" v-if="index == formState[formItem.key].length - 1" >
              <Button size="small" type="text" shape="circle" :icon="h(PlusOutlined)" @click="addTimeslot"></Button>
            </Col>
          </Row>
          
        </ListItem>
      </template>
    </List>

    
    <Select
      v-else-if="formItem.type == FormItemType.Select"
      v-model:value="formState[formItem.key]"
      showSearch
      optionFilterProp="key"
      :placeholder="t('hourlive.info.select')"
      :disabled="formItem.disabled"
      style="width: 400px"
    >
      <Select.Option v-for="option in formItem.value" :key="option.value" :value="option.value">
        {{ option.label }}
      </Select.Option>
    </Select>

    <Tag color="#409eff" v-else-if="formItem.type == FormItemType.Tag">{{
      formItem.value
    }}</Tag>

    <InputNumber
      style="width: 60%"
      :controls="false"
      v-else-if="formItem.type == FormItemType.InputNumber"
      v-model:value="formState[formItem.key]"
    >
    </InputNumber>
  </FormItem> -->
</template>

<style scoped></style>
