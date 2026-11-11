import { checkComponentDocs } from './docs-contract';

describe('React icon library and IconFont', () => {
  const generated = '[data-testid="icon-generated"]';
  const generic = '[data-testid="icon-generic"]';
  const font = '[data-testid="icon-font"]';
  /** @param {JQuery<HTMLElement>} element */
  const geometry = (element: JQuery<HTMLElement>) =>
    (element[0] as unknown as SVGGraphicsElement).getBBox();
  const action = (name = '') => cy.get(`[data-testid="icon-${name}"]`).click();
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="icon-fixture"]').scrollIntoView();
  });
  it('renders generated paths with SVG defaults, native events, stroke options and refs', () => {
    cy.get(generated)
      .should('have.class', 'sd-icon-plus')
      .and('have.attr', 'viewBox', '0 0 48 48')
      .and('have.attr', 'stroke-width', '4');
    cy.get(`${generated} path`).should('have.attr', 'd', 'M5 24h38M24 5v38');
    cy.get(generated).click();
    cy.get('[data-testid="icon-events"]').should('have.text', 'generated');
    action('stroke');
    cy.get(generated)
      .should('have.attr', 'stroke-width', '2')
      .and('have.attr', 'stroke-linecap', 'round')
      .and('have.attr', 'stroke-linejoin', 'bevel');
    action('read-ref');
    cy.get('[data-testid="icon-ref"]').should('have.text', 'svg');
    action('unmount');
    action('read-ref');
    cy.get('[data-testid="icon-ref"]').should('have.text', 'none');
  });
  it('preserves zero sizes and restores inherited and relative sizes on all icon variants', () => {
    action('zero');
    for (const selector of [generated, generic, font])
      cy.get(selector).should('have.css', 'width', '0px');
    action('inherit');
    for (const selector of [generated, generic, font])
      cy.get(selector).should('have.css', 'width', '16px');
    action('em');
    for (const selector of [generated, generic, font])
      cy.get(selector).should('have.css', 'width', '32px');
  });
  it('composes rotation with actual spin animations and clears animation and rotation styles', () => {
    action('spin');
    for (const selector of [generated, generic, font]) {
      cy.get(selector).then(($svg) => {
        const animation = $svg[0].getAnimations()[0];
        expect(animation).not.to.equal(undefined);
        animation.pause();
        animation.currentTime = 0;
      });
      cy.get(selector).should('have.css', 'transform', 'matrix(0, 1, -1, 0, 0, 0)');
    }
    cy.get(generated).should('have.class', 'sd-icon-spin');
    cy.get(generic).should('have.class', 'sd-icon-loading');
    action('stop');
    for (const selector of [generated, generic, font])
      cy.get(selector).should('have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)');
    action('clear-rotate');
    for (const selector of [generated, generic, font])
      cy.get(selector)
        .should(($svg) => {
          expect($svg[0].style.getPropertyValue('--icon-rotate')).to.equal('');
          expect($svg[0].getAnimations()).to.have.length(0);
        })
        .and('have.css', 'transform', 'none');
  });
  it('switches actual symbol geometry and falls back to custom SVG children', () => {
    cy.get(`${font} use`).should(($use) => expect(geometry($use).width).to.equal(10));
    action('large');
    cy.get(`${font} use`).should('have.attr', 'xlink:href', '#fixture-large-square');
    cy.get(`${font} use`).should(($use) => expect(geometry($use).width).to.equal(20));
    cy.get(font).should('have.attr', 'aria-label', 'fixture-large-square').click();
    cy.get('[data-testid="icon-events"]').should('have.text', 'font');
    action('fallback');
    cy.get(`${font} use`).should('not.exist');
    cy.get(`${font} circle`).should(($circle) => expect(geometry($circle).width).to.equal(6));
  });
  it('merges configured and caller classes and events while configured icon props take precedence', () => {
    cy.get('[data-testid="icon-configured"]')
      .should('have.class', 'configured-icon')
      .and('have.class', 'caller-icon')
      .and('have.css', 'width', '30px')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
      .click();
    cy.get('[data-testid="icon-events"]').should('have.text', 'configured|caller');
  });
  it('updates generated and generic class prefixes without retaining prior classes', () => {
    action('prefix');
    cy.get(generated).should('have.class', 'custom-icon-plus').and('not.have.class', 'sd-icon');
    cy.get(generic).should('have.class', 'custom-icon').and('have.class', 'inline-shape');
    cy.get(font).should('have.class', 'custom-icon').and('have.class', 'fixture-small-square');
  });
  it('renders every catalog entry with measurable geometry', () => {
    action('gallery');
    cy.get('[data-testid="icon-gallery-grid"] > svg')
      .should('have.length', 287)
      .each(($svg) => {
        const box = geometry($svg);
        expect(box.width + box.height, $svg.attr('aria-label')).to.be.greaterThan(0);
      });
  });
  it('retries a failed script, renders its symbol and deduplicates successful loads', () => {
    let requests = 0;
    cy.intercept('GET', '/react-iconfont.js', (request) => {
      requests++;
      request.reply(
        requests === 1
          ? { statusCode: 503, body: '' }
          : {
              headers: { 'content-type': 'application/javascript' },
              body: `document.body.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><symbol id="react-remote-square" viewBox="0 0 20 20"><path d="M0 0H20V20H0Z"/></symbol></svg>');`,
            },
      );
    }).as('iconScript');
    action('load');
    cy.wait('@iconScript');
    cy.get('script[src="/react-iconfont.js"]').should('not.exist');
    action('load');
    cy.wait('@iconScript');
    cy.get('[data-testid="icon-remote"] use').should(($use) =>
      expect(geometry($use).width).to.equal(24),
    );
    action('load');
    cy.get('script[src="/react-iconfont.js"]').should('have.length', 1);
    cy.get('@iconScript.all').should('have.length', 2);
  });
});

describe('React icon documentation', () => {
  it('documents shared icon scenes and framework navigation', () => checkComponentDocs('icon'));
  it('documents shared icon-component scenes and framework navigation', () =>
    checkComponentDocs('icon-component'));
});
