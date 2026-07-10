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
});
