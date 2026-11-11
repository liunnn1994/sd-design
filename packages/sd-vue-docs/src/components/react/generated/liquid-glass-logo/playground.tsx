/** @jsxImportSource react */
import type {
  FileItem,
  JsonFormSchema,
  JsonFormComponentType,
  LiquidGlassLogoTuning,
  LiquidGlassLogoProps,
} from '@sdata/web-react';

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
} from '@sdata/web-react';
import { type ComponentRef, useEffect, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
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
  const [settings, setSettings] = useState(defaults());
  const glass = useRef<ComponentRef<typeof LiquidGlassLogo> | null>(null);
  const [time, setTime] = useState(0.9);
  const [fileName, setFileName] = useState('SD Design 官方 Logo');
  const [error, setError] = useState('');
  const localLogo = useRef('');
  const clearLocalLogo = () => {
    if (localLogo.current) URL.revokeObjectURL(localLogo.current);
    localLogo.current = '';
  };
  function selectLogo(_files: FileItem[], item: FileItem) {
    if (!item.file) return;
    clearLocalLogo();
    localLogo.current = URL.createObjectURL(item.file);
    setSettings((previous) => {
      const draft = structuredClone(previous);
      draft.logo = localLogo.current;
      return draft;
    });
    setSettings((previous) => {
      const draft = structuredClone(previous);
      draft.logoColor = 'original';
      return draft;
    });
    setFileName(item.file.name);
    setError('');
  }
  function reset() {
    clearLocalLogo();
    setSettings(defaults());
    setTime(0.9);
    setFileName('SD Design 官方 Logo');
    setError('');
  }
  async function replay() {
    setSettings((previous) => {
      const draft = structuredClone(previous);
      draft.paused = false;
      return draft;
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    glass.current?.replay();
  }
  useEffect(() => {
    setSettings((previous) => {
      const theme = previous.theme;
      if (theme === 'auto')
        return {
          ...previous,
          textColor: undefined,
          tileColor: undefined,
          background: undefined,
          logoColor: previous.logoColor === 'original' ? 'original' : undefined,
        };
      const { logoColor, ...colors } = liquidGlassLogoThemes[theme];
      return {
        ...previous,
        ...colors,
        logoColor: previous.logoColor === 'original' ? 'original' : logoColor,
      };
    });
  }, [settings.theme]);
  useEffect(() => {
    if (settings.paused) glass.current?.seek(time);
  }, [settings, time]);
  function scrub(seconds: number) {
    setTime(seconds);
    setSettings((previous) => ({ ...previous, paused: true }));
  }
  useEffect(() => clearLocalLogo, []);
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

  return (
    <>
      <div data-v-e383b889="" className={'liquid-glass-playground'}>
        <section
          data-v-e383b889=""
          className={'liquid-glass-playground-preview'}
          aria-label={'Logo 实时预览'}
        >
          <LiquidGlassLogo
            data-v-e383b889=""
            {...settings}
            ref={glass}
            style={{ maxWidth: '100%' }}
            aria-label={'自定义品牌标志'}
            onReady={() => {
              glass.current?.seek(time);
            }}
            onError={($event) => {
              setError($event.message);
            }}
          />
          <label data-v-e383b889="" className={'liquid-glass-playground-timeline'}>
            <span data-v-e383b889="">
              {'预览时间：'}
              {formatValue(time.toFixed(2))}
              {' 秒'}
            </span>
            <Slider
              data-v-e383b889=""
              value={time}
              onValueChange={(next) => {
                if (typeof next === 'number') scrub(next);
              }}
              min={0}
              max={3.3}
              step={0.01}
              showTooltip={false}
              aria-label={'预览时间'}
            />
          </label>
          <Space data-v-e383b889="" wrap={true}>
            <Upload
              data-v-e383b889=""
              accept={'image/svg+xml,image/png,image/jpeg,image/webp'}
              autoUpload={false}
              showFileList={false}
              fileList={[]}
              onChange={selectLogo}
              uploadButton={
                <>
                  <Button data-v-e383b889="" type={'outline'}>
                    {'选择本地 Logo'}
                  </Button>
                </>
              }
            />
            <Button data-v-e383b889="" type={'primary'} onClick={replay}>
              {'重播预览'}
            </Button>
            <Button data-v-e383b889="" type={'outline'} status={'warning'} onClick={reset}>
              {'恢复默认值'}
            </Button>
          </Space>
          <p data-v-e383b889="" className={'liquid-glass-playground-hint'}>
            {formatValue(fileName)}
            {' · 文件仅在本地预览，不会上传。'}
          </p>
          <p data-v-e383b889="" className={'liquid-glass-playground-hint'}>
            {'拖动时间轴会暂停播放。先停在玻璃尚未消散的时间，再调整光学参数，更容易看清变化。'}
          </p>
          {error ? (
            <Alert data-v-e383b889="" type={'warning'}>
              {formatValue(error)}
            </Alert>
          ) : null}
        </section>
        <div
          data-v-e383b889=""
          className={'liquid-glass-playground-controls'}
          aria-label={'Logo 参数设置'}
          tabIndex={0}
        >
          {groups.map((group, index) => (
            <details data-v-e383b889="" key={group.title} open={index === 0}>
              <summary data-v-e383b889="">{formatValue(group.title)}</summary>
              <JsonForm
                data-v-e383b889=""
                model={settings}
                schemas={group.schemas}
                layout={'vertical'}
                autoLabelWidth={false}
              />
            </details>
          ))}
        </div>
      </div>
      <style>
        {
          '.liquid-glass-playground[data-v-e383b889] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) minmax(280px, 1fr);\n  gap: 24px;\n}\n.liquid-glass-playground-preview[data-v-e383b889] {\n  display: flex;\n  min-width: 0;\n  flex-direction: column;\n  gap: 16px;\n}\n.liquid-glass-playground-timeline[data-v-e383b889] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  font-size: 12px;\n}\n.liquid-glass-playground-hint[data-v-e383b889] {\n  margin: 0;\n  color: var(--sd-color-text-2);\n  font-size: 12px;\n  line-height: 1.6;\n}\n.liquid-glass-playground-controls[data-v-e383b889] {\n  min-width: 0;\n  max-height: 560px;\n  overflow: auto;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: 8px;\n}\n.liquid-glass-playground-controls details + details[data-v-e383b889] {\n  border-top: 1px solid var(--sd-color-border-2);\n}\n.liquid-glass-playground-controls summary[data-v-e383b889] {\n  padding: 12px 16px;\n  cursor: pointer;\n  font-weight: 500;\n}\n.liquid-glass-playground-controls[data-v-e383b889] .sd-form {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 12px 16px;\n  padding: 0 16px 16px;\n}\n.liquid-glass-playground-controls[data-v-e383b889] .sd-form-item {\n  min-width: 0;\n  margin-bottom: 0;\n}\n@media (max-width: 720px) {\n.liquid-glass-playground[data-v-e383b889] {\n    grid-template-columns: minmax(0, 1fr);\n}\n}'
        }
      </style>
    </>
  );
}
