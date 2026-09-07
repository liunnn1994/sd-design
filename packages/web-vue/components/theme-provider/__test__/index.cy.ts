import { createApp } from 'vue';

import ThemeProvider from '../index';

describe('ThemeProvider', () => {
  afterEach(() => {
    document.body.removeAttribute('style');
    document.body.removeAttribute('sd-theme');
    document.body.querySelectorAll('.sd-theme-popup-container').forEach((el) => {
      el.parentNode?.removeChild(el);
    });
  });

  it('renders slot content directly without a wrapper when no theme is configured', () => {
    cy.mount(ThemeProvider, { slots: { default: 'plain-content' } });
    cy.contains('plain-content').should('exist');
    cy.get('.sd-theme-provider').should('not.exist');
    cy.get('body').should('not.have.attr', 'sd-theme');
    cy.get('body').should(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('');
    });
  });

  it('wraps slot content with sd-theme-provider and the sd-theme attribute in local mode', () => {
    cy.mount(ThemeProvider, {
      props: { themeMode: 'dark' },
      slots: { default: 'local-content' },
    });
    cy.get('.sd-theme-provider').should('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-provider').should('have.text', 'local-content');
    cy.get('body').should('not.have.attr', 'sd-theme');
  });

  it('omits the sd-theme attribute when only theme tokens are provided', () => {
    cy.mount(ThemeProvider, {
      props: { theme: { tokens: { primary6: '12,34,56' } } },
      slots: { default: 'tokens-only' },
    });
    cy.get('.sd-theme-provider').should('exist').and('not.have.attr', 'sd-theme');
    cy.get('.sd-theme-provider').should('contain', 'tokens-only');
  });

  it('renders a custom tag element when tag is set', () => {
    cy.mount(ThemeProvider, {
      props: { themeMode: 'dark', tag: 'section' },
      slots: { default: 'sectioned-content' },
    });
    cy.get('section.sd-theme-provider')
      .should('have.attr', 'sd-theme', 'dark')
      .and('contain', 'sectioned-content');
  });

  it('applies normalized CSS variables for tokens and component tokens', () => {
    cy.mount(ThemeProvider, {
      props: {
        theme: {
          tokens: { primary6: '12,34,56', colorText2: 'rgb(0,0,0)' },
          components: { button: { colorBg: 'red' } },
        },
      },
    });
    cy.get('.sd-theme-provider').should(($el) => {
      const style = ($el[0] as HTMLElement).style;
      expect(style.getPropertyValue('--primary-6')).to.equal('12,34,56');
      expect(style.getPropertyValue('--color-text-2')).to.equal('rgb(0,0,0)');
      expect(style.getPropertyValue('--component-button-color-bg')).to.equal('red');
    });
  });

  it('honors a custom cssVarPrefix from theme meta', () => {
    cy.mount(ThemeProvider, {
      props: {
        theme: { tokens: { primary6: '1,2,3' }, meta: { cssVarPrefix: 'brand' } },
      },
    });
    cy.get('.sd-theme-provider').should(($el) => {
      expect(($el[0] as HTMLElement).style.getPropertyValue('--brand-primary-6')).to.equal('1,2,3');
      expect(($el[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('');
    });
  });

  it('updates and prunes CSS variables when the theme prop changes reactively', () => {
    cy.mount(ThemeProvider, {
      props: { themeMode: 'dark', theme: { tokens: { primary6: '12,34,56' } } },
    });
    cy.get('.sd-theme-provider').should(($el) => {
      expect(($el[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('12,34,56');
    });
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(
        wrapper.setProps({
          theme: { tokens: { colorWarning6: '9,87,65' } },
          themeMode: 'light',
        }),
      ),
    );
    cy.get('.sd-theme-provider').should('have.attr', 'sd-theme', 'light');
    cy.get('.sd-theme-provider').should(($el) => {
      const style = ($el[0] as HTMLElement).style;
      expect(style.getPropertyValue('--primary-6')).to.equal('');
      expect(style.getPropertyValue('--color-warning-6')).to.equal('9,87,65');
    });
  });

  it('themes document.body in global mode and unwraps slot content', () => {
    cy.mount(ThemeProvider, {
      props: { global: true, themeMode: 'dark', theme: { tokens: { primary6: '10,20,30' } } },
      slots: { default: 'global-content' },
    });
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.get('body').should(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('10,20,30');
    });
    cy.contains('global-content').should('exist');
    cy.get('.sd-theme-provider').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.get('body').should('not.have.attr', 'sd-theme');
    cy.get('body').should(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('');
    });
  });

  it('restores the previous body sd-theme attribute and clears variables on unmount', () => {
    cy.document().then((doc) => {
      doc.body.setAttribute('sd-theme', 'dark');
    });
    cy.mount(ThemeProvider, {
      props: { global: true, themeMode: 'light', theme: { tokens: { primary6: '12,34,56' } } },
    });
    cy.get('body').should('have.attr', 'sd-theme', 'light');
    cy.get('body').should(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('12,34,56');
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.get('body').should(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--primary-6')).to.equal('');
    });
  });

  it('creates a themed body-level popup container for local providers', () => {
    cy.mount(ThemeProvider, {
      props: { themeMode: 'dark', theme: { tokens: { primary6: '98,76,54' } } },
    });
    cy.get('.sd-theme-popup-container').should(($el) => {
      const el = $el[0] as HTMLElement;
      expect(el.style.getPropertyValue('--primary-6')).to.equal('98,76,54');
      expect(el.getAttribute('sd-theme')).to.equal('dark');
      expect(Number(el.style.zIndex)).to.be.greaterThan(0);
      expect(getComputedStyle(el).pointerEvents).to.equal('none');
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.get('.sd-theme-popup-container').should('not.exist');
  });

  it('installs itself as SdThemeProvider on an app', () => {
    const app = createApp({ render: () => null });
    ThemeProvider.install(app);
    expect((app.component('SdThemeProvider') as { name?: string } | undefined)?.name).to.equal(
      'ThemeProvider',
    );
  });

  it('honors componentPrefix and classPrefix install options', () => {
    const app = createApp({ render: () => null });
    ThemeProvider.install(app, { componentPrefix: 'X', classPrefix: 'foo' });
    expect((app.component('XThemeProvider') as { name?: string } | undefined)?.name).to.equal(
      'ThemeProvider',
    );
    const globalConfig = app.config.globalProperties.$sd as { classPrefix?: string } | undefined;
    expect(globalConfig?.classPrefix).to.equal('foo');
  });
});
