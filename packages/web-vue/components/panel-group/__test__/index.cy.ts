import { h, ref } from 'vue';

import type { PanelSize } from '../types';

import { moveMouseAway, moveMouseTo, tapAt } from '../../../../web-core/tests/browser/hover-intent';
import PanelGroup, { Panel, PanelSeparator } from '../index';

// 引擎监听 grip 元素上的 pointer 事件，拖拽阈值 3px
const dragGrip = (subject: JQuery<HTMLElement>, dx: number, dy = 0) => {
  return cy
    .wrap(subject)
    .trigger('pointerdown', { clientX: 400, clientY: 150, pointerId: 1 })
    .trigger('pointermove', { clientX: 400 + dx, clientY: 150 + dy, pointerId: 1 })
    .trigger('pointerup', { clientX: 400 + dx, clientY: 150 + dy, pointerId: 1 });
};

// 模拟 v-model:size：让引擎 target 与上报值保持同步（否则拖拽结束后面板会弹回）
const mountGroup = (
  panelProps: Record<string, unknown> = {},
  groupAttrs: Record<string, unknown> = { style: 'width: 800px; height: 300px' },
  groupProps: Record<string, unknown> = {},
) => {
  const sizes: (number | string)[] = [];
  // size 只在未显式传入时用默认值，避免覆盖 v-model 回写
  const { size: initialSize, ...restProps } = panelProps;
  const size = ref((initialSize as number | undefined) ?? 200);
  cy.mount(PanelGroup, {
    attrs: groupAttrs,
    props: groupProps,
    slots: {
      default: () => [
        h(Panel, {
          'size': size.value,
          'minSize': 100,
          'maxSize': 600,
          ...restProps,
          'onUpdate:size': (v: number | string) => {
            size.value = v as number;
            sizes.push(v);
          },
        }),
        h(PanelSeparator),
        h(Panel),
      ],
    },
  });

  return sizes;
};

