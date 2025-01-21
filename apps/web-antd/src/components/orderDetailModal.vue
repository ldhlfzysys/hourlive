<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { AccessControl, useAccess } from '@vben/access';
import { SvgShopeeIcon, SvgTiktokIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Image,
  Modal,
  Tag,
} from 'ant-design-vue';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';

import Empty from '#/components/empty.vue';
import OrderApendModal from '#/components/orderApendModal.vue';
import OSSFileForm from '#/components/ossfileform.vue';
import SampleKspForm from '#/components/samplekspform.vue';
import SubsidyForm from '#/components/subsidyform.vue';
import {
  useAgencyStore,
  useOSSFileStore,
  useSampleStore,
  useTimeslotOrderStore,
} from '#/store';

defineOptions({
  name: 'OrderDetailModal',
});

const orderStore = useTimeslotOrderStore();
const sampleStore = useSampleStore();
const agencyStore = useAgencyStore();
const ossfileStore = useOSSFileStore();

const { hasAccessByRoles } = useAccess();

const itemWidth = ref(300);
const loading = ref(false);
const downloadLoading = ref(false);

// const maxHeight = computed(() => {
//   return window.innerHeight * 0.8;
// });
const maxHeight = ref(window.innerHeight * 0.85);
const updateMaxHeight = () => {
  maxHeight.value = window.innerHeight * 0.85;
};
onMounted(() => {
  window.addEventListener('resize', updateMaxHeight);
  sampleStore.sampleQuery.ids =
    orderStore.currentSelectedOrder?.contents.flatMap((content) =>
      content.samples.flatMap((sample) => sample.id),
    );
  sampleStore.querySampleFromIds();
});
onUnmounted(() => {
  window.removeEventListener('resize', updateMaxHeight);
});

const orderSamples = computed(() => {
  const ids = orderStore.currentSelectedOrder?.contents.flatMap((content) =>
    content.samples.flatMap((sample) => sample.id),
  );
  return sampleStore.sampleList.filter((sample) => ids.includes(sample.id));
});

const liveaccount = computed(() => {
  return orderStore.currentSelectedOrder?.contents[0]?.liveaccount;
});

const contentInfo = computed(() => {
  const content = orderStore.currentSelectedOrder?.contents[0];
  return {
    content_link: content?.content_link,
    content_text: content?.content_text,
    customer_id: content?.customer_id,
  };
});

async function handleDeleteOrder() {
  Modal.confirm({
    onOk: async () => {
      loading.value = true;
      await orderStore.deleteOrders({
        timeslot_ids: [orderStore.currentSelectedOrder!.slotId!],
        timeslotorder_id: orderStore.currentSelectedOrder!.id!,
      });
      loading.value = false;
    },
    title: $t('confirmdelete'),
  });
}

async function handleCancelOrder() {
  Modal.confirm({
    onOk: async () => {
      loading.value = true;
      await orderStore.deleteOrders({
        timeslot_ids: orderStore.currentSelectedOrder!.timeslots.map(
          (timeslot) => timeslot.id,
        ),
        timeslotorder_id: orderStore.currentSelectedOrder!.id!,
      });
      loading.value = false;
    },
    title: $t('deleteallorder'),
  });
}

function handleSubsidy() {
  orderStore.showSubsidyModal = true;
  orderStore.timeslotOrderSubsidyForm.ids = [
    orderStore.currentSelectedOrder!.id!,
  ];
  orderStore.timeslotOrderSubsidyForm.timeslotorder_id =
    orderStore.currentSelectedOrder!.id!;
  orderStore.timeslotOrderSubsidyForm.subsidy_type =
    orderStore.currentSelectedOrder!.subsidy_type;
  orderStore.timeslotOrderSubsidyForm.ads_subsidy =
    orderStore.currentSelectedOrder!.ads_subsidy;
  orderStore.timeslotOrderSubsidyForm.tts_subsidy =
    orderStore.currentSelectedOrder!.tts_subsidy;
  orderStore.timeslotOrderSubsidyForm.ads_subsidy_remark =
    orderStore.currentSelectedOrder!.ads_subsidy_remark;
  orderStore.timeslotOrderSubsidyForm.tts_subsidy_remark =
    orderStore.currentSelectedOrder!.tts_subsidy_remark;
}

