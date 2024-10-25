import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';
import config from '#/router/routes/config';

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

    children: [config.home],
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
    path: '/sample',

    children: [config.sample],
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
    path: '/liveaccount',

    children: [config.liveaccount],
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
    path: '/sampleshipping',

    children: [config.sampleshipping],
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
    path: '/content',

    children: [config.content],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:orders',
      order: 5,
      title: $t('mysampleshipping'),
    },
    name: 'CustomerShippings',
    path: '/shippings',

    children: [config.shippings],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:calendar-days',
      order: 6,
      title: $t('sample'),
    },
    name: 'CustomerOrders',
    path: '/orders',

    children: [config.orders],
  },
];

export default routes;
