export {};
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const precise = () => cy.get('[data-testid="cursor-host"] .typewriter-cursor');
const geometry = () =>
  cy.get('[data-testid="cursor-host"] > .markdown-renderer').should(($root) => {
    const root = $root[0];
    const cursor = root.querySelector<HTMLElement>('.typewriter-cursor')!;
    expect(cursor).not.to.equal(null);
    expect(getComputedStyle(cursor).visibility).to.equal('visible');
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let last: Text | undefined;
    while (walker.nextNode())
      if (walker.currentNode.textContent?.trim()) last = walker.currentNode as Text;
    const range = root.ownerDocument.createRange();
    range.setStart(last!, last!.length - 1);
    range.setEnd(last!, last!.length);
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1];
    const bounds = root.getBoundingClientRect();
    const values = cursor.style.transform.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    expect(values[0]).to.be.closeTo(Math.max(0, rect.right - bounds.left + root.scrollLeft), 2);
    expect(values[1]).to.be.closeTo(Math.max(0, rect.top - bounds.top + root.scrollTop), 2);
    expect(parseFloat(cursor.style.height)).to.be.closeTo(rect.height, 2);
  });
describe('React Markdown typewriter cursors', () => {
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  for (const mode of ['precise', 'boolean']) {
    it(`positions ${mode} at the real final glyph and follows appended/wrapped text`, () => {
      cy.visit(`/markdown-cursor.html?mode=${mode}`);
      precise()
        .should('have.attr', 'aria-hidden', 'true')
        .and('have.css', 'pointer-events', 'none');
      geometry();
      control('Append');
      geometry();
      control('Narrow');
      control('Append');
      geometry();
      control('Finish');
      precise().should('not.exist');
      control('Resume');
      geometry();
    });
  }
  it('uses one pseudo cursor on the last text host and moves it when text is appended', () => {
    cy.visit('/markdown-cursor.html?mode=simple');
    cy.get('.markdown-renderer').should('have.class', 'typewriter-simple-cursor');
    cy.get('.typewriter-simple-cursor-target')
      .should('have.length', 1)
      .then(($target) => {
        const pseudo = getComputedStyle($target[0], '::after');
        expect(pseudo.borderRightWidth).to.equal('2px');
        expect(pseudo.pointerEvents).to.equal('none');
      });
    precise().should('not.exist');
    control('Paragraph tail');
    cy.get('.typewriter-simple-cursor-target')
      .should('have.length', 1)
      .and('have.text', 'After code');
    control('Precise');
    cy.get('.typewriter-simple-cursor-target').should('not.exist');
    geometry();
    control('Off');
    precise().should('not.exist');
    control('Simple');
    control('Append');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
  });
  it('stops at heavy tails and supplied nodes, then resumes for new ordinary content', () => {
    cy.visit('/markdown-cursor.html');
    geometry();
    control('Code tail');
    cy.get('[data-node-type="code_block"]').should('exist');
    precise().should('not.exist');
    control('Paragraph tail');
    geometry();
    control('Toggle nodes');
    cy.get('.markdown-renderer').should('have.text', 'Supplied text');
    precise().should('not.exist');
    control('Toggle nodes');
    control('Append');
    geometry();
  });
  it('expires after three seconds of inactivity and cleans up across a real unmount', () => {
    cy.visit('/markdown-cursor.html?mode=simple');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
    cy.get('.typewriter-simple-cursor-target', { timeout: 4500 }).should('not.exist');
    control('Append');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
    control('Toggle renderer');
    cy.get('.typewriter-simple-cursor-target').should('not.exist');
    control('Toggle renderer');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
  });
  it('keeps precise coordinates correct inside a scrolled renderer', () => {
    cy.visit('/markdown-cursor.html?scroll');
    control('Many lines');
    cy.get('[data-testid="cursor-host"] > .markdown-renderer').scrollTo('bottom');
    control('Append');
    geometry();
  });
  it('follows the actual visible glyph as a real smooth stream catches up', () => {
    cy.visit('/markdown-cursor.html?smooth');
    geometry();
    control('Append');
    geometry();
    cy.get('[data-testid="cursor-host"] .markdown-renderer').should('contain.text', 'continued');
    geometry();
    control('Finish');
    precise().should('not.exist');
  });
  it('suppresses fragment cursors and nested owners while allowing independent renderers', () => {
    cy.visit('/markdown-cursor.html?fragment');
    cy.get('[data-testid="cursor-host"]').should('contain.text', 'opening');
    cy.get('.typewriter-cursor, .typewriter-simple-cursor-target').should('not.exist');
    cy.visit('/markdown-cursor.html?owners');
    cy.get('[data-testid="owner-parent"] .markdown-renderer').should('have.length', 1);
    cy.get('[data-testid="owner-parent"] .typewriter-cursor').should('not.exist');
    cy.get('[data-testid="independent"] .typewriter-cursor').should(
      'have.css',
      'visibility',
      'visible',
    );
  });
  it('respects reduced motion for the simple cursor blink', () => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.visit('/markdown-cursor.html?mode=simple');
    cy.get('.typewriter-simple-cursor-target')
      .should('have.length', 1)
      .then(($target) =>
        expect(getComputedStyle($target[0], '::after').animationName).to.equal('none'),
      );
  });
});
