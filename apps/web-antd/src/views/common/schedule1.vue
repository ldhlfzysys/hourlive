/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { SlotEvent, TimeslotModel, TimeslotOrder } from '#/types';

import { computed, onMounted, ref } from 'vue';
import VueCal from 'vue-cal';
import { RecycleScroller } from 'vue-virtual-scroller';

import { $t, i18n } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { useElementBounding } from '@vueuse/core';
import { Button, Descriptions, DescriptionsItem, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import SampleCard from '#/components/samplecard.vue';
import SelectFilter from '#/components/selectfilter.vue';
import TimeslotOrderForm from '#/components/timeslotorderform.vue';
import {
  useAgencyStore,
  useContentStore,
  useCustomerStore,
  useSampleStore,
  useTimeslotOrderStore,
} from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import 'vue-cal/dist/vuecal.css';

interface Event {
  id: number;
  slotId: number;
  start: string; // Required.
  end: string; // Required.
  title?: string; // Optional.
  content?: string; // Optional.
  class?: string; // Optional - space-separated css classes.
  background?: boolean; // Optional. (Event type not CSS property)
  split?: number | string; // Optional.
  allDay?: boolean; // Optional.
  draggable?: boolean; // Optional.
  deletable?: boolean; // optional - force undeletable when events are editable.
  resizable?: boolean; // optional - force unresizable when events are editable.
}

// Data
const orderStore = useTimeslotOrderStore();
const agencyStore = useAgencyStore();
const userStore = useUserStore();
const customerStore = useCustomerStore();
const sampleStore = useSampleStore();
const contentStore = useContentStore();
const isSuper = computed(() => {
  return userStore.userRoles.includes('super');
});

const isAgency = computed(() => {
  return userStore.userRoles.includes('agency');
});

const itemWidth = ref(300);
const scroller = ref();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

const events = computed(() => {
  const allEvents: Event[] = [];
  orderStore.timeslotOrderList.forEach((order: TimeslotOrder) => {
    order.timeslots.forEach((timeslot) => {
      const slotContent = order.contents
        .map((content) => {
          let rst: string = content.id.toString();
          if (content.liveaccount) {
            rst += `-${content.liveaccount!.name}-${
              content.liveaccount!.live_account
            }`;
          }
          return rst;
        })
        .join(',');

      const agencyName = agencyStore.agencyById(order.agency_id)?.name;

      allEvents.push({
        background: true,
        content: `
         <div class="event-content">
            <div>${$t('agency')}:${agencyName}</div>
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `,
        deletable: false,
        draggable: false,
        end: `${timeslot.date} ${timeslot.end_time}`,
        id: order.id,
        resizable: false,
        slotId: timeslot.id,
        start: `${timeslot.date} ${timeslot.start_time}`,
        title: `
          <div class="event-container">
            <div class="flex justify-between items-center text-sm">
              <span style="font-size: 12px;margin-left: 10px;font-weight: 500;">${timeslot.start_time}-${timeslot.end_time}</span>
              <span style="font-size: 11px;margin-right: 10px;">ID:${order.id}</span>
            </div>
           
          </div>
        `,
      });
    });
  });

  return allEvents.sort((a, b) => {
    return dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1;
  });
});
const selectedDate = ref('');
const loading = ref(false);
const activeView = ref('month');
const selectedAgencies = ref([]);
const selectedCustomers = ref([]);
const selectedContents = ref([]);
const selectedRooms = ref([]);
const selectedEvent = ref<null | SlotEvent>(null);

// Function
const localeStr = computed(() => {
  return i18n.global.locale.value.toLowerCase();
});

const availableFilters = computed(() => {
  if (isSuper.value) {
    return ['agency', 'room', 'customer', 'content'];
  } else if (isAgency.value) {
    return ['room', 'customer', 'content'];
  }
  return [];
});

const contentInfo = computed(() => {
  const content = selectedEvent.value?.contents[0];
  return {
    content_desc: content?.content_desc,
    content_link: content?.content_link,
    content_text: content?.content_text,
    create_time: content?.create_time,
    customer_id: content?.customer_id,
    update_time: content?.update_time,
  };
});

const liveAccountInfo = computed(() => {
  const liveAccount = selectedEvent.value?.contents[0]?.liveaccount;
  return {
    code: liveAccount?.code,
    create_time: liveAccount?.create_time,
    customer_id: liveAccount?.customer_id,
    live_account: liveAccount?.live_account,
    live_uid: liveAccount?.live_uid,
    liveaccount_id: liveAccount?.id,
    mobile: liveAccount?.mobile,
    name: liveAccount?.name,
    platform: liveAccount?.platform,
    update_time: liveAccount?.update_time,
  };
});

// Life Time
onMounted(() => {
  useAgencyStore().fetchAgency();
  fetchCustomerData();
  useTimeslotOrderStore().queryTimeslotOrder();
});

function fetchCustomerData() {
  if (isSuper.value) {
    useCustomerStore().fetchAllCustomers();
  } else if (isAgency.value) {
    useCustomerStore().getAgencyCustomers();
  }
}

function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
}

