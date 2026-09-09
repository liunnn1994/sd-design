import { h, ref } from 'vue';

import Form, { FormItem } from '../../form';
import { InputSearch } from '../index';

describe('InputSearch disabled lifecycle', () => {
  for (const inherited of [false, true]) {
    it(`blocks the search icon when disabled ${inherited ? 'by Form' : 'directly'}`, () => {
      const disabled = ref(true);
      const search = cy.spy().as('search');
      cy.mount({
        setup: () => () =>
          h(
            Form,
            { model: {}, disabled: inherited && disabled.value },
            {
              default: () =>
                h(
                  FormItem,
                  {},
                  {
                    default: () =>
                      h(InputSearch, {
                        defaultValue: 'query',
                        disabled: !inherited && disabled.value,
                        onSearch: search,
                      }),
                  },
                ),
            },
          ),
      });
      cy.get('input').should('be.disabled');
      cy.get('.sd-input-search .sd-icon-hover').click();
      cy.get('@search').should('not.have.been.called');
      cy.then(() => {
        disabled.value = false;
      });
      cy.get('input').should('not.be.disabled');
      cy.get('.sd-input-search .sd-icon-hover').click();
      cy.get('@search').should('have.been.calledOnce');
      cy.get('@search').its('firstCall.args.0').should('equal', 'query');
    });
  }
});
