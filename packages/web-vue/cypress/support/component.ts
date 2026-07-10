import type { Component } from 'vue';

import { mount } from 'cypress/vue';

import '../../components/index.scss';
import SDVue from '../../components';
import SDVueIcon from '../../components/icon';

// "ResizeObserver loop completed with undelivered notifications" is a benign
// browser warning (a re-entrant resize), not a real failure. It is common in
// real-browser component tests — ignore it globally.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  return undefined;
});

// Replicates `vitest.setup.ts`: every mounted component runs inside an app that
// has the full SD Design Vue + icon plugins installed globally (so demos using
// `<sd-button>` resolve) and the `$sd` class-prefix config (`sd-btn`, ...).
Cypress.Commands.add('mount', (component: Component, options: Record<string, any> = {}) => {
  options.global = options.global ?? {};
  options.global.plugins = [...(options.global.plugins ?? []), SDVue, SDVueIcon];
  options.global.config = {
    ...options.global.config,
    globalProperties: {
      ...options.global.config?.globalProperties,
      $sd: { classPrefix: 'sd' },
    },
  };

  // Exposes the @vue/test-utils wrapper (as part of the mount return) via the
  // `@vue` alias, so specs can assert on `wrapper.emitted()` while keeping
  // Cypress retryability: `cy.get('@vue').should(({ wrapper }) => ...)`.
  return mount(component, options).then((mountReturn) => cy.wrap(mountReturn).as('vue'));
});
