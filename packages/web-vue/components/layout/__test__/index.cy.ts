import { computed, defineComponent, h, ref } from 'vue';

import { configProviderInjectionKey } from '../../config-provider/context';
import Menu from '../../menu';
import { useHasSider } from '../hooks/use-has-sider';
import Layout from '../index';

const CySiderWrap = defineComponent({
  name: 'CySiderWrap',
  template: '<div><slot /></div>',
});

const { Sider, Content, Header, Footer } = Layout;
const MenuItem = Menu.Item;

const mountTpl = (template: string, extra: Record<string, unknown> = {}) =>
  cy.mount(
    defineComponent({
      components: { Layout, Sider, Content, Header, Footer, Menu, MenuItem, CySiderWrap },
      template,
      ...extra,
    } as Record<string, unknown>),
  );

const siderStyle = (prop: string, value: string) =>
  cy.get('.sd-layout-sider').should(($el) => {
    expect(($el[0] as HTMLElement).style[prop as keyof CSSStyleDeclaration]).to.equal(value);
  });

const stubMatchMedia = (matches: boolean) =>
  cy.window().then((win) => {
    cy.stub(win, 'matchMedia').returns({
      matches,
      media: '',
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });
  });

describe('Layout', () => {
  afterEach(() => {
    document.body.removeAttribute('sd-theme');
  });

  it('detects the sider as a direct child', () => {
    mountTpl(`<Layout><Sider>Sider</Sider><Content>Content</Content></Layout>`);
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
  });

  it('detects the sider nested inside children', () => {
    mountTpl(`<Layout><div><Sider>Sider</Sider></div><Content>Content</Content></Layout>`);
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
  });

  it('statically scans slot-object children and detects a Sider wrapped in another component', () => {
    mountTpl(
      `<Layout><cy-sider-wrap><Sider>Sider</Sider></cy-sider-wrap><Content>Content</Content></Layout>`,
    );
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
  });

  it('useHasSider detects a Sider inside slot functions and slot objects without registration', () => {
    const SiderStub = { name: 'LayoutSider', render: () => null };
    const siderVNode = h(SiderStub);
    const fnChild = h({ name: 'Wrap', render: () => null }, null, () => [siderVNode]);
    const slotObjChild = h({ name: 'Wrap', render: () => null }, null, {
      default: () => [siderVNode],
    });
    const directArray = h('div', [siderVNode]);
    const result = useHasSider(
      ref([]),
      computed(() => [fnChild, slotObjChild, directArray]),
      ref(undefined),
    );
    expect(result.value).to.equal(true);
  });

  it('useHasSider returns false when no Sider exists anywhere', () => {
    const result = useHasSider(
      ref([]),
      computed(() => [h('div', ['text'])]),
      ref(undefined),
    );
    expect(result.value).to.equal(false);
  });

  it('does not add has-sider when hasSider is false', () => {
    mountTpl(`<Layout :has-sider="false"><Sider>Sider</Sider></Layout>`);
    cy.get('.sd-layout').should('not.have.class', 'sd-layout-has-sider');
  });

  it('keeps has-sider in sync when unmounting multiple siders', () => {
    mountTpl(
      `<Layout>
        <Sider v-if="!hide1">Sider</Sider>
        <Sider v-if="!hide2">Sider</Sider>
        <Content>
          <button @click="hide1 = true">hide 1</button>
          <button @click="hide2 = true">hide 2</button>
        </Content>
      </Layout>`,
      { setup: () => ({ hide1: ref(false), hide2: ref(false) }) },
    );
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
    cy.get('button').eq(0).click();
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
    cy.get('button').eq(1).click();
    cy.get('.sd-layout').should('not.have.class', 'sd-layout-has-sider');
  });

  it('renders Header, Content and Footer as semantic tags', () => {
    mountTpl(
      `<Layout><Header>Header</Header><Content>Content</Content><Footer>Footer</Footer></Layout>`,
    );
    cy.get('header.sd-layout-header').should('contain.text', 'Header');
    cy.get('main.sd-layout-content').should('contain.text', 'Content');
    cy.get('footer.sd-layout-footer').should('contain.text', 'Footer');
  });

  it('forces has-sider when hasSider is true without a Sider', () => {
    mountTpl(`<Layout :has-sider="true"><Content>Content</Content></Layout>`);
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
  });

  it('adds rtl class when ConfigProvider provides rtl', () => {
    cy.mount(Layout, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: { slots: {}, rtl: true },
        },
      },
      slots: { default: 'Content' },
    });
    cy.get('.sd-layout').should('have.class', 'sd-layout-rtl');
  });

  it('adds has-trigger class when collapsible', () => {
    mountTpl(
      `<Layout><div><Sider collapsible>Sider</Sider></div><Content>Content</Content></Layout>`,
    );
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-has-trigger');
  });

  it('collapse trigger is a keyboard-accessible button with aria-expanded', () => {
    mountTpl(`<Layout><Sider collapsible>Sider</Sider><Content>Content</Content></Layout>`);
    cy.get('.sd-layout-sider-trigger').as('trigger');
    cy.get('@trigger').should('have.attr', 'role', 'button');
    cy.get('@trigger').should('have.attr', 'tabindex', '0');
    cy.get('@trigger').should('have.attr', 'aria-label', '切换侧边栏');
    // expanded initially (defaultCollapsed false)
    cy.get('@trigger').should('have.attr', 'aria-expanded', 'true');
    // Enter collapses → aria-expanded flips
    cy.get('@trigger').trigger('keydown', { key: 'Enter' });
    cy.get('@trigger').should('have.attr', 'aria-expanded', 'false');
  });

  it('renders 50% width correctly', () => {
    mountTpl(
      `<Layout><div><Sider width="50%">Sider</Sider></div><Content>Content</Content></Layout>`,
    );
    siderStyle('width', '50%');
    siderStyle('flex', '0 0 50%');
  });

  it('adds zero-width class when width is 0%', () => {
    mountTpl(
      `<Layout><div><Sider width="0%">Sider</Sider></div><Content>Content</Content></Layout>`,
    );
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-zero-width');
  });

  it('detects light as the default theme', () => {
    cy.mount(Sider, { slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-light');
  });

  it('follows ConfigProvider themeMode when theme is not set', () => {
    cy.then(() => document.body.setAttribute('sd-theme', 'dark'));
    cy.mount(Sider, { slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-dark');
  });

  it('explicit theme overrides ConfigProvider themeMode', () => {
    cy.then(() => document.body.setAttribute('sd-theme', 'dark'));
    cy.mount(Sider, { props: { theme: 'light' }, slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-light');
  });

  it('detects dark theme when set', () => {
    cy.mount(Sider, { props: { theme: 'dark' }, slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-dark');
  });

  it('is controlled by collapsed', () => {
    cy.mount(Sider, { props: { collapsed: true }, slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ collapsed: false })));
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-collapsed');
  });

  it('zero-width trigger click emits collapse (uncontrolled)', () => {
    stubMatchMedia(false);
    const onCollapse = cy.spy().as('onCollapse');
    mountTpl(
      `<Layout>
        <Sider collapsible breakpoint="lg" collapsed-width="0" @collapse="onCollapse">Sider</Sider>
        <Content>Content</Content>
      </Layout>`,
      { setup: () => ({ onCollapse }) },
    );
    cy.get('.sd-layout-sider-zero-width-trigger').click({ force: true });
    cy.get('@onCollapse').should('have.been.calledWith', true, 'clickTrigger');
  });

  it('zero-width trigger click toggles collapsed state (controlled via parent)', () => {
    mountTpl(
      `<Layout>
        <Sider :collapsed="collapsed" collapsible collapsed-width="0" @collapse="onCollapse">Sider</Sider>
        <Content>Content</Content>
      </Layout>`,
      {
        setup: () => {
          const collapsed = ref(true);
          return {
            collapsed,
            onCollapse: (val: boolean) => {
              collapsed.value = val;
            },
          };
        },
      },
    );
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('.sd-layout-sider-zero-width-trigger').click({ force: true });
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-collapsed');
  });

  it('hideTrigger hides the trigger', () => {
    cy.mount(Sider, {
      props: { collapsible: true, hideTrigger: true },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-trigger').should('not.exist');
    cy.get('.sd-layout-sider-zero-width-trigger').should('not.exist');
  });

  it('renders a custom trigger via slot', () => {
    cy.mount(Sider, {
      props: { collapsible: true },
      slots: { default: 'Sider', trigger: '<span class="my-trigger">T</span>' },
    });
    cy.get('.sd-layout-sider-trigger .my-trigger').should('exist');
  });
});

describe('Sider responsive', () => {
  it('triggers breakpoint when matched', () => {
    stubMatchMedia(true);
    const onBreakpoint = cy.spy().as('onBreakpoint');
    mountTpl(
      `<Layout><Sider breakpoint="md" @breakpoint="onBreakpoint">Sider</Sider><Content>Content</Content></Layout>`,
      { setup: () => ({ onBreakpoint }) },
    );
    cy.get('@onBreakpoint').should('have.been.calledWith', true);
  });

  it('auto-collapses an uncontrolled sider when the breakpoint matches', () => {
    stubMatchMedia(true);
    const onCollapse = cy.spy().as('onCollapse');
    mountTpl(
      `<Layout><Sider collapsible breakpoint="md" @collapse="onCollapse">Sider</Sider><Content>Content</Content></Layout>`,
      { setup: () => ({ onCollapse }) },
    );
    cy.get('@onCollapse').should('have.been.calledWith', true, 'responsive');
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-below');
  });

  it('emits collapse but keeps the controlled collapsed state when breakpoint matches', () => {
    stubMatchMedia(true);
    const onCollapse = cy.spy().as('onCollapse');
    mountTpl(
      `<Layout><Sider collapsible breakpoint="md" :collapsed="false" @collapse="onCollapse">Sider</Sider><Content>Content</Content></Layout>`,
      { setup: () => ({ onCollapse }) },
    );
    cy.get('@onCollapse').should('have.been.calledWith', true, 'responsive');
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-collapsed');
  });
});

describe('Sider temporary', () => {
  const drawerDisplay = () =>
    cy.get('.sd-drawer').then(($el) => ($el[0] as HTMLElement).style.display);

  it('renders a drawer with a hamburger trigger', () => {
    mountTpl(
      `<Layout><Sider temporary :default-collapsed="false" :drawer-props="{ renderToBody: false }">Sider</Sider><Content>Content</Content></Layout>`,
    );
    cy.get('.sd-drawer').should('exist');
    cy.get('.sd-layout-sider-temporary').should('exist');
    cy.get('.sd-layout-sider-temporary-trigger').should('exist');
  });

  it('drawer visible is inverted from collapsed (uncontrolled)', () => {
    cy.mount(Sider, {
      props: { temporary: true, defaultCollapsed: true, drawerProps: { renderToBody: false } },
      slots: { default: 'Sider' },
    });
    drawerDisplay().should('equal', 'none');
    cy.get('.sd-layout-sider-temporary-trigger').click({ force: true });
    drawerDisplay().should('not.equal', 'none');
  });

  it('hamburger trigger emits collapse(false, clickTrigger) when opening', () => {
    const onCollapse = cy.spy().as('onCollapse');
    cy.mount(Sider, {
      props: { temporary: true, defaultCollapsed: true, drawerProps: { renderToBody: false } },
      attrs: { onCollapse },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-temporary-trigger').click({ force: true });
    cy.get('@onCollapse').should('have.been.calledWith', false, 'clickTrigger');
  });

  it('controlled collapsed opens/closes the drawer', () => {
    cy.mount(Sider, {
      props: { temporary: true, collapsed: true, drawerProps: { renderToBody: false } },
      slots: { default: 'Sider' },
    });
    drawerDisplay().should('equal', 'none');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ collapsed: false })));
    drawerDisplay().should('not.equal', 'none');
  });

  it('hideTrigger hides the hamburger trigger in temporary mode', () => {
    cy.mount(Sider, {
      props: { temporary: true, hideTrigger: true, drawerProps: { renderToBody: false } },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-temporary-trigger').should('not.exist');
  });

  it('forwards drawerProps.placement to the drawer', () => {
    cy.mount(Sider, {
      props: {
        temporary: true,
        defaultCollapsed: false,
        drawerProps: { renderToBody: false, placement: 'right' },
      },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-drawer').should(($el) => {
      expect(($el[0] as HTMLElement).style.right).to.equal('0px');
    });
  });

  it('drawer closing sets collapsed=true', () => {
    const onCollapse = cy.spy().as('onCollapse');
    cy.mount(Sider, {
      props: { temporary: true, defaultCollapsed: false, drawerProps: { renderToBody: false } },
      attrs: { onCollapse },
      slots: { default: 'Sider' },
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.findComponent({ name: 'Drawer' }).vm.$emit('update:visible', false);
    });
    // 抽屉/遮罩关闭路径现发独立 'mask' 类型
    cy.get('@onCollapse').should('have.been.calledWith', true, 'mask');
  });
});

describe('Sider rail', () => {
  it('rail reserves railWidth in flow', () => {
    cy.mount(Sider, { props: { rail: true, railWidth: 72 }, slots: { default: 'Sider' } });
    siderStyle('width', '72px');
    siderStyle('flex', '0 0 72px');
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-rail');
  });

  it('rail respects a custom string railWidth', () => {
    cy.mount(Sider, { props: { rail: true, railWidth: '80px' }, slots: { default: 'Sider' } });
    siderStyle('width', '80px');
  });

  it('rail is independent from collapsed', () => {
    cy.mount(Sider, { props: { rail: true, collapsed: true }, slots: { default: 'Sider' } });
    siderStyle('width', '72px');
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-rail');
  });

  it('mouseenter emits update:rail=false, mouseleave emits update:rail=true', () => {
    const onUpdateRail = cy.spy().as('onUpdateRail');
    mountTpl(`<Sider rail expand-on-hover @update:rail="onUpdateRail">Sider</Sider>`, {
      setup: () => ({ onUpdateRail }),
    });
    cy.get('.sd-layout-sider').trigger('mouseenter', { force: true });
    cy.get('@onUpdateRail').should('have.been.calledWith', false);
    cy.get('.sd-layout-sider').trigger('mouseleave', { force: true });
    cy.get('@onUpdateRail').should('have.been.calledWith', true);
  });

  it('expand-on-hover has no effect when rail is false', () => {
    const onUpdateRail = cy.spy().as('onUpdateRail');
    mountTpl(`<Sider :rail="false" expand-on-hover @update:rail="onUpdateRail">Sider</Sider>`, {
      setup: () => ({ onUpdateRail }),
    });
    cy.get('.sd-layout-sider').trigger('mouseenter', { force: true });
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-rail-expand');
    cy.get('@onUpdateRail').should('not.have.been.called');
  });

  it('hover expands the rail overlay and mouseleave collapses it', () => {
    cy.mount(Sider, {
      props: { rail: true, expandOnHover: true, railWidth: 72, width: 200 },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-rail-overlay').should('not.have.class', 'sd-layout-sider-rail-expand');
    cy.get('.sd-layout-sider').trigger('mouseenter', { force: true });
    cy.get('.sd-layout-sider-rail-overlay').should('have.class', 'sd-layout-sider-rail-expand');
    cy.get('.sd-layout-sider').trigger('mouseleave', { force: true });
    cy.get('.sd-layout-sider-rail-overlay').should('not.have.class', 'sd-layout-sider-rail-expand');
  });

  it('rail aligns inner Menu collapsed width to railWidth', () => {
    mountTpl(
      `<Sider rail :rail-width="72" theme="dark"><Menu theme="dark"><MenuItem key="1">nav 1</MenuItem></Menu></Sider>`,
    );
    siderStyle('width', '72px');
    cy.get('.sd-menu').should(($el) => {
      expect(($el[0] as HTMLElement).style.width).to.equal('72px');
    });
    cy.get('.sd-menu').should('have.class', 'sd-menu-in-sider-rail');
  });

  it('rail with string railWidth falls back Menu collapsed width to 72', () => {
    mountTpl(
      `<Sider rail rail-width="80px" theme="dark"><Menu theme="dark"><MenuItem key="1">nav 1</MenuItem></Menu></Sider>`,
    );
    siderStyle('width', '80px');
    cy.get('.sd-menu').should(($el) => {
      expect(($el[0] as HTMLElement).style.width).to.equal('72px');
    });
  });

  it('rail honors user-provided collapsed-width on Menu', () => {
    mountTpl(
      `<Sider rail :rail-width="72" theme="dark"><Menu theme="dark" :collapsed-width="96"><MenuItem key="1">nav 1</MenuItem></Menu></Sider>`,
    );
    cy.get('.sd-menu').should(($el) => {
      expect(($el[0] as HTMLElement).style.width).to.equal('96px');
    });
  });

  it('non-rail Sider does not inject the rail centering class on Menu', () => {
    mountTpl(
      `<Sider theme="dark"><Menu theme="dark"><MenuItem key="1">nav 1</MenuItem></Menu></Sider>`,
    );
    cy.get('.sd-menu').should('not.have.class', 'sd-menu-in-sider-rail');
  });
});

describe('Sider collapsed state', () => {
  it('renders collapsed initially with defaultCollapsed and respects collapsedWidth', () => {
    cy.mount(Sider, {
      props: { collapsible: true, defaultCollapsed: true },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('.sd-layout-sider-trigger').should('have.attr', 'aria-expanded', 'false');
    siderStyle('width', '48px');
    siderStyle('flex', '0 0 48px');
  });

  it('trigger click expands an uncontrolled sider and emits collapse', () => {
    const onCollapse = cy.spy().as('onCollapse');
    cy.mount(Sider, {
      props: { collapsible: true, defaultCollapsed: true },
      attrs: { onCollapse },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-trigger').click();
    cy.get('@onCollapse').should('have.been.calledWith', false, 'clickTrigger');
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-collapsed');
    siderStyle('width', '200px');
    siderStyle('flex', '0 0 200px');
  });

  it('applies collapsedWidth styles when controlled collapsed', () => {
    cy.mount(Sider, {
      props: { collapsible: true, collapsed: true, collapsedWidth: 64 },
      slots: { default: 'Sider' },
    });
    siderStyle('width', '64px');
    siderStyle('flex', '0 0 64px');
  });

  it('shows the left arrow when expanded and the right arrow when collapsed', () => {
    cy.mount(Sider, { props: { collapsible: true }, slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider-trigger .sd-icon-left').should('exist');
    cy.get('.sd-layout-sider-trigger').click();
    cy.get('.sd-layout-sider-trigger .sd-icon-right').should('exist');
  });

  it('reverseArrow flips the trigger icon', () => {
    cy.mount(Sider, {
      props: { collapsible: true, reverseArrow: true },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-trigger .sd-icon-right').should('exist');
  });

  it('rtl flips the trigger icon direction', () => {
    cy.mount(Sider, {
      props: { collapsible: true },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: { slots: {}, rtl: true },
        },
      },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-trigger .sd-icon-right').should('exist');
  });

  it('applies zeroWidthTriggerStyle to the zero-width trigger', () => {
    cy.mount(Sider, {
      props: {
        collapsible: true,
        collapsedWidth: 0,
        zeroWidthTriggerStyle: { color: 'red' },
      },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-zero-width-trigger').should(($el) => {
      expect(($el[0] as HTMLElement).style.color).to.equal('red');
    });
  });

  it('renders the native scrollbar container when scrollbar is false', () => {
    cy.mount(Sider, {
      props: { scrollbar: false },
      slots: { default: 'Sider' },
    });
    cy.get('.sd-layout-sider-children-scroll').should('exist');
  });

  it('uses the component Scrollbar by default', () => {
    cy.mount(Sider, { slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider-children-scroll').should('not.exist');
    cy.get('.sd-layout-sider-children.sd-scrollbar').should('exist');
  });

  it('renders the header slot', () => {
    cy.mount(Sider, {
      slots: { default: 'Sider', header: '<div class="my-sider-header">H</div>' },
    });
    cy.get('.sd-layout-sider-header').should('contain.text', 'H');
    cy.get('.sd-layout-sider-header .my-sider-header').should('exist');
  });

  it('renders no trigger when not collapsible', () => {
    cy.mount(Sider, { slots: { default: 'Sider' } });
    cy.get('.sd-layout-sider-trigger').should('not.exist');
    cy.get('.sd-layout-sider-zero-width-trigger').should('not.exist');
  });
});
