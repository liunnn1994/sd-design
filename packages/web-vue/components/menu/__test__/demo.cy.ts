import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/menu/*.vue',
);

runDemoTests('menu', demos, (demoName) => {
  cy.get('.sd-menu, [class*="sd-"]').should('exist');

  if (demoName === 'collapse-control') {
    cy.get('.sd-menu').should(($menu) => {
      expect($menu[0].getBoundingClientRect().width).to.equal(200);
    });
    cy.get('.menu-demo > .sd-btn').click();
    cy.get('.sd-menu').should(($menu) => {
      expect($menu[0].getBoundingClientRect().width).to.equal(48);
    });
  }

  if (demoName === 'dark-horizontal' || demoName === 'horizontal') {
    cy.get('.sd-menu').should('have.class', 'sd-menu-horizontal');
    cy.get('.sd-menu-overflow-sub-menu-mirror').should('not.be.visible');
    cy.get('.sd-menu').should(($menu) => {
      expect($menu[0].getBoundingClientRect().height, 'horizontal menu height').to.be.lessThan(120);
    });
    cy.get('.sd-menu-overflow-wrap')
      .children(':visible')
      .should(($items) => {
        const itemTops = new Set([...$items].map((item) => item.getBoundingClientRect().top));
        const overflowItems = [...$items].filter((item) =>
          item.classList.contains('sd-menu-overflow-sub-menu'),
        );
        expect(itemTops.size, 'horizontal items stay on one row').to.equal(1);
        expect(overflowItems.length, 'at most one overflow submenu').to.be.at.most(1);
        if (overflowItems.length === 1) {
          expect(overflowItems[0], 'overflow submenu is the last visible item').to.equal(
            $items[$items.length - 1],
          );
        }
      });
    cy.contains('.sd-menu-overflow-wrap > .sd-menu-item:visible', 'Home').should('exist');
  }

  if (demoName === 'horizontal') {
    cy.get('.menu-demo').should(($demo) => {
      expect(getComputedStyle($demo[0]).backgroundColor).not.to.equal('rgba(0, 0, 0, 0)');
    });
    cy.get('.sd-menu-item')
      .first()
      .find('div')
      .should(($logo) => {
        expect(getComputedStyle($logo[0]).backgroundColor).not.to.equal('rgba(0, 0, 0, 0)');
      });
  }

  if (demoName === 'pop') {
    cy.get('.sd-menu').should('have.class', 'menu-demo__pop-menu');
  } else {
    cy.get('.menu-demo__pop-menu').should('not.exist');
  }

  if (demoName === 'size') {
    cy.get('.sd-menu').should(($menu) => {
      expect($menu[0].getBoundingClientRect().width).to.equal(240);
    });
    cy.get('.sd-menu-collapse-button').click();
    cy.get('.sd-menu').should(($menu) => {
      expect($menu[0].getBoundingClientRect().width).to.equal(48);
    });
  }

  if (demoName === 'sub-menu') {
    cy.get('.sd-menu').should(($menu) => {
      expect($menu[0].getBoundingClientRect().width).to.equal(200);
    });
  }
});
