<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Modal } from 'ant-design-vue';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

import Empty from '#/components/empty.vue';
import {
  useAgencyStore,
  useOSSFileStore,
  useSampleShippingStore,
  useSampleStore,
} from '#/store';

defineOptions({
  name: 'ShippingSampleModal',
});

const sampleShippingStore = useSampleShippingStore();
const sampleStore = useSampleStore();
const agencyStore = useAgencyStore();
const ossfileStore = useOSSFileStore();

const downloadLoading = ref(false);
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

// 简化导出PDF功能
async function exportToPDF() {
  downloadLoading.value = true;
  const element = document.querySelector('.shipping-detail-content');
  if (!element) {
    downloadLoading.value = false;
    return;
  }

  try {
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

    const customerCode =
      sampleShippingStore.currentSelectedShipping?.customer?.code || '';
    const fileName = `物流单详情-${customerCode}-${sampleShippingStore.currentSelectedShipping!.id}.pdf`;

    const opt = {
      filename: fileName,
      html2canvas: {
        imageTimeout: 0,
        logging: true,
        scale: 2,
        useCORS: true,
        windowHeight: element.scrollHeight,
        windowWidth: element.scrollWidth,
      },
      jsPDF: {
        format: 'a4',
        hotfixes: ['px_scaling'],
        orientation: 'landscape',
        unit: 'px',
      },
      margin: 0,
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    saveAs(pdfBlob, fileName);
  } catch (error) {
    console.error('导出PDF失败:', error);
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
    v-model:open="sampleShippingStore.showShippingSample"
    :body-style="{
      overflowY: 'auto',
      maxHeight: `${maxHeight}px`,
      padding: '16px',
    }"
    :title="$t('shippingsampleinfo')"
    style="top: 10px; width: 85%"
    @cancel="sampleShippingStore.showShippingSample = false"
  >
    <div class="shipping-detail-content">
      <!-- 头部信息 -->
      <div class="mb-4 space-y-2">
        <div class="text-lg font-medium">
          总数量:
          {{
            sampleShippingStore.currentSelectedShipping?.samples?.reduce(
              (sum, item) => sum + (item.sample_count || 1),
              0,
            ) || 0
          }}
        </div>
        <div class="text-base">
          代理商:
          {{
            agencyStore.agencyById(
              sampleShippingStore.currentSelectedShipping?.agency_id!,
            )?.name
          }}
        </div>
        <div class="text-base">
          客户代码:
          {{ sampleShippingStore.currentSelectedShipping?.customer?.code }}
        </div>
      </div>

      <!-- 商品列表 -->
      <div
        v-if="sampleShippingStore.currentSelectedShipping?.samples?.length > 0"
        class="sample-grid"
      >
        <div
          v-for="item in sampleShippingStore.currentSelectedShipping?.samples"
          :key="item.id"
          class="sample-grid-item"
        >
          <div class="image-container">
            <img
              :alt="item.product_id"
              :src="item.product_image"
              class="product-image"
            />
            <div :class="[getTypeClass(item.is_main)]" class="product-type">
              {{ $t(getType(item.is_main)) }}
            </div>
          </div>
          <div class="product-info">
            <div class="product-id">ID: {{ item.product_id }}</div>
            <div class="sample-quantity">
              {{ $t('sample_count') }}:
              <span class="quantity-highlight">{{
                item.sample_count || 1
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <Empty
        v-else
        :loading="sampleStore.sampleQueryLoading"
        description="暂无商品信息"
      />
    </div>

    <template #footer>
      <Button
        :disabled="sampleStore.sampleQueryLoading"
        :loading="downloadLoading"
        type="primary"
        @click="exportToPDF"
      >
        {{ $t('download') }}
      </Button>
    </template>
  </Modal>
</template>

<style scoped>
.shipping-detail-content {
  padding: 16px;
  background: white;
}

.sample-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.sample-grid-item {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.image-container {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 保持1:1的宽高比 */
  background: #f5f5f5;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 8px; /* 添加内边距避免图片贴边 */
  object-fit: contain; /* 保持图片比例 */
}

.product-type {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 8px;
  font-size: 12px;
  color: white;
  backdrop-filter: blur(4px);
  border-radius: 12px;
}

.product-info {
  padding: 4px;
  text-align: center;
  background: #fff;
}

.product-id {
  font-size: 14px;
  color: #666;
}

.sample-quantity {
  font-size: 16px;
  color: #666;
}

.quantity-highlight {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

@media print {
  .sample-grid-item {
    break-inside: avoid; /* 防止在打印时被分页 */
  }

  .product-image {
    -webkit-print-color-adjust: exact; /* 确保打印时保持图片质量 */
    print-color-adjust: exact;
  }
}
</style>
