import { defineComponent, ref } from 'vue';

describe('Breadcrumb dynamic content', () => {
  it('recalculates collapsed routes after removing the default slot', () => {
    cy.mount(
      defineComponent({
        setup: () => ({
          custom: ref(true),
          routes: [
            { path: 'home', label: 'Home' },
            { path: 'section', label: 'Section' },
            { path: 'last', label: 'Last' },
          ],
        }),
        template:
          '<button @click="custom = false">Routes</button><sd-breadcrumb :routes="routes" :max-count="2"><template v-if="custom" #default><sd-breadcrumb-item v-for="n in 5" :key="n">Item {{ n }}</sd-breadcrumb-item></template></sd-breadcrumb>',
      }),
    );
    cy.contains('Item 5').should('be.visible');
    cy.contains('button', 'Routes').click();
    cy.contains('.sd-breadcrumb-item', 'Last').should('be.visible');
    cy.get('.sd-breadcrumb-item-separator').should('have.length', 2);
  });

  it('adds and removes a dynamic droplist slot', () => {
    cy.mount(
      defineComponent({
        setup: () => ({ enabled: ref(false) }),
        template:
          '<button @click="enabled = !enabled">Toggle</button><sd-breadcrumb><sd-breadcrumb-item :dropdown-props="{ trigger: \'click\' }">Home<template v-if="enabled" #droplist><sd-doption>Child</sd-doption></template></sd-breadcrumb-item><sd-breadcrumb-item>Last</sd-breadcrumb-item></sd-breadcrumb>',
      }),
    );
    cy.get('.sd-breadcrumb-item-dropdown-icon').should('not.exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-breadcrumb-item-dropdown-icon').should('exist');
    cy.contains('.sd-breadcrumb-item', 'Home').click();
    cy.contains('.sd-dropdown-option', 'Child').should('be.visible');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-breadcrumb-item-dropdown-icon').should('not.exist');
  });
});
