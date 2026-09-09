import { defineComponent, ref } from 'vue';

import BorderBeam from '../index';

describe('BorderBeam lifecycle', () => {
  afterEach(() => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    );
  });

  it('stops the pulse driver when reduced motion is enabled and finishes deactivation', () => {
    cy.mount(BorderBeam, {
      props: { size: 'pulse-inner' },
      slots: { default: '<div style="width:200px;height:100px">Content</div>' },
    });
    cy.get('[data-beam]').should(($el) => expect($el[0].style.cssText).to.contain('--bw1-'));
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.window().should((win) =>
      expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(true),
    );
    cy.wait(100);
    cy.get('[data-beam]').then(($el) => {
      const snapshot = $el[0].style.cssText;
      cy.wait(150);
      cy.get('[data-beam]').should(($current) =>
        expect($current[0].style.cssText).to.equal(snapshot),
      );
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ active: false }));
    cy.get('[data-beam]').should('not.have.attr', 'data-active');
    cy.get('[data-beam]').should('not.have.attr', 'data-fading');
  });

  for (const size of ['sm', 'md', 'line', 'pulse-inner', 'pulse-outside'] as const) {
    it(`keeps ${size} static and visible with reduced motion`, () => {
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Emulation.setEmulatedMedia',
          params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
        }),
      );
      cy.mount(BorderBeam, {
        props: { size },
        slots: { default: '<div style="width:200px;height:100px">Content</div>' },
      });
      cy.get('[data-beam]').should('have.css', 'animation-name', 'none');
      cy.get('[data-beam]').should(($el) => {
        const el = $el[0];
        const id = el.getAttribute('data-beam');
        expect(getComputedStyle(el).getPropertyValue(`--beam-opacity-${id}`).trim()).to.equal('1');
        expect(getComputedStyle(el, '::after').animationName).to.equal('none');
      });
    });
  }

  it('remeasures pulse glow after replacing and resizing the slot root', () => {
    cy.mount(
      defineComponent({
        components: { BorderBeam },
        setup: () => ({ replaced: ref(false), width: ref(350) }),
        template:
          '<button @click="replaced = true; width = 700">Replace</button><button @click="width = 525">Resize</button><BorderBeam size="pulse-outside"><div :key="String(replaced)" :style="{width: width + \'px\', height: \'140px\'}">Content</div></BorderBeam>',
      }),
    );
    cy.get('[data-beam]').should('have.css', '--pulse-glow-sx', '1');
    cy.contains('button', 'Replace').click();
    cy.get('[data-beam]').should('have.css', '--pulse-glow-sx', '2');
    cy.contains('button', 'Resize').click();
    cy.get('[data-beam]').should('have.css', '--pulse-glow-sx', '1.5');
  });

  it('reverses fading when active becomes true again', () => {
    cy.mount(BorderBeam, {
      slots: { default: '<div style="width:200px;height:100px">Content</div>' },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ active: false }));
    cy.get('[data-beam]').should('have.attr', 'data-fading');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ active: true }));
    cy.get('[data-beam]').should('have.attr', 'data-active');
    cy.get('[data-beam]').should('not.have.attr', 'data-fading');
    cy.wait(1000);
    cy.get('[data-beam]').should('have.attr', 'data-active');
  });

  it('detects zero radius and continues observing replacement slot roots', () => {
    cy.mount(
      defineComponent({
        components: { BorderBeam },
        setup: () => ({ radius: ref(12), replaced: ref(false) }),
        template:
          '<button @click="radius = 0">Square</button><button @click="replaced = true; radius = 20">Replace</button><button @click="radius = 30">Round</button><BorderBeam><div :key="String(replaced)" :style="{borderRadius: radius + \'px\', width: \'200px\', height: \'100px\'}">Content</div></BorderBeam>',
      }),
    );
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 12px');
    cy.contains('button', 'Square').click();
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 0px');
    cy.contains('button', 'Replace').click();
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 20px');
    cy.contains('button', 'Round').click();
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 30px');
  });

  it('restores detected radius when the explicit override is removed', () => {
    cy.mount(BorderBeam, {
      props: { borderRadius: 40 },
      slots: { default: '<div style="border-radius:12px">Content</div>' },
    });
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 40px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ borderRadius: undefined }));
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 12px');
  });
});