function onUpdate(
  viewStartIndex: number,
  viewEndIndex: number,
  visibleStartIndex: number,
  visibleEndIndex: number,
) {
  updateParts.value.viewStartIdx = viewStartIndex;
  updateParts.value.viewEndIdx = viewEndIndex;
  updateParts.value.visibleStartIdx = visibleStartIndex;
  updateParts.value.visibleEndIdx = visibleEndIndex;
}

// CalendarEvent
function handleCellClick(event: any) {
  selectedDate.value = event.format('YYYY-MM-DD HH:00');
  const startTime = dayjs(event.format('YYYY-MM-DD HH:00'));
  const endTime = startTime.add(2, 'hour');
  if (activeView.value === 'month') {
    activeView.value = 'day';
  } else {
    if (isSuper.value) {
      orderStore.isEditing = true;
      const initTiMeModel: TimeslotModel = {
        canEdit: true,
        date: startTime.clone(),
        slot: [startTime.clone(), endTime.clone()],
      };
      orderStore.formState = {
        enableEdit: true,
        liveTime: [dayjs(selectedDate.value), dayjs(selectedDate.value)],
        timeslot: [startTime, endTime],
        timeslots: [initTiMeModel],
      };
    }
  }
}

function handleEventClick(event: Event, e: MouseEvent) {
  const order = orderStore.orderById(event.id);

  if (order) {
    sampleStore.clearSamples();
    sampleStore.sampleQuery.content_ids = order.contents.map(
      (content) => content.id,
    );
    sampleStore.sampleQuery.q_size = 100;
    sampleStore.querySample();
    selectedEvent.value = {
      ...order,
      end: dayjs(event.end).format('MM/DD HH:mm'),
      slotId: event.slotId,
      start: dayjs(event.start).format('MM/DD HH:mm'),
    };
    orderStore.showEventDetails = true;
  }
}

async function handleDeleteOrder() {
  Modal.confirm({
    onOk: async () => {
      loading.value = true;
      await orderStore.deleteOrders({
        timeslot_ids: [selectedEvent.value!.slotId],
        timeslotorder_id: selectedEvent.value!.id,
      });
      loading.value = false;
    },
    title: $t('confirmdelete'),
  });
}

