import { checkComponentDocs } from './docs-contract';

describe('React RegexVis shared foundation adapter', () => {
  beforeEach(() => cy.visit('/regex-vis.html'));
  it('preserves controlled rejection, event order and external literal flags', () => {
    cy.contains('#controlled .sd-regex-vis-flags label', 'i').click();
    cy.get('[data-testid="state"]').should('have.text', '/a/g|g');
    cy.get('[data-testid="events"]').should('have.text', 'flags:gi|value:/a/gi');
    cy.contains('#controlled .sd-regex-vis-flags label', 'i')
      .find('input')
      .should('not.be.checked');
    cy.contains('button', 'Accept').click();
    cy.contains('#controlled .sd-regex-vis-flags label', 'i').click();
    cy.get('[data-testid="state"]').should('have.text', '/a/gi|gi');
    cy.contains('button', 'External literal').click();
    cy.get('[data-testid="state"]').should('have.text', '/😀/u|u');
    cy.get('#controlled .sd-regex-vis-node-character').should('contain.text', '😀');
  });
  it('retains stable selection ids and clears selection when the diagram disappears', () => {
    cy.get('#controlled .sd-regex-vis-node-character')
      .click()
      .should('have.attr', 'aria-pressed', 'true');
    cy.contains('button', 'Plain').click();
    cy.get('#controlled .sd-regex-vis-node-character')
      .should('have.attr', 'aria-pressed', 'true')
      .and('contain.text', 'b');
    cy.contains('button', 'Empty').click();
    cy.get('#controlled .sd-regex-vis-graph').should('not.exist');
    cy.contains('button', 'Plain').click();
    cy.get('#controlled .sd-regex-vis-node-character').should('have.attr', 'aria-pressed', 'false');
    cy.contains('button', 'Selectable').click();
    cy.get('#controlled .sd-regex-vis-node-character')
      .click()
      .should('not.have.attr', 'aria-pressed');
    cy.get('[data-testid="selected"]').should('have.text', '1');
  });
  it('selects graph nodes by keyboard', () => {
    cy.get('#controlled .sd-regex-vis-node-character').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="selected"]').should('have.text', '1');
    cy.get('#controlled .sd-regex-vis-node-character').trigger('keydown', { key: ' ' });
    cy.get('[data-testid="selected"]').should('have.text', '2');
  });
  it('supports uncontrolled editing and renders lazy quantifiers', () => {
    cy.get('#uncontrolled .sd-regex-vis-quantifier [stroke-dasharray]').should(
      'have.attr',
      'stroke-dasharray',
      '4 4',
    );
    cy.get('#uncontrolled input[type="text"]').clear().type('x');
    cy.get('#uncontrolled .sd-regex-vis-node-character').should('have.text', '"x"');
  });
  it('renders custom empty/error content and current footer state', () => {
    cy.contains('button', 'Custom').click();
    cy.contains('button', 'Empty').click();
    cy.get('[data-testid="custom-empty"]').should('contain.text', 'Empty:');
    cy.contains('button', 'Invalid').click();
    cy.get('#controlled [role="alert"] [data-testid="custom-error"]').should(
      'contain.text',
      'Error:',
    );
    cy.get('[data-testid="footer"]').should('have.text', '[|g');
  });
  it('makes inputs readonly while preserving graph selection', () => {
    cy.contains('button', 'Readonly').click();
    cy.get('#controlled input[type="text"]').should('have.attr', 'readonly');
    cy.get('#controlled input[type="checkbox"]').should('be.disabled');
    cy.get('#controlled .sd-regex-vis-node-character').click();
    cy.get('[data-testid="selected"]').should('have.text', '1');
  });
});

