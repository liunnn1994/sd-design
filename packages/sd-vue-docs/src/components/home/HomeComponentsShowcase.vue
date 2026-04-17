<script setup lang="ts">
  import { ref } from 'vue';

  import HomeShowcaseCard from './HomeShowcaseCard.vue';

  const carouselImages = [
    'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',
    'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',
    'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',
  ];

  const pickerValue = ref(new Date());
</script>

<template>
  <div class="components-showcase">
    <div class="components-showcase__desktop">
      <div class="components-showcase__track">
        <HomeShowcaseCard title="DatePicker" tag="高频" tone="brand">
          <sd-date-picker v-model="pickerValue" style="width: 100%" />
          <sd-date-picker v-model="pickerValue" hide-trigger style="width: 100%" />
        </HomeShowcaseCard>

        <HomeShowcaseCard title="ColorPicker" tag="主题" tone="success">
          <sd-color-picker default-value="#1476FF" hide-trigger show-preset show-history />
        </HomeShowcaseCard>

        <HomeShowcaseCard title="Collapse" tag="内容组织" tone="warning">
          <sd-collapse :default-active-key="['guide']" :bordered="false" style="width: 100%">
            <sd-collapse-item header="快速开始" key="guide">
              组件、样式与文档结构可以按需组合，适合业务页、后台台账与配置面板。
            </sd-collapse-item>
            <sd-collapse-item header="主题与暗黑态" key="theme">
              文档站主题切换会直接联动组件暗黑模式，首页预览不是静态截图。
            </sd-collapse-item>
          </sd-collapse>
        </HomeShowcaseCard>

        <HomeShowcaseCard title="Carousel" tag="展示" tone="brand">
          <sd-carousel
            show-arrow="never"
            indicator-type="slider"
            :style="{ width: '100%', height: '180px' }"
          >
            <sd-carousel-item v-for="image in carouselImages" :key="image">
              <img class="components-showcase__image" :src="image" alt="carousel preview" />
            </sd-carousel-item>
          </sd-carousel>
        </HomeShowcaseCard>
      </div>
    </div>

    <div class="components-showcase__mobile">
      <sd-carousel
        show-arrow="never"
        indicator-type="dot"
        :style="{ width: '100%', height: '390px' }"
      >
        <sd-carousel-item>
          <div class="components-showcase__slide">
            <HomeShowcaseCard title="DatePicker" tag="高频" tone="brand">
              <sd-date-picker default-value="2026-04-17" style="width: 100%" />
            </HomeShowcaseCard>
          </div>
        </sd-carousel-item>
        <sd-carousel-item>
          <div class="components-showcase__slide">
            <HomeShowcaseCard title="ColorPicker" tag="主题" tone="success">
              <sd-space :size="24">
                <sd-color-picker default-value="#1476FF" hide-trigger show-preset show-history />
                <sd-color-picker default-value="#12D2AC" hide-trigger show-preset disabled />
              </sd-space>
            </HomeShowcaseCard>
          </div>
        </sd-carousel-item>
        <sd-carousel-item>
          <div class="components-showcase__slide">
            <HomeShowcaseCard title="Collapse" tag="内容组织" tone="warning">
              <sd-collapse :default-active-key="['guide']" :bordered="false" style="width: 100%">
                <sd-collapse-item header="快速开始" key="guide">
                  组件、样式与文档结构可以按需组合，适合业务页、后台台账与配置面板。
                </sd-collapse-item>
                <sd-collapse-item header="主题与暗黑态" key="theme">
                  文档站主题切换会直接联动组件暗黑模式，首页预览不是静态截图。
                </sd-collapse-item>
              </sd-collapse>
            </HomeShowcaseCard>
          </div>
        </sd-carousel-item>
        <sd-carousel-item>
          <div class="components-showcase__slide">
            <HomeShowcaseCard title="Carousel" tag="展示" tone="brand">
              <sd-carousel
                show-arrow="never"
                indicator-type="slider"
                :style="{ width: '100%', height: '180px' }"
              >
                <sd-carousel-item v-for="image in carouselImages" :key="image">
                  <img class="components-showcase__image" :src="image" alt="carousel preview" />
                </sd-carousel-item>
              </sd-carousel>
            </HomeShowcaseCard>
          </div>
        </sd-carousel-item>
      </sd-carousel>
    </div>
  </div>
</template>

<style scoped>
  .components-showcase {
    min-width: 0;
  }

  .components-showcase__track {
    display: flex;
    gap: 1rem;
    max-width: min-content;
    padding-bottom: 0.5rem;
    overflow-x: auto;
    scrollbar-width: thin;
    margin-inline: auto;
  }

  .components-showcase__mobile {
    display: none;
  }

  .components-showcase__slide {
    padding: 0 0.5rem 1rem;
  }

  .components-showcase__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 1rem;
  }
</style>