describe('PanelGroup', () => {
  it('commits the final pointer position when a quick drag ends between move events', () => {
    const sizes = mountGroup();
    cy.get('.sd-panel-separator-grip')
      .first()
      .then(($grip) => {
        const grip = $grip[0]!;
        for (const [type, clientX] of [
          ['pointerdown', 400],
          ['pointermove', 410],
          ['pointerup', 520],
        ] as const) {
          grip.dispatchEvent(
            new PointerEvent(type, { clientX, clientY: 150, pointerId: 1, bubbles: true }),
          );
        }
      });
    cy.then(() => expect(sizes.at(-1)).to.equal(320));
    cy.get('.sd-panel').first().should('have.css', 'width', '320px');
    cy.wait(400);
    cy.get('.sd-panel').first().should('have.css', 'width', '320px');
  });

  describe('divider appearance', () => {
    const grip = '.sd-panel-separator-grip';
    const divider = '.sd-resizebox-trigger-icon-wrapper';
    const reducedMotion = (value: 'no-preference' | 'reduce') =>
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Emulation.setEmulatedMedia',
          params: { features: [{ name: 'prefers-reduced-motion', value }] },
        }),
      );

    afterEach(() => {
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Emulation.setEmulatedMedia',
          params: { features: [] },
        }),
      );
    });

    for (const orientation of ['horizontal', 'vertical'] as const) {
      it(`animates the divider without resizing the panels in ${orientation} groups`, () => {
        reducedMotion('no-preference');
        cy.window().should((win) => {
          expect(win.matchMedia('(hover: hover)').matches).to.equal(true);
        });
        mountGroup(
          {},
          { style: 'width: 800px; height: 300px; --sd-primary-6: 12, 34, 56' },
          { orientation },
        );
        const vertical = orientation === 'horizontal';
        const extent = vertical ? 'width' : 'height';
        const panelSizes = () =>
          cy
            .get('.sd-panel-group > .sd-panel, .sd-panel-group > .sd-panel-fill')
            .then(($panels) => {
              expect($panels).to.have.length(2);
              return Array.from($panels, (panel) => panel.getBoundingClientRect()[extent]);
            });

        moveMouseAway();
        cy.get(grip)
          .should('have.class', 'sd-resizebox-trigger')
          .and('have.class', `sd-resizebox-trigger-${vertical ? 'vertical' : 'horizontal'}`);
        cy.get(divider)
          .should('be.visible')
          .and('have.css', extent, '1px')
          .and('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)')
          .and('have.css', 'transition-property', 'background-color, scale');
        cy.get('svg.sd-resizebox-trigger-icon').should('not.exist');

        panelSizes().then((before) => {
          moveMouseTo(grip);
          cy.get(divider).should(($divider) => {
            const line = $divider[0].getBoundingClientRect();
            const hitArea = $divider[0].parentElement!.getBoundingClientRect();
            const start = vertical ? 'left' : 'top';
            expect(line[extent]).to.equal(1.5);
            expect(line[start] + line[extent] / 2).to.equal(hitArea[start] + hitArea[extent] / 2);
            expect($divider).to.have.css('background-color', 'rgb(12, 34, 56)');
          });
          panelSizes().should('deep.equal', before);
          moveMouseAway();
          cy.get(divider).should(($divider) => {
            expect($divider[0].getBoundingClientRect()[extent]).to.equal(1);
          });
        });

        reducedMotion('reduce');
        cy.window().should((win) => {
          expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(true);
        });
        cy.get(divider).should('have.css', 'transition-duration', '0s');
        moveMouseTo(grip);
        cy.get(divider).should(($divider) => {
          expect($divider[0].getBoundingClientRect()[extent]).to.equal(1.5);
          expect($divider).to.have.css('background-color', 'rgb(12, 34, 56)');
        });
        moveMouseAway();
      });
    }

    describe('touch input', () => {
      const emulateTouch = (enabled: boolean) =>
        cy.then(() =>
          Cypress.automation('remote:debugger:protocol', {
            command: 'Emulation.setTouchEmulationEnabled',
            params: { enabled },
          }),
        );

      afterEach(() => {
        emulateTouch(false);
      });

      it('keeps the resting color and thickness after tapping the divider', () => {
        emulateTouch(true);
        mountGroup(
          {},
          {
            style:
              'width: 800px; height: 300px; --sd-primary-6: 12, 34, 56; --component-panel-group-panel-separator-color-background: rgb(78, 90, 12)',
          },
        );
        cy.window().should((win) => {
          expect(win.matchMedia('(hover: none)').matches).to.equal(true);
        });
        const release = cy.stub();
        cy.get(grip).then(($grip) => {
          $grip[0].addEventListener('pointerup', (event) => release(event.pointerType), {
            once: true,
          });
          const { left, top, width, height } = $grip[0].getBoundingClientRect();
          return tapAt(left + width / 2, top + height / 2);
        });
        cy.wrap(release).should('have.been.calledOnceWith', 'touch');
        cy.get(grip).should(($grip) => expect($grip[0].matches(':hover')).to.equal(true));
        cy.get(divider).should(($divider) => {
          expect($divider[0].getBoundingClientRect().width).to.equal(1);
          expect($divider).to.have.css('background-color', 'rgb(78, 90, 12)');
        });
      });
    });
  });

  it('replaces the default trigger appearance when a custom slot is provided', () => {
    cy.mount(PanelGroup, {
      attrs: { style: 'width: 800px; height: 300px' },
      slots: {
        default: () => [
          h(Panel, { size: 200 }),
          h(PanelSeparator, {}, () => h('span', '自定义伸缩杆')),
          h(Panel),
        ],
      },
    });
    cy.contains('自定义伸缩杆').should('be.visible');
    cy.get('.sd-resizebox-trigger-icon-wrapper').should('not.exist');
  });

  it('renders sized panel, fill panel and a11y separator', () => {
    mountGroup();
    // 等待初始同步与动画稳定后再断言
    cy.wait(450);
    cy.get('.sd-panel-group').should('exist');
    cy.get('.sd-panel-fill').should('exist');
    cy.get('.sd-panel-separator-grip')
      .should('have.attr', 'role', 'separator')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-orientation', 'vertical');
  });

  it('gives a bare sized panel an edge grip instead of requiring a separator', () => {
    cy.mount(PanelGroup, {
      attrs: { style: 'width: 800px; height: 300px' },
      slots: {
        default: () => [h(Panel, { size: 200 }), h(Panel)],
      },
    });
    cy.wait(450);
    cy.get('.sd-panel-separator-edge').should('exist');
    cy.get('.sd-panel-separator-edge .sd-panel-separator-grip').should(
      'have.attr',
      'aria-label',
      '调整大小',
    );
  });

  it('resizes via keyboard arrows and emits update:size', () => {
    const sizes = mountGroup();
    cy.get('.sd-panel-separator-grip')
      .focus()
      .trigger('keydown', { key: 'ArrowRight' })
      .trigger('keydown', { key: 'ArrowLeft' });
    cy.get('@vue').should(() => {
      expect(sizes).to.deep.equal([210, 200]);
    });
  });

  it('clamps keyboard resize at maxSize', () => {
    const sizes = mountGroup({ minSize: 150, maxSize: 350 });
    cy.get('.sd-panel-separator-grip')
      .focus()
      .trigger('keydown', { key: 'End' })
      .trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(() => {
      expect(sizes).to.deep.equal([350, 350]);
    });
    cy.get('.sd-panel').should('have.css', 'width', '350px');
  });

  it('clamps keyboard resize at minSize and recovers', () => {
    const sizes = mountGroup({ size: 160, minSize: 150 });
    cy.get('.sd-panel-separator-grip')
      .focus()
      .trigger('keydown', { key: 'ArrowLeft' })
      .trigger('keydown', { key: 'ArrowLeft' })
      .trigger('keydown', { key: 'ArrowRight' });
    // 160-10 → min 150；第二次仍 clamp 在 150（不重复越界）；恢复 160
    cy.get('@vue').should(() => {
      expect(sizes).to.deep.equal([150, 150, 160]);
    });
  });

  it('toggles collapse via Enter and emits update:collapsed', () => {
    const collapsedValues: boolean[] = [];
    cy.mount(PanelGroup, {
      attrs: { style: 'width: 800px; height: 300px' },
      slots: {
        default: () => [
          h(Panel, {
            'size': 200,
            'onUpdate:collapsed': (v: boolean) => collapsedValues.push(v),
          }),
          h(PanelSeparator),
          h(Panel),
        ],
      },
    });
    cy.get('.sd-panel-separator-grip').focus().trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(() => {
      expect(collapsedValues).to.deep.equal([true]);
    });
  });

  it('resizes via pointer drag and emits update:size', () => {
    const sizes = mountGroup();
    cy.wait(450);
    cy.get('.sd-panel-separator-grip').then(($el) => {
      dragGrip($el, 100);
    });
    cy.get('@vue').should(() => {
      expect(sizes).to.deep.equal([300]);
    });
  });

  it('clamps drags to minSize and maxSize', () => {
    const sizes = mountGroup({ minSize: 150, maxSize: 350 });
    cy.wait(450);
    cy.get('.sd-panel-separator-grip').then(($el) => {
      dragGrip($el, 300);
    });
    cy.get('.sd-panel-separator-grip').then(($el) => {
      // -250 终点为 100px：低于 min 150 被 clamp，但不越过 min/2 触发折叠手势
      dragGrip($el, -250);
    });
    cy.get('@vue').should(() => {
      // 200+300 顶到 max 350；350-250 clamp 到 min 150
      expect(sizes).to.deep.equal([350, 150]);
    });
  });

  it('switches keyboard axes in vertical orientation', () => {
    const sizes = mountGroup(
      {},
      { style: 'width: 800px; height: 600px' },
      { orientation: 'vertical' },
    );
    cy.get('.sd-panel-separator-grip')
      .focus()
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'ArrowUp' });
    cy.get('@vue').should(() => {
      expect(sizes).to.deep.equal([210, 200]);
    });
  });

  it('exposes panel state through the default slot props', () => {
    let seenDragging: boolean | undefined;
    cy.mount(PanelGroup, {
      attrs: { style: 'width: 800px; height: 300px' },
      slots: {
        default: () => [
          h(
            Panel,
            { size: 200 },
            {
              default: ({ dragging }: { dragging: boolean }) => {
                seenDragging = dragging;

                return 'content';
              },
            },
          ),
          h(PanelSeparator),
          h(Panel),
        ],
      },
    });
    cy.get('.sd-panel-group').then(() => {
      expect(seenDragging).to.equal(false);
    });
  });
});

