export const intentOptions = [
  {
    value: 'a',
    label: 'Branch A',
    children: Array.from({ length: 8 }, (_, i) => ({ value: `a${i}`, label: `A child ${i}` })),
  },
  { value: 'b', label: 'Branch B', children: [{ value: 'b0', label: 'B child 0' }] },
];

export const intentModes = ['trigger', 'menu', 'dropdown', 'cascader', 'panel', 'popover'] as const;
export type IntentMode = (typeof intentModes)[number];

function atViewportPoint<T>(
  x: number,
  y: number,
  action: (x: number, y: number) => PromiseLike<T>,
) {
  return cy.window().then((win) => {
    // CDP uses the top-level viewport; component tests run inside the AUT iframe.
    let current: Window = win;
    while (current !== current.parent) {
      const frame =
        current.frameElement ??
        [...current.parent.document.querySelectorAll('iframe')].find(
          (element) => element.contentWindow === current,
        );
      if (!frame) throw new Error('AUT iframe was not found');
      const rect = frame.getBoundingClientRect();
      x = rect.left + (x * rect.width) / frame.clientWidth;
      y = rect.top + (y * rect.height) / frame.clientHeight;
      current = current.parent;
    }
    return action(x, y);
  });
}

function moveMouse(x: number, y: number) {
  return atViewportPoint(x, y, (x, y) =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Input.dispatchMouseEvent',
      params: { type: 'mouseMoved', x, y, button: 'none', pointerType: 'mouse' },
    }),
  );
}

export function tapAt(x: number, y: number) {
  return atViewportPoint(x, y, async (x, y) => {
    await Cypress.automation('remote:debugger:protocol', {
      command: 'Input.dispatchTouchEvent',
      params: { type: 'touchStart', touchPoints: [{ x, y }] },
    });
    await Cypress.automation('remote:debugger:protocol', {
      command: 'Input.dispatchTouchEvent',
      params: { type: 'touchEnd', touchPoints: [] },
    });
  });
}

export function moveMouseTo(selector: string) {
  return cy
    .get(selector)
    .first()
    .scrollIntoView()
    .then(($target) => {
      const rect = $target[0].getBoundingClientRect();
      return moveMouse(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}

export function moveMouseAway() {
  return cy.window().then((win) => moveMouse(win.innerWidth - 5, win.innerHeight - 5));
}

export function hoverIntentTests(setup: (mode: IntentMode) => void) {
  function expectSiblingHidden() {
    cy.get('body').should(($body) => {
      const matches = [...$body[0].querySelectorAll<HTMLElement>('*')].filter(
        (element) => element.textContent === 'B child 0',
      );
      expect(matches.some((element) => Cypress.dom.isVisible(element))).to.equal(false);
    });
  }
  for (const mode of intentModes) {
    describe(`${mode} safe polygon`, () => {
      const selector = 'button, .sd-menu-pop-header, .sd-dropdown-option';
      function start(flipped = false) {
        setup(mode);
        if (flipped)
          cy.get('[data-intent-fixture]').invoke(
            'attr',
            'style',
            'position:absolute;right:20px;top:60px;width:200px',
          );
        if (mode === 'cascader') cy.get('input').click();
        moveMouse(5, 5);
        cy.contains(selector, /^Branch A$/)
          .should('be.visible')
          .should('have.css', 'pointer-events', 'auto')
          .then(($source) => {
            const rect = $source[0].getBoundingClientRect();
            moveMouse(rect.left + 20, rect.top + rect.height / 2);
          });
        cy.contains('A child 0').should('be.visible');
      }
      function crossSibling() {
        cy.contains(selector, /^Branch A$/).then(($source) => {
          const rect = $source[0].getBoundingClientRect();
          moveMouse(rect.left + rect.width * 0.3, rect.bottom + 4);
          moveMouse(rect.left + rect.width * 0.5, rect.bottom + 12);
        });
        cy.wait(120);
        cy.contains('A child 0').should('be.visible');
        expectSiblingHidden();
      }
      it('keeps the original branch across siblings and permits switching on pause', () => {
        start();
        crossSibling();
        cy.contains('B child 0').should('be.visible');
      });
      it('lands on the original panel without opening the crossed sibling', () => {
        start();
        crossSibling();
        cy.contains<HTMLElement>('A child 3').then(($child) => {
          const rect = $child[0].getBoundingClientRect();
          moveMouse(rect.left + 12, rect.top + rect.height / 2);
        });
        cy.wait(450);
        cy.contains('A child 3').should('be.visible');
        expectSiblingHidden();
      });
      it('cancels a crossed sibling after leaving the entire hot zone', () => {
        start();
        crossSibling();
        moveMouse(5, 5);
        cy.wait(500);
        expectSiblingHidden();
      });
      if (mode === 'trigger') {
        it('protects a panel automatically flipped to the left', () => {
          start(true);
          cy.contains(selector, /^Branch A$/).then(($source) => {
            const rect = $source[0].getBoundingClientRect();
            cy.contains<HTMLElement>('A child 0').should(($child) => {
              expect($child[0].getBoundingClientRect().right).to.be.at.most(rect.left + 1);
            });
            moveMouse(rect.right - rect.width * 0.3, rect.bottom + 4);
            moveMouse(rect.right - rect.width * 0.5, rect.bottom + 12);
          });
          cy.wait(120);
          cy.contains('A child 0').should('be.visible');
          expectSiblingHidden();
          cy.contains<HTMLElement>('A child 3').then(($child) => {
            const rect = $child[0].getBoundingClientRect();
            moveMouse(rect.right - 12, rect.top + rect.height / 2);
          });
          cy.wait(450);
          cy.contains('A child 3').should('be.visible');
          expectSiblingHidden();
        });
      }
    });
  }
}
