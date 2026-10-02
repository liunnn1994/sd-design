import type { CyMountOptions, mount } from 'cypress/vue';

import type { Component } from 'vue';
declare global {
  namespace Cypress {
    interface Chainable {
      mount(
        component: Component,
        options?: CyMountOptions<Record<string, unknown>>,
      ): ReturnType<typeof mount>;
    }
  }
}

// Transition stubs create extra grid items and invalidate Calendar pointer geometry.
Cypress.Commands.overwrite<'mount'>(
  'mount',
  (mount, component, options: CyMountOptions<Record<string, unknown>> = {}) =>
    mount(component, {
      ...options,
      global: {
        ...options.global,
        stubs: { ...options.global?.stubs, 'transition': false, 'transition-group': false },
      },
    }),
);
