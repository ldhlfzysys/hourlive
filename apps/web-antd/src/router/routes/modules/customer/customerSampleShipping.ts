import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
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

    children: [
      {
        name: 'Sampleshipping',
        path: '/sampleshipping',
        component: () => import('#/views/customer/sampleshipping.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:truck',
          title: $t('sampleshipping'),
        },
      },
    ],
  },
];

export default routes;
