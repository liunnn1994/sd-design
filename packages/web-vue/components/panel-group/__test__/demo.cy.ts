import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/panel-group/*.vue',
);

runDemoTests('panel-group', demos, () => {
  cy.get('.sd-panel-group, [class*="sd-"]').should('exist');
});

describe('单内容面板基本用法', () => {
  it('拖拽高度期间右侧伸缩杆实时等高，取消后一起恢复', () => {
    cy.wrap(demos['../../../../sd-vue-docs/src/components/generated/panel-group/basic.vue']()).then(
      (mod) => cy.mount(mod.default),
    );
    cy.get('.single-panel-demo .sd-panel .sd-panel').as('heightPanel');
    cy.get('.single-panel-demo > .sd-panel-group > .sd-panel > .sd-panel-separator-edge')
      .find('.sd-resizebox-trigger')
      .as('rightTrigger');
    cy.get('@heightPanel').should('have.css', 'height', '200px');
    cy.get('@heightPanel')
      .find('.sd-panel-separator-grip')
      .then(($grip) => {
        const rect = $grip[0].getBoundingClientRect();
        const point = {
          clientX: rect.left + 50,
          clientY: rect.top + rect.height / 2,
          pointerId: 1,
          button: 0,
        };
        cy.wrap($grip).trigger('pointerdown', point);
        for (const height of [260, 170, 340]) {
          cy.wrap($grip).trigger('pointermove', {
            ...point,
            clientY: point.clientY + height - 200,
          });
          cy.get('@heightPanel').should('have.css', 'height', `${height}px`);
          cy.get('@rightTrigger').should('have.css', 'height', `${height}px`);
          cy.get('.single-panel-demo').should('have.css', '--panel-height', `${height}px`);
        }
        cy.wrap($grip).trigger('pointercancel', point);
        cy.get('@heightPanel').should('have.css', 'height', '200px');
        cy.get('@rightTrigger').should('have.css', 'height', '200px');
      });
  });

  it('从右下角同时调整宽高', () => {
    cy.wrap(demos['../../../../sd-vue-docs/src/components/generated/panel-group/basic.vue']()).then(
      (mod) => cy.mount(mod.default),
    );
    cy.get('.single-panel-demo > .sd-panel-group > .sd-panel')
      .as('widthPanel')
      .should('have.css', 'width', '500px');
    cy.get('.single-panel-demo .sd-panel .sd-panel')
      .as('heightPanel')
      .should('have.css', 'height', '200px');
    cy.get('@widthPanel')
      .children('.sd-panel-separator-edge')
      .find('.sd-panel-separator-grip')
      .then(($grip) => {
        const rect = $grip[0].getBoundingClientRect();
        const point = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.bottom,
          pointerId: 1,
          button: 0,
        };
        cy.wrap($grip)
          .trigger('pointerdown', point)
          .trigger('pointermove', {
            ...point,
            clientX: point.clientX - 60,
            clientY: point.clientY + 40,
          })
          .trigger('pointerup', {
            ...point,
            clientX: point.clientX - 60,
            clientY: point.clientY + 40,
          });
      });
    cy.get('@widthPanel').should('have.css', 'width', '440px');
    cy.get('@heightPanel').should('have.css', 'height', '240px');
  });
});
