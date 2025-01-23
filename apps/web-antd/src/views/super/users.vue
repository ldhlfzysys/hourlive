<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Collapse,
  CollapsePanel,
  Input,
  message,
  Modal,
} from 'ant-design-vue';
import {
  Building2,
  KeyRound,
  MapPin,
  Search,
  Trash2,
  UserRound,
} from 'lucide-vue-next';

import { useAgencyStore } from '#/store/agency';
import { useCustomerStore } from '#/store/customer';
import HourLivePage from '#/views/template/common.vue';

const activeTab = ref('customers');
const customerStore = useCustomerStore();
const agencyStore = useAgencyStore();
const searchText = ref('');

// 过滤用户列表
const filteredCustomers = computed(() => {
  if (!searchText.value) {
    return customerStore.agencyCustomers?.data || [];
  }
  return (customerStore.agencyCustomers?.data || []).filter((customer) =>
    customer.code?.toLowerCase().includes(searchText.value.toLowerCase()),
  );
});

// 过滤机构列表
const filteredAgencies = computed(() => {
  if (!searchText.value) {
    return agencyStore.allAgency;
  }
  return agencyStore.allAgency.filter((agency) =>
    agency.name.toLowerCase().includes(searchText.value.toLowerCase()),
  );
});

onMounted(async () => {
  await customerStore.fetchAllCustomers();
  await agencyStore.fetchAgency();
});

// 添加删除确认方法
const handleDeleteCustomer = (customer: any) => {
  Modal.confirm({
    cancelText: $t('cancel'),
    content: `${$t('confirmDeleteCustomer')}: ${customer.code}`,

    okText: $t('confirm'),
    async onOk() {
      await customerStore.hideCustomer(customer.id);
    },
    title: $t('confirmDelete'),
  });
};

const handleDeleteAgency = (agency: any) => {
  Modal.confirm({
    cancelText: $t('cancel'),
    content: `${$t('confirmDeleteAgency')}: ${agency.name}`,

    okText: $t('confirm'),
    async onOk() {
      await agencyStore.hideAgency(agency.id);
    },
    title: $t('confirmDelete'),
  });
};

