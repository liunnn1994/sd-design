import { mount } from '@vue/test-utils';

import { describe, test, expect } from 'vitest';

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
});