const subsidyTypeText = computed(() => {
  const type = Number(orderStore.currentSelectedOrder?.subsidy_type);
  switch (type) {
    case 1: {
      return $t('ads_subsidy');
    }
    case 2: {
      return $t('tts_subsidy');
    }
    default: {
      return $t('subsidy_type');
    }
  }
});

async function exportToPDF() {
  downloadLoading.value = true;
  const zip = new JSZip();

  // 获取订单里商品脚本文件路径
  // files结构为：{sample_id:[{name,path}]}
  const files = await ossfileStore.listFilesFromIds(
    orderSamples.value.map((sample) => sample.id!),
  );

  // 创建PDF
  const element = document.querySelector('.order-detail-content');
  if (!element) return;

  // 临时调整样式以确保内容完整显示
  // const originalStyle = element.style.cssText;
  // element.style.width = '1000px';
  // element.style.maxHeight = 'none';
  // element.style.margin = '0 auto';
  // element.style.padding = '20px';

  try {
    // 等待图片加载
    await Promise.all(
      [...element.querySelectorAll('img')].map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null);
            else {
              img.addEventListener('load', () => resolve(null));
              img.addEventListener('error', () => resolve(null));
            }
          }),
      ),
    );

    const opt = {
      filename: `订单详情-${orderStore.currentSelectedOrder!.id}-${liveaccount.value?.name}-${liveaccount.value?.code}.pdf`,
      html2canvas: {
        logging: true,
        scale: 1.5,
        useCORS: true,
      },
      image: { quality: 0.98, type: 'jpeg' },
      jsPDF: {
        format: 'a4',
        orientation: 'landscape',
        unit: 'mm',
      },
      margin: [10, 10, 10, 10],
      pagebreak: {
        before: '.sample-item',
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    // 生成PDF并添加到zip
    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    zip.file(
      `订单详情-${orderStore.currentSelectedOrder!.id}-${liveaccount.value?.name}-${liveaccount.value?.code}.pdf`,
      pdfBlob,
    );

    // 下载额外文件并按商品编号组织
    if (files.success && files.data) {
      // 创建sample_id到序号的映射
      const sampleIndexMap = new Map(
        sampleStore.sampleList.map((sample, index) => [sample.id, index + 1]),
      );

      // 按sample_id分组处理文件
      for (const [sampleId, fileList] of Object.entries(files.data)) {
        // 获取商品在列表中的序号
        const sampleIndex = sampleIndexMap.get(Number(sampleId));
        if (sampleIndex === undefined) continue;

        // 获取商品信息
        const sample = sampleStore.sampleList.find(
          (s) => s.id === Number(sampleId),
        );
        const folderName = `商品${sampleIndex}-${sample?.product_id || '未命名'}`;

        // 下载该商品的所有文件并放入对应文件夹
        for (const file of fileList) {
          try {
            const response = await fetch(file.path);
            const fileBlob = await response.blob();
            zip.file(`${folderName}/${file.name}`, fileBlob);
          } catch (error) {
            console.error(`下载文件失败: ${folderName}/${file.name}`, error);
          }
        }
      }
    }

    // 下载客户头像（如果存在）
    console.log('下载客户头像');
    console.log(orderStore.currentSelectedOrder?.customer);
    const customerAvatar =
      orderStore.currentSelectedOrder?.customer?.user.avatar;
    if (customerAvatar) {
      try {
        const response = await fetch(customerAvatar);
        const avatarBlob = await response.blob();
        zip.file('customer-brand.png', avatarBlob);
      } catch (error) {
        console.error('下载客户头像失败:', error);
      }
    }

    // 生成并下载zip文件
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(
      zipBlob,
      `订单${orderStore.currentSelectedOrder!.id}-${liveaccount.value?.name}-${liveaccount.value?.code}-完整资料.zip`,
    );
  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    downloadLoading.value = false;
  }
}

const getType = (isMain: string) => {
  switch (isMain) {
    case '0': {
      return 'sample_welfare';
    }
    case '1': {
      return 'sample_main';
    }
    case '2': {
      return 'sample_deal';
    }
    case '3': {
      return 'sample_normal';
    }
    case '4': {
      return 'sample_new';
    }
    default: {
      return '';
    }
  }
};