describe('PanelGroup lifecycle and layout', () => {
  const mountCollapsible = (initial = false, keepMounted = true, fold = false) => {
    const collapsed = ref(initial);
    const size = ref<PanelSize>(240);
    cy.mount(
      {
        setup: () => () =>
          h(PanelGroup, { style: 'width: 800px; height: 300px' }, () => [
            h(
              Panel,
              {
                'size': size.value,
                'collapsed': collapsed.value,
                keepMounted,
                'fold': fold ? { hidden: { opacity: 0 }, shown: { opacity: 1 } } : undefined,
                'style': 'padding: 12px; border: 1px solid red',
                'onUpdate:size': (value: PanelSize) => {
                  size.value = value;
                },
                'onUpdate:collapsed': (value: boolean) => {
                  collapsed.value = value;
                },
              },
              () => h('div', { 'data-testid': 'content' }, '内容'),
            ),
            h(PanelSeparator),
            h(Panel, { pin: true }, () => '固定内容'),
          ]),
      },
      { global: { stubs: { transition: false } } },
    );
    return { collapsed, size };
  };

  it('binds content width when an initially collapsed panel first opens', () => {
    const { collapsed, size } = mountCollapsible(true);
    cy.get('.sd-panel-content').should('not.exist');
    cy.then(() => {
      collapsed.value = false;
    });
    cy.get('.sd-panel-content').should('have.css', 'width', '240px');
    cy.then(() => {
      size.value = 300;
    });
    cy.get('.sd-panel-content').should('have.css', 'width', '300px');
  });

  it('rebinds content dimensions after keepMounted=false remounts', () => {
    const { collapsed, size } = mountCollapsible(false, false);
    cy.get('.sd-panel-content').should('have.css', 'width', '240px');
    cy.then(() => {
      collapsed.value = true;
    });
    cy.get('.sd-panel-content').should('not.exist');
    cy.then(() => {
      collapsed.value = false;
      size.value = 320;
    });
    cy.get('.sd-panel-content').should('have.css', 'width', '320px');
  });

  it('collapses completely even when content has padding and borders', () => {
    const { collapsed } = mountCollapsible();
    cy.get('.sd-panel-content').should('have.css', 'padding-left', '12px');
    cy.then(() => {
      collapsed.value = true;
    });
    cy.get('.sd-panel').should('have.css', 'width', '0px');
    cy.get('.sd-panel').should(($el) => {
      expect($el[0].getBoundingClientRect().width).to.equal(0);
    });
  });

  it('pins fill content to a pixel width during folding', () => {
    const { collapsed } = mountCollapsible();
    cy.get('.sd-panel').should('have.css', 'width', '240px');
    cy.then(() => {
      collapsed.value = true;
    });
    cy.get('.sd-panel-fill-inner').should('have.css', 'width', '800px');
    cy.then(() => {
      collapsed.value = false;
    });
    cy.get('.sd-panel-fill-inner').should('have.css', 'width', '560px');
    cy.get('.sd-panel-fill-inner').should('have.attr', 'style').and('contain', 'width: 100%');
  });

  it('keeps content mounted until its exit animation finishes', () => {
    const { collapsed } = mountCollapsible(false, false, true);
    cy.get('.sd-panel-content').should('exist');
    cy.then(() => {
      collapsed.value = true;
    });
    cy.get('.sd-panel-content').should('exist');
    cy.get('.sd-panel-content').should('not.exist');
    cy.then(() => {
      collapsed.value = false;
    });
    cy.get('.sd-panel-content').should('have.css', 'width', '240px');
  });

  it('cancels a drag on Escape and ignores subsequent movement until a new press', () => {
    const sizes = mountGroup();
    cy.get('.sd-panel').should('have.css', 'width', '200px');
    cy.get('.sd-panel-separator-grip')
      .trigger('pointerdown', { clientX: 200, clientY: 100, pointerId: 1 })
      .trigger('pointermove', { clientX: 280, clientY: 100, pointerId: 1 });
    cy.get('.sd-panel').should('have.css', 'width', '280px');
    cy.window().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-panel-separator-grip')
      .trigger('pointermove', { clientX: 350, clientY: 100, pointerId: 1 })
      .trigger('pointerup', { clientX: 350, clientY: 100, pointerId: 1 });
    cy.get('.sd-panel').should('have.css', 'width', '200px');
    cy.then(() => {
      expect(sizes).to.deep.equal([280, 200]);
    });
    cy.document().its('body.style.userSelect').should('not.equal', 'none');
  });

  it('releases the body lock if an active separator unmounts', () => {
    const separator = ref(true);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:300px' }, () => [
          h(Panel, { size: 200 }),
          separator.value ? h(PanelSeparator) : null,
          h(Panel),
        ]),
    });
    cy.get('.sd-panel-separator-grip')
      .trigger('pointerdown', { clientX: 200, clientY: 100, pointerId: 1 })
      .trigger('pointermove', { clientX: 280, clientY: 100, pointerId: 1 });
    cy.document().its('body.style.userSelect').should('equal', 'none');
    cy.then(() => {
      separator.value = false;
    });
    cy.document().its('body.style.userSelect').should('not.equal', 'none');
  });

  it('updates defaultSize used by double-click reset', () => {
    const resetSize = ref(250);
    const size = ref<PanelSize>(200);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:300px' }, () => [
          h(Panel, {
            'size': size.value,
            'defaultSize': resetSize.value,
            'onUpdate:size': (value: PanelSize) => {
              size.value = value;
            },
          }),
          h(PanelSeparator),
          h(Panel),
        ]),
    });
    cy.then(() => {
      resetSize.value = 300;
    });
    cy.get('.sd-panel-separator-grip').dblclick();
    cy.get('.sd-panel').should('have.css', 'width', '300px');
  });

  it('refits percentage sizes when the group resizes', () => {
    const width = ref(800);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: `width:${width.value}px;height:300px` }, () => [
          h(Panel, { size: '25%' }),
          h(PanelSeparator),
          h(Panel),
        ]),
    });
    cy.get('.sd-panel').should('have.css', 'width', '200px');
    cy.then(() => {
      width.value = 600;
    });
    cy.get('.sd-panel').should('have.css', 'width', '150px');
  });

  it('updates separator association when keyed panels reorder', () => {
    const reversed = ref(false);
    const size = ref<PanelSize>(200);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:300px' }, () => {
          const children = [
            h(Panel, {
              'key': 'sized',
              'size': size.value,
              'onUpdate:size': (value: PanelSize) => {
                size.value = value;
              },
            }),
            h(PanelSeparator, { key: 'separator' }),
            h(Panel, { key: 'fill' }),
          ];
          return reversed.value ? children.reverse() : children;
        }),
    });
    cy.then(() => {
      reversed.value = true;
    });
    cy.get('.sd-panel-separator-grip').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('.sd-panel').should('have.css', 'width', '210px');
    cy.get('.sd-panel-separator-edge').should('not.exist');
  });

  it('uses the correct vertical resize cursor and forwards separator attrs to its focus target', () => {
    cy.mount(PanelGroup, {
      props: { orientation: 'vertical' },
      attrs: { style: 'width:800px;height:300px' },
      slots: {
        default: () => [
          h(Panel, { size: 100 }),
          h(PanelSeparator, { 'id': 'resize', 'aria-controls': 'editor' }),
          h(Panel),
        ],
      },
    });
    cy.get('#resize')
      .should('have.attr', 'role', 'separator')
      .and('have.attr', 'aria-controls', 'editor')
      .and('have.css', 'cursor', 'row-resize')
      .and('have.attr', 'aria-valuemax');
  });
});
