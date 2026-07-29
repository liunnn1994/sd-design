<template>
  <ModelSelector :close-on-select="false">
    <ModelSelectorTrigger>选择模型路由</ModelSelectorTrigger>
    <ModelSelectorContent :mask-closable="false" title="选择路由模型">
      <ModelSelectorInput placeholder="搜索模型路由" />
      <ModelSelectorList>
        <ModelSelectorGroup>
          <template #heading>
            <div class="group-heading">
              <span>智能路由</span>
              <Tag color="green">推荐</Tag>
            </div>
          </template>
          <ModelSelectorItem value="quality-route" selected :shortcut="shortcuts.qualityRoute">
            <ModelSelectorLogoGroup>
              <ModelSelectorLogo provider="openai" />
              <ModelSelectorLogo provider="anthropic" />
              <ModelSelectorLogo provider="google" />
            </ModelSelectorLogoGroup>
            <ModelSelectorName>
              <strong>质量优先</strong>
              <small>自动选择当前最强模型</small>
            </ModelSelectorName>
            <ModelSelectorShortcut>{{ shortcuts.qualityRoute }}</ModelSelectorShortcut>
          </ModelSelectorItem>
          <ModelSelectorItem value="local-route" :shortcut="shortcuts.localRoute">
            <ModelSelectorName>
              <strong>私有模型</strong>
              <small>未知厂商使用离线通用 Logo</small>
            </ModelSelectorName>
            <ModelSelectorLogo provider="custom-private-provider" />
            <ModelSelectorShortcut>{{ shortcuts.localRoute }}</ModelSelectorShortcut>
          </ModelSelectorItem>
        </ModelSelectorGroup>
        <ModelSelectorSeparator />
        <div class="offline-note">所有 Logo 均由组件包离线提供，不会请求外部站点。</div>
      </ModelSelectorList>
    </ModelSelectorContent>
  </ModelSelector>
</template>

<script setup lang="ts">
  import {
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorLogoGroup,
    ModelSelectorName,
    ModelSelectorSeparator,
    ModelSelectorShortcut,
    ModelSelectorTrigger,
    Tag,
  } from '@sdata/web-vue';

  const shortcuts = {
    qualityRoute: 'Alt+Shift+1',
    localRoute: 'Alt+Shift+2',
  } as const;
</script>

<style>
  .group-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sd-model-selector-name {
    display: flex;
    flex-direction: column;
  }

  .sd-model-selector-name small,
  .offline-note {
    color: var(--sd-color-text-3);
    font-size: 12px;
  }

  .offline-note {
    padding: 8px 12px;
  }
</style>
