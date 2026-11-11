export {};
const metrics = () =>
  cy
    .get('output')
    .invoke('text')
    .should('not.be.empty')
    .then((text) => JSON.parse(text));
const imageResponses = new Set<() => void>();
const releaseImages = () => {
  for (const release of imageResponses) release();
  imageResponses.clear();
};
const image = () =>
  cy.intercept(
    'GET',
    '**/nested-markdown-image.svg*',
    (request) =>
      new Promise<void>((resolve) =>
        imageResponses.add(() => {
          request.reply({
            headers: { 'content-type': 'image/svg+xml' },
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>',
          });
          resolve();
        }),
      ),
  );
describe('React Markdown nested lifecycle and DOM modes', () => {
  afterEach(releaseImages);
  it('retains normal slots when SD node overrides prevent minimal DOM mode', () => {
    cy.visit('/markdown-nested.html?minimal');
    cy.get('.node-slot').should('have.length', 1);
    cy.get('.node-content h2.sd-typography').should('have.text', 'Minimal');
  });
  for (const fragment of [false, true]) {
    it(`keeps the parent unsettled until its nested image settles with fragment=${fragment}`, () => {
      image();
      cy.visit(`/markdown-nested.html${fragment ? '?fragment' : ''}`);
      cy.contains('button', 'Toggle child').click();
      cy.get('img[alt="Nested image"]').should('exist');
      cy.wrap(null).should(() => expect(imageResponses.size).to.be.greaterThan(0));
      cy.contains('button', 'Settle parent').click();
      metrics().then((value) => {
        expect(value.sessionKey).to.equal('parent');
        expect(value.measuredCount).to.equal(1);
        expect(value.stable).to.equal(false);
      });
      cy.then(releaseImages);
      cy.get('img[alt="Nested image"]').should(($image) =>
        expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(32),
      );
      cy.contains('button', 'Settle parent').click();
      metrics().then((value) => expect(value.stable).to.equal(true));
      cy.contains('button', 'Clone image AST').click();
      cy.contains('button', 'Settle parent').click();
      metrics().then((value) => expect(value.stable).to.equal(true));
    });
  }
  it('releases the parent pending marker when a nested renderer unmounts before loading', () => {
    image();
    cy.visit('/markdown-nested.html?fragment');
    cy.contains('button', 'Toggle child').click();
    cy.get('img[alt="Nested image"]').should('exist');
    cy.wrap(null).should(() => expect(imageResponses.size).to.be.greaterThan(0));
    cy.contains('button', 'Settle parent').click();
    metrics().then((value) => expect(value.stable).to.equal(false));
    cy.contains('button', 'Toggle child').click();
    cy.get('img[alt="Nested image"]').should('not.exist');
    cy.contains('button', 'Settle parent').click();
    metrics().then((value) => expect(value.stable).to.equal(true));
  });
});
