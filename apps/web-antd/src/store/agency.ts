import { defineStore } from 'pinia';

// Model

// Query

// API
enum AgencyApi {
  AllAgency = 'getallagencies',
}

export const useAgencyStore = defineStore('agency-store', () => {
  function $reset() {}

  return {
    $reset,
  };
});
