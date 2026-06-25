import { mount } from '@vue/test-utils';

import { describe, test, expect, vi } from 'vitest';

import BorderBeam from '../index';

describe('BorderBeam', () => {
  test('should render with default props', () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
    expect(wrapper.find('[data-active]').exists()).toBe(true);
    expect(wrapper.find('.sd-border-beam').exists()).toBe(true);
  });

  test('should apply size prop', async () => {
    const wrapper = mount(BorderBeam, {
      props: { size: 'sm' },
      slots: { default: '<div>Content</div>' },
    });
    const el = wrapper.find('[data-beam]');
    expect(el.exists()).toBe(true);
    // The CSS is dynamically injected; verify the style element was created
    const styleEl = document.querySelector('[data-beam-style]');
    expect(styleEl).toBeTruthy();
  });

  test('should not show data-active when active is false', () => {
    const wrapper = mount(BorderBeam, {
      props: { active: false },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-active]').exists()).toBe(false);
  });

  test('should show data-fading when toggling active from true to false', async () => {
    const wrapper = mount(BorderBeam, {
      props: { active: true },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-active]').exists()).toBe(true);

    await wrapper.setProps({ active: false });
    expect(wrapper.find('[data-fading]').exists()).toBe(true);
  });

  test('should apply colorVariant prop', () => {
    const wrapper = mount(BorderBeam, {
      props: { colorVariant: 'ocean' },
      slots: { default: '<div>Content</div>' },
    });
    // Verify component renders without error
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
  });

  test('should apply theme prop', () => {
    const wrapper = mount(BorderBeam, {
      props: { theme: 'light' },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
  });

  test('should apply custom borderRadius', () => {
    const wrapper = mount(BorderBeam, {
      props: { borderRadius: 24 },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
  });

  test('should render slot content', () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div class="inner-content">Hello</div>' },
    });
    expect(wrapper.find('.inner-content').exists()).toBe(true);
    expect(wrapper.find('.inner-content').text()).toBe('Hello');
  });

  test('should render bloom element', () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-beam-bloom]').exists()).toBe(true);
  });

  test('should apply strength and density as CSS variables', () => {
    const wrapper = mount(BorderBeam, {
      props: { strength: 0.5, density: 2 },
      slots: { default: '<div>Content</div>' },
    });
    const style = wrapper.find('[data-beam]').attributes('style');
    expect(style).toContain('--beam-strength');
    expect(style).toContain('--beam-density');
  });

  test('should handle line size', () => {
    const wrapper = mount(BorderBeam, {
      props: { size: 'line' },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
  });

  test('should handle pulse sizes', () => {
    const wrapper = mount(BorderBeam, {
      props: { size: 'pulse-inner' },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
  });

  test('should inject style element into document head on mount', () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });
    const el = wrapper.find('[data-beam]');
    const beamId = el.attributes('data-beam');
    expect(beamId).toBeTruthy();
    // Style element is created for this instance
    const styleEl = document.querySelector(`style[data-beam-style="${beamId}"]`);
    expect(styleEl).toBeTruthy();

    wrapper.unmount();
  });

  test('should expose flowFrom method', () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });

    expect(typeof wrapper.vm.flowFrom).toBe('function');
  });

  test('should start flow from top-right by default', async () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    wrapper.vm.flowFrom();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-flowing]').exists()).toBe(true);
    expect(wrapper.find('[data-beam-flow]').exists()).toBe(true);
    const style = wrapper.find('[data-beam]').attributes('style');
    expect(style).toContain('--beam-flow-x: 200px');
    expect(style).toContain('--beam-flow-y: 0px');
  });

  test('should start flow from custom local coordinate', async () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    wrapper.vm.flowFrom({ x: 24, y: 36 });
    await wrapper.vm.$nextTick();

    const style = wrapper.find('[data-beam]').attributes('style');
    expect(style).toContain('--beam-flow-x: 24px');
    expect(style).toContain('--beam-flow-y: 36px');
    expect(style).toContain('--beam-flow-radius');
  });

  test('should fade out after flow entrance when active is false', async () => {
    const wrapper = mount(BorderBeam, {
      props: { active: false },
      slots: { default: '<div>Content</div>' },
    });
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    wrapper.vm.flowFrom('center');
    await wrapper.vm.$nextTick();

    // During the entrance the beam is active even though `active` is false.
    expect(wrapper.find('[data-active]').exists()).toBe(true);
    await wrapper.find('[data-beam-flow]').trigger('animationend');
    await wrapper.vm.$nextTick();

    // Once the entrance ends, a controlled `active=false` triggers the fade-out
    // so the border can be hidden rather than staying stuck on.
    expect(wrapper.find('[data-beam-flow]').exists()).toBe(false);
    expect(wrapper.find('[data-flowing]').exists()).toBe(false);
    expect(wrapper.find('[data-active]').exists()).toBe(false);
    expect(wrapper.find('[data-fading]').exists()).toBe(true);
  });

  test('should keep beam active after flow entrance when active is true', async () => {
    const wrapper = mount(BorderBeam, {
      props: { active: true },
      slots: { default: '<div>Content</div>' },
    });
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    wrapper.vm.flowFrom('center');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-active]').exists()).toBe(true);
    await wrapper.find('[data-beam-flow]').trigger('animationend');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-beam-flow]').exists()).toBe(false);
    expect(wrapper.find('[data-flowing]').exists()).toBe(false);
    expect(wrapper.find('[data-active]').exists()).toBe(true);
    expect(wrapper.find('[data-fading]').exists()).toBe(false);
  });

  test('should include flow overlay styles in dynamic CSS', () => {
    const wrapper = mount(BorderBeam, {
      slots: { default: '<div>Content</div>' },
    });
    const beamId = wrapper.find('[data-beam]').attributes('data-beam');
    const styleEl = document.querySelector(`style[data-beam-style="${beamId}"]`);

    expect(styleEl?.textContent).toContain('[data-beam-flow]');
    expect(styleEl?.textContent).toContain('beam-flow-spread');
  });
});
