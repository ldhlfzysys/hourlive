import type {
  AgencyHomeInfo,
  AgencyRead,
  BaseQuery,
  StandardResponse,
} from '#/types';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

import { useRoomStore } from './room';
import { useShippingAddressStore } from './shippingaddress';

// API

async function _queryAgency() {
  return requestClient.get<StandardResponse>(`agency/query`);
}

async function _queryAgencyByIds(params: BaseQuery) {
  return requestClient.post<StandardResponse>(`agency/query/ids`, params);
}

async function _hideAgency(params: BaseQuery) {
  return requestClient.post<StandardResponse>(`agency/hide`, params);
}

async function _getAgencyHomeInfo() {
  return requestClient.post<StandardResponse>('home/agencyhome');
}

export const useAgencyStore = defineStore('agency-store', () => {
  // data
  const agencyies = ref<Map<number, AgencyRead>>(new Map());
  const agencyList = computed(() => {
    return [...agencyies.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, agency]) => agency); // 转换为Agency的list
  });
  const agencyHomeInfo = ref<AgencyHomeInfo>();

  // UI - loading
  const queryAgencyLoading = ref(false);
  const hideAgencyLoading = ref(false);

  // UI - modal
  // 适配select组件
  const agencyOptions = computed(() => {
    return agencyList.value.map((item: AgencyRead) => ({
      label: item.name,
      value: item.id,
    }));
  });

  // UE - Update

  // API
  async function agencyById(id: number) {
    const agency = agencyies.value.get(id);
    if (agency) {
      return agency;
    } else {
      queryAgencyLoading.value = true;
      const res = await _queryAgencyByIds({ ids: [id] });
      if (res.success && res.data && res.data.length > 0) {
        const roomStore = useRoomStore();
        const shippingAddressStore = useShippingAddressStore();

        res.data.forEach((agency: AgencyRead) => {
          if (agency.id) {
            // 设置 agency
            agencyies.value.set(agency.id, agency);

            // 使用 roomStore.setRooms 设置 rooms 数据
            if (agency.rooms && agency.rooms.length > 0) {
              roomStore.setRooms(agency.rooms);
            }

            // 使用 shippingAddressStore.setShippingAddresses 设置 shippingaddress 数据
            if (agency.shippingaddress && agency.shippingaddress.length > 0) {
              shippingAddressStore.setShippingAddresses(agency.shippingaddress);
            }
          }
        });
      }
      queryAgencyLoading.value = false;
      return agencyies.value.get(id);
    }
  }

  async function fetchAgencyHomeInfo() {
    const res = await _getAgencyHomeInfo();
    agencyHomeInfo.value = res.data;
  }

  async function hideAgency(id: number) {
    hideAgencyLoading.value = true;
    const res = await _hideAgency({ id });
    if (res.success) {
      agencyies.value.delete(id);
    }
    hideAgencyLoading.value = false;
  }

  async function fetchAgency() {
    queryAgencyLoading.value = true;
    const res = await _queryAgency();
    if (res.success && res.data) {
      const roomStore = useRoomStore();
      const shippingAddressStore = useShippingAddressStore();

      res.data.forEach((agency: AgencyRead) => {
        if (agency.id) {
          // 设置 agency
          agencyies.value.set(agency.id, agency);

          // 使用 roomStore.setRooms 设置 rooms 数据
          if (agency.rooms && agency.rooms.length > 0) {
            roomStore.setRooms(agency.rooms);
          }

          // 使用 shippingAddressStore.setShippingAddresses 设置 shippingaddress 数据
          if (agency.shippingaddress && agency.shippingaddress.length > 0) {
            shippingAddressStore.setShippingAddresses(agency.shippingaddress);
          }
        }
      });
    }
    queryAgencyLoading.value = false;
  }

  function $reset() {
    agencyies.value.clear();
    agencyHomeInfo.value = undefined;
  }

  function setAgencies(agencies: AgencyRead[]) {
    agencies.forEach((agency) => {
      if (agency.id) {
        agencyies.value.set(agency.id, agency);
      }
    });
  }

  return {
    $reset,
    agencyById,
    agencyHomeInfo,
    agencyies,
    agencyList,
    agencyOptions,
    fetchAgency,
    fetchAgencyHomeInfo,
    hideAgency,
    hideAgencyLoading,
    queryAgencyLoading,
    setAgencies,
  };
});