// 添加重置密码的处理方法
const handleResetPassword = (customer: any) => {
  let newPassword = '';
  Modal.confirm({
    cancelText: $t('cancel'),
    content: h('div', [
      h(Input, {
        onChange: (e: any) => {
          newPassword = e.target.value;
        },
        placeholder: $t('enterNewPassword'),
      }),
    ]),
    okText: $t('confirm'),
    async onOk() {
      if (!newPassword) {
        return;
      }
      try {
        await customerStore.resetPassword({
          id: customer.id,
          password: newPassword,
        });
        message.success($t('passwordResetSuccess'));
      } catch {
        message.error($t('passwordResetFailed'));
      }
    },
    title: $t('resetPassword'),
  });
};
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #content>
      <div class="p-4">
        <!-- 顶部标签栏和搜索框 -->
        <div class="mb-6 flex justify-between">
          <div class="flex gap-4">
            <div
              :class="[
                activeTab === 'customers'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-neutral-800',
              ]"
              class="flex cursor-pointer items-center gap-2 rounded px-4 py-2 transition-colors"
              @click="activeTab = 'customers'"
            >
              <UserRound class="size-4" />
              {{ $t('customers') }}
            </div>
            <div
              :class="[
                activeTab === 'agencies'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-neutral-800',
              ]"
              class="flex cursor-pointer items-center gap-2 rounded px-4 py-2 transition-colors"
              @click="activeTab = 'agencies'"
            >
              <Building2 class="size-4" />
              {{ $t('agencies') }}
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="w-64">
            <Input
              v-model:value="searchText"
              :placeholder="
                activeTab === 'customers'
                  ? $t('searchCustomers')
                  : $t('searchAgencies')
              "
              class="!bg-gray-100 dark:!bg-neutral-800"
            >
              <template #prefix>
                <Search class="size-4 text-gray-400" />
              </template>
            </Input>
          </div>
        </div>

        <!-- 用户列表 -->
        <div v-if="activeTab === 'customers'" class="grid grid-cols-3 gap-4">
          <Card
            v-for="customer in filteredCustomers"
            :key="customer.id"
            :bordered="false"
            class="transition-shadow hover:shadow-md"
          >
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img
                    v-if="customer.user.avatar"
                    :src="customer.user.avatar"
                    alt="avatar"
                    class="h-6 w-auto rounded-full object-cover"
                  />
                  <span>{{ customer.code }}</span>
                  <span class="text-sm text-gray-500">{{
                    customer.source
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Button
                    class="!p-0"
                    type="link"
                    @click="handleResetPassword(customer)"
                  >
                    <KeyRound class="text-primary size-4" />
                  </Button>
                  <Button
                    class="!p-0"
                    type="link"
                    @click="handleDeleteCustomer(customer)"
                  >
                    <Trash2 class="size-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </template>
            <div class="space-y-3">
              <!-- 基本信息行 -->
              <div class="flex items-center gap-4">
                <span class="text-gray-500">ID: {{ customer.id }}</span>
                <span class="text-gray-500">
                  {{ $t('balance') }}: {{ customer.hourlive_money }}
                </span>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-gray-500">
                  {{ $t('contents') }}: {{ customer.contents?.length || 0 }}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <!-- 机构列表 -->
        <div v-if="activeTab === 'agencies'" class="grid grid-cols-3 gap-4">
          <Card
            v-for="agency in filteredAgencies"
            :key="agency.id"
            :bordered="false"
            class="transition-shadow hover:shadow-md"
          >
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img
                    v-if="agency.user.avatar"
                    :src="agency.user.avatar"
                    alt="avatar"
                    class="h-6 w-auto rounded-full object-cover"
                  />
                  {{ agency.name }}
                </div>
                <Button
                  class="!p-0"
                  type="link"
                  @click="handleDeleteAgency(agency)"
                >
                  <Trash2 class="size-4 text-red-500" />
                </Button>
              </div>
            </template>
            <div class="space-y-2">
              <p>ID: {{ agency.id }}</p>
              <p>{{ $t('rooms') }}: {{ agency.rooms?.length || 0 }}</p>

              <!-- 收货地址折叠面板 -->
              <Collapse v-if="agency.shippingaddress?.length">
                <CollapsePanel :key="1">
                  <template #header>
                    <div class="flex items-center gap-2 text-gray-600">
                      <MapPin class="size-4" />
                      {{ $t('shippingAddresses') }}
                      <span class="text-sm text-gray-400">
                        ({{ agency.shippingaddress.length }})
                      </span>
                    </div>
                  </template>
                  <div class="space-y-2">
                    <div
                      v-for="(address, index) in agency.shippingaddress"
                      :key="index"
                      class="rounded bg-gray-50 p-2 dark:bg-neutral-700"
                    >
                      <p class="text-sm text-gray-600 dark:text-gray-300">
                        {{ address.address }}
                      </p>
                    </div>
                  </div>
                </CollapsePanel>
              </Collapse>

              <!-- 无地址提示 -->
              <p v-else class="text-sm text-gray-400">
                {{ $t('noShippingAddress') }}
              </p>
            </div>
          </Card>
        </div>

        <!-- 无搜索结果提示 -->
        <div
          v-if="
            (activeTab === 'customers' && filteredCustomers.length === 0) ||
            (activeTab === 'agencies' && filteredAgencies.length === 0)
          "
          class="mt-8 text-center text-gray-500"
        >
          {{ $t('noSearchResults') }}
        </div>
      </div>
    </template>
  </HourLivePage>
</template>

<style scoped>
.ant-card {
  @apply bg-white dark:bg-neutral-800;
}

:deep(.ant-collapse) {
  @apply border-none bg-transparent;
}

:deep(.ant-collapse-header) {
  @apply px-0 py-2;
}

:deep(.ant-collapse-content) {
  @apply bg-transparent;
}

:deep(.ant-collapse-content-box) {
  @apply p-0;
}
</style>
