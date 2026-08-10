import { h } from 'vue';

import { addFromIconFontCn } from '../add-from-icon-font-cn';

describe('IconFont', () => {
  it('renders the icon type and applies configured extra props', () => {
    const IconFont = addFromIconFontCn({
      extraProps: {
        class: 'configured-icon',
        size: 24,
        spin: true,
      },
    });

    cy.mount(IconFont, { props: { size: 16, type: 'example' } });

    cy.get('svg')
      .should('have.class', 'configured-icon')
      .and('have.class', 'sd-icon-loading')
      .and('have.css', 'font-size', '24px');
    cy.get('use').should('have.attr', 'xlink:href', '#example');
  });

  it('renders the default slot when type is not set', () => {
    const IconFont = addFromIconFontCn({});

    cy.mount(() => h(IconFont, null, () => h('title', 'Custom icon')));

    cy.get('svg title').should('have.text', 'Custom icon');
    cy.get('use').should('not.exist');
  });
});
