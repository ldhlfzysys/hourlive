import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type { Agency, AgencyHomeInfo, StanderResult } from '#/types';

// Model

async function getAllAgency() {
  return requestClient.get<StanderResult<Agency[]>>(`agency/query`);
}

async function _hideAgency(id: number) {
  return requestClient.post<StanderResult<Agency>>(`agency/hideagency`, { id });
}

async function getAgencyHomeInfo() {
  return requestClient.post<StanderResult<AgencyHomeInfo>>('home/agencyhome');
}

// Store
export const useAgencyStore = defineStore('agency-store', () => {
  const allAgency = ref<Agency[]>([]);
  const agencyOptions = computed(() => {
    return allAgency.value.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  });

  const hideAgencyLoading = ref(false);

  const agencyHomeInfo = ref<AgencyHomeInfo>();

  async function fetchAgencyHomeInfo() {
    const res = await getAgencyHomeInfo();
    agencyHomeInfo.value = res.data;
  }

  function roomsByAgencyIds(ids: number[]) {
    return allAgency.value
      .filter((agency) => ids.includes(agency.id))
      .flatMap((agency) => agency.rooms);
  }

  function roomOptionsByAgencyIds(ids: number[]) {
    return roomsByAgencyIds(ids)?.map((room) => ({
      label: `${room.id.toString()}-${room.name}`,
      value: room.id,
    }));
  }

  async function hideAgency(id: number) {
    hideAgencyLoading.value = true;
    const res = await _hideAgency(id);
    if (res.success) {
      allAgency.value = allAgency.value.filter((agency) => agency.id !== id);
    }
    hideAgencyLoading.value = false;
  }

  async function fetchAgency() {
    const res = await getAllAgency();
    allAgency.value = res.data;
  }

  function agencyById(id: number) {
    return allAgency.value.find((agency) => agency.id === id);
  }

  function $reset() {}
  return {
    $reset,
    agencyById,
    agencyHomeInfo,
    agencyOptions,
    allAgency,
    fetchAgency,
    fetchAgencyHomeInfo,
    hideAgency,
    hideAgencyLoading,
    roomOptionsByAgencyIds,
    roomsByAgencyIds,
  };
});
