import ThinkingOrb from '../index';

describe('ThinkingOrb visibility batches', () => {
  it('starts from the newest entry and stops for a later hidden entry', () => {
    let notify: IntersectionObserverCallback;
    cy.window().then((win) => {
      const Native = win.IntersectionObserver;
      cy.stub(win, 'IntersectionObserver').callsFake(
        (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
          notify = callback;
          return new Native(
            (entries, observer) =>
              callback(
                [{ isIntersecting: false } as IntersectionObserverEntry, ...entries],
                observer,
              ),
            options,
          );
        },
      );
      cy.spy(win, 'requestAnimationFrame').as('frames');
      cy.spy(win, 'cancelAnimationFrame').as('cancel');
    });
    cy.mount(ThinkingOrb);
    cy.get('@frames').should('have.been.called');
    cy.then(() =>
      notify(
        [{ isIntersecting: true }, { isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    cy.get('@cancel').should('have.been.called');
  });
});
