import { h } from 'vue';

import ConfigProvider from '../../config-provider';
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

  it('checkable tag exposes role=button + aria-pressed and toggles via Enter', () => {
    cy.mount(Tag, { props: { checkable: true, defaultChecked: false } });
    cy.get('.sd-tag').should('have.attr', 'role', 'button');
    cy.get('.sd-tag').should('have.attr', 'tabindex', '0');
    cy.get('.sd-tag').should('have.attr', 'aria-pressed', 'false');
    cy.get('.sd-tag').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-tag').should('have.attr', 'aria-pressed', 'true');
  });

  it('keyboard activation passes the KeyboardEvent as the check payload', () => {
    cy.mount(Tag, { props: { checkable: true, defaultChecked: false } });
    // Cypress trigger 合成的是普通 Event，需用真实 KeyboardEvent 验证 payload 类型
    cy.get('.sd-tag').then(($tag) => {
      $tag[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    cy.get('@vue').should(({ wrapper }) => {
      const checkEvent = wrapper.emitted('check') as Array<[boolean, Event]> | undefined;
      expect(checkEvent?.[0][0]).to.equal(true);
      expect(checkEvent?.[0][1]).to.be.an.instanceOf(KeyboardEvent);
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

  it('non-bordered custom color tag is fully opaque (backgroundAlpha falls back to 1)', () => {
    cy.mount(Tag, { props: { color: '#ff5722' }, slots: { default: 'Opaque' } });
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgb(255, 87, 34)');
  });

  it('explicitly bordered custom color tag keeps the default 0.8 alpha', () => {
    cy.mount(Tag, { props: { color: '#ff5722', bordered: true }, slots: { default: 'Bordered' } });
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgba(255, 87, 34, 0.8)');
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

  it('renders a checkable tag as checked by default (defaultChecked=true)', () => {
    cy.mount(Tag, { props: { checkable: true } });
    cy.get('.sd-tag').should('have.class', 'sd-tag-checked');
    cy.get('.sd-tag').should('have.attr', 'aria-pressed', 'true');
  });

  it('emits update:checked and check(true) when an unchecked checkable tag is clicked', () => {
    cy.mount(Tag, { props: { checkable: true, defaultChecked: false } });
    cy.get('.sd-tag').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checked')?.[0]).to.deep.equal([true]);
      const checkEvent = wrapper.emitted('check') as Array<[boolean]> | undefined;
      expect(checkEvent?.[0][0]).to.equal(true);
    });
    cy.get('.sd-tag').should('have.attr', 'aria-pressed', 'true');
  });

  it('toggles a checkable tag with the Space key', () => {
    cy.mount(Tag, { props: { checkable: true, defaultChecked: false } });
    cy.get('.sd-tag').focus().trigger('keydown', { key: ' ' });
    cy.get('.sd-tag').should('have.attr', 'aria-pressed', 'true');
  });

  it('keeps a controlled checked state when the checked prop does not change', () => {
    cy.mount(Tag, { props: { checkable: true, checked: true } });
    cy.get('.sd-tag').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checked')?.[0]).to.deep.equal([false]);
    });
    cy.get('.sd-tag').should('have.attr', 'aria-pressed', 'true');
  });

  it('does not render the tag when defaultVisible is false', () => {
    cy.mount(Tag, { props: { defaultVisible: false }, slots: { default: 'Hidden' } });
    cy.get('.sd-tag').should('not.exist');
  });

  it('keeps a controlled visible tag rendered after close and emits update:visible', () => {
    cy.mount(Tag, { props: { visible: true, closable: true }, slots: { default: 'Pinned' } });
    cy.get('.sd-tag-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:visible')?.[0]).to.deep.equal([false]);
      expect(wrapper.emitted('close')).to.have.length(1);
    });
    cy.get('.sd-tag').should('exist');
  });

  it('closes the tag when pressing Space on the close button', () => {
    cy.mount(Tag, { props: { closable: true }, slots: { default: 'Closable tag' } });
    cy.get('.sd-tag-close-btn').trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('emits close but not check when the close button of a checkable tag is clicked', () => {
    cy.mount(Tag, { props: { checkable: true, closable: true }, slots: { default: 'Both' } });
    cy.get('.sd-tag-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
      expect(wrapper.emitted('check')).to.equal(undefined);
    });
  });

  it('exposes the close button as a button with an aria-label', () => {
    cy.mount(Tag, { props: { closable: true }, slots: { default: 'Closable tag' } });
    cy.get('.sd-tag-close-btn')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label');
  });

  it('adds the loading class and renders a loading icon when loading', () => {
    cy.mount(Tag, { props: { loading: true }, slots: { default: 'Loading' } });
    cy.get('.sd-tag').should('have.class', 'sd-tag-loading');
    cy.get('.sd-tag-loading-icon').should('exist');
  });

  it('applies the size class for size=small', () => {
    cy.mount(Tag, { props: { size: 'small' }, slots: { default: 'Small' } });
    cy.get('.sd-tag').should('have.class', 'sd-tag-size-small');
  });

  it('forwards native attributes to the tag root', () => {
    cy.mount(Tag, {
      attrs: { 'aria-label': 'Build status', 'data-testid': 'status-tag' },
      slots: { default: 'Ready' },
    });
    cy.get('[data-testid="status-tag"]')
      .should('have.class', 'sd-tag')
      .and('have.attr', 'aria-label', 'Build status');
  });

  it('follows ConfigProvider RTL direction', () => {
    cy.mount(() => h(ConfigProvider, { rtl: true }, () => h(Tag, null, () => 'RTL')));
    cy.get('.sd-tag').should('have.class', 'sd-tag-rtl');
  });
});
