import Ellipsis, { PerformantEllipsis } from '../../ellipsis';
import Tag from '../index';

describe('Tag', () => {
  it('emits check(false) when a checkable tag is clicked', () => {
    cy.mount(Tag, { props: { checkable: true } });
    cy.get('.sd-tag').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const checkEvent = wrapper.emitted('check') as Array<[boolean]> | undefined;
      expect(checkEvent?.[0][0]).to.equal(false);
    });
  });

  it('enables ellipsis by default and forwards ellipsis props', () => {
    cy.mount(Tag, {
      props: { ellipsisLineClamp: 2, ellipsisTooltip: false },
      slots: { default: 'A very long tag content that should be truncated.' },
    });
    cy.get('.sd-tag').should('have.class', 'sd-tag-ellipsis-line-clamp');
    cy.get('@vue').should(({ wrapper }) => {
      const ellipsis = wrapper.findComponent(Ellipsis);
      expect(ellipsis.exists()).to.equal(true);
      expect(ellipsis.props('lineClamp')).to.equal(2);
      expect(ellipsis.props('tooltip')).to.equal(false);
    });
  });

  it('renders plain content when ellipsis is disabled', () => {
    cy.mount(Tag, { props: { ellipsis: false }, slots: { default: 'Plain tag content' } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).exists()).to.equal(false);
    });
    cy.get('.sd-tag-text').should('have.text', 'Plain tag content');
    cy.get('.sd-tag').should('have.class', 'sd-tag-no-ellipsis');
  });

  it('switches to performant ellipsis when requested', () => {
    cy.mount(Tag, {
      props: { ellipsisPerformant: true },
      slots: { default: 'A very long tag content that should be truncated.' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(PerformantEllipsis).exists()).to.equal(true);
    });
  });

  it('closes the tag when pressing Enter on the close button', () => {
    cy.mount(Tag, { props: { closable: true }, slots: { default: 'Closable tag' } });
    cy.get('.sd-tag-close-btn').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
      expect(wrapper.emitted('update:visible')?.[0]).to.deep.equal([false]);
    });
  });

  it('applies a custom color with CSS variables', () => {
    cy.mount(Tag, { props: { color: '#ff5722' }, slots: { default: 'Custom' } });
    cy.get('.sd-tag')
      .invoke('attr', 'style')
      .should('contain', '--sd-tag-color')
      .and('contain', '--sd-tag-bg-color');
    cy.get('.sd-tag').should('have.class', 'sd-tag-custom-color');
    cy.get('.sd-tag').should('not.have.class', 'sd-tag-red');
  });

  it('uses the textColor prop to override auto text color', () => {
    cy.mount(Tag, {
      props: { color: '#ff5722', textColor: '#000000' },
      slots: { default: 'Custom' },
    });
    cy.get('.sd-tag').invoke('attr', 'style').should('contain', '--sd-tag-color: #000000');
  });

  it('does not apply custom color variables for built-in colors', () => {
    cy.mount(Tag, { props: { color: 'red' }, slots: { default: 'Red' } });
    cy.get('.sd-tag').invoke('attr', 'style').should('equal', undefined);
    cy.get('.sd-tag').should('have.class', 'sd-tag-red');
    cy.get('.sd-tag').should('not.have.class', 'sd-tag-custom-color');
  });

  it('applies bordered style with a custom color', () => {
    cy.mount(Tag, { props: { color: '#ff5722', bordered: true }, slots: { default: 'Bordered' } });
    cy.get('.sd-tag').invoke('attr', 'style').should('contain', '--sd-tag-border-color');
    cy.get('.sd-tag').should('have.class', 'sd-tag-bordered');
  });

  it('uses color alpha when the color has transparency', () => {
    cy.mount(Tag, {
      props: { color: 'rgba(255, 0, 86, 0.5)', bordered: true },
      slots: { default: 'Alpha' },
    });
    cy.get('.sd-tag')
      .invoke('attr', 'style')
      .should('contain', '--sd-tag-bg-color: rgb(255 0 86 / 0.5)');
  });

  it('uses color alpha for 8-digit hex with transparency', () => {
    cy.mount(Tag, {
      props: { color: '#ff572280', bordered: true },
      slots: { default: 'Hex alpha' },
    });
    cy.get('.sd-tag')
      .invoke('attr', 'style')
      .should('contain', '--sd-tag-bg-color: rgb(255 87 34 / 0.5)');
  });

  it('falls back to default 0.8 when the color is opaque', () => {
    cy.mount(Tag, { props: { color: '#ff5722', bordered: true }, slots: { default: 'Opaque' } });
    cy.get('.sd-tag')
      .invoke('attr', 'style')
      .should('contain', '--sd-tag-bg-color: rgb(255 87 34 / 0.8)');
  });

  it('lets an explicit backgroundAlpha override color alpha', () => {
    cy.mount(Tag, {
      props: { color: 'rgba(255, 0, 86, 0.5)', backgroundAlpha: 0.3, bordered: true },
      slots: { default: 'Explicit' },
    });
    cy.get('.sd-tag')
      .invoke('attr', 'style')
      .should('contain', '--sd-tag-bg-color: rgb(255 0 86 / 0.3)');
  });
});
