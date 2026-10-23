import { h, ref } from 'vue';

import type { PanelSize } from '../types';

import PanelGroup, { Panel, PanelSeparator } from '../index';

describe('PanelGroup robustness', () => {
  it('keeps the fill panel unclipped when the resized panel is removed on pointer release', () => {
    const visible = ref(true);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:300px', reorder: false }, () => [
          ...(visible.value
            ? [
                h(Panel, {
                  'key': 'sized',
                  'size': 200,
                  'onUpdate:size': (size: PanelSize) => {
                    if (typeof size === 'number' && size >= 320) visible.value = false;
                  },
                }),
              ]
            : []),
          h(Panel, { key: 'fill', pin: true }, () => 'Remaining content'),
        ]),
    });
    const point = { clientX: 200, clientY: 100, pointerId: 1, button: 0 };
    cy.get('.sd-panel-separator-grip')
      .trigger('pointerdown', point)
      .trigger('pointermove', { ...point, clientX: 280 })
      .trigger('pointerup', { ...point, clientX: 320 });
    cy.get('.sd-panel').should('not.exist');
    cy.get('.sd-panel-fill').should('have.css', 'overflow', 'visible');
    cy.get('.sd-panel-fill-inner').should('have.css', 'width', '800px');
  });

  it('refreshes separator bounds when a numeric-size group resizes outside Vue', () => {
    cy.mount(PanelGroup, {
      attrs: { style: 'width: 800px; height: 300px' },
      slots: { default: () => [h(Panel, { size: 200 }), h(PanelSeparator), h(Panel)] },
    });
    cy.get('.sd-panel-separator-grip').should('have.attr', 'aria-valuemax', '800');
    cy.get('.sd-panel-group').invoke('css', 'width', '400px');
    cy.get('.sd-panel-fill').should('have.css', 'width', '200px');
    cy.get('.sd-panel-separator-grip').should('have.attr', 'aria-valuemax', '400');
  });
});
