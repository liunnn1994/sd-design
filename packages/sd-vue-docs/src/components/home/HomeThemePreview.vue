<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

  type ThemeKey = 'light' | 'dark';

  interface ThemeOption {
    key: ThemeKey;
    name: string;
    description: string;
    accent: string;
  }

  const themeOptions: ThemeOption[] = [
    {
      key: 'light',
      name: '浅色主题',
      description: '适合白天、高密度信息与默认业务台场景。',
      accent: '#1476FF',
    },
    {
      key: 'dark',
      name: '暗色主题',
      description: '适合夜间、投屏或低光环境中的持续浏览与操作。',
      accent: '#61A8FF',
    },
  ];

  const activeThemeKey = shallowRef<ThemeKey>('light');
  const accentColor = shallowRef(themeOptions[0].accent);
  const compactMode = shallowRef(false);
  const rootObserver = shallowRef<MutationObserver | null>(null);

  const activeTheme = computed(() => {
    return themeOptions.find((item) => item.key === activeThemeKey.value) ?? themeOptions[0];
  });

  const previewStyle = computed(() => {
    return {
      '--home-preview-accent': accentColor.value,
      'gap': compactMode.value ? '0.5rem' : '0.75rem',
    };
  });

  const syncThemeFromDocument = () => {
    if (typeof document === 'undefined') {
      return;
    }

    activeThemeKey.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  };

  const applyTheme = (themeKey: ThemeKey) => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.theme = themeKey;
    activeThemeKey.value = themeKey;
  };

  watch(
    activeTheme,
    (themeOption) => {
      accentColor.value = themeOption.accent;
    },
    { immediate: true },
  );

  onMounted(() => {
    syncThemeFromDocument();

    rootObserver.value = new MutationObserver(syncThemeFromDocument);
    rootObserver.value.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  });

  onBeforeUnmount(() => {
    rootObserver.value?.disconnect();
    rootObserver.value = null;
  });
</script>

<template>
  <div class="theme-preview" :style="previewStyle">
    <aside class="theme-preview__aside">
      <button
        v-for="themeOption in themeOptions"
        :key="themeOption.key"
        type="button"
        class="theme-preview__option"
        :class="{ 'is-active': themeOption.key === activeThemeKey }"
        @click="applyTheme(themeOption.key)"
      >
        <strong>{{ themeOption.name }}</strong>
        <span>{{ themeOption.description }}</span>
      </button>

      <div class="theme-preview__doc-links">
        <a href="/guides/theme/">主题定制</a>
        <a href="/guides/dark/">暗黑模式</a>
      </div>
    </aside>

    <div class="theme-preview__surface">
      <div class="theme-preview__summary">
        <div>
          <p class="theme-preview__eyebrow">实时预览</p>
          <h3>{{ activeTheme.name }}</h3>
          <p>
            当前选择会直接切换文档站主题，下面的按钮、标签、卡片与色板全部来自 SD Design 组件库。
          </p>
        </div>

        <div class="theme-preview__summary-actions">
          <sd-switch v-model="compactMode">
            <template #checked> 紧凑 </template>
            <template #unchecked> 宽松 </template>
          </sd-switch>
          <sd-color-picker v-model="accentColor" show-text />
        </div>
      </div>

      <sd-tabs default-active-key="workspace">
        <sd-tab-pane key="workspace" title="工作台">
          <div class="theme-preview__panel-grid">
            <sd-card class="theme-preview__panel" title="快捷操作">
              <div class="theme-preview__button-row" :style="{ gap: previewStyle.gap }">
                <sd-button type="primary">创建方案</sd-button>
                <sd-button>导出配置</sd-button>
                <sd-button type="secondary">查看变更</sd-button>
              </div>
              <div class="theme-preview__tag-row" :style="{ gap: previewStyle.gap }">
                <sd-tag color="blue">组件文档</sd-tag>
                <sd-tag color="green">主题切换</sd-tag>
                <sd-tag color="orange">建设中</sd-tag>
              </div>
            </sd-card>

            <sd-card class="theme-preview__panel" title="预设色板">
              <div class="theme-preview__swatches">
                <span class="theme-preview__swatch" :style="{ background: accentColor }"></span>
                <span class="theme-preview__swatch theme-preview__swatch--soft"></span>
                <span class="theme-preview__swatch theme-preview__swatch--dark"></span>
              </div>
              <p class="theme-preview__panel-copy">
                这里展示的是当前主题下的强调色参考，真实业务主题仍以 less 变量覆盖为主。
              </p>
            </sd-card>
          </div>
        </sd-tab-pane>

        <sd-tab-pane key="details" title="组件状态">
          <sd-collapse :default-active-key="['state']" :bordered="false">
            <sd-collapse-item header="主题能力现状" key="state">
              组件库当前支持文档站亮暗主题联动，品牌主题仍建议通过 less
              变量定制，不在首页里伪造运行时换肤。
            </sd-collapse-item>
            <sd-collapse-item header="首页迁移策略" key="migration">
              保留 antd 首页的结构节奏与交互入口，但文案、链接与能力说明全部改成 SD Design
              的实际能力。
            </sd-collapse-item>
          </sd-collapse>
        </sd-tab-pane>
      </sd-tabs>
    </div>
  </div>
