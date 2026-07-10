import { defineComponent, h, shallowRef } from 'vue';

import Modal from '../../modal';
import Trigger from '../../trigger';
import ThemeProvider from '../theme-provider.vue';

describe('theme-provider standalone', () => {
  afterEach(() => {
    document.body.removeAttribute('style');
    document.body.removeAttribute('sd-theme');
    document.body
      .querySelectorAll('.sd-theme-popup-container, .sd-modal-container')
      .forEach((el) => {
        el.parentNode?.removeChild(el);
      });
  });

  it('works as a standalone local provider', () => {
    cy.mount(
      defineComponent({
        render() {
          return h(
            ThemeProvider,
            { themeMode: 'dark', theme: { tokens: { primary6: '12,34,56' } } },
            { default: () => h('div', 'standalone-content') },
          );
        },
      }),
    );
    cy.get('.sd-theme-provider').should('exist').and('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-provider').should(($el) => {
      expect(($el[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('12,34,56');
    });
    cy.get('body').then(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('');
    });
  });

  it('keeps body-mounted popups synced with the local theme provider', () => {
    cy.mount(
      defineComponent({
        render() {
          return h(
            ThemeProvider,
            { themeMode: 'dark', theme: { tokens: { primary6: '98,76,54' } } },
            {
              default: () =>
                h(
                  Trigger,
                  { trigger: 'click', defaultPopupVisible: true },
                  {
                    default: () => h('button', 'open'),
                    content: () => h('div', { id: 'theme-popup-content' }, 'popup-content'),
                  },
                ),
            },
          );
        },
      }),
    );
    cy.get('#theme-popup-content').should('exist');
    cy.get('#theme-popup-content').closest('.sd-theme-popup-container').as('container');
    cy.get('@container').should('have.attr', 'sd-theme', 'dark');
    cy.get('@container').should(($el) => {
      expect(($el[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('98,76,54');
    });
  });

  it('keeps the theme popup container above the modal when the popup opens later', () => {
    const visible = shallowRef(false);
    cy.mount(
      defineComponent({
        setup() {
          return { visible };
        },
        render() {
          return h(
            Modal,
            { visible: this.visible },
            {
              default: () =>
                h(
                  ThemeProvider,
                  { themeMode: 'dark' },
                  {
                    default: () =>
                      h(
                        Trigger,
                        { trigger: 'click', popupVisible: this.visible },
                        {
                          default: () => h('button', 'open'),
                          content: () => h('div', { id: 'theme-popup-in-modal' }, 'popup-content'),
                        },
                      ),
                  },
                ),
            },
          );
        },
      }),
    );
    let initialZ = 0;
    cy.get('.sd-theme-popup-container').then(($el) => {
      initialZ = Number(($el[0] as HTMLElement).style.zIndex);
      expect(initialZ).to.be.greaterThan(0);
    });
    cy.then(() => {
      visible.value = true;
    });
    cy.get('#theme-popup-in-modal')
      .closest('.sd-theme-popup-container')
      .should(($popup) => {
        const popupZ = Number(($popup[0] as HTMLElement).style.zIndex);
        const modalZ = Number(
          (document.body.querySelector('.sd-modal-container') as HTMLElement)?.style.zIndex || 0,
        );
        expect(popupZ).to.be.greaterThan(initialZ);
        expect(popupZ).to.be.greaterThan(modalZ);
      });
  });
});
