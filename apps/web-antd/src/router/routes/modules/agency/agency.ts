import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';
import config from '#/router/routes/config';

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
    name: 'CustomerHome',
    path: '/home',

    children: [config.agencyhome],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:podcast',
      order: 4,
      title: $t('hourlivepackage'),
    },
    name: 'AgencySales',
    path: '/sales',
    children: [config.sales],
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
    path: '/agency/sample',
    children: [config.agencySample],
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
    path: '/shippingaddress',
    children: [config.shippingaddress],
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
    path: '/room',
    children: [config.room],
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
    path: '/streamer',
    children: [config.streamer],
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
    name: 'AgencySchedule1',
    path: '/agency',

    children: [config.schedule1],
  },
];

export default routes;
