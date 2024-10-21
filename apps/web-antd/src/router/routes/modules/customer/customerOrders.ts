import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
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

    children: [
      {
        name: 'Orders',
        path: '/orders',
        component: () => import('#/views/customer/orders.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:calendar-days',
          title: $t('sample'),
        },
      },
    ],
  },
];

export default routes;
