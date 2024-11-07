import { ref } from 'vue';

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

export const useAgencyStore = defineStore('agency-store', () => {
  const allAgency = ref<Agency[]>([]);

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
    allAgency,
    fetchAgency,
  };
});
