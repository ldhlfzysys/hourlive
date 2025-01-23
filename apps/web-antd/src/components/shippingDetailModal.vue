<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Image,
  Modal,
} from 'ant-design-vue';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';

import Empty from '#/components/empty.vue';
import {
  useAgencyStore,
  useOSSFileStore,
  useSampleShippingStore,
  useSampleStore,
} from '#/store';

defineOptions({
  name: 'ShippingDetailModal',
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

// 导出PDF功能
async function exportToPDF() {
  downloadLoading.value = true;
  const zip = new JSZip();

  const files = await ossfileStore.listFilesFromIds(
    sampleShippingStore.currentSelectedShipping?.samples?.map(
      (sample) => sample.id!,
    ),
  );

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
      margin: [10, 10, 10, 10],
      pagebreak: {
        before: '.sample-item',
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    zip.file(
      `物流单详情-${sampleShippingStore.currentSelectedShipping!.id}.pdf`,
      pdfBlob,
    );

    // 下载相关文件
    if (files.success && files.data) {
      const sampleIndexMap = new Map(
        sampleStore.sampleList.map((sample, index) => [sample.id, index + 1]),
      );

      for (const [sampleId, fileList] of Object.entries(files.data)) {
        const sampleIndex = sampleIndexMap.get(Number(sampleId));
        if (sampleIndex === undefined) continue;

        const sample = sampleStore.sampleList.find(
          (s) => s.id === Number(sampleId),
        );
        const folderName = `商品${sampleIndex}-${sample?.product_id || '未命名'}`;

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

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(
      zipBlob,
      `物流单${sampleShippingStore.currentSelectedShipping!.id}-完整资料.zip`,
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
    v-model:open="sampleShippingStore.showShippingDetails"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    :title="$t('shippingdetail')"
    style="top: 10px; width: 85%"
    @cancel="sampleShippingStore.showShippingDetails = false"
  >
    <div class="shipping-detail-content flex h-full flex-1 flex-col">
      <Descriptions :column="3" bordered>
        <!-- 物流信息 -->
        <DescriptionsItem :label="$t('express_company')">
          {{ sampleShippingStore.currentSelectedShipping?.express_company }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('tracking_number')">
          {{ sampleShippingStore.currentSelectedShipping?.tracking_number }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('agency')">
          {{
            agencyStore.agencyById(
              sampleShippingStore.currentSelectedShipping?.agency_id!,
            )?.name
          }}
        </DescriptionsItem>

        <!-- 发件人信息 -->
        <DescriptionsItem :label="$t('sender_name')">
          {{ sampleShippingStore.currentSelectedShipping?.sender_name }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sender_time')">
          {{ sampleShippingStore.currentSelectedShipping?.sender_time }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('delivery_approval')">
          <span
            :class="
              sampleShippingStore.currentSelectedShipping?.delivery_approval ===
              '1'
                ? 'text-green-600'
                : 'text-orange-600'
            "
          >
            {{
              sampleShippingStore.currentSelectedShipping?.delivery_approval ===
              '1'
                ? $t('agencyrecived')
                : $t('norecived')
            }}
          </span>
        </DescriptionsItem>

        <!-- 收件人信息 -->
        <DescriptionsItem :label="$t('receiver_name')">
          {{ sampleShippingStore.currentSelectedShipping?.receiver_name }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('receiver_time')">
          {{ sampleShippingStore.currentSelectedShipping?.receiver_time }}
        </DescriptionsItem>
      </Descriptions>

      <!-- 商品列表 -->
      <div
        v-if="sampleShippingStore.currentSelectedShipping?.samples?.length > 0"
        class="flex h-full flex-1 flex-col"
      >
        <br />
        <h1>{{ $t('sample') }}</h1>
        <div class="sample-list">
          <div
            v-for="item in sampleShippingStore.currentSelectedShipping?.samples"
            :key="item.id"
            class="sample-item"
          >
            <!-- 复用相同的商品展示样式 -->
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
                    <div class="sample-remark">
                      {{ $t('sample_mark') }}: {{ item.sample_mark || '-' }}
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
/* 复用相同的样式 */
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

.sample-quantity,
.sample-remark {
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}
</style>
