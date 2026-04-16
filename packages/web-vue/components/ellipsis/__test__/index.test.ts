import { mount } from '@vue/test-utils';
import type { VNode } from 'vue';
import { nextTick } from 'vue';

import Ellipsis, { PerformantEllipsis } from '../index';

function mockSize(
  element: HTMLElement,
  size: Partial<
    Record<'offsetWidth' | 'scrollWidth' | 'clientWidth' | 'offsetHeight' | 'scrollHeight', number>
  >,
) {
  for (const [key, value] of Object.entries(size)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
    });
  }
}

function collectVNodeText(nodes: VNode[] | undefined): string {
  if (!nodes) {
    return '';
  }

  return nodes
    .map((node) => {
      if (typeof node.children === 'string') {
        return node.children;
      }

      if (Array.isArray(node.children)) {
        return collectVNodeText(node.children as VNode[]);
      }

      return '';
    })
    .join('');
}

describe('Ellipsis', () => {
  test('should render single-line ellipsis style', () => {
    const wrapper = mount(Ellipsis, {
      attrs: {
        style: 'max-width: 120px;',
      },
      slots: {
        default: 'ellipsis content',
      },
    });

    const element = wrapper.find('.sd-ellipsis');
    expect(element.exists()).toBe(true);
    expect(element.classes()).toContain('sd-ellipsis--single-line');
    expect(element.attributes('style')).toContain('text-overflow: ellipsis;');
  });

  test('should forward custom tooltip slot content', async () => {
    const wrapper = mount(Ellipsis, {
      props: {
        tooltip: {
          mini: true,
        },
      },
      attrs: {
        style: 'max-width: 80px;',
      },
      slots: {
        default: 'tooltip slot content',
        tooltip: '<div class="custom-tooltip">custom tooltip body</div>',
      },
    });

    const root = wrapper.find('.sd-ellipsis').element as HTMLElement;
    mockSize(root, { offsetWidth: 80, clientWidth: 80, scrollWidth: 180 });

    wrapper.findComponent({ name: 'ResizeObserver' }).vm.$emit('resize');
    await nextTick();

    const tooltip = wrapper.findComponent({ name: 'Tooltip' });
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.vm.$slots.content).toBeTruthy();

    const slotNodes = tooltip.vm.$slots.content?.();
    expect(collectVNodeText(slotNodes)).toContain('custom tooltip body');
  });

  test('should support lineClamp prop', () => {
    const wrapper = mount(Ellipsis, {
      props: {
        lineClamp: 2,
      },
      slots: {
        default:
          'A design is a plan or specification for the construction of an object or system.'.repeat(
            2,
          ),
      },
    });

    const element = wrapper.find('.sd-ellipsis');
    expect(element.classes()).toContain('sd-ellipsis--line-clamp');
    expect(element.attributes('style')).toContain('-webkit-line-clamp: 2;');
  });

  test('should toggle expanded state when click trigger is enabled', async () => {
    const wrapper = mount(Ellipsis, {
      props: {
        expandTrigger: 'click',
        tooltip: false,
      },
      attrs: {
        style: 'max-width: 80px;',
      },
      slots: {
        default: 'test ellipsis content',
      },
    });

    const root = wrapper.find('.sd-ellipsis').element as HTMLElement;
    const content = wrapper.find('.sd-ellipsis-content').element as HTMLElement;
    mockSize(root, { offsetWidth: 80, clientWidth: 80, scrollWidth: 80 });
    mockSize(content, { offsetWidth: 160, scrollWidth: 160 });

    wrapper.findComponent({ name: 'ResizeObserver' }).vm.$emit('resize');
    await nextTick();

    await wrapper.find('.sd-ellipsis').trigger('click');
    expect(wrapper.find('.sd-ellipsis').attributes('style')).toContain('white-space: normal;');

    await wrapper.find('.sd-ellipsis').trigger('click');
    expect(wrapper.find('.sd-ellipsis').attributes('style')).toContain('text-overflow: ellipsis;');
  });

  test('should fallback to native title when tooltip is disabled', async () => {
    const wrapper = mount(Ellipsis, {
      props: {
        tooltip: false,
      },
      attrs: {
        style: 'max-width: 80px;',
      },
      slots: {
        default: 'tooltip fallback content',
      },
    });

    const root = wrapper.find('.sd-ellipsis').element as HTMLElement;
    const content = wrapper.find('.sd-ellipsis-content').element as HTMLElement;
    mockSize(root, { offsetWidth: 80, clientWidth: 80, scrollWidth: 80 });
    mockSize(content, { offsetWidth: 180, scrollWidth: 180 });

    wrapper.findComponent({ name: 'ResizeObserver' }).vm.$emit('resize');
    await nextTick();

    expect(wrapper.find('.sd-ellipsis').attributes('title')).toBe('tooltip fallback content');
  });

  test('should activate performant ellipsis after mouseenter', async () => {
    const wrapper = mount(PerformantEllipsis, {
      props: {
        tooltip: false,
      },
      attrs: {
        style: 'max-width: 80px;',
      },
      slots: {
        default: 'performant ellipsis content',
      },
    });

    expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).toBe(false);

    await wrapper.trigger('mouseenter');
    await nextTick();

    expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).toBe(true);
  });
});
