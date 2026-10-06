import { defineComponent, h, ref } from 'vue';

import ModelSelector, { ModelSelectorInput, ModelSelectorItem, ModelSelectorList } from '../index';

describe('ModelSelector reordered items', () => {
  it('navigates in displayed order after keyed items move', () => {
    const items = ref(['Alpha', 'Beta']);
    const select = cy.spy().as('select');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ModelSelector,
            { defaultVisible: true, onSelect: select },
            {
              default: () => [
                h(ModelSelectorInput),
                h(
                  ModelSelectorList,
                  {},
                  {
                    default: () =>
                      items.value.map((value) =>
                        h(ModelSelectorItem, { key: value, value }, () => value),
                      ),
                  },
                ),
              ],
            },
          ),
      }),
    );
    cy.then(() => {
      items.value = ['Beta', 'Alpha'];
    });
    cy.get('[role="option"]').first().should('have.text', 'Beta');
    cy.get('input')
      .focus()
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('@select').should('have.been.calledWith', 'Beta');
  });
});
