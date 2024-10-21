import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
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

    children: [
      {
        name: 'Content',
        path: '/content',
        component: () => import('#/views/customer/content.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:tv-minimal-play',
          title: $t('content'),
        },
      },
    ],
  },
];

export default routes;
