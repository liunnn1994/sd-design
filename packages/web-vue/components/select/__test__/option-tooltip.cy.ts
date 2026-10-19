import Select from '../index';

describe('Select option tooltip lifecycle', () => {
  for (const ellipsis of [true, 'performant-ellipsis'] as const) {
    for (const virtual of [false, true]) {
      it(`closes the ${ellipsis} tooltip before the dropdown leaves, virtual=${virtual}`, () => {
        const label = 'mb-3 sd:text-[var(--color-text-2)] '.repeat(12);
        cy.mount(Select, {
          global: { stubs: { transition: false } },
          props: {
            options: [label, 'Other'],
            ellipsis,
            virtualListProps: virtual ? {} : undefined,
            triggerProps: { duration: 1000 },
          },
          attrs: { style: 'width: 150px; margin: 100px;' },
        });
        cy.get('.sd-select-view').click();
        cy.get('.sd-select-option')
          .first()
          .find('.sd-ellipsis, .sd-performant-ellipsis')
          .first()
          .trigger('mouseenter');
        cy.get('[role="tooltip"]').should('be.visible');
        cy.get('[role="tooltip"]').then(($tooltip) => {
          const doc = $tooltip[0].ownerDocument;
          cy.get('.sd-select-option')
            .first()
            .then(($option) => {
              const dropdown = $option[0].closest('.sd-select-dropdown')!;
              $option[0].click();
              return new Promise<void>((resolve, reject) => {
                const win = doc.defaultView!;
                const start = win.performance.now();
                let firstFrame = true;
                const checkFrame = () => {
                  if (firstFrame) {
                    expect(
                      dropdown.getClientRects().length,
                      'dropdown still has its anchor during leave',
                    ).to.be.greaterThan(0);
                    firstFrame = false;
                  }
                  const visible = Array.from(doc.querySelectorAll('[role="tooltip"]')).some(
                    (element) =>
                      element.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }),
                  );
                  if (visible) {
                    reject(
                      new Error(
                        `tooltip is visible ${Math.round(win.performance.now() - start)}ms after closing`,
                      ),
                    );
                    return;
                  }
                  if (win.performance.now() - start >= 1100) resolve();
                  else win.requestAnimationFrame(checkFrame);
                };
                win.requestAnimationFrame(checkFrame);
              });
            });
        });
        cy.get('.sd-select-dropdown').should('not.be.visible');
        cy.get('body').should(($body) => {
          expect(
            Array.from($body[0].querySelectorAll('[role="tooltip"]')).some((element) =>
              element.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }),
            ),
          ).to.equal(false);
        });
        cy.get('.sd-select-view').click();
        cy.get('.sd-select-dropdown').should('be.visible');
        cy.get('body').should(($body) => {
          expect(
            Array.from($body[0].querySelectorAll('[role="tooltip"]')).some((element) =>
              element.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }),
            ),
          ).to.equal(false);
        });
      });
    }
  }
});
