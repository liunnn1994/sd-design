import BorderBeam from '../index';

const slot = { default: '<div>Content</div>' };

const rectMock = {
  width: 200,
  height: 100,
  top: 0,
  right: 200,
  bottom: 100,
  left: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

const stubBeamRect = () =>
  cy.get('[data-beam]').then(($el) => {
    cy.stub($el[0] as HTMLElement, 'getBoundingClientRect').returns(rectMock);
  });

const flowFrom = (arg?: unknown) =>
  cy.get('@vue').then(({ wrapper }) => {
    (wrapper.vm as { flowFrom: (arg?: unknown) => void }).flowFrom(arg);
  });

const fireAnimationEnd = (animationName: string) =>
  cy.get('[data-beam]').then(($el) => {
    ($el[0] as HTMLElement).dispatchEvent(
      new AnimationEvent('animationend', { animationName, bubbles: true }),
    );
  });

describe('BorderBeam', () => {
  it('renders with default props', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('[data-beam]').should('exist');
    cy.get('[data-active]').should('exist');
    cy.get('.sd-border-beam').should('exist');
  });

  it('applies size prop and injects a style element', () => {
    cy.mount(BorderBeam, { props: { size: 'sm' }, slots: slot });
    cy.get('[data-beam]').should('exist');
    cy.get('[data-beam-style]').should('exist');
  });

  it('does not show data-active when active is false', () => {
    cy.mount(BorderBeam, { props: { active: false }, slots: slot });
    cy.get('[data-active]').should('not.exist');
  });

  it('shows data-fading when toggling active from true to false', () => {
    cy.mount(BorderBeam, { props: { active: true }, slots: slot });
    cy.get('[data-active]').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ active: false })));
    cy.get('[data-fading]').should('exist');
  });

  it('applies colorVariant, theme and borderRadius props', () => {
    cy.mount(BorderBeam, {
      props: { colorVariant: 'ocean', theme: 'light', borderRadius: 24 },
      slots: slot,
    });
    cy.get('[data-beam]').should('exist');
  });

  it('renders slot content', () => {
    cy.mount(BorderBeam, { slots: { default: '<div class="inner-content">Hello</div>' } });
    cy.get('.inner-content').should('have.text', 'Hello');
  });

  it('renders the bloom element', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('[data-beam-bloom]').should('exist');
  });

  it('applies strength and density as CSS variables', () => {
    cy.mount(BorderBeam, { props: { strength: 0.5, density: 2 }, slots: slot });
    cy.get('[data-beam]')
      .invoke('attr', 'style')
      .should('contain', '--beam-strength')
      .and('contain', '--beam-density');
  });

  it('handles line and pulse sizes', () => {
    cy.mount(BorderBeam, { props: { size: 'line' }, slots: slot });
    cy.get('[data-beam]').should('exist');
  });

  it('injects a per-instance style element into the head', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('[data-beam]')
      .invoke('attr', 'data-beam')
      .then((beamId) => {
        cy.get(`style[data-beam-style="${beamId}"]`).should('exist');
      });
  });

  it('exposes a flowFrom method', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('@vue').then(({ wrapper }) => {
      expect(typeof (wrapper.vm as { flowFrom?: unknown }).flowFrom).to.equal('function');
    });
  });

  it('starts flow from top-right by default', () => {
    cy.mount(BorderBeam, { slots: slot });
    stubBeamRect();
    flowFrom();
    cy.get('[data-flowing]').should('exist');
    cy.get('[data-beam-flow]').should('exist');
    cy.get('[data-beam]')
      .invoke('attr', 'style')
      .should('contain', '--beam-flow-x: 200px')
      .and('contain', '--beam-flow-y: 0px');
  });

  it('starts flow from a custom local coordinate', () => {
    cy.mount(BorderBeam, { slots: slot });
    stubBeamRect();
    flowFrom({ x: 24, y: 36 });
    cy.get('[data-beam]')
      .invoke('attr', 'style')
      .should('contain', '--beam-flow-x: 24px')
      .and('contain', '--beam-flow-y: 36px')
      .and('contain', '--beam-flow-radius');
  });

  it('fades out after flow entrance when active is false', () => {
    cy.mount(BorderBeam, { props: { active: false }, slots: slot });
    stubBeamRect();
    flowFrom('center');
    cy.get('[data-active]').should('exist');
    // Wait for the real CSS flow entrance to finish, then it fades out.
    cy.get('[data-beam-flow]', { timeout: 10000 }).should('not.exist');
    cy.get('[data-fading]').should('exist');
  });

  it('keeps beam active after flow entrance when active is true', () => {
    cy.mount(BorderBeam, { props: { active: true }, slots: slot });
    stubBeamRect();
    flowFrom('center');
    cy.get('[data-active]').should('exist');
    cy.get('[data-beam-flow]', { timeout: 10000 }).should('not.exist');
    cy.get('[data-active]').should('exist');
    cy.get('[data-fading]').should('not.exist');
  });

  it('includes flow overlay styles in dynamic CSS', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('[data-beam]')
      .invoke('attr', 'data-beam')
      .then((beamId) => {
        cy.get(`style[data-beam-style="${beamId}"]`)
          .invoke('text')
          .should('contain', '[data-beam-flow]')
          .and('contain', 'beam-flow-spread');
      });
  });

  it('does not show data-paused while the beam is in view', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('[data-beam]').should('not.have.attr', 'data-paused');
  });

  it('clamps strength to 1 and density to the 0.1 minimum', () => {
    cy.mount(BorderBeam, { props: { strength: 2, density: 0 }, slots: slot });
    cy.get('[data-beam]')
      .invoke('attr', 'style')
      .should('contain', '--beam-strength: 1')
      .and('contain', '--beam-density: 0.1');
  });

  it('applies the duration prop to the generated CSS', () => {
    cy.mount(BorderBeam, { props: { duration: 2.5 }, slots: slot });
    // Only one beam is mounted per test, so the per-instance style element is unique.
    cy.get('style[data-beam-style]').invoke('text').should('contain', '2.5s linear infinite');
  });

  it('applies brightness and saturation overrides to the hue-shift keyframes', () => {
    cy.mount(BorderBeam, { props: { brightness: 2.2, saturation: 0.8 }, slots: slot });
    cy.get('style[data-beam-style]')
      .invoke('text')
      .should('contain', 'brightness(2.20)')
      .and('contain', 'saturate(0.80)');
  });

  it('disables hue shift when staticColors is set', () => {
    cy.mount(BorderBeam, { props: { staticColors: true }, slots: slot });
    cy.get('style[data-beam-style]').invoke('text').should('not.contain', 'beam-hue-shift');
  });

  it('forces static colors for the mono color variant', () => {
    cy.mount(BorderBeam, { props: { colorVariant: 'mono' }, slots: slot });
    cy.get('style[data-beam-style]').invoke('text').should('not.contain', 'beam-hue-shift');
  });

  it('clamps hueRange to 13deg for the line size', () => {
    cy.mount(BorderBeam, { props: { size: 'line', hueRange: 50 }, slots: slot });
    cy.get('style[data-beam-style]')
      .invoke('text')
      .should('contain', 'hue-rotate(-13deg)')
      .and('not.contain', 'hue-rotate(-50deg)');
  });

  it('uses light-theme gradients when theme is light', () => {
    cy.mount(BorderBeam, { props: { theme: 'light' }, slots: slot });
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'rgba(0, 0, 0, 0.08)');
  });

  it('auto-detects the border radius from slot content', () => {
    cy.mount(BorderBeam, {
      slots: { default: '<div class="inner-content" style="border-radius: 10px">Hi</div>' },
    });
    cy.get('style[data-beam-style]').invoke('text').should('contain', 'border-radius: 10px');
  });

  it('borderRadius prop takes precedence over the detected radius', () => {
    cy.mount(BorderBeam, {
      props: { borderRadius: 24 },
      slots: { default: '<div class="inner-content" style="border-radius: 10px">Hi</div>' },
    });
    cy.get('style[data-beam-style]')
      .invoke('text')
      .should('contain', 'border-radius: 24px')
      .and('not.contain', 'border-radius: 10px');
  });

  it('maps the center preset to the element center during flow', () => {
    cy.mount(BorderBeam, { slots: slot });
    stubBeamRect();
    flowFrom('center');
    cy.get('[data-beam]')
      .invoke('attr', 'style')
      .should('contain', '--beam-flow-x: 100px')
      .and('contain', '--beam-flow-y: 50px');
  });

  it('renders the flow overlay internals with the measured viewBox', () => {
    cy.mount(BorderBeam, { slots: slot });
    stubBeamRect();
    flowFrom('top-left');
    cy.get('[data-beam-flow]').should('have.attr', 'viewBox', '0 0 200 100');
    cy.get('[data-beam-flow-front]').should('exist');
    cy.get('[data-beam-flow-sheet]').should('exist');
    cy.get('[data-beam-flow-blob]').should('have.length', 3);
  });

  it('gives each instance a unique beam id', () => {
    cy.mount({ components: { BorderBeam }, template: '<div><BorderBeam /><BorderBeam /></div>' });
    cy.get('[data-beam]').should('have.length', 2);
    cy.get('[data-beam]').then(($els) => {
      const ids = $els.toArray().map((el) => el.getAttribute('data-beam'));
      expect(new Set(ids).size).to.equal(2);
    });
  });

  it('removes the injected style element on unmount', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('style[data-beam-style]').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('style[data-beam-style]').should('not.exist');
  });

  it('emits activate when the fade-in animation ends', () => {
    cy.mount(BorderBeam, { slots: slot });
    fireAnimationEnd('beam-fade-in-test');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('activate') ?? [];
      expect(events.length).to.be.greaterThan(0);
    });
  });

  it('emits deactivate and clears fading when the fade-out animation ends', () => {
    cy.mount(BorderBeam, { props: { active: true }, slots: slot });
    cy.get('[data-active]').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ active: false })));
    cy.get('[data-fading]').should('exist');
    fireAnimationEnd('beam-fade-out-test');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('deactivate') ?? [];
      expect(events.length).to.be.greaterThan(0);
    });
    cy.get('[data-fading]').should('not.exist');
    cy.get('[data-active]').should('not.exist');
  });

  it('registers the shared pulse driver for pulse sizes', () => {
    cy.mount(BorderBeam, { props: { size: 'pulse-inner' }, slots: slot });
    cy.get('[data-beam]').invoke('attr', 'style').should('contain', '--bw1-');
  });

  it('does not register the pulse driver for rotating sizes', () => {
    cy.mount(BorderBeam, { slots: slot });
    cy.get('[data-beam]').invoke('attr', 'style').should('not.contain', '--bw1-');
  });

  it('scales the pulse-outside glow to the slot content size', () => {
    cy.mount(BorderBeam, {
      props: { size: 'pulse-outside' },
      slots: { default: '<div class="inner-content" style="width: 700px; height: 280px">Hi</div>' },
    });
    cy.get('[data-beam]')
      .invoke('attr', 'style')
      .should('contain', '--pulse-glow-sx: 2')
      .and('contain', '--pulse-glow-sy: 2');
  });
});
