import type { App } from 'vue';
import { createApp, h } from 'vue';

import type { BloomMenuItem } from '../types';

import BloomMenu from '../index';

const items: BloomMenuItem[] = [
  { value: 'doc', label: '文档' },
  { value: 'board', label: '看板' },
  { value: 'table', label: '表格', disabled: true },
];

describe('BloomMenu', () => {
  const mountedApps: App[] = [];

  afterEach(() => {
    for (const app of mountedApps.splice(0)) app.unmount();
  });

  beforeEach(() => {
    cy.document().then((document) => {
      document.body.style.padding = '160px';
    });
  });

  it('uses Button as the trigger and opens a body-mounted positioned popup', () => {
    cy.mount(BloomMenu, { props: { items } });

    cy.get('[data-bloom-menu-trigger]')
      .should('have.class', 'sd-btn')
      .and('have.class', 'sd-btn-shape-square')
      .and('not.have.class', 'sd-btn-shape-round')
      .and('have.attr', 'aria-expanded', 'false')
      .then(($trigger) => {
        const trigger = $trigger[0] as HTMLElement;
        const sourceWidth = trigger.getBoundingClientRect().width;
        const sourceBackground = getComputedStyle(trigger).backgroundColor;

        cy.wrap($trigger).click();
        cy.get('[data-bloom-menu-panel]')
          .should('exist')
          .and('have.css', '--bloom-menu-source-width', `${sourceWidth}px`)
          .and('have.css', '--bloom-menu-source-background', sourceBackground);
      });

    cy.get('.sd-bloom-menu [data-bloom-menu-panel]').should('not.exist');
    cy.get('.sd-trigger-popup')
      .should('be.visible')
      .and(($popup) => {
        const style = ($popup[0] as HTMLElement).style;
        expect(style.transform).to.contain('translate');
        expect(style.left).not.to.equal('');
        expect(style.top).not.to.equal('');
      });
    cy.get('.sd-bloom-menu-close').should('have.class', 'sd-btn');
    cy.get('.sd-bloom-menu-item').should('have.length', 3).and('have.class', 'sd-btn');
    cy.contains('.sd-bloom-menu-item-label', '文档').should('exist');

    // 打开后焦点移入面板(第一个可用菜单项)
    cy.get('.sd-bloom-menu-item').eq(0).should('have.focus');

    // Motion 改变面板尺寸时，Floating UI 仍持续保持两者圆心重合
    cy.get('[data-bloom-menu-trigger]').then(($trigger) => {
      const triggerRect = ($trigger[0] as HTMLElement).getBoundingClientRect();
      const triggerCenterX = triggerRect.left + triggerRect.width / 2;
      const triggerCenterY = triggerRect.top + triggerRect.height / 2;

      cy.get('[data-bloom-menu-panel]').should(($panel) => {
        const panelRect = ($panel[0] as HTMLElement).getBoundingClientRect();
        expect(panelRect.left + panelRect.width / 2).to.be.closeTo(triggerCenterX, 2);
        expect(panelRect.top + panelRect.height / 2).to.be.closeTo(triggerCenterY, 2);
      });
    });
  });

  it('forwards button props and offsets the popup center', () => {
    const onMouseenter = cy.spy().as('onMouseenter');

    cy.mount(BloomMenu, {
      props: {
        items,
        defaultOpen: true,
        buttonProps: {
          'type': 'primary',
          'shape': 'circle',
          'size': 'large',
          'id': 'custom-trigger',
          'class': 'custom-trigger',
          'style': { opacity: 0.99 },
          'data-testid': 'bloom-menu-trigger',
          'aria-label': 'Create item',
          onMouseenter,
        },
        offset: { left: 24, top: -16 },
      },
    });

    cy.get('[data-bloom-menu-trigger]')
      .should('have.class', 'sd-btn-primary')
      .and('have.class', 'sd-btn-shape-circle')
      .and('have.class', 'sd-btn-size-large')
      .and('have.class', 'custom-trigger')
      .and('have.id', 'custom-trigger')
      .and('have.attr', 'data-testid', 'bloom-menu-trigger')
      .and('have.attr', 'aria-label', 'Create item')
      .and('have.css', 'opacity', '0.99')
      // size 等尺寸类不被默认样式压制(large 高度 36 而非默认 44)
      .and('have.css', 'height', '36px')
      .trigger('mouseenter', { force: true })
      .then(($trigger) => {
        const triggerRect = ($trigger[0] as HTMLElement).getBoundingClientRect();
        const expectedCenterX = triggerRect.left + triggerRect.width / 2 + 24;
        const expectedCenterY = triggerRect.top + triggerRect.height / 2 - 16;

        cy.get('[data-bloom-menu-panel]').should(($panel) => {
          const panelRect = ($panel[0] as HTMLElement).getBoundingClientRect();
          expect(panelRect.left + panelRect.width / 2).to.be.closeTo(expectedCenterX, 2);
          expect(panelRect.top + panelRect.height / 2).to.be.closeTo(expectedCenterY, 2);
        });
      });
    cy.get('@onMouseenter').should('have.been.calledOnce');
  });

  it('emits selection and closes after selecting an enabled item', () => {
    const onSelect = cy.spy().as('onSelect');
    const onUpdate = cy.spy().as('onUpdate');

    cy.mount(BloomMenu, {
      props: {
        items,
        'defaultOpen': true,
        onSelect,
        'onUpdate:modelValue': onUpdate,
      },
    });

    cy.contains('.sd-bloom-menu-item', '文档').click();
    cy.get('@onSelect').should('have.been.calledWith', items[0], 0);
    cy.get('@onUpdate').should('have.been.calledWith', false);
    cy.get('[data-bloom-menu-trigger]').should('exist');
  });

  it('keeps the popup mounted while the closing animation plays', () => {
    cy.mount(BloomMenu, { props: { items, defaultOpen: true } });

    cy.get('[data-bloom-menu-panel]').should('exist');
    cy.get('.sd-bloom-menu-close').click();
    cy.wait(50);
    cy.get('[data-bloom-menu-panel]').should('be.visible');
    cy.get('[data-bloom-menu-panel]').should('not.be.visible');
  });

  it('does not select disabled items', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(BloomMenu, { props: { items, defaultOpen: true, onSelect } });

    cy.contains('.sd-bloom-menu-item', '表格').should('be.disabled');
    cy.get('@onSelect').should('not.have.been.called');
  });

  it('supports controlled open state', () => {
    const onUpdate = cy.spy().as('onUpdate');
    cy.mount(BloomMenu, {
      props: { items, 'modelValue': true, 'onUpdate:modelValue': onUpdate },
    });

    cy.get('.sd-bloom-menu-close').click();
    cy.get('@onUpdate').should('have.been.calledWith', false);
    cy.get('[data-bloom-menu-panel]').should('exist');
  });

  it('closes on Escape and outside pointer interaction', () => {
    cy.mount(BloomMenu, { props: { items, defaultOpen: true } });
    cy.get('.sd-bloom-menu-item').eq(0).should('have.focus');
    cy.get('body').type('{esc}');
    // Esc 关闭后焦点还给触发器
    cy.get('[data-bloom-menu-trigger]').should('have.focus');
    cy.get('[data-bloom-menu-panel]').should('not.be.visible');
    cy.get('[data-bloom-menu-trigger]').click();
    cy.get('body').click('topLeft');
    cy.get('[data-bloom-menu-panel]').should('not.be.visible');
  });

  it('renders custom trigger, item and empty slots', () => {
    cy.mount(BloomMenu, {
      props: { items },
      slots: {
        trigger: '<span class="custom-trigger">新建内容</span>',
        item: '<template #item="{ item }"><strong class="custom-item">{{ item.label }}</strong></template>',
      },
    });

    cy.get('.custom-trigger').should('have.text', '新建内容').click();
    cy.get('.custom-item').should('have.length', 3);

    cy.mount(BloomMenu, {
      props: { items: [], defaultOpen: true },
      slots: { empty: '<span class="custom-empty">没有操作</span>' },
    });
    cy.get('.custom-empty').should('have.text', '没有操作');
  });

  it('uses columns on the teleported panel', () => {
    cy.mount(BloomMenu, { props: { items, columns: 2, defaultOpen: true } });

    cy.get('[data-bloom-menu-panel]').should('have.css', '--bloom-menu-columns', '2');
    cy.get('.sd-bloom-menu-item').eq(0).should('have.class', 'sd-bloom-menu-item-border-right');
    cy.get('.sd-bloom-menu-item')
      .eq(2)
      .should('not.have.class', 'sd-bloom-menu-item-border-bottom');
  });

  it('keeps popups isolated across separately mounted Vue applications', () => {
    cy.document().then((document) => {
      const firstHost = document.createElement('div');
      const secondHost = document.createElement('div');
      document.body.append(firstHost, secondHost);

      const firstApp = createApp({
        render: () =>
          h(BloomMenu, {
            items,
            title: '基本浮层',
            triggerText: '基本用法',
          }),
      });
      const secondApp = createApp({
        render: () =>
          h(BloomMenu, {
            items,
            columns: 2,
            title: '列数浮层',
            triggerText: '调整列数',
          }),
      });
      mountedApps.push(firstApp, secondApp);
      firstApp.mount(firstHost);
      secondApp.mount(secondHost);
    });

    cy.contains('[data-bloom-menu-trigger]', '基本用法').click();
    cy.get('[data-bloom-menu-trigger]').should('have.length', 2);
    cy.get('[data-bloom-menu-panel]:visible')
      .should('have.length', 1)
      .and('have.attr', 'aria-label', '基本浮层');

    // 中心展开的面板会覆盖邻近元素,先关闭再操作第二个触发器
    cy.get('body').type('{esc}');
    cy.get('[data-bloom-menu-panel]:visible').should('have.length', 0);

    cy.contains('[data-bloom-menu-trigger]', '调整列数').click();
    cy.get('[data-bloom-menu-trigger]').should('have.length', 2);
    cy.get('[data-bloom-menu-panel]:visible')
      .should('have.length', 1)
      .and('have.attr', 'aria-label', '列数浮层');
  });

  it('keeps the panel inside the viewport near screen edges', () => {
    cy.document().then((document) => {
      const host = document.createElement('div');
      host.style.cssText = 'position: fixed; top: 8px; left: 4px;';
      document.body.append(host);

      const app = createApp({
        render: () => h(BloomMenu, { items, defaultOpen: true, title: '边缘' }),
      });
      mountedApps.push(app);
      app.mount(host);
    });

    cy.get('[data-bloom-menu-panel]').should(($panel) => {
      const rect = $panel[0].getBoundingClientRect();
      expect(rect.left, 'panel left').to.be.at.least(0);
      expect(rect.top, 'panel top').to.be.at.least(0);
      expect(rect.right, 'panel right').to.be.at.most(window.innerWidth);
      expect(rect.bottom, 'panel bottom').to.be.at.most(window.innerHeight);
    });
  });
});
