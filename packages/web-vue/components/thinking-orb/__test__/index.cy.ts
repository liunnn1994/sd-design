import { h, shallowRef } from 'vue';

import ThemeProvider from '../../theme-provider';
import ThinkingOrb from '../index';

function getAverageVisibleBrightness(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  expect(context).not.to.equal(null);
  const pixels = context!.getImageData(0, 0, canvas.width, canvas.height).data;
  let brightness = 0;
  let opacity = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    brightness += ((pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3) * alpha;
    opacity += alpha;
  }
  return brightness / opacity;
}

describe('ThinkingOrb', () => {
  it('renders an accessible working state by default', () => {
    cy.mount(ThinkingOrb);
    cy.get('.sd-thinking-orb')
      .should('have.attr', 'role', 'img')
      .and('have.attr', 'aria-label', '正在工作')
      .and('have.attr', 'data-state', 'working')
      .and('have.css', 'width', '64px')
      .and('have.css', 'height', '64px');
  });

  it('supports the inline size and a custom accessible label', () => {
    cy.mount(ThinkingOrb, {
      props: { size: 20, state: 'searching' },
      attrs: { 'aria-label': '正在检索知识库' },
    });
    cy.get('.sd-thinking-orb')
      .should('have.attr', 'aria-label', '正在检索知识库')
      .and('have.attr', 'data-state', 'searching')
      .and('have.css', 'width', '20px')
      .and('have.css', 'height', '20px');
  });

  it('follows the nearest ThemeProvider in auto mode', () => {
    const themeMode = shallowRef<'light' | 'dark'>('light');
    cy.mount(() => h(ThemeProvider, { themeMode: themeMode.value }, () => h(ThinkingOrb)));
    cy.get('.sd-thinking-orb').should('have.attr', 'data-theme', 'light');
    cy.then(() => {
      themeMode.value = 'dark';
    });
    cy.get('.sd-thinking-orb').should('have.attr', 'data-theme', 'dark');
  });

  it('lets an explicit theme override the inherited mode', () => {
    cy.mount(() =>
      h(ThemeProvider, { themeMode: 'dark' }, () => h(ThinkingOrb, { theme: 'light' })),
    );
    cy.get('.sd-thinking-orb').should('have.attr', 'data-theme', 'light');
  });

  it('inverts the rendered ink palette between light and dark themes', () => {
    let lightBrightness = 0;
    cy.mount(ThinkingOrb, { props: { paused: true, speed: 0, theme: 'light' } });
    cy.get<HTMLCanvasElement>('.sd-thinking-orb').then(([canvas]) => {
      lightBrightness = getAverageVisibleBrightness(canvas);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ theme: 'dark' })));
    cy.get<HTMLCanvasElement>('.sd-thinking-orb').should(([canvas]) => {
      const darkBrightness = getAverageVisibleBrightness(canvas);
      expect(lightBrightness + darkBrightness).to.be.closeTo(255, 1);
    });
  });

  it('does not schedule animation frames while paused', () => {
    cy.window().then((window) => {
      cy.spy(window, 'requestAnimationFrame').as('requestAnimationFrame');
    });
    cy.mount(ThinkingOrb, { props: { paused: true } });
    cy.get('@requestAnimationFrame').should('not.have.been.called');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ paused: false })));
    cy.get('@requestAnimationFrame').should('have.been.called');
  });
});
