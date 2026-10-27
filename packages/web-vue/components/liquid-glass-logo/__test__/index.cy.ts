import { h, ref } from 'vue';

import { resolveLiquidGlassLogo } from '@sdata/web-core/liquid-glass-logo/foundation';
import {
  measureLiquidGlassLogoText,
  getLiquidGlassLogoFont,
} from '@sdata/web-core/liquid-glass-logo/layout';

import type { SdThemeConfig } from '../../config-provider/theme';

import ConfigProvider from '../../config-provider';
import ThemeProvider from '../../theme-provider';
import LiquidGlassLogo from '../index';

const root = '.sd-liquid-glass-logo';
const pixels = (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext('webgl2')!;
  gl.finish();
  const values = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, values);
  return values;
};

describe('LiquidGlassLogo', () => {
  it('Pretext 测量保留中英文、空格、字重、拉伸与字间距', () => {
    cy.document().then((document) => {
      for (const text of [' Design', 'Hello  世界', 'AV fi']) {
        const tuning = resolveLiquidGlassLogo({
          text,
          fontSize: 30,
          fontWeight: 700,
          fontFamily: 'Arial',
          fontStretch: 'expanded',
          letterSpacing: 0.05,
        });
        const context = document.createElement('canvas').getContext('2d')!;
        context.font = getLiquidGlassLogoFont(tuning);
        context.fontStretch = tuning.fontStretch as CanvasFontStretch;
        context.letterSpacing = `${tuning.letterSpacing * tuning.fontSize}px`;
        expect(measureLiquidGlassLogoText(null, tuning).contentWidth).to.be.closeTo(
          context.measureText(text).width,
          2,
        );
      }
    });
  });
  it('默认自动宽度，关闭后铺满容器，显式 CSS 宽度优先', () => {
    cy.mount(() =>
      h('div', { style: 'width:400px' }, h(LiquidGlassLogo, { paused: true, maxDpr: 1 })),
    );
    cy.get(root).should('have.css', 'width', '41px');
    cy.mount(LiquidGlassLogo, { props: { paused: true, autoWidth: false, maxDpr: 1 } });
    cy.get(root).should(($root) => {
      expect($root[0].getBoundingClientRect().width).to.be.greaterThan(100);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ autoWidth: true }));
    cy.get(root).should('have.css', 'width', '41px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ style: 'width:120px' }));
    cy.get(root).should('have.css', 'width', '120px');
  });

  it('使用 Pretext 测量字标，响应文字、间距与图案变化', () => {
    cy.mount(LiquidGlassLogo, {
      props: {
        paused: true,
        ending: 'wordmark',
        logoSize: 32,
        fontSize: 30,
        text: 'Design',
        mark: '',
        maxDpr: 1,
      },
    });
    let initial = 0;
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get(root).then(($root) => {
      initial = $root[0].getBoundingClientRect().width;
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ text: 'Design for Developers' }));
    cy.get(root).should(($root) => {
      expect($root[0].getBoundingClientRect().width).to.be.greaterThan(initial);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ text: 'Design', letterSpacing: 0.3 }));
    cy.get(root).should(($root) => {
      expect($root[0].getBoundingClientRect().width).to.be.greaterThan(initial);
    });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        letterSpacing: -0.01,
        mark: 'logo',
        logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="50"%3E%3Cpath fill="blue" d="M0 0h100v50H0z"/%3E%3C/svg%3E',
      }),
    );
    cy.get(root).should(($root) => {
      expect($root[0].getBoundingClientRect().width).to.be.greaterThan(initial);
    });
  });

  it('百分比高度随父容器变化时重新计算宽度', () => {
    const height = ref(32);
    cy.mount(() =>
      h(
        'div',
        { style: { height: `${height.value}px` } },
        h(LiquidGlassLogo, { height: '100%', paused: true, maxDpr: 1 }),
      ),
    );
    cy.get(root).should('have.css', 'height', '32px').and('have.css', 'width', '41px');
    cy.then(() => {
      height.value = 64;
    });
    cy.get(root).should('have.css', 'height', '64px').and('have.css', 'width', '82px');
  });

  it('完成真实 WebGL 首帧，支持跳转、重播与暂停', () => {
    cy.mount(LiquidGlassLogo, {
      props: { 'paused': true, 'height': 300, 'maxDpr': 1, 'aria-label': '品牌标志' },
    });
    cy.get(root)
      .should('have.attr', 'data-liquid-glass-ready', 'true')
      .and('have.attr', 'aria-label', '品牌标志');
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.seek(1);
    });
    cy.get(`${root} canvas`).then(($canvas) => {
      const first = pixels($canvas[0] as HTMLCanvasElement);
      expect(first.some((value) => value > 0)).to.equal(true);
      cy.get('@vue').then(({ wrapper }) => {
        wrapper.vm.seek(1.8);
      });
      cy.get(`${root} canvas`).then(($next) => {
        expect(
          pixels($next[0] as HTMLCanvasElement).some((value, index) => value !== first[index]),
        ).to.equal(true);
      });
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.play();
      wrapper.vm.pause();
      wrapper.vm.replay();
      wrapper.vm.seek(1.8);
      expect(wrapper.emitted('ready')).to.have.length(1);
      expect(wrapper.emitted('error')).to.equal(undefined);
    });
  });

  it('响应主题、字标、背景图和容器尺寸变化', () => {
    cy.mount(LiquidGlassLogo, {
      props: { paused: true, ending: 'wordmark', text: '苏打', height: 280, maxDpr: 1 },
    });
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        theme: 'light',
        text: '设计',
        height: 320,
        backgroundImage: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        backgroundScale: 9,
        backgroundTintOpacity: 2,
      }),
    );
    cy.get(root)
      .should('have.attr', 'aria-label', '设计')
      .and('have.css', 'height', '320px')
      .and('have.css', 'background-color', 'rgb(226, 226, 229)');
    cy.get(`${root}-background`).should('have.length', 2).last().should('have.css', 'opacity', '1');
    cy.get(`${root} canvas`).should(($canvas) => {
      expect(($canvas[0] as HTMLCanvasElement).height).to.equal(320);
    });
  });

  it('WebGL 不可用时显示静态字标和自定义替代插槽', () => {
    cy.window().then((win) => {
      const original = win.HTMLCanvasElement.prototype.getContext;
      cy.stub(win.HTMLCanvasElement.prototype, 'getContext').callsFake(function (
        this: HTMLCanvasElement,
        ...args: Parameters<typeof original>
      ) {
        if (args[0] === 'webgl2') return null;
        return Reflect.apply(original, this, args);
      });
    });
    cy.mount(LiquidGlassLogo, { props: { ending: 'wordmark', text: '苏打', mark: '' } });
    cy.get(`${root}-fallback`).should('have.text', '苏打');
    cy.get(`${root}-fallback`).should(($fallback) => {
      expect($fallback[0].scrollWidth).to.be.at.most($fallback[0].clientWidth);
      expect($fallback[0].scrollHeight).to.be.at.most($fallback[0].clientHeight);
    });
    cy.get('@vue').then(({ wrapper }) => {
      expect(wrapper.emitted('error')).to.have.length(1);
    });
    cy.mount(LiquidGlassLogo, { slots: { fallback: () => h('strong', '品牌静态标志') } });
    cy.get(`${root}-fallback`).should('have.text', '品牌静态标志');
  });

  it('上下文丢失后释放渲染资源并显示降级内容', () => {
    cy.mount(LiquidGlassLogo, { props: { maxDpr: 1 } });
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get(`${root} canvas`).then(($canvas) => {
      const gl = ($canvas[0] as HTMLCanvasElement).getContext('webgl2')!;
      gl.getExtension('WEBGL_lose_context')!.loseContext();
    });
    cy.get(root).should('not.have.attr', 'data-liquid-glass-ready');
    cy.get(root).should('have.attr', 'data-liquid-glass-fallback');
    cy.get(`${root}-fallback img`).should('be.visible');
  });

  it('着色器编译失败时释放已创建的程序并降级', () => {
    cy.window().then((win) => {
      cy.stub(win.WebGL2RenderingContext.prototype, 'getShaderParameter').returns(false);
      cy.spy(win.WebGL2RenderingContext.prototype, 'deleteProgram').as('failedProgram');
    });
    cy.mount(LiquidGlassLogo);
    cy.get(`${root}-fallback img`).should('be.visible');
    cy.get('@failedProgram').should('have.callCount', 1);
  });

  it('减少动态效果时始终绘制最终状态', () => {
    cy.window().then((win) => {
      const original = win.matchMedia.bind(win);
      cy.stub(win, 'matchMedia').callsFake((query: string) =>
        original(query === '(prefers-reduced-motion: reduce)' ? '(min-width: 0px)' : query),
      );
    });
    cy.mount(LiquidGlassLogo, { props: { paused: true, maxDpr: 1 } });
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get('@vue').then(({ wrapper }) => {
      const canvas = wrapper.find('canvas').element;
      wrapper.vm.seek(0.5);
      const first = pixels(canvas);
      wrapper.vm.seek(1.8);
      expect(pixels(canvas)).to.deep.equal(first);
    });
  });

  it('卸载时释放 GPU 资源与观察器', () => {
    cy.mount(LiquidGlassLogo, { props: { loop: true, maxDpr: 1 } });
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get(`${root} canvas`).then(($canvas) => {
      const gl = ($canvas[0] as HTMLCanvasElement).getContext('webgl2')!;
      cy.spy(gl, 'deleteProgram').as('deleteProgram');
      cy.spy(gl, 'deleteTexture').as('deleteTexture');
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@deleteProgram').should('have.callCount', 2);
    cy.get('@deleteTexture').should('have.callCount', 3);
  });

  it('默认高度为 32px，显式高度可小于默认值', () => {
    cy.mount(LiquidGlassLogo, { props: { paused: true, maxDpr: 1 } });
    cy.get(root).should('have.css', 'height', '32px').and('have.css', 'min-height', '0px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ height: 16 }));
    cy.get(root).should('have.css', 'height', '16px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ height: 256 }));
    cy.get(root).should('have.css', 'height', '256px');
  });

  it('共享主题 token 可动态调整默认高度', () => {
    const theme = ref<SdThemeConfig>({
      components: { 'liquid-glass-logo': { 'liquid-glass-logo-height': '48px' } },
    });
    cy.mount(() =>
      h(
        ConfigProvider,
        { theme: theme.value },
        { default: () => h(LiquidGlassLogo, { paused: true, maxDpr: 1 }) },
      ),
    );
    cy.get(root).should('have.css', 'height', '48px');
    cy.then(() => {
      theme.value = { components: { 'liquid-glass-logo': { height: '64px' } } };
    });
    cy.get(root).should('have.css', 'height', '64px');
  });
});

describe('LiquidGlassLogo 自动主题', () => {
  let savedBody: string | null;
  let savedRoot: string | null;
  beforeEach(() => {
    cy.document().then((document) => {
      savedBody = document.body.getAttribute('sd-theme');
      savedRoot = document.documentElement.getAttribute('sd-theme');
      document.body.removeAttribute('sd-theme');
      document.documentElement.removeAttribute('sd-theme');
    });
  });
  afterEach(() => {
    cy.document().then((document) => {
      if (savedBody === null) document.body.removeAttribute('sd-theme');
      else document.body.setAttribute('sd-theme', savedBody);
      if (savedRoot === null) document.documentElement.removeAttribute('sd-theme');
      else document.documentElement.setAttribute('sd-theme', savedRoot);
    });
  });
  const browserMode = (initial: boolean) => {
    let dark = initial;
    let change = () => {};
    cy.window().then((win) => {
      const original = win.matchMedia.bind(win);
      const media = original('(prefers-color-scheme: dark)');
      Object.defineProperty(media, 'matches', { get: () => dark, configurable: true });
      change = () => {
        media.dispatchEvent(
          new win.MediaQueryListEvent('change', { matches: dark, media: media.media }),
        );
      };
      cy.stub(win, 'matchMedia').callsFake((query: string) =>
        query.includes('prefers-color-scheme: dark') ? media : original(query),
      );
    });
    return (value: boolean) =>
      cy.then(() => {
        dark = value;
        change();
      });
  };

  it('没有组件库主题时跟随浏览器偏好，并响应变化', () => {
    const setDark = browserMode(true);
    cy.mount(LiquidGlassLogo, { props: { paused: true, style: 'color-scheme:normal' } });
    cy.get(root)
      .should('have.attr', 'data-liquid-glass-theme', 'dark')
      .and('have.css', 'background-color', 'rgb(0, 0, 0)');
    setDark(false);
    cy.get(root)
      .should('have.attr', 'data-liquid-glass-theme', 'light')
      .and('have.css', 'background-color', 'rgb(226, 226, 229)');
    setDark(true);
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
  });

  it('组件库局部主题优先于系统偏好，并支持嵌套覆盖', () => {
    browserMode(true);
    const mode = ref<'dark' | 'light'>('light');
    cy.mount(() =>
      h(
        ConfigProvider,
        { themeMode: 'dark' },
        {
          default: () =>
            h(
              ThemeProvider,
              { themeMode: mode.value },
              { default: () => h(LiquidGlassLogo, { paused: true, style: 'color-scheme:normal' }) },
            ),
        },
      ),
    );
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
    cy.then(() => {
      mode.value = 'dark';
    });
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
  });

  it('显式主题和颜色优先，切回 auto 后重新跟随', () => {
    const setDark = browserMode(false);
    cy.mount(LiquidGlassLogo, {
      props: { paused: true, theme: 'dark', textColor: '#123456', style: 'color-scheme:normal' },
    });
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
    setDark(true);
    setDark(false);
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ theme: 'auto' }));
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
    cy.get(`${root} canvas`).then(($canvas) => {
      ($canvas[0] as HTMLCanvasElement)
        .getContext('webgl2')!
        .getExtension('WEBGL_lose_context')!
        .loseContext();
    });
    cy.get(`${root}-fallback`).should('have.css', 'color', 'rgb(18, 52, 86)');
  });

  it('页面 data-theme 优先于系统偏好并响应切换', () => {
    browserMode(true);
    const mode = ref<'light' | 'dark'>('light');
    cy.mount(() =>
      h(
        'div',
        { 'data-theme': mode.value, 'style': { colorScheme: mode.value } },
        h(LiquidGlassLogo, { paused: true }),
      ),
    );
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
    cy.then(() => {
      mode.value = 'dark';
    });
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
  });

  it('没有主题属性时读取页面声明的 color-scheme', () => {
    browserMode(true);
    cy.mount(LiquidGlassLogo, { props: { paused: true, style: 'color-scheme:light' } });
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
  });
});
