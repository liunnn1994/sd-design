// Transition stubs create extra grid items and invalidate Calendar pointer geometry.
Cypress.Commands.overwrite('mount', (mount, component, options = {}) =>
  mount(component, {
    ...options,
    global: {
      ...options.global,
      stubs: { ...options.global?.stubs, 'transition': false, 'transition-group': false },
    },
  }),
);
