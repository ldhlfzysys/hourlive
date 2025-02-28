import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  BaseQuery,
  HardwareUpdate,
  RoomRead,
  RoomUpdate,
  StandardResponse,
} from '#/types';

// network requests
async function _getAllRooms(params?: BaseQuery) {
  return requestClient.post<StandardResponse<RoomRead[]>>('room/query', params);
}

async function _newRoom(params: RoomUpdate) {
  return requestClient.post<StandardResponse<RoomRead>>('room/create', params);
}

async function _updateRoom(params: RoomUpdate) {
  return requestClient.post<StandardResponse<RoomRead>>('room/update', params);
}

async function _deleteRoom(roomId: number) {
  return requestClient.post<StandardResponse<null>>('room/delete', {
    id: roomId,
  });
}

async function _addHardwareToRoom(params: HardwareUpdate) {
  return requestClient.post<StandardResponse<null>>(
    'room/create_hardware_to_room',
    params,
  );
}

async function _deleteHardwareFromRoom(params: BaseQuery) {
  return requestClient.post<StandardResponse<null>>(
    'room/delete_hardware',
    params,
  );
}

// async function _queryHardware(roomId: number) {
//   return requestClient.post<StandardResponse<HardwareRead[]>>(
//     'room/query_hardware',
//     {
//       room_id: roomId,
//     },
//   );
// }

// async function _updateHardware(hardware: HardwareUpdate) {
//   return requestClient.post<StandardResponse<HardwareRead>>(
//     'room/update_hardware',
//     hardware,
//   );
// }

// store
export const useRoomStore = defineStore('room-store', () => {
  // data
  const rooms = ref<Map<number, RoomRead>>(new Map());
  const roomUpdate = ref<RoomUpdate>({});
  const hardwareCreate = ref<HardwareUpdate>({ name: '' });

  const roomList = computed(() => {
    return [...rooms.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, room]) => room);
  });

  // UI - loading
  const roomLoading = ref(false);
  const roomCreateLoading = ref(false);
  const roomUpdateLoading = ref(false);

  // UI - modal
  const showModal = ref(false);
  const showRoomDescModal = ref(false);

  const roomQuery = ref<BaseQuery>({
    agency_id: -1,
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  function $reset() {
    roomLoading.value = false;
    roomCreateLoading.value = false;
    roomQuery.value = {
      agency_id: -1,
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
    rooms.value.clear();
  }

  async function queryRoom() {
    try {
      roomLoading.value = true;
      const res = await _getAllRooms(roomQuery.value);
      if (res && res.success) {
        if (res.data && res.data.length > 0) {
          const lastRoom = res.data.at(-1);
          if (lastRoom) {
            roomQuery.value.q_id = lastRoom.id;
          }
        }
        res.data?.forEach((room) => {
          if (room.id) {
            rooms.value.set(room.id, room);
          }
        });
      }
    } finally {
      roomLoading.value = false;
    }
  }

  async function createRoom() {
    try {
      if (!roomUpdate.value.name) {
        notification.error({
          description: $t('请输入直播间名称'),
          message: $t('验证失败'),
        });
        return;
      }
      roomCreateLoading.value = true;

      const res = await _newRoom(roomUpdate.value);
      if (res && res.success && res.data && res.data.id) {
        rooms.value.set(res.data.id, res.data);
        showModal.value = false;
        roomUpdate.value = {
          id: -1,
          name: '',
        };
        notification.success({
          description: $t('新增直播间成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      roomCreateLoading.value = false;
    }
  }

  async function makeRoomUpdate(id: number) {
    const room = rooms.value.get(id);
    if (room) {
      roomUpdate.value = room;
    }
  }

  async function modifyRoom() {
    try {
      roomLoading.value = true;
      roomUpdateLoading.value = true;
      const res = await _updateRoom(roomUpdate.value);
      if (res && res.success && res.data && res.data.id) {
        const existingRoom = rooms.value.get(res.data.id);
        const updatedRoom = {
          ...existingRoom,
          desc: res.data.desc,
          name: res.data.name,
        };
        rooms.value.set(res.data.id, updatedRoom);
        showModal.value = false;
        showRoomDescModal.value = false;
        notification.success({
          description: $t('修改直播间成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      roomLoading.value = false;
      roomUpdateLoading.value = false;
    }
  }

  async function removeRoom(roomId: number) {
    try {
      roomLoading.value = true;
      const res = await _deleteRoom(roomId);
      if (res && res.success) {
        rooms.value.delete(roomId);
        notification.success({
          description: $t('删除直播间成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('deletefail'),
        });
      }
    } finally {
      roomLoading.value = false;
    }
  }

  async function deleteHardwareFromRoom(params: BaseQuery, roomId: number) {
    try {
      const res = await _deleteHardwareFromRoom(params);
      if (res && res.success) {
        const room = rooms.value.get(roomId);
        if (room) {
          const updatedHardwares = room.hardwares?.filter(
            (hardware) => hardware.id !== params.id,
          );
          const updatedRoom = {
            ...room,
            hardwares: updatedHardwares,
          };
          rooms.value.set(roomId, updatedRoom);
        }
      }
    } catch (error) {
      console.error('删除硬件从房间失败:', error);
      notification.error({
        description: '删除硬件从房间失败',
        message: $t('删除失败'),
      });
    }
  }

  async function createHardwareToRoom(params: HardwareUpdate) {
    try {
      const res = await _addHardwareToRoom(params);
      if (res && res.success && res.data && params.room_id) {
        const room = rooms.value.get(params.room_id);
        if (room) {
          room.hardwares?.push(res.data);
        }
        notification.success({
          description: $t('添加硬件成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('添加失败'),
        });
      }
    } catch (error) {
      console.error('添加硬件到房间失败:', error);
      notification.error({
        description: '添加硬件到房间失败',
        message: $t('添加失败'),
      });
    }
  }

  function setRooms(rs: RoomRead[]) {
    rs.forEach((r) => {
      if (r.id) {
        rooms.value.set(r.id, r);
      }
    });
  }

  return {
    $reset,
    createHardwareToRoom,
    createRoom,
    deleteHardwareFromRoom,
    hardwareCreate,
    makeRoomUpdate,
    modifyRoom,
    queryRoom,
    removeRoom,
    roomCreateLoading,
    roomList,
    roomLoading,
    roomQuery,
    rooms,
    roomUpdate,
    roomUpdateLoading,
    setRooms,
    showModal,
    showRoomDescModal,
  };
});
