<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Image, Modal } from 'ant-design-vue';
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
  if (!element) return;

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

    const opt = {
      filename: `物流单详情-${sampleShippingStore.currentSelectedShipping!.id}.pdf`,
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { format: 'a4', orientation: 'landscape' },
      margin: [5, 5, 5, 5],
      pagebreak: {
        mode: ['avoid-all'],
      },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    saveAs(
      pdfBlob,
      `物流单详情-${sampleShippingStore.currentSelectedShipping!.id}.pdf`,
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
    v-model:open="sampleShippingStore.showShippingSample"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    :title="$t('shippingsampleinfo')"
    style="top: 10px; width: 85%"
    @cancel="sampleShippingStore.showShippingSample = false"
  >
    <div class="shipping-detail-content flex h-full flex-1 flex-col">
      <!-- 商品列表 -->
      <div
        v-if="sampleShippingStore.currentSelectedShipping?.samples?.length > 0"
        class="flex h-full flex-1 flex-col"
      >
        <div class="sample-list">
          <div
            v-for="item in sampleShippingStore.currentSelectedShipping?.samples"
            :key="item.id"
            class="sample-item"
          >
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
                    <div class="sample-quantity">
                      {{ $t('sample_count') }}: {{ item.sample_count || 1 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
/* 修改样式部分 */
.sample-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.sample-item {
  width: 100%;
  min-width: unset;
}

.sample-container {
  padding: 8px;
  margin-bottom: 0;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.product-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.product-info {
  display: flex;
  gap: 12px;
  width: 100%;
}

.image-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 4px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-type {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 8px;
  font-size: 10px;
  color: white;
  backdrop-filter: blur(4px);
  border-radius: 12px;
}

.product-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 4px 0;
}

.product-name {
  display: -webkit-box;
  margin-bottom: 4px;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.2;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  word-break: break-all;
  -webkit-box-orient: vertical;
}

.product-id,
.sample-quantity {
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}
</style>
