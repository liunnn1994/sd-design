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
});
