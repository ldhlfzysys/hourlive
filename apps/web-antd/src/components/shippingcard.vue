<script lang="ts" setup>
import type { SampleShipping } from '#/types';

import { computed } from 'vue';

import { AccessControl, useAccess } from '@vben/access';
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import { useAgencyStore, useSampleShippingStore } from '#/store';

defineOptions({
  name: 'ShippingCard',
});

const props = defineProps<{
  sampleshipping: SampleShipping;
}>();

const sampleShippingStore = useSampleShippingStore();
const agencyStore = useAgencyStore();
const agency = computed(() => {
  return agencyStore.agencyById(props.sampleshipping.agency_id!);
});

const handleShowShippingDetail = () => {
  sampleShippingStore.showShippingDetails = true;
  sampleShippingStore.currentSelectedShipping = props.sampleshipping;
};

const handleShowShippingSample = () => {
  sampleShippingStore.showShippingSample = true;
  sampleShippingStore.currentSelectedShipping = props.sampleshipping;
};

const { hasAccessByRoles } = useAccess();
const isAgency = computed(() => hasAccessByRoles(['agency']));
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
  >
    <!-- Header部分 -->
    <div
      class="flex items-center justify-between border-b border-gray-100 px-6 py-5"
    >
      <div class="flex items-center gap-3">
        <h3 class="m-0 text-lg font-semibold text-gray-800">
          {{ agency?.name }}
        </h3>
        <span
          :class="
            props.sampleshipping.delivery_approval === '1'
              ? 'bg-green-50 text-green-600'
              : 'bg-orange-50 text-orange-600'
          "
          class="rounded-md bg-gray-50 px-3 py-1 text-sm"
        >
          {{
            props.sampleshipping.delivery_approval === '1'
              ? $t('agencyrecived')
              : $t('norecived')
          }}
        </span>
      </div>

      <!-- 新增的按钮组 -->
      <div class="flex items-center gap-3">
        <a
          class="cursor-pointer text-blue-600 hover:text-blue-800"
          @click="handleShowShippingDetail"
        >
          {{ $t('shippingdetailinfo') }}
        </a>
        <a
          class="cursor-pointer text-blue-600 hover:text-blue-800"
          @click="handleShowShippingSample"
        >
          {{ $t('shippingsampleinfo') }}
        </a>
        <AccessControl :codes="['super', 'agency']">
          <Button
            :disabled="props.sampleshipping.delivery_approval === '1'"
            class="min-w-[80px]"
            type="primary"
            @click="
              sampleShippingStore.agencyMakeUpdate(props.sampleshipping.id!)
            "
          >
            {{ isAgency ? $t('confirm_receipt') : $t('edit') }}
          </Button>
        </AccessControl>
        <AccessControl :codes="['customer']">
          <Button
            :disabled="props.sampleshipping.delivery_approval === '1'"
            class="min-w-[80px]"
            type="primary"
            @click="
              sampleShippingStore.customerMakeUpdate(props.sampleshipping.id!)
            "
          >
            {{ $t('edit') }}
          </Button>
        </AccessControl>
      </div>
    </div>

    <!-- 内容部分 -->
    <div class="p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- 快递信息 -->
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('express_company')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.sampleshipping.express_company
              }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('tracking_number')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.sampleshipping.tracking_number
              }}</span>
            </div>
          </div>
        </div>

        <!-- 发件人信息 -->
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('sender_name')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.sampleshipping.sender_name
              }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('sender_time')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.sampleshipping.sender_time
              }}</span>
            </div>
          </div>
        </div>

        <!-- 收件人信息 -->
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('receiver_name')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.sampleshipping.receiver_name
              }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('receiver_time')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.sampleshipping.receiver_time
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
