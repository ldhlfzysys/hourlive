<script lang="ts" setup>
import type { Sample } from '#/types';

import { ref } from 'vue';

import { Card, Col, Image, Row } from 'ant-design-vue';

defineOptions({
  name: 'SampleCard',
});

const props = defineProps<{
  sample: Sample;
}>();

const sellingPoints = ref(
  '<p>这是一个非常大的卖点展示区域，支持HTML内容。</p>',
);
</script>

<template>
  <Card class="h-[160px]">
    <Row :gutter="16">
      <!-- 左侧: 图片、名称、价格、原价 -->
      <Col :span="6">
        <div class="left-content">
          <Image
            :src="props.sample.product_image"
            alt="商品图片"
            class="product-image h-[100px]"
          />
          <div class="product-info">
            <h3>name</h3>
            <p class="price">{{ props.sample.product_final_price }}</p>
            <p class="original-price">{{ props.sample.product_final_price }}</p>
          </div>
        </div>
      </Col>

      <!-- 中间: 自适应宽度的卖点 -->
      <Col :span="12">
        <div class="middle-content">
          <div v-html="props.sample.product_commission"></div>
        </div>
      </Col>

      <!-- 右侧: 操作按钮 -->
      <Col :span="6" class="right-content">
        <a-button type="primary">立即购买</a-button>
        <a-button>加入购物车</a-button>
      </Col>
    </Row>
  </Card>
</template>

<style scoped>
.product-image {
  width: 100%;
  height: auto;
}

.product-info {
  margin-top: 10px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f5222d;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.middle-content {
  font-size: 16px;
  word-break: break-word;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
