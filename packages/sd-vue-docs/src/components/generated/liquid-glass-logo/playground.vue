<script setup lang="ts">
  import type {
    FileItem,
    JsonFormSchema,
    JsonFormComponentType,
    LiquidGlassLogoTuning,
    LiquidGlassLogoProps,
  } from '@sdata/web-vue';

  import { nextTick, onBeforeUnmount, reactive, ref, useTemplateRef, watch } from 'vue';

  import {
    Alert,
    Button,
    JsonForm,
    LiquidGlassLogo,
    Slider,
    Space,
    Upload,
    liquidGlassLogoDefaults,
    liquidGlassLogoThemes,
  } from '@sdata/web-vue';

  type Settings = Omit<
    LiquidGlassLogoTuning,
    'theme' | 'textColor' | 'tileColor' | 'background' | 'logoColor'
  > & {
    theme: NonNullable<LiquidGlassLogoProps['theme']>;
    logoColor?: string;
    textColor?: string;
    tileColor?: string;
    background?: string;
    autoWidth: boolean;
    height: number;
    backgroundImage: string;
    backgroundX: number;
    backgroundY: number;
    backgroundScale: number;
    backgroundTint: string;
    backgroundTintOpacity: number;
  };
  const defaults = (): Settings => ({
    ...liquidGlassLogoDefaults,
    theme: 'auto',
    textColor: undefined,
    tileColor: undefined,
    background: undefined,
    logo: '/logo-icon.png',
    logoColor: 'original',
    mark: 'logo',
    text: 'Design',
    ending: 'wordmark',
    paused: true,
    height: 320,
    autoWidth: false,
    backgroundImage: '',
    backgroundX: 0,
    backgroundY: 0,
    backgroundScale: 1,
    backgroundTint: '#000000',
    backgroundTintOpacity: 0,
  });
  const settings = reactive(defaults());
  const glass = useTemplateRef('glass');
  const time = ref(0.9);
  const fileName = ref('SD Design 官方 Logo');
  const error = ref('');
  let localLogo = '';
  const clearLocalLogo = () => {
    if (localLogo) URL.revokeObjectURL(localLogo);
    localLogo = '';
  };
  function selectLogo(_files: FileItem[], item: FileItem) {
    if (!item.file) return;
    clearLocalLogo();
    localLogo = URL.createObjectURL(item.file);
    settings.logo = localLogo;
    settings.logoColor = 'original';
    fileName.value = item.file.name;
    error.value = '';
  }
  function reset() {
    clearLocalLogo();
    Object.assign(settings, defaults());
    time.value = 0.9;
    fileName.value = 'SD Design 官方 Logo';
    error.value = '';
  }
  async function replay() {
    settings.paused = false;
    await nextTick();
    glass.value?.replay();
  }
  watch(
    () => settings.theme,
    (theme) => {
      if (theme === 'auto') {
        settings.textColor = undefined;
        settings.tileColor = undefined;
        settings.background = undefined;
        if (settings.logoColor !== 'original') settings.logoColor = undefined;
        return;
      }
      const { logoColor, ...colors } = liquidGlassLogoThemes[theme];
      Object.assign(settings, colors);
      if (settings.logoColor !== 'original') settings.logoColor = logoColor;
    },
  );
  watch(
    settings,
    () => {
      if (settings.paused) glass.value?.seek(time.value);
    },
    { flush: 'post' },
  );
  watch(time, (seconds) => {
    settings.paused = true;
    glass.value?.seek(seconds);
  });
  onBeforeUnmount(clearLocalLogo);

  const number = (
    field: keyof Settings,
    label: string,
    min?: number,
    max?: number,
    step = 0.01,
  ): JsonFormSchema<JsonFormComponentType> => ({
    field,
    label,
    type: 'inputNumber',
    componentProps: { min, max, step },
  });
  const input = (field: keyof Settings, label: string): JsonFormSchema<JsonFormComponentType> => ({
    field,
    label,
    type: 'input',
  });
  const toggle = (field: keyof Settings, label: string): JsonFormSchema<JsonFormComponentType> => ({
    field,
    label,
    type: 'switch',
  });
  const select = (
    field: keyof Settings,
    label: string,
    options: { label: string; value: string }[],
  ): JsonFormSchema<JsonFormComponentType> => ({
    field,
    label,
    type: 'select',
    componentProps: { options },
  });
  const groups: { title: string; schemas: JsonFormSchema<JsonFormComponentType>[] }[] = [
    {
      title: '内容与播放',
      schemas: [
        input('logo', 'Logo 地址'),
        input('text', '字标文字'),
        select('ending', '结束内容', [
          { label: '标志', value: 'logo' },
          { label: '字标', value: 'wordmark' },
        ]),
        select('theme', '配色主题', [
          { label: '跟随主题', value: 'auto' },
          { label: '深色', value: 'dark' },
          { label: '浅色', value: 'light' },
        ]),
        number('speed', '速度倍率', 0.1, 4, 0.1),
        number('loopDelay', '循环间隔（秒）', 0, 30, 0.1),
        toggle('paused', '暂停播放'),
        toggle('loop', '循环播放'),
      ],
    },
    {
      title: '尺寸与字标',
      schemas: [
        toggle('autoWidth', '自动宽度（autoWidth）'),
        number('height', '容器高度（px）', undefined, undefined, 1),
        number('logoSize', '底板边长（px）', 24, 1024, 1),
        number('logoScale', '标志比例', 0.1, 1),
        number('finalLogoScale', '最终缩放', 0.1, 1),
        toggle('tile', '显示底板（无背景图时）'),
        input('mark', '字标图案（logo / 留空 / 图片地址）'),
        number('fontSize', '字标字号（px）', 8, 400, 1),
        number('fontWeight', '字重', 100, 1000, 50),
        input('fontFamily', '字体'),
        select(
          'fontStretch',
          '字体拉伸',
          [
            'ultra-condensed',
            'extra-condensed',
            'condensed',
            'semi-condensed',
            'normal',
            'semi-expanded',
            'expanded',
            'extra-expanded',
            'ultra-expanded',
          ].map((value) => ({ label: value, value })),
        ),
        number('letterSpacing', '字间距（em）', -0.3, 1),
        number('markGap', '图案间距（em）', 0, 2),
        number('maxDpr', '最大像素比', 0.5, 4, 0.5),
      ],
    },
    {
      title: '玻璃光学',
      schemas: [
        number('depth', '光学深度', 0, 6),
        number('dispersion', '色散强度', 0, 4),
        number('relief', '背面折射', 0, 3),
        number('caustics', '焦散亮度', 0, 4),
        number('highlights', '反射强度', 0, 4),
        number('bloom', '边缘辉光', 0, 2),
        number('logoRelief', '标志浮雕（统一着色时）', 0, 1),
        number('dropSize', '透镜初始比例', 0.05, 1.5),
        number('dropStrength', '透镜曲率', 0, 4),
        number('echoTint', '外缘染色', 0, 1),
        number('innerWallFocus', '内壁聚焦', 0, 1),
        number('decay', '玻璃环衰减（秒）', 0.1, 10, 0.1),
      ],
    },
    {
      title: '颜色',
      schemas: [
        input('logoColor', '标志颜色（original 保留原色）'),
        input('textColor', '字标颜色'),
        input('tileColor', '底板颜色'),
        input('background', '背景颜色'),
      ],
    },
    {
      title: '背景图',
      schemas: [
        input('backgroundImage', '背景图地址'),
        number('backgroundX', '横向偏移（%）', -100, 100, 1),
        number('backgroundY', '纵向偏移（%）', -100, 100, 1),
        number('backgroundScale', '背景缩放', 1, 3),
        input('backgroundTint', '遮罩颜色'),
        number('backgroundTintOpacity', '遮罩透明度', 0, 1),
      ],
    },
  ];
