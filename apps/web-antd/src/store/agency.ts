import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type { Agency, StanderResult } from '#/types';

// Model

// API
const API_PREFIX = '/agency';
enum AgencyApi {
  AllAgency = 'query',
}

async function getAllAgency() {
  return requestClient.get<StanderResult<Agency[]>>(
    `${API_PREFIX}/${AgencyApi.AllAgency}`,
  );
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
    agencyOptions,
    allAgency,
    fetchAgency,
    roomOptionsByAgencyIds,
    roomsByAgencyIds,
  };
});
