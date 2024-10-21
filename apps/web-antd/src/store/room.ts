import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type {
  Room,
  RoomCreate,
  RoomDelete,
  RoomUpdate,
  StanderResult,
} from '#/types';

// API
enum RoomApi {
  AllRoom = 'getallrooms',
  CreateRoom = 'createroom',
  DeleteRoom = 'deleteroom',
  UpdateRoom = 'updateRoom',
}

export function getAllRooms() {
  return requestClient.post<StanderResult<Room[]>>(RoomApi.AllRoom);
}

export function createRoom(params: RoomCreate) {
  return requestClient.post<StanderResult<Room>>(RoomApi.CreateRoom, params);
}

export function updateRoom(params: RoomUpdate) {
  return requestClient.post<StanderResult<Room>>(RoomApi.UpdateRoom, params);
}

export function deleteRoom(params: RoomDelete) {
  return requestClient.post<StanderResult<any>>(RoomApi.DeleteRoom, params);
}

export const useRoomStore = defineStore('room-store', () => {
  function $reset() {}

  return {
    $reset,
  };
});
