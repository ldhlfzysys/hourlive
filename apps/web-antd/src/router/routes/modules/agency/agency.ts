import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:house',
      order: 1,
      title: $t('home'),
    },
    name: 'AgencyHome',
    path: '/home',
    children: [
      {
        component: () => import('#/views/agency/home.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:calendar',
          title: $t('home'),
        },
        name: 'AgencyHomeIndex',
        path: '/home/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:arrows-up-from-line',
      order: 5,
      title: $t('agency_shippings'),
    },
    name: 'AgencyShippings',
    path: '/agencyshippings',
    children: [
      {
        component: () => import('#/views/agency/shippings.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:orders',
          title: $t('agency_shippings'),
        },
        name: 'AgencyShippingsIndex',
        path: '/agencyshippings/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:eye',
      order: 6,
      title: $t('store'),
    },
    name: 'AgencySample',
    path: '/agencysample',
    children: [
      {
        component: () => import('#/views/agency/sample.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:eye',
          title: $t('store'),
        },
        name: 'AgencySampleIndex',
        path: '/agencysample/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:truck',
      order: 5,
      title: $t('shipping_address'),
    },
    name: 'AgencyShippingAddress',
    path: '/agencyshippingaddress',
    children: [
      {
        component: () => import('#/views/agency/shipppingaddress.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:map-pin',
          title: $t('shipping_address'),
        },
        name: 'AgencyShippingAddressIndex',
        path: '/agencyshippingaddress/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:video',
      order: 3,
      title: $t('room'),
    },
    name: 'AgencyRoom',
    path: '/agencyroom',
    children: [
      {
        component: () => import('#/views/agency/room.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:video',
          title: $t('room'),
        },
        name: 'AgencyRoomIndex',
        path: '/agencyroom/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:users',
      order: 2,
      title: $t('teammanagement'),
    },
    name: 'AgencyStreamer',
    path: '/agencystreamer',
    children: [
      {
        component: () => import('#/views/agency/streamer.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('teammanagement'),
        },
        name: 'AgencyStreamerIndex',
        path: '/agencystreamer/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:calendar',
      order: 7,
      title: $t('schedule'),
    },
    name: 'AgencySchedule',
    path: '/agencyschedule',
    children: [
      {
        component: () => import('#/views/common/schedule.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:calendar',
          title: $t('schedule'),
        },
        name: 'AgencyScheduleIndex',
        path: '/agencyschedule/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:settings',
      order: 8,
      title: $t('profile'),
    },
    name: 'agencyProfile',
    path: '/agencyprofile',
    children: [
      {
        component: () => import('#/views/customer/profile.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user',
          title: $t('profile'),
        },
        name: 'AgencyProfileIndex',
        path: '/agencyprofile/index',
      },
    ],
  },
];

export default routes;
