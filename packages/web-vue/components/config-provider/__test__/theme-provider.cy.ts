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
    let clickCount = 0;
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
                    content: () =>
                      h(
                        'button',
                        {
                          id: 'theme-popup-content',
                          onClick: () => clickCount++,
                        },
                        'popup-content',
                      ),
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
      expect(getComputedStyle($el[0]).pointerEvents).to.equal('none');
    });
    cy.get('#theme-popup-content')
      .closest('.sd-trigger-popup')
      .should(($popup) => {
        expect(getComputedStyle($popup[0]).pointerEvents).to.equal('auto');
      });
    cy.get('#theme-popup-content').click();
    cy.then(() => expect(clickCount).to.equal(1));
  });

  it('applies and withdraws body theme effects when global flips at runtime', () => {
    cy.mount(ThemeProvider, {
      props: { themeMode: 'dark' },
      slots: { default: () => h('div', 'local-content') },
    });
    cy.get('.sd-theme-provider').should('have.attr', 'sd-theme', 'dark');
    cy.get('body').should('not.have.attr', 'sd-theme');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ global: true })));
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-provider').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ global: false })));
    cy.get('body').should('not.have.attr', 'sd-theme');
  });

  it('restores the previous body theme per provider with simultaneous global providers', () => {
    cy.mount(
      defineComponent({
        components: { ThemeProvider },
        data: () => ({ showSecond: false }),
        template: `
          <div>
            <ThemeProvider global theme-mode="dark">
              <div class="first-provider">first</div>
            </ThemeProvider>
            <ThemeProvider v-if="showSecond" global theme-mode="light">
              <div class="second-provider">second</div>
            </ThemeProvider>
          </div>
        `,
      }),
    );

    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setData({ showSecond: true })));
    cy.get('body').should('have.attr', 'sd-theme', 'light');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setData({ showSecond: false })));
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
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