const getTypeClass = (isMain: string) => {
  return isMain === '1' ? 'bg-red-500/60' : 'bg-black/60';
};
</script>

<template>
  <Modal
    v-model:open="orderStore.showEventDetails"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    :title="$t('orderdetail')"
    style="top: 10px; width: 85%"
    @cancel="orderStore.showEventDetails = false"
  >
    <div class="order-detail-content flex h-full flex-1 flex-col">
      <Descriptions :column="3" bordered>
        <DescriptionsItem :label="$t('timeslotorder_id')">
          {{ orderStore.currentSelectedOrder!.id }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('timeslot')">
          {{ orderStore.currentSelectedOrder!.start }} -
          {{ orderStore.currentSelectedOrder!.end }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('agency')">
          {{
            agencyStore.agencyById(orderStore.currentSelectedOrder!.agency_id)
              ?.name
          }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('customer')">
          ({{ orderStore.currentSelectedOrder!.customer?.id }}){{
            orderStore.currentSelectedOrder!.customer?.code
          }}
        </DescriptionsItem>

        <DescriptionsItem :label="$t('content')">
          {{ orderStore.currentSelectedOrder!.contents[0]?.id }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('brand_logo')">
          <img
            :src="orderStore.currentSelectedOrder!.customer?.user.avatar"
            alt="brand logo"
            class="customer-avatar h-8 w-8 rounded-full object-cover"
          />
        </DescriptionsItem>

        <DescriptionsItem :label="$t('subsidy')" :span="3">
          <div class="flex flex-col gap-2">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <strong>{{ $t('tts_subsidy') }}: </strong>
                <span class="ml-1 text-red-500"
                  >${{ orderStore.currentSelectedOrder!.tts_subsidy }}</span
                >
              </div>
              <div class="flex items-center">
                <strong>{{ $t('ads_subsidy') }}: </strong>
                <span class="ml-1 text-red-500"
                  >${{ orderStore.currentSelectedOrder!.ads_subsidy }}</span
                >
              </div>
              <div class="flex items-center">
                <strong>{{ $t('tts_subsidy_remark') }}: </strong>
                {{ orderStore.currentSelectedOrder!.tts_subsidy_remark }}
              </div>
              <div class="flex items-center">
                <strong>{{ $t('ads_subsidy_remark') }}: </strong>
                {{ orderStore.currentSelectedOrder!.ads_subsidy_remark }}
              </div>
            </div>
          </div>
        </DescriptionsItem>

        <DescriptionsItem :label="$t('content_text')" :span="3">
          <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
            <div
              v-for="[key, value] in Object.entries(contentInfo)"
              :key="key"
              class="flex items-center"
            >
              <strong>{{ $t(key) }}: </strong>
              <div class="ml-2" v-html="value"></div>
            </div>
          </div>
        </DescriptionsItem>

        <DescriptionsItem :label="$t('content_desc')" :span="3">
          <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
            <div class="flex items-center">
              <div
                class="ml-2"
                v-html="
                  orderStore.currentSelectedOrder?.contents[0].content_desc
                "
              ></div>
            </div>
          </div>
        </DescriptionsItem>

        <DescriptionsItem :label="$t('liveaccount')" :span="3">
          <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
            <div class="flex items-center">
              <strong>{{ $t('live_account') }}: </strong>
              <div class="ml-2">{{ liveaccount?.live_account }}</div>
            </div>
            <div class="flex items-center">
              <strong>{{ $t('live_uid') }}: </strong>
              <div class="ml-2">{{ liveaccount?.live_uid }}</div>
            </div>
            <div class="flex items-center">
              <strong>{{ $t('platform_name') }}: </strong>
              <div class="ml-2">{{ liveaccount?.platform_account }}</div>
            </div>
            <div class="flex items-center">
              <strong>{{ $t('livephone') }}: </strong>
              <div class="ml-2">{{ liveaccount?.mobile }}</div>
            </div>
            <div v-if="liveaccount?.email" class="flex items-center">
              <strong>{{ $t('liveemail') }}: </strong>
              <div class="ml-2">{{ liveaccount?.email }}</div>
            </div>
            <div class="flex items-center">
              <strong>{{ $t('platform') }}: </strong>
              <div class="ml-2">
                <SvgTiktokIcon
                  v-if="liveaccount?.platform === 'tiktok'"
                  class="size-8"
                />
                <SvgShopeeIcon
                  v-else-if="liveaccount?.platform === 'shopee'"
                  class="size-8"
                />
                <Tag v-else>
                  {{ liveaccount?.platform }}
                </Tag>
              </div>
            </div>
          </div>
        </DescriptionsItem>
      </Descriptions>

      <div v-if="orderSamples.length > 0" class="flex h-full flex-1 flex-col">
        <br />
        <h1>{{ $t('sample') }}</h1>
        <div class="sample-list">
          <div v-for="item in orderSamples" :key="item.id" class="sample-item">
            <div class="sample-container">
              <div class="product-wrapper">
                <div class="product-info">
                  <div class="image-wrapper">
                    <Image
                      :alt="item.product_name"
                      :src="item.product_image"
                      class="product-image"
                    />
                    <div
                      :class="[getTypeClass(item.is_main)]"
                      class="product-type"
                    >
                      {{ $t(getType(item.is_main)) }}
                    </div>
                  </div>

                  <div class="product-details">
                    <h2 class="product-name">
                      <a
                        :href="item.product_link"
                        class="hover:text-blue-600"
                        target="_blank"
                      >
                        {{ item.product_name }}
                      </a>
                    </h2>
                    <div class="product-id">ID: {{ item.product_id }}</div>

                    <div class="price-info">
                      <span class="final-price">{{
                        item.product_final_price
                      }}</span>
                      <span class="original-price">{{ item.product_srp }}</span>
                      <span class="discount">{{ item.product_discount }}</span>
                    </div>
                  </div>
                </div>

                <div class="content-sections">
                  <div class="section">
                    <h3>{{ $t('product_ksp') }}</h3>
                    <div
                      class="section-content"
                      v-html="item.product_ksp || $t('no_product_ksp')"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <OSSFileForm />
        <SampleKspForm />
      </div>

      <Empty
        v-else
        :loading="sampleStore.sampleQueryLoading"
        class="flex-1"
        description="暂无商品信息"
      />
    </div>

    <template #footer>
      <Button
        key="download"
        :loading="orderStore.timeslotOrderSubsidyLoading"
        type="primary"
        @click="handleSubsidy"
      >
        {{ $t('subsidy') }}
      </Button>
      <Button
        key="download"
        :disabled="sampleStore.sampleQueryLoading || orderStore.downloadLoading"
        :loading="downloadLoading"
        type="primary"
        @click="exportToPDF"
      >
        {{ $t('download') }}
      </Button>
      <AccessControl :codes="['super']">
        <Button
          key="submit"
          type="primary"
          @click="orderStore.showApendModal = true"
        >
          {{ $t('apendorder') }}
        </Button>
        <Button
          key="submit"
          :loading="loading"
          type="primary"
          @click="handleCancelOrder"
        >
          {{ $t('deleteall') }}
        </Button>
        <Button
          key="submit"
          :loading="loading"
          type="primary"
          @click="handleDeleteOrder"
        >
          {{ $t('delete') }}
        </Button>
      </AccessControl>
    </template>
  </Modal>
  <OrderApendModal v-if="orderStore.showApendModal" />
  <SubsidyForm />
</template>

<style scoped>
.grid {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.sample-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}

.sample-item {
  width: 100%;
}

.sample-container {
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.product-wrapper {
  display: flex;
  gap: 24px;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 16px;
  width: 20%;
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 8px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-type {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  font-size: 12px;
  color: white;
  backdrop-filter: blur(4px);
  border-radius: 16px;
}

.product-details {
  padding: 8px 0;
}

.product-name {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #333;
}

.product-id {
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.final-price {
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.discount {
  display: inline-block;
  width: fit-content;
  padding: 2px 8px;
  font-size: 12px;
  color: #ff4d4f;
  background: #fff1f0;
  border-radius: 4px;
}

.content-sections {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}

.section {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.section h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-content {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
}

.section-content:empty {
  font-style: italic;
  color: #999;
}

.customer-avatar {
  width: auto;
  height: 2rem;
  max-height: 2rem;
  object-fit: contain;
  border-radius: 9999px;
}
</style>