</template>

<style scoped>
  .theme-preview {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: 1rem;
    min-width: 0;
  }

  .theme-preview__aside,
  .theme-preview__surface {
    min-width: 0;
    background: color-mix(in srgb, var(--sl-color-bg) 84%, transparent);
    border: 1px solid rgb(20 118 255 / 12%);
    border-radius: 1.5rem;
    box-shadow: 0 16px 40px rgb(15 23 42 / 5%);
  }

  .theme-preview__aside {
    display: grid;
    gap: 0.75rem;
    align-content: start;
    padding: 1rem;
  }

  .theme-preview__option {
    display: grid;
    gap: 0.35rem;
    padding: 0.95rem 1rem;
    color: inherit;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 1rem;
    cursor: pointer;
    transition:
      border-color 180ms ease,
      background 180ms ease,
      transform 180ms ease;
  }

  .theme-preview__option strong {
    font-size: 1rem;
  }

  .theme-preview__option span {
    color: var(--sl-text-3);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .theme-preview__option:hover,
  .theme-preview__option.is-active {
    background: color-mix(in srgb, var(--home-preview-accent) 10%, transparent);
    border-color: color-mix(in srgb, var(--home-preview-accent) 42%, transparent);
    transform: translateY(-1px);
  }

  .theme-preview__doc-links {
    display: grid;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .theme-preview__doc-links a {
    color: var(--sl-color-accent-high);
    font-weight: 600;
    text-decoration: none;
  }

  .theme-preview__surface {
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

  .theme-preview__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
  }

  .theme-preview__eyebrow {
    margin: 0 0 0.4rem;
    color: var(--home-preview-accent);
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .theme-preview__summary h3 {
    margin: 0;
    font-size: 1.45rem;
  }

  .theme-preview__summary p {
    margin: 0.45rem 0 0;
    color: var(--sl-text-3);
    line-height: 1.75;
  }

  .theme-preview__summary-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .theme-preview__panel-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .theme-preview__panel {
    height: 100%;
  }

  .theme-preview__button-row,
  .theme-preview__tag-row {
    display: flex;
    flex-wrap: wrap;
  }

  .theme-preview__tag-row {
    margin-top: 1rem;
  }

  .theme-preview__swatches {
    display: flex;
    gap: 0.75rem;
  }

  .theme-preview__swatch {
    width: 4.2rem;
    height: 4.2rem;
    background: var(--home-preview-accent);
    border-radius: 1rem;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 20%);
  }

  .theme-preview__swatch--soft {
    background: color-mix(in srgb, var(--home-preview-accent) 22%, white);
  }

  .theme-preview__swatch--dark {
    background: color-mix(in srgb, var(--home-preview-accent) 70%, rgb(11 18 32));
  }

  .theme-preview__panel-copy {
    margin: 1rem 0 0;
    color: var(--sl-text-3);
    line-height: 1.7;
  }

  :root[data-theme='dark'] .theme-preview__aside,
  :root[data-theme='dark'] .theme-preview__surface {
    background: rgb(255 255 255 / 3%);
    border-color: rgb(255 255 255 / 10%);
    box-shadow: 0 18px 44px rgb(0 0 0 / 22%);
  }

  @media (width <= 900px) {
    .theme-preview {
      grid-template-columns: 1fr;
    }

    .theme-preview__panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