function disablePastDates(date: Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <div v-for="filter in availableFilters" :key="filter">
          <SelectFilter
            v-if="filter === 'agency'"
            v-model="selectedAgencies"
            :options="agencyStore.agencyOptions"
            :placeholder="$t('selectagency')"
            :title="$t('agency')"
          />
          <SelectFilter
            v-if="filter === 'room'"
            v-model="selectedRooms"
            :options="agencyStore.roomOptionsByAgencyIds(selectedAgencies)"
            :placeholder="$t('selectroom')"
            :title="$t('room')"
          />
          <SelectFilter
            v-if="filter === 'customer'"
            v-model="selectedCustomers"
            :options="customerStore.customerOptions ?? []"
            :placeholder="$t('selectcustomer')"
            :title="$t('hourlive_account')"
          />
          <SelectFilter
            v-if="filter === 'content'"
            v-model="selectedContents"
            :options="customerStore.contentOptions ?? []"
            :placeholder="$t('selectcontent')"
            :title="$t('content')"
          />
        </div>
      </template>

      <template #content>
        <div class="flex h-full flex-1 flex-row space-x-4">
          <div class="flex h-full flex-1 flex-col">
            <VueCal
              v-model:active-view="activeView"
              :disable-dates="disablePastDates"
              :disable-views="['years', 'year']"
              :drag-to-create-event="false"
              :events="events"
              :events-on-month-view="true"
              :locale="localeStr"
              :selected-date="dayjs().format('YYYY-MM-DD')"
              :time-from="0"
              :time-step="120"
              :time-to="24 * 60"
              watch-real-time
              @cell-click="handleCellClick"
              @event-click="handleEventClick"
            />
          </div>

          <div
            v-if="orderStore.isEditing"
            class="flex h-full w-[500px] flex-col"
          >
            <div class="mb-2 flex items-center justify-between">
              <button
                class="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
                @click="orderStore.isEditing = false"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>
              <Button type="primary" @click="orderStore.makeOrders">
                {{ $t('makeorder') }}
              </Button>
            </div>
            <TimeslotOrderForm />
          </div>
        </div>
      </template>

      <template #footer></template>
    </HourLivePage>

    <div v-if="selectedEvent">
      <Modal
        v-model:open="orderStore.showEventDetails"
        :body-style="{ overflowY: 'auto', maxHeight: '500px' }"
        :title="$t('orderdetail')"
        style="top: 10px; width: 85%"
        @cancel="orderStore.showEventDetails = false"
      >
        <div class="flex h-full flex-1 flex-col">
          <Descriptions :column="3" bordered>
            <DescriptionsItem :label="$t('id')">
              {{ selectedEvent!.id }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('timeslot')">
              {{ selectedEvent!.start }} - {{ selectedEvent!.end }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('agency')">
              {{ agencyStore.agencyById(selectedEvent!.agency_id)?.name }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('customer')">
              {{ selectedEvent!.customer?.code }}
            </DescriptionsItem>

            <DescriptionsItem :label="$t('content')" :span="3">
              {{ selectedEvent!.contents[0].id }}
            </DescriptionsItem>

            <DescriptionsItem :label="$t('content_text')" :span="3">
              <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
                <div
                  v-for="[key, value] in Object.entries(contentInfo)"
                  :key="key"
                  class="flex items-center"
                >
                  <strong>{{ $t(key) }}: </strong>
                  <div class="ml-2" v-html="value"></div>
                </div>
              </div>
            </DescriptionsItem>

            <DescriptionsItem :label="$t('liveaccount')" :span="3">
              <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
                <div
                  v-for="[key, value] in Object.entries(liveAccountInfo)"
                  :key="key"
                  class="flex items-center"
                >
                  <strong>{{ $t(key) }}: </strong>
                  <div class="ml-2" v-html="value"></div>
                </div>
              </div>
            </DescriptionsItem>
          </Descriptions>

          <div
            v-if="sampleStore.sampleList.length > 0"
            class="flex h-full flex-1 flex-col"
          >
            <br />
            <h1>{{ $t('sample') }}</h1>
            <RecycleScroller
              ref="scroller"
              v-slot="{ item }"
              :emit-update="true"
              :grid-items="2"
              :item-secondary-size="itemWidth"
              :item-size="240"
              :items="sampleStore.sampleList"
              :loading="sampleStore.sampleQueryLoading"
              :page-mode="true"
              class="scroller"
              key-field="id"
              @resize="onResize"
              @update="onUpdate"
            >
              <SampleCard :sample="item" />
            </RecycleScroller>
          </div>
        </div>

        <template #footer>
          <Button
            key="download"
            :disabled="
              sampleStore.sampleQueryLoading || orderStore.downloadLoading
            "
            :loading="orderStore.downloadLoading"
            type="primary"
            @click="orderStore.downloadTimeslotOrder(selectedEvent)"
          >
            {{ $t('download') }}
          </Button>
          <Button
            v-if="isSuper"
            key="submit"
            :loading="loading"
            type="primary"
            @click="handleDeleteOrder"
          >
            {{ $t('delete') }}
          </Button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  /* height: 32%; */

  /* padding: 0 12px; */
  display: flex;
  align-items: center;
}

:deep(.vuecal__event) {
  overflow: hidden;
  border: 1px solid #e5e7eb !important;
  border-radius: 4px;
}

:deep(.event-container) {
  height: 100%;
  border-radius: 1px;
}

:deep(.event-content) {
  padding: 4px 10px;
  font-size: 12px;
  text-align: left;
  word-break: break-all;
}

:deep(.vuecal__event-time) {
  display: none;
}

:deep(.vuecal__cell--disabled) {
  color: #a0a0a0 !important; /* Gray text */
  pointer-events: none; /* Disable click events */
  background-color: #f0f0f0 !important; /* Light gray background */
}
</style>
