import { h } from 'vue';

import { PerformantEllipsis } from '../../ellipsis';
import Link from '../index';

describe('Link', () => {
  it('removes the href attribute when disabled', () => {
    cy.mount(Link, { props: { disabled: true } });
    cy.get('a').should('not.have.attr', 'href');
  });

  it('enables performant ellipsis by default and forwards ellipsis props', () => {
    cy.mount(Link, {
      props: { ellipsisLineClamp: 2, ellipsisTooltip: false },
      slots: { default: 'A very long link content that should be truncated.' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const ellipsis = wrapper.findComponent(PerformantEllipsis);
      expect(ellipsis.exists()).to.equal(true);
      expect(ellipsis.props('lineClamp')).to.equal(2);
      expect(ellipsis.props('tooltip')).to.equal(false);
    });
  });

  it('renders plain content when ellipsis is disabled', () => {
    cy.mount(Link, {
      props: { ellipsis: false },
      slots: { default: 'Plain link content' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(PerformantEllipsis).exists()).to.equal(false);
    });
    cy.get('.sd-link-content').should('have.text', 'Plain link content');
  });

  it('disables hoverable style for icon-only links by default', () => {
    cy.mount(Link, { props: { icon: true } });
    cy.get('.sd-link')
      .should('have.class', 'sd-link-hoverless')
      .and('have.class', 'sd-link-icon-only');
  });

  it('wraps the icon with a tooltip when iconTooltip is provided', () => {
    cy.mount(Link, { props: { icon: true, iconTooltip: '打开链接' } });
    cy.get('@vue').should(({ wrapper }) => {
      const tooltip = wrapper.findComponent({ name: 'Tooltip' });
      expect(tooltip.exists()).to.equal(true);
      expect(tooltip.props('content')).to.equal('打开链接');
    });
  });

  it('renders the href attribute when not disabled', () => {
    cy.mount(Link, { props: { href: '/home' } });
    cy.get('a').should('have.attr', 'href', '/home');
  });

  it('applies the status class', () => {
    cy.mount(Link, { props: { status: 'danger' } });
    cy.get('.sd-link').should('have.class', 'sd-link-status-danger');
  });

  it('emits click when enabled and clicked', () => {
    cy.mount(Link, { props: { ellipsis: false }, slots: { default: 'Link text' } });
    cy.get('.sd-link').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('does not emit click when disabled', () => {
    cy.mount(Link, {
      props: { disabled: true, ellipsis: false },
      slots: { default: 'Link text' },
    });
    cy.get('.sd-link').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('does not emit click while loading and shows the loading icon', () => {
    cy.mount(Link, {
      props: { loading: true, ellipsis: false },
      slots: { default: 'Link text' },
    });
    cy.get('.sd-link').should('have.class', 'sd-link-loading');
    cy.get('.sd-link .sd-icon-loading').should('exist');
    cy.get('.sd-link').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('renders a custom icon slot instead of the default icon', () => {
    cy.mount(Link, {
      props: { icon: true },
      slots: { icon: () => h('span', { class: 'custom-icon' }) },
    });
    cy.get('.sd-link .custom-icon').should('exist');
    cy.get('.sd-link .sd-icon-link').should('not.exist');
  });

  it('keeps the hoverless class off an icon-only link when hoverable is explicit', () => {
    cy.mount(Link, { props: { icon: true, hoverable: true } });
    cy.get('.sd-link').should('not.have.class', 'sd-link-hoverless');
  });

  it('marks a content link hoverless by default and hoverable when hoverable is true', () => {
    cy.mount(Link, { slots: { default: 'Link text' } });
    cy.get('.sd-link').should('have.class', 'sd-link-hoverless');

    cy.mount(Link, { props: { hoverable: true }, slots: { default: 'Link text' } });
    cy.get('.sd-link').should('not.have.class', 'sd-link-hoverless');
  });
});
