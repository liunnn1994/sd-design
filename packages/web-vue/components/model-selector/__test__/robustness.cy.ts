import { defineComponent, h, ref } from 'vue';

import ModelSelector, {
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorInput,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorTrigger,
} from '../index';

describe('ModelSelector robustness', () => {
  it('does not reference a missing heading on unnamed groups', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ModelSelector,
            { defaultExpanded: false },
            {
              default: () =>
                h(
                  ModelSelectorGroup,
                  {},
                  { default: () => h(ModelSelectorItem, { value: 'alpha' }, () => 'Alpha') },
                ),
            },
          ),
      }),
    );
    cy.get('[role="group"]').should('not.have.attr', 'aria-labelledby');
    cy.get('.sd-model-selector-group-content').should('not.have.attr', 'inert');
  });
  it('ignores composition shortcuts and does not repeat a handled Enter selection', () => {
    const onSelect = cy.spy().as('select');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ModelSelector,
            { defaultVisible: true, closeOnSelect: false, onSelect },
            {
              default: () =>
                h(
                  ModelSelectorContent,
                  { renderToBody: false },
                  {
                    default: () => [
                      h(ModelSelectorInput),
                      h(ModelSelectorItem, { value: 'alpha', shortcut: 'Enter' }, () => 'Alpha'),
                      h(ModelSelectorItem, { value: 'beta' }, () => 'Beta'),
                    ],
                  },
                ),
            },
          ),
      }),
    );
    cy.get('input').type('{downarrow}').trigger('keydown', {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
      eventConstructor: 'KeyboardEvent',
    });
    cy.get('@select').should('not.have.been.called');
    cy.get('input').type('{downarrow}{enter}');
    cy.get('@select').should('have.been.calledOnce').and('have.been.calledWith', 'beta');
  });
  for (const Component of [ModelSelector, ModelSelectorDialog]) {
    it(`accepts a visible prop added after ${Component.name} mounts`, () => {
      const controlled = ref(false);
      cy.mount(
        defineComponent({
          setup: () => () =>
            h(
              Component,
              {
                ...(controlled.value ? { visible: true } : {}),
                ...(Component === ModelSelectorDialog ? { renderToBody: false } : {}),
              },
              { default: () => h(ModelSelectorTrigger, {}, { default: () => 'State' }) },
            ),
        }),
      );
      cy.then(() => {
        controlled.value = true;
      });
      if (Component === ModelSelectorDialog) cy.get('.sd-modal').should('be.visible');
      else cy.get('.sd-model-selector-trigger').should('have.attr', 'aria-expanded', 'true');
    });
  }

  it('emits the item select event for keyboard selection', () => {
    const onSelect = cy.spy().as('itemSelect');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ModelSelector,
            { defaultVisible: true },
            {
              default: () =>
                h(
                  ModelSelectorContent,
                  { renderToBody: false },
                  {
                    default: () => [
                      h(ModelSelectorInput),
                      h(ModelSelectorItem, { value: 'a', onSelect }, { default: () => 'Alpha' }),
                    ],
                  },
                ),
            },
          ),
      }),
    );
    cy.get('input').type('{downarrow}{enter}');
    cy.get('@itemSelect').should('have.been.calledOnce');
    cy.get('@itemSelect').its('firstCall.args.0').should('equal', 'a');
  });

  it('preserves an uncontrolled search across content unmount and reopen', () => {
    cy.mount(
      defineComponent({
        components: {
          ModelSelector,
          ModelSelectorContent,
          ModelSelectorInput,
          ModelSelectorTrigger,
        },
        template: `<ModelSelector :reset-query-on-close="false">
        <ModelSelectorTrigger>Open</ModelSelectorTrigger>
        <ModelSelectorContent :render-to-body="false"><ModelSelectorInput /></ModelSelectorContent>
      </ModelSelector>`,
      }),
      { global: { stubs: { transition: false } } },
    );
    cy.contains('button', 'Open').click();
    cy.get('input').type('Alpha{esc}');
    cy.get('input').should('not.exist');
    cy.contains('button', 'Open').click();
    cy.get('input').should('have.value', 'Alpha');
  });

  it('does not select an item while Enter confirms IME composition', () => {
    const onSelect = cy.spy().as('selection');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ModelSelector,
            { defaultVisible: true, onSelect },
            {
              default: () =>
                h(
                  ModelSelectorContent,
                  { renderToBody: false },
                  {
                    default: () => [
                      h(ModelSelectorInput),
                      h(ModelSelectorItem, { value: 'a' }, { default: () => 'Alpha' }),
                    ],
                  },
                ),
            },
          ),
      }),
    );
    cy.get('input').type('{downarrow}').trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('@selection').should('not.have.been.called');
    cy.get('.sd-modal').should('be.visible');
  });
});
