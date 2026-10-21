import { h } from 'vue';

import Sender from '../index';

describe('Sender focus styles', () => {
  for (const theme of ['light', 'dark']) {
    for (const mode of ['text', 'slots']) {
      it(`shows a soft focus highlight without resizing in ${theme} ${mode} mode`, () => {
        cy.mount(() =>
          h('div', { 'sd-theme': theme, 'style': { padding: '32px' } }, [
            h(Sender, {
              placeholder: '输入消息，按 Enter 发送',
              ...(mode === 'slots' ? { slotConfig: [{ type: 'text' as const, value: '' }] } : {}),
            }),
          ]),
        );
        let idleShadow: string;
        let bounds: DOMRect;
        const editor = mode === 'text' ? 'textarea' : '.sd-rich-text-editor-content';
        cy.get('.sd-sender-main').invoke('css', 'transition', 'none');
        cy.get(editor).focus().blur();
        cy.get('.sd-sender-main').then(($main) => {
          idleShadow = $main.css('box-shadow');
          bounds = $main[0].getBoundingClientRect();
        });
        cy.get(editor).focus().should('be.focused').and('have.css', 'outline-style', 'none');
        cy.get('.sd-sender-main').should(($main) => {
          const shadow = $main.css('box-shadow');
          expect(shadow).not.to.equal(idleShadow);
          expect(shadow).to.contain('20px');
          expect(shadow).not.to.contain('0px 0px 0px 2px');
          const focusedBounds = $main[0].getBoundingClientRect();
          expect(focusedBounds.width).to.equal(bounds.width);
          expect(focusedBounds.height).to.equal(bounds.height);
        });
        cy.get('.sd-sender').parent().screenshot(`sender-focus-${theme}-${mode}`);
        cy.get(editor).blur();
        cy.get('.sd-sender-main').should(($main) => {
          expect($main.css('box-shadow')).to.equal(idleShadow);
        });
      });
    }
  }

  it('does not highlight a disabled sender when a custom control receives focus', () => {
    cy.mount(Sender, {
      props: { disabled: true },
      slots: { prefix: () => h('button', '附件') },
    });
    cy.get('.sd-sender-main').then(($main) => {
      const idleShadow = $main.css('box-shadow');
      cy.get('.sd-sender-main button').first().focus();
      cy.get('.sd-sender-main').should('have.css', 'box-shadow', idleShadow);
    });
  });
});

describe('Sender action button styles', () => {
  it('applies the primary color token to the cancel text button', () => {
    cy.mount(Sender, { props: { loading: true } });
    cy.get('.sd-sender').invoke('css', '--component-sender-color-primary', 'rgb(12, 34, 56)');
    cy.get('.sd-sender-actions-btn.sd-btn-text')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'color', 'rgb(12, 34, 56)');
  });

  it('keeps the disabled speech text button transparent with the disabled color token', () => {
    cy.mount(Sender, { props: { allowSpeech: true, disabled: true, voiceGlow: false } });
    cy.get('.sd-sender').invoke(
      'css',
      '--component-sender-color-bg-actions-disabled',
      'rgb(78, 90, 12)',
    );
    cy.get('.sd-sender-actions-btn-disabled.sd-btn-text')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'color', 'rgb(78, 90, 12)')
      .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
  });

  it('applies the disabled background token to the empty send button', () => {
    cy.mount(Sender);
    cy.get('.sd-sender').invoke(
      'css',
      '--component-sender-color-bg-actions-disabled',
      'rgb(78, 90, 12)',
    );
    cy.get('.sd-sender-actions-btn-disabled:not(.sd-btn-text)')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'color', 'rgb(255, 255, 255)')
      .and('have.css', 'background-color', 'rgb(78, 90, 12)');
  });
});
