<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

import { Button, Select, SelectOption } from 'ant-design-vue';

import { useCustomerStore, useOSSFileStore, useSampleStore } from '#/store';
// @ts-ignore

import { $t } from '@vben/locales';

import { useElementBounding } from '@vueuse/core';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';

import Empty from '#/components/empty.vue';
import OSSFileForm from '#/components/ossfileform.vue';
import SampleCard from '#/components/samplecard.vue';
import SampleKspForm from '#/components/samplekspform.vue';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const sampleStore = useSampleStore();
const customerStore = useCustomerStore();
const ossfileStore = useOSSFileStore();
const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

const itemWidth = ref(300);
const scroller = ref();
function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
}

const selectedNames = ref([]);
const selectedItems = ref([]);

watch(
  selectedNames,
  (newValue) => {
    console.log('xxxxx', newValue);
  },
  { deep: true },
);

watch(
  selectedItems,
  (newValue) => {
    console.log('222', newValue);
  },
  { deep: true },
);

onMounted(() => {
  sampleStore.querySample();
  customerStore.getAgencyCustomers();
});

function onTop() {}

const isLoadingMore = ref(false);

async function onBottom() {
  if (isLoadingMore.value || sampleStore.sampleQueryLoading) return;

  isLoadingMore.value = true;
  try {
    await sampleStore.querySample();
  } finally {
    isLoadingMore.value = false;
  }
}

function onUpdate(
  viewStartIndex: number,
  viewEndIndex: number,
  visibleStartIndex: number,
  visibleEndIndex: number,
) {
  updateParts.value.viewStartIdx = viewStartIndex;
  updateParts.value.viewEndIdx = viewEndIndex;
  updateParts.value.visibleStartIdx = visibleStartIndex;
  updateParts.value.visibleEndIdx = visibleEndIndex;
}

function onCustomerChange(value: any) {
  sampleStore.$reset();

  sampleStore.sampleQuery.customer_id = value;
  sampleStore.querySample();
}

async function exportToPDF() {
  const zip = new JSZip();

  // 获取选中商品的文件
  const files = await ossfileStore.listFilesFromIds(
    sampleStore.sampleList
      .map((sample) => sample.id)
      .filter((id): id is number => id !== undefined),
  );

  const element = document.querySelector('.sample-list');
  if (!element) return;

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
      filename: '商品列表.pdf',
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { format: 'a4', orientation: 'landscape' },
      pagebreak: { before: '.sample-item', mode: ['avoid-all'] },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    zip.file('商品列表.pdf', pdfBlob);

    // 下载商品相关文件
    if (files.success && files.data) {
      for (const [sampleId, fileList] of Object.entries(files.data)) {
        const sample = sampleStore.sampleList.find(
          (s) => s.id === Number(sampleId),
        );
        const folderName = `商品-${sample?.product_id || '未命名'}`;

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
    saveAs(zipBlob, '商品完整资料.zip');
  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    element.style.cssText = originalStyle;
  }
}

// 添加同步函数
function syncLatestProducts() {
  const currentCustomerId = sampleStore.sampleQuery.customer_id;
  sampleStore.$reset();
  sampleStore.sampleQuery.customer_id = currentCustomerId;
  sampleStore.querySample();
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div class="header-container">
        <div style="margin-left: 20px">
          {{ $t('filtercustomer') }}
        </div>
        <Select
          v-model="sampleStore.sampleQuery.customer_id"
          class="custom-select"
          placeholder="请选择"
          @change="onCustomerChange"
        >
          <SelectOption
            v-for="customer in customerStore.agencyCustomers?.data || []"
            :key="customer.id"
            :value="customer.id"
          >
            {{ customer.code }}
          </SelectOption>
        </Select>
        <template
          v-if="
            sampleStore.sampleQuery.customer_id &&
            customerStore.agencyCustomers?.data
          "
        >
          <img
            v-if="
              customerStore.agencyCustomers.data.find(
                (c) => c.id === sampleStore.sampleQuery.customer_id,
              )?.user?.avatar
            "
            :src="
              customerStore.agencyCustomers.data.find(
                (c) => c.id === sampleStore.sampleQuery.customer_id,
              )?.user?.avatar
            "
            alt="用户头像"
            class="user-avatar"
          />
          <span v-else class="no-avatar-text">{{ $t('no_avatar_text') }}</span>
        </template>
        <Button
          :disabled="sampleStore.sampleList.length === 0"
          class="ml-4"
          type="primary"
          @click="exportToPDF"
        >
          {{ $t('download') }}
        </Button>
        <Button class="ml-4" type="primary" @click="syncLatestProducts">
          {{ $t('sync_latest_products') }}
        </Button>
      </div>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <div v-if="sampleStore.sampleList.length > 0" class="sample-list">
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
          <div class="load-more-container">
            <Button :loading="isLoadingMore" type="primary" @click="onBottom">
              {{ isLoadingMore ? '加载中...' : '加载更多' }}
            </Button>
          </div>
        </div>
        <Empty
          v-else
          :loading="sampleStore.sampleQueryLoading"
          class="flex-1"
          description="暂无样本数据，请选择客户或添加新样本"
        />
      </div>
      <SampleKspForm />
      <OSSFileForm />
    </template>

    <!-- <template #footer> 123 </template> -->
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  /* height: 32%; */

  /* padding: 0 12px; */
  display: flex;
  align-items: center;
}

.custom-select {
  width: 200px; /* 设置宽度 */
  margin-left: 10px; /* 添加左边距 */
}

.ant-select-selector {
  border-color: #1890ff; /* 边框颜色 */
  border-radius: 8px; /* 圆角 */
}

.ant-select-arrow {
  color: #1890ff; /* 箭头颜色 */
}

.header-container {
  display: flex;
  align-items: center;
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

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.user-avatar {
  width: auto;
  height: 32px;
  margin-left: 10px;
  object-fit: contain;
  border-radius: 4px;
}

.no-avatar-text {
  margin-left: 10px;
  font-size: 14px;
  color: #999;
}
</style>
