import { $t } from '#/locales';

const viewMap = {
  content: {
    component: () => import('#/views/customer/content.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:tv-minimal-play',
      title: $t('content'),
    },
    name: 'Content',
    path: '/content',
  },
  home: {
    component: () => import('#/views/common/home.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar',
      title: $t('home'),
    },
    name: 'Home',
    path: '/home',
  },
  liveaccount: {
    component: () => import('#/views/customer/liveaccount.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:user-round',
      title: $t('liveaccount'),
    },
    name: 'CustomerLiveAccount',
    path: '/liveaccount',
  },
  orders: {
    component: () => import('#/views/customer/orders.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar-days',
      title: $t('sample'),
    },
    name: 'Orders',
    path: '/orders',
  },
  sales: {
    component: () => import('#/views/agency/sales.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'Sales',
    path: '/sales',
  },
  sample: {
    component: () => import('#/views/customer/sample.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'Sample',
    path: '/sample',
  },
  sampleshipping: {
    component: () => import('#/views/customer/sampleshipping.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:truck',
      title: $t('sampleshipping'),
    },
    name: 'Sampleshipping',
    path: '/sampleshipping',
  },
  schedule: {
    component: () => import('#/views/common/schedule.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar',
      // title: $t('schedule'),
      title: 'schedule-x',
    },
    name: 'Schedule',
    path: '/schedule',
  },
  schedule1: {
    component: () => import('#/views/common/schedule1.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar',
      // title: $t('schedule'),
      title: 'vue-cal',
    },
    name: 'Schedule1',
    path: '/schedule1',
  },
  shippingaddress: {
    component: () => import('#/views/agency/shipppingaddress.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:map-pin',
      title: $t('shippingaddress'),
    },
    name: 'ShippingAddress',
    path: '/shippingaddress',
  },

  shippings: {
    component: () => import('#/views/customer/shippings.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:orders',
      title: $t('mysampleshipping'),
    },
    name: 'Shippings',
    path: '/shippings',
  },
};

export default viewMap;
