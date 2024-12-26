<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { AccessControl } from '@vben/access';
import { SvgShopeeIcon, SvgTiktokIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Modal,
  Tag,
} from 'ant-design-vue';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';

import Empty from '#/components/empty.vue';
import OrderApendModal from '#/components/orderApendModal.vue';
import OSSFileForm from '#/components/ossfileform.vue';
import SampleCard from '#/components/samplecard.vue';
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

const itemWidth = ref(300);
const loading = ref(false);

// const maxHeight = computed(() => {
//   return window.innerHeight * 0.8;
// });
const maxHeight = ref(window.innerHeight * 0.85);
const updateMaxHeight = () => {
  maxHeight.value = window.innerHeight * 0.85;
};
onMounted(() => {
  window.addEventListener('resize', updateMaxHeight);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateMaxHeight);
});

const liveAccountInfo = computed(() => {
  const liveAccount = orderStore.currentSelectedOrder?.contents[0]?.liveaccount;
  return {
    code: liveAccount?.code,
    customer_id: liveAccount?.customer_id,
    live_account: liveAccount?.live_account,
    live_uid: liveAccount?.live_uid,
    liveaccount_id: liveAccount?.id,
    mobile: liveAccount?.mobile,
    name: liveAccount?.name,
    platform: liveAccount?.platform,
  };
});

const contentInfo = computed(() => {
  const content = orderStore.currentSelectedOrder?.contents[0];
  return {
    content_desc: content?.content_desc,
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
  const zip = new JSZip();

  // 获取订单里商品脚本文件路径
  // files结构为：{sample_id:[{name,path}]}
  const files = await ossfileStore.fetchFileFromOrder(
    orderStore.currentSelectedOrder!.id!,
  );

  // 创建PDF
  const element = document.querySelector('.order-detail-content');
  if (!element) return;

  // 临时调整样式以确保内容完整显示
  const originalStyle = element.style.cssText;
  element.style.width = '1000px';
  element.style.maxHeight = 'none';
  element.style.margin = '0 auto';
  element.style.padding = '20px';

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
      filename: `订单详情-${orderStore.currentSelectedOrder!.id}.pdf`,
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
    zip.file(`订单详情-${orderStore.currentSelectedOrder!.id}.pdf`, pdfBlob);

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

    // 生成并下载zip文件
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `订单${orderStore.currentSelectedOrder!.id}-完整资料.zip`);
  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    // 恢复原始样式
    element.style.cssText = originalStyle;
  }
}
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
        <DescriptionsItem :label="$t('id')">
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
          {{ orderStore.currentSelectedOrder!.customer?.code }}
        </DescriptionsItem>

        <DescriptionsItem :label="$t('content')" :span="3">
          {{ orderStore.currentSelectedOrder!.contents[0]?.id }}
        </DescriptionsItem>

        <DescriptionsItem :label="$t('subsidy')" :span="3">
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
              <strong>{{ $t('tts_subsidy_remark') }}: </strong
              >{{ orderStore.currentSelectedOrder!.tts_subsidy_remark }}
            </div>
            <div class="flex items-center">
              <strong>{{ $t('ads_subsidy_remark') }}: </strong
              >{{ orderStore.currentSelectedOrder!.ads_subsidy_remark }}
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

        <DescriptionsItem :label="$t('liveaccount')" :span="3">
          <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
            <div
              v-for="[key, value] in Object.entries(liveAccountInfo)"
              :key="key"
              class="flex items-center"
            >
              <strong>{{ $t(key) }}: </strong>
              <div v-if="key === 'platform'" class="ml-2">
                <SvgTiktokIcon
                  v-if="value?.toString().toLowerCase() === 'tiktok'"
                  class="size-8"
                />
                <SvgShopeeIcon
                  v-else-if="value?.toString().toLowerCase() === 'shopee'"
                  class="size-8"
                />
                <Tag v-else>
                  {{ value }}
                </Tag>
              </div>
              <div v-else class="ml-2" v-html="value"></div>
            </div>
          </div>
        </DescriptionsItem>
      </Descriptions>

      <div
        v-if="sampleStore.sampleList.length > 0"
        class="flex h-full flex-1 flex-col"
      >
        <br />
        <h1>{{ $t('sample') }}</h1>
        <div class="sample-list">
          <div
            v-for="(item, index) in sampleStore.sampleList"
            :key="item.id"
            class="sample-item"
          >
            <div class="sample-container">
              <div class="sample-number-wrapper">
                <div class="sample-number">{{ index + 1 }}</div>
              </div>
              <div class="sample-content">
                <SampleCard :sample="item" />
                <div class="sample-selling-points">
                  <h3>{{ $t('product_ksp') }}</h3>
                  <div
                    class="selling-points-content"
                    v-html="item.product_ksp || $t('no_product_ksp')"
                  ></div>
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
        :loading="orderStore.downloadLoading"
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
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.sample-number-wrapper {
  padding-top: 90px;
}

.sample-number {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #1890ff;
  border-radius: 50%;
}

.sample-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}

.sample-selling-points {
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #e8e8e8;
}

.sample-selling-points h3 {
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
}

.selling-points-content {
  line-height: 1.5;
  color: #666;
}

/* 确保 HTML 内容中的样式正确显示 */
.selling-points-content :deep(p) {
  margin-bottom: 8px;
}

.selling-points-content :deep(ul),
.selling-points-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

.selling-points-content :deep(li) {
  margin-bottom: 4px;
}
</style>
