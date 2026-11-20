import React, { StrictMode, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import {
  Switch,
  Space,
  Divider,
  Comment,
  Button,
  ButtonGroup,
  ConfigProvider,
  Empty,
  Spin,
  Tag,
  Avatar,
  NumberFlow,
  NumberFlowGroup,
  Badge,
  addI18nMessages,
  useLocale,
} from '../../src/index';
import enUS from '../../src/locale/lang/en-us';
import zhCN from '../../src/locale/lang/zh-cn';
import { AffixFixture } from './affix-fixture';
import { AlertFixture } from './alert-fixture';
import { AnchorFixture } from './anchor-fixture';
import { AutoCompleteFixture } from './auto-complete-fixture';
import { AvatarGroupFixture } from './avatar-group-fixture';
import { BackTopFixture } from './back-top-fixture';
import { BloomMenuFixture } from './bloom-menu-fixture';
import { BorderBeamFixture } from './border-beam-fixture';
import { BreadcrumbFixture } from './breadcrumb-fixture';
import { CalendarRootFixture } from './calendar-root-fixture';
import { CardFixture } from './card-fixture';
import { CarouselFixture } from './carousel-fixture';
import { ChoiceFixture } from './choice-fixture';
import { ClampFixture } from './clamp-fixture';
import { CollapseFixture } from './collapse-fixture';
import { CopySecretFixture } from './copy-secret-fixture';
import { DescriptionsFixture } from './descriptions-fixture';
import { DrawerFixture } from './drawer-fixture';
import { DropdownFixture } from './dropdown-fixture';
import { FloatingFixture } from './floating-fixture';
import './style.scss';
import { FormFixture } from './form-fixture';
import { GridFixture } from './grid-fixture';
import { InputFixture } from './input-fixture';
import { InputMaskFixture } from './input-mask-fixture';
import { InputNumberFixture } from './input-number-fixture';
import { InputTagFixture } from './input-tag-fixture';
import { KvListFixture } from './kv-list-fixture';
import { LayoutFixture } from './layout-fixture';
import { LineFixture } from './line-fixture';
import { LiquidGlassLogoFixture } from './liquid-glass-logo-fixture';
import { ListFixture } from './list-fixture';
import { MentionFixture } from './mention-fixture';
import { MenuCollectorFixture } from './menu-collector-fixture';
import { MenuFixture } from './menu-fixture';
import { ModalFixture } from './modal-fixture';
import { NoticeFixture } from './notice-fixture';
import { PageHeaderFixture } from './page-header-fixture';
import { PaginationFixture } from './pagination-fixture';
import { PopconfirmFixture } from './popconfirm-fixture';
import { PopoverFixture } from './popover-fixture';
import { ProgressFixture } from './progress-fixture';
import { QrCodeFixture } from './qr-code-fixture';
import { RateFixture } from './rate-fixture';
import { ResultFixture } from './result-fixture';
import { ScrollbarFixture } from './scrollbar-fixture';
import { SelectFixture } from './select-fixture';
import { SelectViewFixture } from './select-view-fixture';
import { SelectableCardFixture } from './selectable-card-fixture';
import { SkeletonFixture } from './skeleton-fixture';
import { SkeletonRevealFixture } from './skeleton-reveal-fixture';
import { SliderFixture } from './slider-fixture';
import { StatisticFixture } from './statistic-fixture';
import { StepsFixture } from './steps-fixture';
import { TabsFixture } from './tabs-fixture';
import { TagGroupFixture } from './tag-group-fixture';
import { TextControlsFixture } from './text-controls-fixture';
import { TextareaFixture } from './textarea-fixture';
import { ThinkingOrbFixture } from './thinking-orb-fixture';
import { TimelineFixture } from './timeline-fixture';
import { TransferFixture } from './transfer-fixture';
import { TriggerFixture } from './trigger-fixture';
import { TypographyFixture } from './typography-fixture';
import { VerificationCodeFixture } from './verification-code-fixture';
import { VirtualListFixture } from './virtual-list-fixture';
import { VoiceGlowFixture } from './voice-glow-fixture';
import { WatermarkFixture } from './watermark-fixture';
import { WrapFixture } from './wrap-fixture';

addI18nMessages({ [enUS.locale]: enUS });

function App() {
  const zeroSwitchText = new URLSearchParams(location.search).has('zero-switch-text');
  const providerAttrs = new URLSearchParams(location.search).has('provider-attrs');
  const [value, setValue] = useState(false);
  const [changes, setChanges] = useState(0);
  const [autoValue, setAutoValue] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [spacing, setSpacing] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [themeVisible, setThemeVisible] = useState(true);
  const [dark, setDark] = useState(false);
  const [globalTheme, setGlobalTheme] = useState(false);
  const [english, setEnglish] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('/missing-avatar.png');
  const [avatarLoads, setAvatarLoads] = useState(0);
  const [number, setNumber] = useState(9);
  const [numberEvents, setNumberEvents] = useState('');
  return (
    <>
      <MenuCollectorFixture />
      <AffixFixture />
      <AnchorFixture />
      <TabsFixture />
      <StatisticFixture />
      <ProgressFixture />
      <TagGroupFixture />
      <WatermarkFixture />
      <FormFixture />
      <InputFixture />
      <NoticeFixture />
      <CopySecretFixture />
      <InputTagFixture />
      <ImageFixture />
      <TransferFixture />
      <IconFixture />
      <PanelGroupFixture />
      <KvListFixture />
      <BloomMenuFixture />
      <VoiceGlowFixture />
      <BorderBeamFixture />
      <LiquidGlassLogoFixture />
      <ThinkingOrbFixture />
      <SkeletonRevealFixture />
      <TypographyFixture />
      <QrCodeFixture />
      <SelectableCardFixture />
      <MentionFixture />
      <CarouselFixture />
      <ListFixture />
      <ModalFixture />
      <AutoCompleteFixture />
      <PaginationFixture />
      <SelectFixture />
      <VirtualListFixture />
      <SelectViewFixture />
      <InputMaskFixture />
      <VerificationCodeFixture />
      <SliderFixture />
      <RateFixture />
      <ChoiceFixture />
      <InputNumberFixture />
      <TextareaFixture />
      <BackTopFixture />
      <MenuFixture />
      <FloatingFixture />
      <TriggerFixture />
      <ScrollbarFixture />
      <ClampFixture />
      <TextControlsFixture />
      <LineFixture />
      <WrapFixture />
      <PopoverFixture />
      <AvatarGroupFixture />
      <PopconfirmFixture />
      <AlertFixture />
      <CardFixture />
      <SkeletonFixture />
      <ResultFixture />
      <PageHeaderFixture />
      <DescriptionsFixture />
      <GridFixture />
      <DrawerFixture />
      <LayoutFixture />
      <DropdownFixture />
      <BreadcrumbFixture />
      <StepsFixture />
      <TimelineFixture />
      <CollapseFixture />
      <Badge data-testid="count-badge" status="success" count={number} maxCount={10}>
        <Avatar>SD</Avatar>
      </Badge>
      <Badge data-testid="dot-badge" dot count={number} />
      <NumberFlow
        data-testid="number-flow"
        value={number}
        respectMotionPreference={false}
        transformTiming={{ duration: 100 }}
        opacityTiming={{ duration: 100 }}
        onAnimationsStart={() => setNumberEvents((events) => events + 'S')}
        onAnimationsFinish={() => setNumberEvents((events) => events + 'F')}
      />
      <NumberFlow data-testid="static-number-flow" value={number} animated={false} />
      <NumberFlowGroup data-testid="number-group">
        <NumberFlow data-testid="group-first" value={number} respectMotionPreference={false} />
        <NumberFlow data-testid="group-second" value={number * 2} respectMotionPreference={false} />
        <NumberFlow data-testid="group-unchanged" value={42} respectMotionPreference={false} />
      </NumberFlowGroup>
      <Button onClick={() => setNumber((n) => n + 1)}>增加数值</Button>
      <output data-testid="number-events">{numberEvents}</output>
      <Avatar data-testid="text-avatar" size={32}>
        LongAvatarName
      </Avatar>
      <Avatar
        data-testid="image-avatar"
        imageUrl={avatarUrl}
        error={<span>头像失败</span>}
        onLoad={() => setAvatarLoads((count) => count + 1)}
      />
      <Button
        onClick={() =>
          setAvatarUrl(
            'data:image/svg+xml,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>',
              ),
          )
        }
      >
        重试头像
      </Button>
      <output data-testid="avatar-loads">{avatarLoads}</output>
      <Tag data-testid="check-tag" checkable defaultChecked={false}>
        可选标签
      </Tag>
      <Tag data-testid="controlled-tag" checkable checked={false}>
        受控标签
      </Tag>
      <Tag data-testid="close-tag" closable checkable>
        可关闭标签
      </Tag>
      <Tag data-testid="fixed-tag" visible closable>
        固定显示标签
      </Tag>
      <Button onClick={() => setSpinLoading(!spinLoading)}>切换加载</Button>
      <Spin data-testid="delayed-spin" loading={spinLoading} delay={400} tip="加载中">
        <span>保留内容</span>
      </Spin>
      <Spin data-testid="standalone-spin" loading={false} dot size={5} />
      <Button onClick={() => setEnglish(!english)}>切换局部语言</Button>
      <Button onClick={() => useLocale('en-US')}>切换全局英文</Button>
      <section data-testid="global-empty">
        <Empty />
      </section>
      <section data-testid="localized-empty">
        <ConfigProvider locale={english ? enUS : zhCN}>
          <Empty />
        </ConfigProvider>
      </section>
      <Switch
        aria-label="默认开启"
        defaultChecked
        checkedText={zeroSwitchText ? 0 : undefined}
        uncheckedText={zeroSwitchText ? 0 : undefined}
      />
      <Switch aria-label="受控" value={value} onChange={(next) => setValue(Boolean(next))} />
      <Switch
        aria-label="锁定受控"
        value={false}
        onChange={() => setChanges((count) => count + 1)}
      />
      <Switch
        aria-label="异步校验"
        beforeChange={() => new Promise((resolve) => setTimeout(() => resolve(true), 150))}
        onChange={() => setChanges((count) => count + 1)}
      />
      <Switch aria-label="拒绝切换" beforeChange={() => false} />
      <Switch aria-label="禁用" disabled />
      <Switch
        aria-label="自动加载"
        value={autoValue}
        autoLoading
        onChange={(next) => setTimeout(() => setAutoValue(Boolean(next)), 300)}
      />
      <Switch aria-label="拒绝异步" beforeChange={() => Promise.reject(new Error('取消'))} />
      <output data-testid="changes">{changes}</output>
      <Space split={<Divider direction="vertical" />}>
        <span>第一项</span>
        <span>第二项</span>
      </Space>
      <Comment author="作者" content="评论" />
      <Button onClick={() => setClicks((count) => count + 1)}>普通按钮</Button>
      <Button loading onClick={() => setClicks((count) => count + 1)}>
        加载按钮
      </Button>
      <Button href="#target" loading onClick={() => setClicks((count) => count + 1)}>
        加载链接
      </Button>
      <ButtonGroup disabled>
        <Button disabled={false}>组内禁用</Button>
      </ButtonGroup>
      <output data-testid="clicks">{clicks}</output>
      <ConfigProvider autoInsertSpaceInButton={spacing}>
        <Button ref={buttonRef} data-testid="chinese-button">
          保存
        </Button>
      </ConfigProvider>
      <Button onClick={() => setSpacing(!spacing)}>切换字间距</Button>
      <Button onClick={() => buttonRef.current?.focus()}>聚焦保存</Button>
      <Button onClick={() => setDark(!dark)}>切换局部主题</Button>
      <Button onClick={() => setThemeVisible(!themeVisible)}>卸载局部主题</Button>
      <section data-testid="local-theme">
        {themeVisible && (
          <ConfigProvider
            themeMode={dark ? 'dark' : 'light'}
            theme={{ tokens: { 'color-primary-6': '#123456' } }}
            {...(providerAttrs
              ? {
                  'id': 'provider-attrs',
                  'className': dark ? 'provider-dark' : 'provider-light',
                  'style': { padding: dark ? 8 : 4 },
                  'data-provider': dark ? 'dark' : 'light',
                  'aria-label': 'Provider attributes',
                  'onClick': () => setClicks((count) => count + 1),
                }
              : {})}
          >
            <Button>主题按钮</Button>
          </ConfigProvider>
        )}
      </section>
      <Button onClick={() => setGlobalTheme(!globalTheme)}>切换全局主题</Button>
      {globalTheme && <ConfigProvider global themeMode="dark" />}
      <section data-testid="inherited-theme">
        <ConfigProvider theme={{ tokens: { 'color-primary-6': '#654321' } }}>
          <Button>继承环境主题</Button>
        </ConfigProvider>
      </section>
    </>
  );
}

const fixture = location.pathname === '/clamp' ? <ClampFixture /> : <App />;
// Finish mounting before the page load event, even when React's scheduler is delayed.
flushSync(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {location.pathname === '/calendar-root' ? <CalendarRootFixture /> : fixture}
    </StrictMode>,
  );
});
import { IconFixture } from './icon-fixture';
import { ImageFixture } from './image-fixture';
import { PanelGroupFixture } from './panel-group-fixture';
