import dayjs from 'dayjs';

import IconHover from '../icon-hover.vue';
import DateInput from '../picker/input.vue';
import VirtualList from '../virtual-list/virtual-list.vue';

describe('Shared component robustness', () => {
  it('preserves click forwarding when only the hover appearance is disabled', () => {
    cy.mount(IconHover, { props: { disabled: true }, slots: { default: 'Icon' } });
    cy.get('.sd-icon-hover').click();
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('click')).to.have.length(1));
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false }));
    cy.get('.sd-icon-hover').click();
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('click')).to.have.length(2));
  });

  it('shows an explicitly empty picker draft instead of the committed date', () => {
    cy.mount(DateInput, {
      props: { value: dayjs('2026-10-06'), format: 'YYYY-MM-DD', inputValue: '' },
    });
    cy.get('input').should('have.value', '');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ inputValue: undefined }));
    cy.get('input').should('have.value', '2026-10-06');
  });

  it('accepts the declared string itemSize without a prop warning', () => {
    const warnings: string[] = [];
    cy.mount(VirtualList, {
      props: { items: [{ key: 'one' }], height: 100, fixedSize: true, itemSize: '30px' },
      slots: { default: '<div>Item</div>' },
      global: { config: { warnHandler: (message: string) => warnings.push(message) } },
    });
    cy.get('.sd-virtual-list-content > *').should('have.css', 'height', '30px');
    cy.then(() =>
      expect(warnings.filter((message) => message.includes('prop "itemSize"'))).to.deep.equal([]),
    );
  });
});
