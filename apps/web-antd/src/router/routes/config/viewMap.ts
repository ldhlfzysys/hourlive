import { $t } from '#/locales';

const viewMap = {
  agencyhome: {
    component: () => import('#/views/agency/home.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar',
      title: $t('home'),
    },
    name: 'Home',
    path: '/home',
  },
  agencySample: {
    component: () => import('#/views/agency/sample.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'AgencySample',
    path: '/agency/sample',
  },
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
  customerhome: {
    component: () => import('#/views/customer/home.vue'),
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
  profile: {
    component: () => import('#/views/customer/profile.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:user',
      title: $t('个人中心'),
    },
    name: 'Profile',
    path: '/profile',
  },
  room: {
    component: () => import('#/views/agency/room.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:video',
      title: $t('room'),
    },
    name: 'Room',
    path: '/room',
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

  streamer: {
    component: () => import('#/views/agency/streamer.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:users',
      title: $t('teammanagement'),
    },
    name: 'Streamer',
    path: '/streamer',
  },
  superhome: {
    component: () => import('#/views/super/home.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar',
      title: $t('home'),
    },
    name: 'Home',
    path: '/home',
  },
};

export default viewMap;
