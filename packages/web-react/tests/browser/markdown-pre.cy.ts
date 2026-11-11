import { markdownPreNode } from '../../../web-core/tests/fixtures/markdown-pre-node.js';
const mono =
  '"SF Mono", Monaco, Consolas, "Ubuntu Mono", "Liberation Mono", "Courier New", monospace';
const common = {
  'font-family': mono,
  'font-size': '12px',
  'line-height': '18px',
  'padding-top': '8px',
  'padding-right': '6.59766px',
  'padding-bottom': '8px',
  'padding-left': '41.5859px',
  'max-height': '500px',
  'white-space': 'pre-wrap',
  'overflow-wrap': 'anywhere',
  'overflow-x': 'hidden',
  'background-color': 'rgb(255, 255, 255)',
  'color': 'rgb(57, 58, 52)',
  'border-top-width': '0px',
  'margin-top': '0px',
  'tab-size': '4',
};
const captured = {
  'default': { styles: common, height: 88, lines: 2, header: true },
  'configured': {
    styles: {
      ...common,
      'font-family': '"Courier New"',
      'font-size': '16px',
      'line-height': '28px',
      'padding-top': '12px',
      'padding-right': '12px',
      'padding-bottom': '12px',
      'padding-left': '62.0078px',
      'max-height': '150px',
      'background-color': 'rgb(18, 18, 18)',
      'color': 'rgba(219, 215, 202, 0.933)',
      'tab-size': '8',
    },
    height: 136,
    lines: 2,
    header: true,
  },
  'scroll': {
    styles: {
      ...common,
      'padding-left': '6.59766px',
      'white-space': 'pre',
      'overflow-wrap': 'normal',
      'overflow-x': 'auto',
    },
    height: 67,
    lines: 0,
    header: true,
  },
  'bare': {
    styles: { ...common, 'padding-left': '6.59766px' },
    height: 88,
    lines: 0,
    header: false,
  },
  'plain-title': { styles: common, height: 88, lines: 2, header: true },
};
function expectGeometry(scenario: keyof typeof captured) {
  const expected = captured[scenario];
  cy.get('pre.code-pre-fallback').should(($pre) => {
    const node = $pre[0],
      style = node.ownerDocument.defaultView!.getComputedStyle(node);
    for (const [key, value] of Object.entries(expected.styles)) {
      if (key.startsWith('padding-'))
        expect(Number.parseFloat(style.getPropertyValue(key)), key).to.be.closeTo(
          Number.parseFloat(value),
          0.02,
        );
      else expect(style.getPropertyValue(key), key).to.equal(value);
    }
    expect(node.getBoundingClientRect().height).to.be.closeTo(expected.height, 0.02);
    expect(node.querySelector('code')?.textContent).to.equal(markdownPreNode.code.slice(0, -1));
    expect(node.querySelectorAll('.markstream-pre__logical-line').length).to.equal(expected.lines);
  });
  if (expected.header) {
    cy.get('.code-block-header').then(($header) => {
      const nodes = [
        $header[0],
        ...$header[0].querySelectorAll('.code-header-title,.code-header-caption'),
      ];
      cy.writeFile(
        `../../.local/markdown-pre-react-header-${scenario}.json`,
        nodes.map((node) => {
          const style = node.ownerDocument.defaultView!.getComputedStyle(node);
          return {
            class: node.className,
            height: node.getBoundingClientRect().height,
            styles: Object.fromEntries(
              [
                'line-height',
                'font-size',
                'font-family',
                'color',
                'background-color',
                'border-bottom-color',
                'padding-top',
                'padding-bottom',
                'border-bottom-width',
                'gap',
                '--ms-leading-body',
              ].map((key) => [key, style.getPropertyValue(key)]),
            ),
          };
        }),
      );
    });
    cy.get('.code-block-header').should(($header) =>
      expect($header[0].getBoundingClientRect().height).to.be.closeTo(
        scenario === 'plain-title' ? 39 : 52.6875,
        0.02,
      ),
    );
    cy.get('.code-block-header')
      .should(
        'have.css',
        'background-color',
        scenario === 'configured' ? 'rgb(31, 31, 31)' : 'rgb(238, 238, 238)',
      )
      .and(
        'have.css',
        'color',
        scenario === 'configured' ? 'rgb(237, 237, 237)' : 'rgb(26, 26, 26)',
      )
      .and(
        'have.css',
        'border-bottom-color',
        scenario === 'configured' ? 'rgb(51, 51, 51)' : 'rgb(222, 222, 222)',
      );
    cy.get('.code-header-title').should(
      'have.text',
      scenario === 'plain-title' ? 'TypeScript' : '/src/file.ts',
    );
    if (scenario === 'plain-title') cy.get('.code-header-caption').should('not.exist');
    else cy.get('.code-header-caption').should('have.text', 'TypeScript');
  } else cy.get('.code-block-header').should('not.exist');
}
describe('React Markdown pre rendering against actual Vue', () => {
  for (const scenario of Object.keys(captured) as (keyof typeof captured)[])
    it(`matches Vue ${scenario} styles, geometry, header and text`, () => {
      cy.visit(`/markdown-pre.html?${scenario}`);
      expectGeometry(scenario);
    });
  it('updates styles and preserves loading line endings on the same code node', () => {
    cy.visit('/markdown-pre.html');
    expectGeometry('default');
    cy.contains('button', 'Change options').click();
    expectGeometry('configured');
    cy.contains('button', 'Toggle loading').click();
    cy.get('pre')
      .should('have.attr', 'aria-busy', 'true')
      .find('code')
      .should('have.text', markdownPreNode.code);
  });
  it('waits for clipboard success, emits once per public callback and resets feedback', () => {
    cy.visit('/markdown-pre.html');
    cy.get('button[aria-label="Copy"]').then(() => cy.clock());
    cy.get('button[aria-label="Copy"]').click();
    cy.get('[data-testid="pre-events"]').should('have.text', 'click');
    cy.get('[data-testid="pre-written"]').should(
      'have.text',
      JSON.stringify([markdownPreNode.code]),
    );
    cy.contains('button', 'Resolve copy').click();
    cy.get('button[aria-label="Copied"]').should('exist');
    cy.get('[data-testid="pre-events"]').should('have.text', 'click|copy-code|copy');
    cy.tick(1000);
    cy.get('button[aria-label="Copy"]').should('exist');
  });
  it('does not emit copy success or show copied feedback after writer rejection', () => {
    cy.visit('/markdown-pre.html', {
      onBeforeLoad(window) {
        cy.spy(window.console, 'error').as('copyError');
      },
    });
    cy.get('button[aria-label="Copy"]').click();
    cy.contains('button', 'Reject copy').click();
    cy.get('@copyError').should('have.been.calledOnce');
    cy.get('button[aria-label="Copied"]').should('not.exist');
    cy.get('[data-testid="pre-events"]').should('have.text', 'click');
  });
  it('uses pre for every diagram language instead of mounting asynchronous renderers', () => {
    for (const language of ['mermaid', 'infographic', 'd2', 'd2lang']) {
      cy.visit(`/markdown-pre.html?language=${language}`);
      cy.get('pre.code-pre-fallback').should('have.attr', 'data-language', language);
      cy.get('.code-block-header').should('exist');
      cy.get('.mermaid-block, .infographic-block, .d2-block').should('not.exist');
    }
  });
  it('honors tooltip and copy visibility controls', () => {
    cy.visit('/markdown-pre.html?no-tooltip');
    cy.get('button[aria-label="Copy"]').trigger('mouseover');
    cy.get('[role="tooltip"]').should('not.exist');
    cy.visit('/markdown-pre.html?no-copy');
    cy.get('.code-block-header').should('exist').find('button').should('not.exist');
  });
  it('keeps the open tooltip text until a new hover or focus while copy feedback changes', () => {
    cy.visit('/markdown-pre.html');
    cy.get('button[aria-label="Copy"]').then(() => cy.clock());
    cy.get('button[aria-label="Copy"]').trigger('mouseover');
    cy.tick(80);
    cy.get('button[aria-label="Copy"]').should('have.attr', 'aria-describedby');
    cy.get('[role="tooltip"]').should('contain.text', 'Copy');
    cy.get('button[aria-label="Copy"]').click();
    cy.contains('button', 'Resolve copy').trigger('click');
    cy.get('button[aria-label="Copied"]').should('exist');
    cy.get('[role="tooltip"]').should('contain.text', 'Copy').and('not.contain.text', 'Copied');
    cy.get('button[aria-label="Copied"]').trigger('mouseout').trigger('mouseover');
    cy.tick(80);
    cy.get('[role="tooltip"]').should('contain.text', 'Copied');
    cy.get('button[aria-label="Copied"]').trigger('mouseout');
    cy.tick(119);
    cy.get('button[aria-label="Copied"]').should('have.attr', 'aria-describedby');
    cy.tick(1);
    cy.get('button[aria-label="Copied"]').should('not.have.attr', 'aria-describedby');
  });
});
