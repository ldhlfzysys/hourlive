import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:house',
      order: 1,
      title: $t('home'),
    },
    name: 'CustomerHome',
    path: '/home',
    children: [
      {
        component: () => import('#/views/common/home.vue'),
        meta: {
          affixTab: false,
          authority: ['customer'],
          icon: 'lucide:calendar',
          title: $t('home'),
        },
        name: 'CustomerHomeIndex',
        path: '/home',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:package',
      order: 1,
      title: $t('sample'),
    },
    name: 'CustomerSample',
    path: '/customersample',
    children: [
      {
        component: () => import('#/views/customer/sample.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:package',
          title: $t('sample'),
        },
        name: 'CustomerSampleIndex',
        path: '/customersample/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:user-round',
      order: 2,
      title: $t('liveaccount'),
    },
    name: 'CustomerLiveAccount',
    path: '/customerliveaccount',
    children: [
      {
        component: () => import('#/views/customer/liveaccount.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-round',
          title: $t('liveaccount'),
        },
        name: 'CustomerLiveAccountIndex',
        path: '/customerliveaccount/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:truck',
      order: 3,
      title: $t('sampleshipping'),
    },
    name: 'CustomerSampleshipping',
    path: '/customersampleshipping',
    children: [
      {
        component: () => import('#/views/customer/sampleshipping.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:truck',
          title: $t('sampleshipping'),
        },
        name: 'CustomerSampleshippingIndex',
        path: '/customersampleshipping/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:tv-minimal-play',
      order: 4,
      title: $t('content'),
    },
    name: 'CustomerContent',
    path: '/customercontent',
    children: [
      {
        component: () => import('#/views/customer/content.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:tv-minimal-play',
          title: $t('content'),
        },
        name: 'CustomerContentIndex',
        path: '/customercontent/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:arrows-up-from-line',
      order: 5,
      title: $t('mysampleshipping'),
    },
    name: 'CustomerShippings',
    path: '/customershippings',
    children: [
      {
        component: () => import('#/views/customer/shippings.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:orders',
          title: $t('mysampleshipping'),
        },
        name: 'CustomerShippingsIndex',
        path: '/customershippings/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:calendar',
      order: 6,
      title: $t('schedule'),
    },
    name: 'CustomerSchedule',
    path: '/customershcedule',
    children: [
      {
        component: () => import('#/views/common/schedule.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:calendar',
          title: $t('schedule'),
        },
        name: 'CustomerScheduleIndex',
        path: '/customershcedule/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:settings',
      order: 7,
      title: $t('profile'),
    },
    name: 'CustomerProfile',
    path: '/customerprofile',
    children: [
      {
        component: () => import('#/views/customer/profile.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user',
          title: $t('profile'),
        },
        name: 'CustomerProfileIndex',
        path: '/customerprofile/index',
      },
    ],
  },
];

export default routes;
