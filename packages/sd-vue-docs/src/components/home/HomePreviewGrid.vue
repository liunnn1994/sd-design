<script setup lang="ts">
  import { shallowRef } from 'vue';

  import {
    Button,
    Input,
    Switch,
    Rate,
    Tag,
    Space,
    Tabs,
    TabPane,
    Collapse,
    CollapseItem,
  } from '@sdata/web-vue';
  const name = shallowRef('下一件好作品');
  const enabled = shallowRef(true);
  const rating = shallowRef(4);
  const count = shallowRef(0);
</script>
<template>
  <div class="home-previews">
    <article
      ><div class="home-previews__stage"
        ><Space wrap
          ><Button type="primary" @click="count++">{{
            count ? `已点击 ${count} 次` : '开始创作'
          }}</Button
          ><Button>保存草稿</Button></Space
        ></div
      ><a href="/components/button/"><strong>按钮</strong><span>Button ↗</span></a></article
    >
    <article
      ><div class="home-previews__stage"
        ><div class="home-previews__field"
          ><label for="home-preview-name">项目名称</label
          ><Input id="home-preview-name" v-model="name" allow-clear /></div></div
      ><a href="/components/input/"><strong>输入框</strong><span>Input ↗</span></a></article
    >
    <article
      ><div class="home-previews__stage"
        ><Space :size="16"
          ><Switch v-model="enabled" aria-label="开启通知" /><span>{{
            enabled ? '通知已开启' : '通知已关闭'
          }}</span></Space
        ></div
      ><a href="/components/switch/"><strong>开关</strong><span>Switch ↗</span></a></article
    >
    <article
      ><div class="home-previews__stage"
        ><div class="home-previews__rating"
          ><Rate v-model="rating" allow-half /><Tag color="blue">{{ rating }} / 5</Tag></div
        ></div
      ><a href="/components/rate/"><strong>评分</strong><span>Rate ↗</span></a></article
    >
    <article
      ><div class="home-previews__stage"
        ><Tabs type="capsule" animation
          ><TabPane key="overview" title="总览">所有内容，井然有序。</TabPane
          ><TabPane key="activity" title="动态">新的想法，正在发生。</TabPane></Tabs
        ></div
      ><a href="/components/tabs/"><strong>标签页</strong><span>Tabs ↗</span></a></article
    >
    <article
      ><div class="home-previews__stage"
        ><Collapse :bordered="false"
          ><CollapseItem key="details" header="展开，了解更多"
            >把次要信息留到需要时。</CollapseItem
          ></Collapse
        ></div
      ><a href="/components/collapse/"><strong>折叠面板</strong><span>Collapse ↗</span></a></article
    >
  </div>
</template>
<style lang="scss" scoped>
  .home-previews {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;

    article {
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--sd-color-border-1);
      border-radius: 12px;
    }

    &__stage {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 176px;
      padding: 24px;
      background: var(--sd-color-fill-1);
    }

    &__stage > :deep(*) {
      min-width: 0;
      max-width: 100%;
    }

    article > a {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 16px;
      color: var(--sd-color-text-1);
      font-size: 13px;
      text-decoration: none;
    }

    article > a span {
      color: var(--sd-color-text-3);
    }

    article > a:hover span {
      color: rgb(var(--sd-primary-7));
    }

    &__field {
      width: 100%;
    }

    &__field label {
      display: block;
      margin-bottom: 8px;
      color: var(--sd-color-text-2);
      font-size: 13px;
    }

    &__rating {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    @media (width < 64rem) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (width < 36rem) {
      grid-template-columns: 1fr;

      &__stage {
        min-height: 144px;
      }
    }
  }
</style>
