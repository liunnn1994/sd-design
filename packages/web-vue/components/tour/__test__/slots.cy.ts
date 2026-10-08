import { defineComponent, h, inject, onUnmounted, provide, shallowRef } from 'vue';

import type { TourExpose, TourSlotProps } from '../types';

import Button from '../../button';
import Tour from '../index';

const steps = [
  { popover: { title: '原生标题', description: '原生描述', onPopoverRender: () => {} } },
  { popover: { title: '第二步', description: '另一段内容' } },
];

function instance(run: (tour: TourExpose) => void) {
  cy.get('@vue').then(({ wrapper }) => run(wrapper.vm as TourExpose));
}

describe('Tour Vue slots', () => {
  it('renders library buttons, preserves injection and reactive content, and cleans up on destroy', () => {
    const text = shallowRef('开始');
    const unmounted = cy.spy().as('slotUnmounted');
    const Child = defineComponent({
      setup() {
        const provided = inject<string>('tour-context');
        onUnmounted(unmounted);
        return () => h('div', { 'data-testid': 'slot-content' }, `${provided}：${text.value}`);
      },
    });
    const tour = shallowRef<TourExpose>();
    cy.mount(
      defineComponent({
        setup() {
          provide('tour-context', '父级上下文');
          return () =>
            h(
              Tour,
              { ref: tour, steps, animate: false },
              {
                title: ({ index }: TourSlotProps) => h('span', `Vue 标题 ${index}`),
                description: () => h(Child),
                footer: ({ driver }: TourSlotProps) =>
                  h(Button, { onClick: () => driver.moveNext() }, () => '组件按钮'),
              },
            );
        },
      }),
    );
    cy.then(() => tour.value!.drive());
    cy.get('.driver-popover-title').should('have.text', 'Vue 标题 0');
    cy.get('[data-testid="slot-content"]').should('have.text', '父级上下文：开始');
    cy.then(() => {
      text.value = '更新';
    });
    cy.get('[data-testid="slot-content"]').should('have.text', '父级上下文：更新');
    cy.contains('.driver-popover-footer .sd-btn', '组件按钮').click();
    cy.get('.driver-popover-title').should('have.text', 'Vue 标题 1');
    cy.get('[data-testid="slot-content"]').should('have.length', 1);
    cy.then(() => tour.value!.destroy());
    cy.get('[data-testid="slot-content"], .driver-popover').should('not.exist');
    cy.get('@slotUnmounted').should('have.been.calledOnce');
    cy.then(() => tour.value!.highlight({ popover: {} }));
    cy.get('.driver-popover-title').should('have.text', 'Vue 标题 undefined');
    cy.then(() => tour.value!.destroy());
    cy.get('@slotUnmounted').should('have.been.calledTwice');
  });

  it('keeps global and step-level render hooks intact and supports progress slots', () => {
    const stepHook = cy.spy().as('stepHook');
    const globalHook = cy.spy().as('globalHook');
    cy.mount(Tour, {
      props: {
        animate: false,
        onPopoverRender: globalHook,
        steps: [
          { popover: { title: 'A', onPopoverRender: stepHook } },
          { popover: { title: 'B' } },
        ],
      },
      slots: { progress: ({ index }: TourSlotProps) => h('strong', `步骤 ${index}`) },
    });
    instance((tour) => tour.drive());
    cy.get('.driver-popover-progress-text').should('be.visible').and('have.text', '步骤 0');
    cy.get('@stepHook').should('have.been.calledOnce');
    cy.get('@globalHook').should('not.have.been.called');
    cy.get('.driver-popover-next-btn').click();
    cy.get('.driver-popover-progress-text').should('have.text', '步骤 1');
    cy.get('@globalHook').should('have.been.calledOnce');
    instance((tour) => tour.destroy());
  });

  it('refreshes placement after slot content changes size', () => {
    const height = shallowRef(50);
    cy.mount(Tour, {
      props: { animate: false, steps: [{ popover: {} }] },
      slots: {
        description: () => h('div', { style: { height: `${height.value}px` } }, '响应式内容'),
      },
    });
    instance((tour) => tour.drive());
    cy.get('.driver-popover').then(($popover) => {
      const firstTop = $popover[0].getBoundingClientRect().top;
      cy.then(() => {
        height.value = 150;
      });
      cy.get('.driver-popover').should(($updated) => {
        expect($updated[0].getBoundingClientRect().top).to.be.lessThan(firstTop - 20);
      });
    });
    instance((tour) => tour.destroy());
  });
});
