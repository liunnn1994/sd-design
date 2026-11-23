export function scrollToTopOutside(node: Element) {
  return cy.window().then(
    (win) =>
      new Cypress.Promise<void>((resolve) => {
        const observer = new win.IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) return;
          observer.disconnect();
          resolve();
        });
        observer.observe(node);
        win.scrollTo({ top: 0, behavior: 'instant' });
      }),
  );
}
