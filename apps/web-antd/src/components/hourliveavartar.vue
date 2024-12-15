<script lang="ts" setup>
import { Avatar, AvatarGroup } from 'ant-design-vue';

import defaultAvatar from '#/assets/images/default-avatar.png';

defineOptions({
  name: 'HourLiveAvatar',
});

withDefaults(
  defineProps<{
    avatars: Array<string>;
  }>(),
  {
    avatars: () => [],
  },
);

const size = 60;
</script>

<template>
  <div v-if="avatars.length > 0">
    <AvatarGroup v-if="avatars.length > 1" :max-count="2" :size="size">
      <Avatar
        v-for="(avatar, index) in avatars"
        :key="index"
        :size="size"
        :src="avatar"
      />
    </AvatarGroup>
    <Avatar v-else :size="size" :src="avatars[0]" />
  </div>
  <div v-else>
    <Avatar :size="size" :src="defaultAvatar" />
  </div>
</template>

<style scoped></style>
