import IconLoading from '../icon-loading';
import IconPlus from '../icon-plus';
import SDVueIcon from '../index';

describe('Icon', () => {
  it('should render an svg with sd-icon and icon-specific classes', () => {
    cy.mount(IconPlus);
    cy.get('svg').should('have.class', 'sd-icon').and('have.class', 'sd-icon-plus');
  });

  it('should render the default viewBox and stroke attributes', () => {
    cy.mount(IconPlus);
    cy.get('svg.sd-icon')
      .should('have.attr', 'viewBox', '0 0 48 48')
      .and('have.attr', 'fill', 'none')
      .and('have.attr', 'stroke', 'currentColor')
      .and('have.attr', 'stroke-width', 4)
      .and('have.attr', 'stroke-linecap', 'butt')
      .and('have.attr', 'stroke-linejoin', 'miter');
  });

  it('should support strokeWidth, strokeLinecap and strokeLinejoin props', () => {
    cy.mount(IconLoading, {
      props: { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    });
    cy.get('svg.sd-icon')
      .should('have.attr', 'stroke-width', 2)
      .and('have.attr', 'stroke-linecap', 'round')
      .and('have.attr', 'stroke-linejoin', 'round');
  });

  it('should apply numeric size as font-size and derive width from it', () => {
    cy.mount(IconPlus, { props: { size: 32 } });
    cy.get('svg.sd-icon')
      .should('have.css', 'font-size', '32px')
      .and('have.css', 'width', '32px')
      .and('have.css', 'height', '32px');
  });

  it('should apply string size verbatim', () => {
    cy.mount(IconPlus, { props: { size: '1.5rem' } });
    cy.get('svg.sd-icon').should('have.attr', 'style', 'font-size: 1.5rem;');
  });

  it('should apply the rotate prop as a transform', () => {
    cy.mount(IconPlus, { props: { rotate: 90 } });
    cy.get('svg.sd-icon').should('have.css', 'transform', 'matrix(0, 1, -1, 0, 0, 0)');
  });

  it('should add the spin class when spin is true and not otherwise', () => {
    cy.mount(IconLoading, { props: { spin: true } });
    cy.get('svg.sd-icon').should('have.class', 'sd-icon-spin');

    cy.mount(IconLoading);
    cy.get('svg.sd-icon').should('not.have.class', 'sd-icon-spin');
  });

  it('should inherit color from the parent element', () => {
    cy.mount({
      template: '<span style="color: rgb(255, 0, 0)"><icon-plus /></span>',
      components: { IconPlus },
    });
    cy.get('svg.sd-icon').should('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('should emit click event', () => {
    cy.mount(IconPlus);
    cy.get('svg.sd-icon').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('should register icons globally via the plugin install with default options', () => {
    // The mount helper installs the icon plugin bundle (no iconPrefix), so
    // components are resolvable by their PascalCase names in any template.
    cy.mount({ template: '<icon-loading />' });
    cy.get('svg.sd-icon-loading').should('exist');
  });

  it('should register icons with a custom iconPrefix via install options', () => {
    cy.mount(
      { template: '<FooIconPlus />' },
      { global: { plugins: [[IconPlus, { iconPrefix: 'Foo' }]] } },
    );
    cy.get('svg.sd-icon-plus').should('exist');
  });

  it('should re-export individual icons and the install bundle from the index', () => {
    expect(SDVueIcon.IconPlus).to.equal(IconPlus);
    expect(SDVueIcon.IconLoading).to.equal(IconLoading);
    expect(typeof SDVueIcon.install).to.equal('function');
  });
});
