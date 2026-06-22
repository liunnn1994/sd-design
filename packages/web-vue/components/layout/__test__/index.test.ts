import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import Layout from '../index';

const { Sider, Content } = Layout;

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('Layout', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('detect the sider as children', () => {
    const wrapper = mount({
      components: { Layout, Sider, Content },
      template: `<Layout><Sider>Sider</Sider><Content>Content</Content></Layout>`,
    });
    expect(wrapper.find('.sd-layout').classes()).toContain('sd-layout-has-sider');
  });

  it('detect the sider inside the children', () => {
    const wrapper = mount({
      components: { Layout, Sider, Content },
      template: `<Layout><div><Sider>Sider</Sider></div><Content>Content</Content></Layout>`,
    });
    expect(wrapper.find('.sd-layout').classes()).toContain('sd-layout-has-sider');
  });

  it('should not add has-sider when hasSider is false', () => {
    const wrapper = mount({
      components: { Layout, Sider },
      template: `<Layout :has-sider="false"><Sider>Sider</Sider></Layout>`,
    });
    expect(wrapper.find('.sd-layout').classes()).not.toContain('sd-layout-has-sider');
  });

  it('unmount from multiple siders keeps has-sider in sync', async () => {
    const wrapper = mount({
      components: { Layout, Sider, Content },
      setup() {
        const hide1 = ref(false);
        const hide2 = ref(false);
        return { hide1, hide2 };
      },
      template: `
        <Layout>
          <Sider v-if="!hide1">Sider</Sider>
          <Sider v-if="!hide2">Sider</Sider>
          <Content>
            <button @click="hide1 = true">hide 1</button>
            <button @click="hide2 = true">hide 2</button>
          </Content>
        </Layout>`,
    });
    expect(wrapper.find('.sd-layout').classes()).toContain('sd-layout-has-sider');
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.find('.sd-layout').classes()).toContain('sd-layout-has-sider');
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.find('.sd-layout').classes()).not.toContain('sd-layout-has-sider');
  });

  it('detect has-trigger class when collapsible', () => {
    const wrapper = mount({
      components: { Layout, Sider, Content },
      template: `<Layout><div><Sider collapsible>Sider</Sider></div><Content>Content</Content></Layout>`,
    });
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-has-trigger');
  });

  it('renders 50% width correctly', () => {
    const wrapper = mount({
      components: { Layout, Sider, Content },
      template: `<Layout><div><Sider width="50%">Sider</Sider></div><Content>Content</Content></Layout>`,
    });
    const sider = wrapper.find<HTMLElement>('.sd-layout-sider');
    expect(sider.element.style.width).toBe('50%');
    expect(sider.element.style.flex).toBe('0 0 50%');
  });

  it('detect zero-width class when width is 0%', () => {
    const wrapper = mount({
      components: { Layout, Sider, Content },
      template: `<Layout><div><Sider width="0%">Sider</Sider></div><Content>Content</Content></Layout>`,
    });
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-zero-width');
  });

  it('detect light as default theme', () => {
    const wrapper = mount(Sider, { slots: { default: 'Sider' } });
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-light');
  });

  it('follows ConfigProvider themeMode when theme not set', async () => {
    document.body.setAttribute('sd-theme', 'dark');
    const wrapper = mount(Sider, {
      attachTo: document.body,
      slots: { default: 'Sider' },
    });
    await nextTick();
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-dark');
    wrapper.unmount();
    document.body.removeAttribute('sd-theme');
  });

  it('explicit theme overrides ConfigProvider themeMode', async () => {
    document.body.setAttribute('sd-theme', 'dark');
    const wrapper = mount(Sider, {
      attachTo: document.body,
      props: { theme: 'light' },
      slots: { default: 'Sider' },
    });
    await nextTick();
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-light');
    wrapper.unmount();
    document.body.removeAttribute('sd-theme');
  });

  it('detect dark theme when set', () => {
    const wrapper = mount(Sider, { props: { theme: 'dark' }, slots: { default: 'Sider' } });
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-dark');
  });

  it('should be controlled by collapsed', async () => {
    const wrapper = mount(Sider, {
      props: { collapsed: true },
      slots: { default: 'Sider' },
    });
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-collapsed');
    await wrapper.setProps({ collapsed: false });
    expect(wrapper.find('.sd-layout-sider').classes()).not.toContain('sd-layout-sider-collapsed');
  });

  it('zero-width trigger click emits collapse (uncontrolled)', async () => {
    mockMatchMedia(false);
    const onCollapse = vi.fn();
    const wrapper = mount({
      components: { Layout, Sider, Content },
      methods: { onCollapse },
      template: `
        <Layout>
          <Sider
            collapsible
            breakpoint="lg"
            collapsed-width="0"
            @collapse="onCollapse"
          >Sider</Sider>
          <Content>Content</Content>
        </Layout>`,
    });
    await wrapper.find('.sd-layout-sider-zero-width-trigger').trigger('click');
    expect(onCollapse).toHaveBeenCalledTimes(1);
    expect(onCollapse).toHaveBeenCalledWith(true, 'clickTrigger');
  });

  it('zero-width trigger click toggles collapsed state (controlled via parent)', async () => {
    mockMatchMedia(false);
    const wrapper = mount({
      components: { Layout, Sider, Content },
      setup() {
        const collapsed = ref(true);
        const onCollapse = (val: boolean) => {
          collapsed.value = val;
        };
        return { collapsed, onCollapse };
      },
      template: `
        <Layout>
          <Sider
            :collapsed="collapsed"
            collapsible
            breakpoint="lg"
            collapsed-width="0"
            @collapse="onCollapse"
          >Sider</Sider>
          <Content>Content</Content>
        </Layout>`,
    });
    expect(wrapper.find('.sd-layout-sider').classes()).toContain('sd-layout-sider-collapsed');
    await wrapper.find('.sd-layout-sider-zero-width-trigger').trigger('click');
    expect(wrapper.find('.sd-layout-sider').classes()).not.toContain('sd-layout-sider-collapsed');
  });

  it('hide-trigger hides the trigger', () => {
    const wrapper = mount(Sider, {
      props: { collapsible: true, hideTrigger: true },
      slots: { default: 'Sider' },
    });
    expect(wrapper.find('.sd-layout-sider-trigger').exists()).toBe(false);
    expect(wrapper.find('.sd-layout-sider-zero-width-trigger').exists()).toBe(false);
  });

  it('custom trigger via slot', () => {
    const wrapper = mount(Sider, {
      props: { collapsible: true },
      slots: { default: 'Sider', trigger: '<span class="my-trigger">T</span>' },
    });
    expect(wrapper.find('.sd-layout-sider-trigger .my-trigger').exists()).toBe(true);
  });
});

describe('Sider responsive', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should trigger breakpoint when matched', () => {
    mockMatchMedia(true);
    const onBreakpoint = vi.fn();
    mount({
      components: { Layout, Sider, Content },
      methods: { onBreakpoint },
      template: `
        <Layout>
          <Sider breakpoint="md" @breakpoint="onBreakpoint">Sider</Sider>
          <Content>Content</Content>
        </Layout>`,
    });
    expect(onBreakpoint).toHaveBeenCalledWith(true);
  });
});
