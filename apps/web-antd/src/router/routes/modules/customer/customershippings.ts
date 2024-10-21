import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
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

    children: [
      {
        name: 'Shippings',
        path: '/shippings',
        component: () => import('#/views/customer/shippings.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:orders',
          title: $t('mysampleshipping'),
        },
      },
    ],
  },
];

export default routes;