</script>

<template>
  <div class="liquid-glass-playground">
    <section class="liquid-glass-playground-preview" aria-label="Logo 实时预览">
      <LiquidGlassLogo
        ref="glass"
        v-bind="settings"
        style="max-width: 100%"
        aria-label="自定义品牌标志"
        @ready="glass?.seek(time)"
        @error="error = $event.message"
      />
      <label class="liquid-glass-playground-timeline">
        <span>预览时间：{{ time.toFixed(2) }} 秒</span>
        <Slider
          v-model="time"
          :min="0"
          :max="3.3"
          :step="0.01"
          :show-tooltip="false"
          aria-label="预览时间"
        />
      </label>
      <Space wrap>
        <Upload
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          :auto-upload="false"
          :show-file-list="false"
          :file-list="[]"
          @change="selectLogo"
        >
          <template #upload-button><Button type="outline">选择本地 Logo</Button></template>
        </Upload>
        <Button type="primary" @click="replay">重播预览</Button>
        <Button type="outline" status="warning" @click="reset">恢复默认值</Button>
      </Space>
      <p class="liquid-glass-playground-hint">{{ fileName }} · 文件仅在本地预览，不会上传。</p>
      <p class="liquid-glass-playground-hint"
        >拖动时间轴会暂停播放。先停在玻璃尚未消散的时间，再调整光学参数，更容易看清变化。</p
      >
      <Alert v-if="error" type="warning">{{ error }}</Alert>
    </section>
    <div class="liquid-glass-playground-controls" aria-label="Logo 参数设置" tabindex="0">
      <details v-for="(group, index) in groups" :key="group.title" :open="index === 0">
        <summary>{{ group.title }}</summary>
        <JsonForm
          :model="settings"
          :schemas="group.schemas"
          layout="vertical"
          :auto-label-width="false"
        />
      </details>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .liquid-glass-playground {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 1fr);
    gap: 24px;

    &-preview {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 16px;
    }

    &-timeline {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
    }

    &-hint {
      margin: 0;
      color: var(--sd-color-text-2);
      font-size: 12px;
      line-height: 1.6;
    }

    &-controls {
      min-width: 0;
      max-height: 560px;
      overflow: auto;
      border: 1px solid var(--sd-color-border-2);
      border-radius: 8px;

      details + details {
        border-top: 1px solid var(--sd-color-border-2);
      }
      summary {
        padding: 12px 16px;
        cursor: pointer;
        font-weight: 500;
      }
      :deep(.sd-form) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 16px;
        padding: 0 16px 16px;
      }
      :deep(.sd-form-item) {
        min-width: 0;
        margin-bottom: 0;
      }
    }
  }

  @media (max-width: 720px) {
    .liquid-glass-playground {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
