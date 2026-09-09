import { h } from 'vue';

import { addFromIconFontCn } from '../add-from-icon-font-cn';
import Icon from '../icon.vue';

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

  it('applies rotate and string size directly on the component', () => {
    const IconFont = addFromIconFontCn({});
    cy.mount(IconFont, { props: { rotate: 90, size: '1.5em' } });

    cy.get('svg')
      .should('have.attr', 'style')
      .and('contain', 'rotate(90deg)')
      .and('contain', 'font-size: 1.5em');
  });

  it('passes through arbitrary extraProps as attributes on the svg', () => {
    const IconFont = addFromIconFontCn({
      extraProps: {
        'aria-hidden': 'true',
        'data-testid': 'icon-font-under-test',
      },
    });

    cy.mount(IconFont);

    cy.get('svg')
      .should('have.attr', 'aria-hidden', 'true')
      .and('have.attr', 'data-testid', 'icon-font-under-test');
  });

  it('ignores the default slot when type is set', () => {
    const IconFont = addFromIconFontCn({});
    cy.mount(() => h(IconFont, { type: 'example' }, () => h('title', 'Custom icon')));

    cy.get('use').should('have.attr', 'xlink:href', '#example');
    cy.get('svg title').should('not.exist');
  });

  it('injects the iconfont script once per unique src', () => {
    const src = '/iconfont-under-test.js';
    cy.intercept('GET', src, { body: '' }).as('iconfontScript');

    cy.then(() => cy.mount(addFromIconFontCn({ src }), { props: { type: 'example' } }));
    cy.wait('@iconfontScript');
    cy.then(() => cy.mount(addFromIconFontCn({ src }), { props: { type: 'example' } }));

    cy.get(`body script[src="${src}"]`).should('have.length', 1);
    cy.get('@iconfontScript.all').should('have.length', 1);
  });
});

describe('Icon', () => {
  it('applies the type as a class on the svg', () => {
    cy.mount(Icon, { props: { type: 'my-custom-icon' } });

    cy.get('svg').should('have.class', 'sd-icon').and('have.class', 'my-custom-icon');
  });

  it('applies numeric size as px font-size', () => {
    cy.mount(Icon, { props: { size: 32 } });

    cy.get('svg').should('have.css', 'font-size', '32px');
  });

  it('applies rotate as a rotation transform', () => {
    cy.mount(Icon, { props: { rotate: 45 } });

    cy.get('svg').should('have.attr', 'style').and('contain', 'rotate(45deg)');
  });

  it('does not apply a transform when rotate is 0', () => {
    cy.mount(Icon, { props: { rotate: 0 } });

    cy.get('svg').should('have.css', 'transform', 'none');
  });

  it('applies the loading class when spin is true and not when false', () => {
    cy.mount(Icon, { props: { spin: true } });
    cy.get('svg').should('have.class', 'sd-icon-loading');

    cy.mount(Icon, { props: { spin: false } });
    cy.get('svg').should('not.have.class', 'sd-icon-loading');
  });

  it('renders default slot content inside the svg', () => {
    cy.mount(() => h(Icon, null, () => h('title', 'Inline icon')));

    cy.get('svg title').should('have.text', 'Inline icon');
    cy.get('use').should('not.exist');
  });
});
