import { h } from 'vue';

import Descriptions from '../index';

describe('Descriptions presentation', () => {
  it('updates title, alignment, explicit styles and table layout', () => {
    cy.mount(Descriptions, {
      props: {
        title: 'Before',
        data: [{ label: 'Label', value: 'Value' }],
        bordered: true,
        size: 'small',
        tableLayout: 'fixed',
        align: { label: 'right', value: 'center' },
      },
    });
    cy.get('.sd-descriptions-title').should('have.text', 'Before');
    cy.get('.sd-descriptions')
      .should('have.class', 'sd-descriptions-border')
      .and('have.class', 'sd-descriptions-size-small');
    cy.get('table').should('have.css', 'table-layout', 'fixed');
    cy.get('.sd-descriptions-item-label').should('have.css', 'text-align', 'right');
    cy.get('.sd-descriptions-item-value').should('have.css', 'text-align', 'center');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        title: '',
        bordered: false,
        tableLayout: 'auto',
        align: 'left',
        labelStyle: { textAlign: 'center' },
        valueStyle: { color: 'rgb(255, 0, 0)' },
      }),
    );
    cy.get('.sd-descriptions-title').should('not.exist');
    cy.get('.sd-descriptions').should('not.have.class', 'sd-descriptions-border');
    cy.get('table').should('have.css', 'table-layout', 'auto');
    cy.get('.sd-descriptions-item-label').should('have.css', 'text-align', 'center');
    cy.get('.sd-descriptions-item-value')
      .should('have.css', 'text-align', 'left')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('renders functional labels and values with a title slot', () => {
    const onClick = cy.spy();
    cy.mount(Descriptions, {
      props: {
        data: [
          {
            label: () => h('strong', 'Function label'),
            value: () => h('button', { onClick }, 'Action'),
          },
        ],
      },
      slots: { title: () => h('span', 'Slot title') },
    });
    cy.get('.sd-descriptions-title').should('have.text', 'Slot title');
    cy.get('.sd-descriptions-item-label strong').should('have.text', 'Function label');
    cy.contains('button', 'Action').click();
    cy.then(() => expect(onClick.callCount).to.equal(1));
  });
});
