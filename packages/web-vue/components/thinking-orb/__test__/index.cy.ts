import { h, shallowRef } from 'vue';

import ThemeProvider from '../../theme-provider';
import { paint } from '../engine/core';
import ThinkingOrb from '../index';

function captureInkColors(dark: boolean) {
  const colors: string[] = [];
  const context = {
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
      colors.push(String(value));
    },
    beginPath() {},
    arc() {},
    fill() {},
  } as unknown as CanvasRenderingContext2D;

  paint(
    context,
    [
      { x: 0, y: 0, z: 0, r: 1, white: 0.2 },
      { x: 0, y: 0, z: 1, r: 1, white: 0.4 },
      { x: 0, y: 0, z: 2, r: 1, white: 0.8 },
    ],
    dark,
  );
  return colors;
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

  it('inverts ink colors before canvas rasterization', () => {
    expect(captureInkColors(false)).to.deep.equal([
      'rgba(51,51,51,1)',
      'rgba(102,102,102,1)',
      'rgba(204,204,204,1)',
    ]);
    expect(captureInkColors(true)).to.deep.equal([
      'rgba(204,204,204,1)',
      'rgba(153,153,153,1)',
      'rgba(51,51,51,1)',
    ]);
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