describe('React RegexVis graph and Unicode parity', () => {
  const visit = (pattern: string, extra = '') =>
    cy.visit(`/regex-vis.html?pattern=${encodeURIComponent(pattern)}${extra}`);
  it('renders groups, branches, assertions and quantifiers', () => {
    visit(String.raw`^(foo|bar)+\d$`);
    cy.get('.sd-regex-vis-graph').should('have.attr', 'role', 'img');
    cy.get('.sd-regex-vis-node-group, .sd-regex-vis-node-choice').should('have.length', 2);
    cy.get('.sd-regex-vis-node-assertion').should('have.length', 2);
    cy.get('.sd-regex-vis-quantifier').should('exist');
  });
  it('emits the initial validation once in StrictMode and recovers after editing', () => {
    visit('(');
    cy.get('[data-testid="errors"]').should('have.text', 'invalid');
    cy.get('[role="alert"]').should('exist');
    cy.get('.sd-regex-vis-input input').clear().type('abc');
    cy.get('.sd-regex-vis-graph').should('exist');
    cy.get('[data-testid="errors"]').should('have.text', 'invalid|valid');
  });
  it('synchronizes initial literal flags once in StrictMode', () => {
    visit('/a/u');
    cy.get('[data-testid="flag-events"]').should('have.text', 'u');
    cy.contains('.sd-regex-vis-flags label', 'u').find('input').should('be.checked');
  });
  for (const pattern of [
    String.raw`[\uD83D\uDE00-\uD83D\uDE4F]`,
    '[😀-🙏]',
    String.raw`[\u{1F600}-\u{1F64F}]`,
  ]) {
    it(`preserves selected Unicode endpoints for ${pattern}`, () => {
      visit(pattern, '&unicode');
      cy.get('.sd-regex-vis-node-character').click();
      cy.get('[data-testid="node"]')
        .invoke('text')
        .then(JSON.parse)
        .its('ranges.0')
        .should('include', { from: '😀', to: '🙏' });
    });
  }
  for (const unicode of [false, true]) {
    it(`renders surrogate escape pairs ${unicode ? 'together' : 'separately'}`, () => {
      visit(String.raw`\uD83D\uDE00+`, unicode ? '&unicode' : '');
      cy.get('.sd-regex-vis-node-character').should('have.length', unicode ? 1 : 2);
      cy.get('.sd-regex-vis-quantifier').should('have.text', '1 - ∞');
    });
  }
  it('revalidates Unicode-dependent syntax when flags change', () => {
    visit(String.raw`[\u{1F600}-\u{1F64F}]`);
    cy.get('[role="alert"]').should('exist');
    cy.contains('.sd-regex-vis-flags label', 'u').click();
    cy.get('.sd-regex-vis-node-character').should('have.text', '😀 - 🙏');
    cy.get('[role="alert"]').should('not.exist');
  });
  it('renders Unicode property escapes as quantified classes', () => {
    visit(String.raw`\p{Script=Greek}+`, '&unicode');
    cy.get('.sd-regex-vis-node-character').should('have.text', String.raw`\p{Script=Greek}`);
    cy.get('.sd-regex-vis-quantifier').should('have.text', '1 - ∞');
  });
  it('retains selected nodes when flags change', () => {
    visit('abc');
    cy.get('.sd-regex-vis-node-character').click();
    cy.contains('.sd-regex-vis-flags label', 'i').click();
    cy.get('.sd-regex-vis-node-character')
      .should('have.class', 'sd-regex-vis-node-selected')
      .and('have.attr', 'aria-pressed', 'true');
  });
  it('uses semantic SVG fill in dark mode', () => {
    visit('abc', '&dark');
    cy.get('[sd-theme="dark"]').then(($theme) => {
      const doc = $theme[0].ownerDocument;
      const win = doc.defaultView!;
      const probe = doc.createElement('span');
      probe.style.color = win
        .getComputedStyle($theme[0])
        .getPropertyValue('--sd-color-primary-light-1')
        .trim();
      doc.body.append(probe);
      const expected = win.getComputedStyle(probe).color;
      probe.remove();
      cy.get('.sd-regex-vis-node-character rect').should(($rect) => {
        expect(win.getComputedStyle($rect[0]).fill).to.equal(expected);
      });
    });
  });
});

describe('React RegexVis documentation', () => {
  it('documents shared regex-vis scenes and framework navigation', () =>
    checkComponentDocs('regex-vis'));
});
