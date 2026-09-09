import { addFromIconFontCn } from '../add-from-icon-font-cn';

describe('IconFont script recovery', () => {
  it('retries a failed script and renders the loaded symbol without duplicate successful loads', () => {
    const src = '/iconfont-recovery.js';
    let requests = 0;
    cy.intercept('GET', src, (request) => {
      requests++;
      request.reply(
        requests === 1
          ? { statusCode: 503, body: '' }
          : {
              headers: { 'content-type': 'application/javascript' },
              body: `document.body.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" id="retry-symbols"><symbol id="retry-square" viewBox="0 0 20 20"><path d="M0 0H20V20H0Z"/></symbol></svg>');`,
            },
      );
    }).as('script');
    cy.then(
      () =>
        new Cypress.Promise<void>((resolve) => {
          addFromIconFontCn({ src });
          const script = document.querySelector(`script[src="${src}"]`)!;
          script.addEventListener('error', () => resolve(), { once: true });
        }),
    );
    cy.then(() =>
      cy.mount(addFromIconFontCn({ src }), { props: { type: 'retry-square', size: 20 } }),
    );
    cy.get('#retry-symbols').should('exist');
    cy.get('svg.sd-icon use').should(($use) => {
      const box = ($use[0] as unknown as SVGGraphicsElement).getBBox();
      expect(box.width).to.equal(20);
      expect(box.height).to.equal(20);
    });
    cy.then(() => {
      addFromIconFontCn({ src });
    });
    cy.get('@script.all').should('have.length', 2);
    cy.get(`script[src="${src}"]`).should('have.length', 1);
    cy.get('#retry-symbols').then(($svg) => $svg.remove());
  });
});
