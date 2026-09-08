import { h } from 'vue';

import type { TourStep } from '../types';

import Tour from '../index';

const steps: TourStep[] = [
  { element: '#tour-step-a', popover: { title: '步骤一', description: '内容一' } },
  { element: '#tour-step-b', popover: { title: '步骤二', description: '内容二' } },
];

const defaultSlots = {
  default: '<div><button id="tour-step-a">A</button><button id="tour-step-b">B</button></div>',
};

const zIndex = (selector: string, value: string) =>
  cy.get(selector).should(($el) => {
    expect(($el[0] as HTMLElement).style.zIndex).to.equal(value);
  });

describe('Tour', () => {
  afterEach(() => {
    // Tour portals its overlay/popover to document.body; remove only those,
    // never the whole body (that would wipe Cypress's [data-cy-root] mount point).
    document.body
      .querySelectorAll('.sd-tour-popover, .sd-tour-overlay, .sd-tour-mask')
      .forEach((el) => el.remove());
  });

  it('uses localized button text and keeps default actions', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '下一步').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    cy.get('.sd-tour-popover-prev-btn').should('contain.text', '上一步');
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '完成');
    cy.get('.sd-tour-popover-prev-btn').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
    cy.get('.sd-tour-popover-close-btn').click();
    cy.get('.sd-tour-popover').should('not.exist');
  });

  it('starts from the default state', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, defaultCurrent: 1, steps },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover').should('exist');
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    zIndex('.sd-tour-overlay', '1000');
    zIndex('.sd-tour-popover', '1001');
  });

  it('passes Floating UI options through to the tour popover', () => {
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        floatingOptions: {
          middleware: [
            {
              name: 'testCoordinates',
              fn: () => ({ x: 41, y: 53 }),
            },
          ],
        },
      },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-shell').should(($shell) => {
      expect(($shell[0] as HTMLElement).style.transform).to.contain('41px');
      expect(($shell[0] as HTMLElement).style.transform).to.contain('53px');
    });
  });

  it('reacts to controlled current changes', () => {
    cy.mount(Tour, { props: { visible: true, current: 0, steps }, slots: defaultSlots });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ current: 1 })));
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
  });

  it('preserves user hooks via the controller', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, zIndex: 3200, showProgress: true, allowClose: false },
      slots: defaultSlots,
    });
    cy.get('@vue').should(({ wrapper }) => {
      const controller = (
        wrapper.vm as unknown as {
          getController: () => {
            getConfig: () => { showProgress?: boolean; allowClose?: boolean };
          };
        }
      ).getController();
      expect(controller?.getConfig().showProgress).to.equal(true);
      expect(controller?.getConfig().allowClose).to.equal(false);
    });
    zIndex('.sd-tour-popover', '3201');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ zIndex: 4200 })));
    zIndex('.sd-tour-popover', '4201');
  });

  it('renders custom title/description slots with button props', () => {
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        buttonProps: {
          previous: { type: 'outline' },
          next: { status: 'danger' },
          close: { type: 'text' },
        },
      },
      slots: {
        ...defaultSlots,
        title: ({ current, title }: any) =>
          h('div', { class: 'tour-title-slot' }, `${title}-${(current ?? 0) + 1}`),
        description: ({ current, description }: any) =>
          h('div', { class: 'tour-description-slot' }, [
            h('span', `${description}-${(current ?? 0) + 1}`),
            h('table', { class: 'tour-description-table' }, [
              h('tbody', [
                h('tr', [h('td', 'A'), h('td', 'B')]),
                h('tr', [h('td', 'C'), h('td', 'D')]),
              ]),
            ]),
          ]),
      },
    });
    cy.get('.tour-title-slot').should('contain.text', '步骤一-1');
    cy.get('.tour-description-slot').should('contain.text', '内容一-1');
    cy.get('.tour-description-table').should('exist');
    cy.get('.sd-tour-popover-next-btn').should('have.class', 'sd-btn-status-danger');
    cy.get('.sd-tour-popover-prev-btn').should('have.class', 'sd-btn-outline');
    cy.get('.sd-tour-popover-close-btn').should('have.class', 'sd-btn-text');
  });

  it('renders the overlay with an explicit hollow fill rule', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-overlay')
      .should('have.attr', 'fill-rule', 'evenodd')
      .and('have.attr', 'clip-rule', 'evenodd');
    cy.get('.sd-tour-overlay path')
      .should('have.attr', 'fill-rule', 'evenodd')
      .and('have.attr', 'd')
      .and('include', 'Z M');
  });

  it('closes on Escape, emitting close with the active index and update:visible', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover').should('exist');
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-tour-popover').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      // 生命周期事件每次真实的打开/关闭只发出一次（teardown 幂等守卫 + wasActive 守卫）
      const closeEvents = wrapper.emitted('close') ?? [];
      expect(closeEvents).to.have.length(1);
      expect(closeEvents[0][0]).to.equal(0);

      const visibleEvents = wrapper.emitted('update:visible') ?? [];
      expect(visibleEvents).to.have.length(2);
      expect(visibleEvents[0][0]).to.equal(true);
      expect(visibleEvents[1][0]).to.equal(false);

      const visibleChangeEvents = wrapper.emitted('visibleChange') ?? [];
      expect(visibleChangeEvents).to.have.length(2);
      expect(visibleChangeEvents[0][0]).to.equal(true);
      expect(visibleChangeEvents[1][0]).to.equal(false);
    });
  });

  it('navigates with the arrow keys', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');

    cy.get('body').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');

    cy.get('body').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');

    // 第一步 ArrowLeft 不回退（previous 按钮在首步被禁用）
    cy.get('body').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
    cy.get('@vue').should(({ wrapper }) => {
      // 前进/后退各产生一次 change：1->0 与 0->1
      const changeEvents = wrapper.emitted('change') ?? [];
      expect(changeEvents).to.have.length(2);
      expect(changeEvents[0][0]).to.equal(1);
      expect(changeEvents[0][1]).to.equal(0);
      expect(changeEvents[1][0]).to.equal(0);
      expect(changeEvents[1][1]).to.equal(1);
    });
  });

  it('ignores keyboard control when allowKeyboardControl is false', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, allowKeyboardControl: false },
      slots: defaultSlots,
    });
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-tour-popover').should('exist');
    cy.get('body').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
  });

  it('closes on overlay click by default', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover').should('exist');
    // trigger 直接派发到 body，目标必然不在 stage 孔洞或气泡内
    cy.get('body').trigger('click');
    cy.get('.sd-tour-popover').should('not.exist');
  });

  it('keeps the tour open on overlay click when allowClose is false', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, allowClose: false },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover').should('exist');
    cy.get('body').trigger('click');
    cy.get('.sd-tour-popover').should('exist');
    // allowClose: false 同时隐藏关闭按钮
    cy.get('.sd-tour-popover-close-btn').should('not.exist');
  });

  it('advances on overlay click when overlayClickBehavior is nextStep', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, overlayClickBehavior: 'nextStep' },
      slots: defaultSlots,
    });
    cy.get('body').trigger('click');
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
  });

  it('delegates overlay clicks to the overlayClickBehavior function', () => {
    const clicks: (string | undefined)[] = [];
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        overlayClickBehavior: (_element: Element | undefined, step: TourStep | undefined) => {
          clicks.push(step?.popover?.title);
        },
      },
      slots: defaultSlots,
    });
    cy.get('body').trigger('click');
    cy.get('.sd-tour-popover').should('exist');
    cy.get('@vue').should(() => {
      expect(clicks).to.eql(['步骤一']);
    });
  });

  it('shows only the configured buttons with showButtons', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, showButtons: ['next'] },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-next-btn').should('exist');
    cy.get('.sd-tour-popover-prev-btn').should('not.exist');
    cy.get('.sd-tour-popover-close-btn').should('not.exist');
  });

  it('removes the close button when allowClose is false', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, allowClose: false },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-close-btn').should('not.exist');
    cy.get('.sd-tour-popover-next-btn').should('exist');
  });

  it('disables the next button via disableButtons and keeps the first-step previous disabled', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, disableButtons: ['next'] },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-prev-btn').should('have.attr', 'disabled');
    cy.get('.sd-tour-popover-next-btn').should('have.attr', 'disabled');
    // 点击被守卫拦截，停留在第一步
    cy.get('.sd-tour-popover-next-btn').click({ force: true });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change'), 'no navigation when next disabled').to.equal(undefined);
    });
  });

  it('renders the default progress text', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, showProgress: true },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-progress-text').should('contain.text', '1 / 2');
  });

  it('renders a custom progress text template', () => {
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        showProgress: true,
        progressText: '第 {current} 步，共 {total} 步',
      },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-progress-text').should('contain.text', '第 1 步，共 2 步');
  });

  it('customizes prev/next/done button texts', () => {
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        prevBtnText: '上一站',
        nextBtnText: '下一站',
        doneBtnText: '结束',
      },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-prev-btn').should('contain.text', '上一站');
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '下一站');
    cy.get('.sd-tour-popover-next-btn').click();
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '结束');
  });

  it('applies popoverClass to the popover', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, popoverClass: 'my-tour-popover' },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover.my-tour-popover').should('exist');
  });

  it('renders steps without an element as a centered over popover without arrow', () => {
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps: [{ popover: { title: '无目标步骤', showProgress: true } }],
      },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-title').should('contain.text', '无目标步骤');
    // side 'over' 走居中中间件，箭头类为 side-over 而非具体方位
    cy.get('.sd-tour-popover-arrow-side-over').should('exist');
    cy.get('.sd-tour-popover-arrow-align-center').should('exist');
    cy.get('.sd-tour-popover-progress-text').should('contain.text', '1 / 1');
  });

  it('marks the active element with tour and aria state', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, disableActiveInteraction: true },
      slots: defaultSlots,
    });
    cy.get('#tour-step-a')
      .should('have.class', 'sd-tour-active-element')
      .and('have.class', 'sd-tour-no-interaction')
      .and('have.attr', 'aria-haspopup', 'dialog')
      .and('have.attr', 'aria-expanded', 'true')
      .and('have.attr', 'aria-controls', 'sd-tour-popover-content');
    // aria-controls 必须指向真实存在的内容 id
    cy.get('#sd-tour-popover-content').should('exist');
  });

  it('invokes step lifecycle hooks during navigation and destroy', () => {
    const calls: string[] = [];
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        onHighlightStarted: () => calls.push('started'),
        onHighlighted: () => calls.push('ed'),
        onDeselected: () => calls.push('deselected'),
        onDestroyed: () => calls.push('destroyed'),
      },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-next-btn').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    cy.get('.sd-tour-popover-close-btn').click();
    cy.get('.sd-tour-popover').should('not.exist');
    // 打开 1 次 + 导航 1 次；关闭只跑一轮 teardown（幂等守卫）
    cy.get('@vue').should(() => {
      expect(calls.filter((name) => name === 'started').length).to.equal(2);
      expect(calls.filter((name) => name === 'ed').length).to.equal(2);
      expect(calls.filter((name) => name === 'deselected').length).to.equal(1);
      expect(calls.filter((name) => name === 'destroyed').length).to.equal(1);
      expect(calls[calls.length - 1]).to.equal('destroyed');
    });
  });

  it('hides all buttons when highlight() forces showButtons to an empty array', () => {
    cy.mount(Tour, { props: { steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as { highlight: (step: TourStep) => void }).highlight({
        element: '#tour-step-a',
        popover: { title: '高亮', description: '无按钮' },
      });
    });
    cy.get('.sd-tour-popover-title').should('contain.text', '高亮');
    // showButtons: [] 表示"无按钮"，不再回退到顶层配置按钮
    cy.get('.sd-tour-popover-next-btn').should('not.exist');
    cy.get('.sd-tour-popover-prev-btn').should('not.exist');
    cy.get('.sd-tour-popover-close-btn').should('not.exist');
    cy.get('.sd-tour-popover-footer').should('not.exist');
  });

  it('lets onNextClick intercept next-button navigation', () => {
    const clicks: string[] = [];
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        onNextClick: () => clicks.push('next'),
      },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover-next-btn').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
    cy.get('@vue').should(() => {
      expect(clicks).to.eql(['next']);
    });
  });

  it('exposes moveNext/destroy through the component instance', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as { moveNext: () => void }).moveNext();
    });
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as { destroy: () => void }).destroy();
    });
    cy.get('.sd-tour-popover').should('not.exist');
  });

  it('emits change and update:current when navigating', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover-next-btn').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    cy.get('@vue').should(({ wrapper }) => {
      const changeEvents = wrapper.emitted('change') ?? [];
      expect(changeEvents).to.have.length(1);
      expect(changeEvents[0][0]).to.equal(1);
      expect(changeEvents[0][1]).to.equal(0);

      const currentEvents = wrapper.emitted('update:current') ?? [];
      expect(currentEvents).to.have.length(1);
      expect(currentEvents[0][0]).to.equal(1);
    });
  });

  it('opens when the controlled visible prop flips to true', () => {
    cy.mount(Tour, { props: { visible: false, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover').should('not.exist');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ visible: true })));
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('visibleChange') ?? [];
      expect(events.length, 'visibleChange emitted').to.be.greaterThan(0);
      const last = events[events.length - 1];
      expect(last[0]).to.equal(true);
    });

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ visible: false })));
    cy.get('.sd-tour-popover').should('not.exist');
  });
});
