describe('React ColorPicker shared pointer controls', () => {
  beforeEach(() => cy.visit('/color-picker-controls.html'));
  const press = (selector: string, x: number, y = 0.5) =>
    cy.get(selector).then(($block) => {
      const block = $block[0];
      const rect = block.getBoundingClientRect();
      expect(rect.width).to.be.greaterThan(100);
      expect(rect.height).to.be.greaterThan(0);
      const win = block.ownerDocument.defaultView!;
      block.dispatchEvent(
        new win.MouseEvent('mousedown', {
          bubbles: true,
          buttons: 1,
          clientX: rect.left + rect.width * x,
          clientY: rect.top + rect.height * y,
        }),
      );
      win.dispatchEvent(new win.MouseEvent('mouseup'));
    });
  it('maps palette coordinates to saturation and brightness', () => {
    press('.sd-color-picker-palette', 0.25, 0.75);
    cy.get('[data-testid="hsv"]').should('have.text', '0.00|0.25|0.25');
  });
  it('updates hue and alpha independently with current state', () => {
    press('.sd-color-picker-control-bar-hue', 0.75);
    cy.get('[data-testid="hsv"]').should('have.text', '0.75|0.50|0.50');
    press('.sd-color-picker-control-bar-alpha', 0.25);
    cy.get('[data-testid="alpha"]').should('have.text', '0.25');
    cy.get('[data-testid="hsv"]').should('have.text', '0.75|0.50|0.50');
  });
  it('retains a first press made before StrictMode replays layout cleanup', () => {
    const frames = new Map<number, FrameRequestCallback>();
    let id = 0;
    cy.visit('/color-picker-controls.html?early', {
      onBeforeLoad(win) {
        win.requestAnimationFrame = (callback) => {
          frames.set(++id, callback);
          return id;
        };
        win.cancelAnimationFrame = (key) => {
          frames.delete(key);
        };
      },
    });
    cy.get('[data-control-layout-pass]')
      .should(($host) => {
        expect(Number($host.attr('data-control-layout-pass'))).to.equal(
          $host.attr('data-control-strict') === 'true' ? 2 : 1,
        );
      })
      .then(() => {
        for (const [key, callback] of frames) {
          frames.delete(key);
          callback(0);
        }
      });
    cy.get('[data-testid="hsv"]').should('have.text', '0.75|0.50|0.50');
    cy.get('[data-testid="changes"]').should('have.text', '1');
  });
  it('cancels queued frames and listeners when controls unmount during a drag', () => {
    cy.get('.sd-color-picker-palette').then(($block) => {
      const block = $block[0];
      const win = block.ownerDocument.defaultView!;
      block.dispatchEvent(
        new win.MouseEvent('mousedown', { bubbles: true, buttons: 1, clientX: 10, clientY: 10 }),
      );
      block.ownerDocument.querySelector('button')!.click();
    });
    cy.get('.sd-color-picker-palette').should('not.exist');
    cy.get('[data-testid="changes"]')
      .invoke('text')
      .then((count) => {
        cy.window().then((win) => {
          win.dispatchEvent(
            new win.MouseEvent('mousemove', { buttons: 1, clientX: 200, clientY: 150 }),
          );
          return new Cypress.Promise((resolve) =>
            win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)),
          );
        });
        cy.get('[data-testid="changes"]').should('have.text', count);
      });
  });
});

describe('React ColorPicker panel state adapter', () => {
  beforeEach(() => cy.visit('/color-picker-controls.html?panel'));
  it('rolls back rejected changes and retains accepted changes after render', () => {
    cy.contains('button', 'Hue').click();
    cy.get('[data-testid="events"]').should('have.text', 'palette-hue-bar');
    cy.get('[data-testid="value"]').should('have.text', '#ff0000');
    cy.get('[data-testid="hue"]').should('have.text', '0.00');
    cy.contains('button', 'Accept changes').click();
    cy.contains('button', 'Hue').click();
    cy.get('[data-testid="hue"]').should('have.text', '0.50');
    cy.get('[data-testid="value"]')
      .invoke('text')
      .should('match', /^#00ffff$/i);
  });
  it('guards disabled changes and resynchronizes format when alpha changes', () => {
    cy.contains('button', 'Disabled').click();
    cy.contains('button', 'Hue').click();
    cy.contains('button', 'Gradient').click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.get('[data-testid="mode"]').should('have.text', 'monochrome');
    cy.contains('button', 'HSL').click();
    cy.get('[data-testid="format"]').should('have.text', 'HSL');
    cy.contains('button', 'Alpha').click();
    cy.get('[data-testid="format"]').should('have.text', 'HEX8');
  });
  it('preserves a selected gradient point across external value replacements', () => {
    cy.contains('button', 'External gradient').click();
    cy.contains('button', 'Accept changes').click();
    cy.contains('button', 'Second point').click();
    cy.get('[data-testid="selected-point"]')
      .invoke('text')
      .then((id) => {
        cy.contains('button', 'Move external points').click();
        cy.get('[data-testid="selected-point"]').should('have.text', id);
        cy.get('[data-testid="hue"]').should('have.text', '0.67');
      });
  });
});

describe('React ColorPicker gradient pointer adapter', () => {
  beforeEach(() => cy.visit('/color-picker-controls.html?gradient'));
  const pointer = (win: Window & typeof globalThis, type: string, x: number, id = 1) =>
    new win.PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: id,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: 50,
    });
  it('preserves an early drag across StrictMode replay, stop reordering and both boundaries', () => {
    cy.visit('/color-picker-controls.html?gradient&early');
    cy.get('.sd-color-picker-gradient-bar-shell').should(
      'have.attr',
      'data-gradient-layout-pass',
      '2',
    );
    cy.get('.sd-color-picker-gradient-thumb')
      .first()
      .then(($thumb) => {
        const thumb = $thumb[0];
        const win = thumb.ownerDocument.defaultView!;
        const rect = thumb
          .parentElement!.querySelector('.sd-color-picker-gradient-bar')!
          .getBoundingClientRect();
        win.dispatchEvent(pointer(win, 'pointermove', rect.left + rect.width * 0.8));
        cy.get('.sd-color-picker-gradient-thumb')
          .eq(1)
          .should(($node) => {
            expect($node[0]).to.equal(thumb);
            expect(parseFloat(thumb.style.left)).to.be.closeTo(80, 1);
          });
        cy.get('.sd-color-picker-gradient-thumb-active').should(($node) =>
          expect($node[0]).to.equal(thumb),
        );
        const expectActiveThumbAt = (left: string) =>
          cy.get('.sd-color-picker-gradient-thumb-active').should(($node) => {
            expect($node[0]).to.equal(thumb);
            expect(thumb.style.left).to.equal(left);
          });
        cy.then(() => win.dispatchEvent(pointer(win, 'pointermove', rect.right + 40)));
        expectActiveThumbAt('100%');
        cy.then(() => win.dispatchEvent(pointer(win, 'pointermove', rect.left - 40)));
        expectActiveThumbAt('0%');
        cy.then(() => win.dispatchEvent(pointer(win, 'pointerup', rect.left)));
      });
  });
  it('removes a stop by keyboard while retaining at least two stops', () => {
    const middleThumb = () => cy.get('.sd-color-picker-gradient-thumb').eq(1);
    cy.contains('button', 'Disabled').click();
    middleThumb().should('be.disabled').trigger('keydown', { key: 'Delete', force: true });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
    cy.contains('button', 'Disabled').click();
    middleThumb()
      .should('have.css', 'cursor', 'grab')
      .focus()
      .trigger('keydown', { key: 'Delete' });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.get('.sd-color-picker-gradient-thumb')
      .first()
      .focus()
      .trigger('keydown', { key: 'Backspace' });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.contains('button', 'Disabled').click();
    cy.get('.sd-color-picker-gradient-thumb').should('be.disabled');
  });
  it('ignores other pointers and stops moving after pointer cancellation', () => {
    cy.get('.sd-color-picker-gradient-thumb')
      .first()
      .then(($thumb) => {
        const thumb = $thumb[0];
        const win = thumb.ownerDocument.defaultView!;
        thumb.dispatchEvent(pointer(win, 'pointerdown', 30));
        win.dispatchEvent(pointer(win, 'pointermove', 200, 2));
        cy.wrap(thumb).should('have.attr', 'style').and('contain', 'left: 0%');
        cy.then(() => {
          win.dispatchEvent(pointer(win, 'pointercancel', 30));
          win.dispatchEvent(pointer(win, 'pointermove', 200));
        });
        cy.wrap(thumb).should('have.attr', 'style').and('contain', 'left: 0%');
      });
  });
  it('removes active pointer listeners when the thumbs unmount', () => {
    cy.get('.sd-color-picker-gradient-thumb')
      .first()
      .then(($thumb) => {
        const thumb = $thumb[0];
        const win = thumb.ownerDocument.defaultView!;
        const add = cy.spy(win, 'addEventListener');
        const remove = cy.spy(win, 'removeEventListener');
        thumb.dispatchEvent(pointer(win, 'pointerdown', 30));
        cy.contains('button', 'Mount thumbs').then(($button) => $button[0].click());
        cy.get('.sd-color-picker-gradient-thumb')
          .should('not.exist')
          .then(() => {
            for (const type of ['pointermove', 'pointerup', 'pointercancel']) {
              const registration = add.getCalls().find((call) => call.args[0] === type);
              expect(registration, `${type} registered`).not.to.equal(undefined);
              expect(
                remove
                  .getCalls()
                  .some((call) => call.args[0] === type && call.args[1] === registration!.args[1]),
                `${type} removed`,
              ).to.equal(true);
            }
          });
      });
  });
});

describe('React ColorPicker complete panel view', () => {
  beforeEach(() => cy.visit('/color-picker-controls.html?view'));
  it('commits format inputs and adds the current color to recent colors', () => {
    cy.get('.sd-color-picker-format-input input').first().clear().type('00ff00').blur();
    cy.get('[data-testid="value"]')
      .invoke('text')
      .should('match', /^#00ff00$/i);
    cy.get('.sd-color-picker-colors-action').click();
    cy.get('[data-testid="recent"]')
      .invoke('text')
      .should('match', /^#00ff00$/i);
    cy.get('.sd-color-picker-colors-section').last().find('.sd-color-picker-color-block').click();
    cy.get('[data-testid="value"]')
      .invoke('text')
      .should('match', /^#0000ff$/i);
  });
  it('switches to gradient mode and adds a stop with keyboard input', () => {
    cy.get('.sd-color-picker-panel-head input[value="linear-gradient"]').closest('label').click();
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.get('.sd-color-picker-gradient-bar').focus().trigger('keydown', { key: 'Enter' });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
    cy.get('[data-testid="value"]').should('contain.text', 'linear-gradient(');
  });
  it('updates alpha controls and blocks disabled edits', () => {
    cy.get('.sd-color-picker-control-bar-alpha').should('not.exist');
    cy.contains('button', 'Alpha').click();
    cy.get('.sd-color-picker-control-bar-alpha').should('exist');
    cy.get('.sd-color-picker-format-input input').should('have.length', 2);
    cy.contains('button', 'Disabled').click();
    cy.get('.sd-color-picker-format-input input').should('be.disabled');
    cy.get('.sd-color-picker-color-block').should('be.disabled');
    cy.get('.sd-color-picker-colors-action').should('be.disabled');
    cy.get('.sd-color-picker-color-block').trigger('click', { force: true });
    cy.get('.sd-color-picker-colors-action').trigger('click', { force: true });
    cy.get('[data-testid="value"]').should('have.text', '#ff0000');
    cy.get('[data-testid="recent"]').should('be.empty');
  });
});

describe('React ColorPicker root', () => {
  const colorBlocks = '.sd-color-picker-color-block';

  it('renders no system swatches when neither props nor provider supply them', () => {
    cy.visit('/color-picker-controls.html?root&hidden&no-provider-swatches');
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get(colorBlocks).should('not.exist');
  });

  it('updates system swatches when an explicit list overrides, hides and restores provider colors', () => {
    cy.visit('/color-picker-controls.html?root&hidden&swatches');
    cy.get(colorBlocks)
      .should('have.length', 1)
      .and('have.attr', 'aria-label')
      .and('include', '#0000ff');
    cy.contains('button', 'Override swatches').click();
    cy.get(colorBlocks).should('have.length', 1).click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:#ABCDEF:preset');
    cy.contains('button', 'Hide swatches').click();
    cy.get(colorBlocks).should('not.exist');
    cy.contains('button', 'Inherit swatches').click();
    cy.get(colorBlocks).should('have.length', 1).click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:#0000FF:preset');
  });

  it('keeps a controlled recent list until the parent accepts an addition', () => {
    cy.visit('/color-picker-controls.html?root&hidden&no-provider-swatches&recent');
    cy.get(colorBlocks).should('have.length', 2).first().click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:#165DFF:recent');
    cy.get(colorBlocks).last().click();
    const addColor = '.sd-color-picker-colors-action';
    cy.get(addColor).click();
    cy.get('[data-testid="events"]').should('contain.text', 'recent:#00B42A,#165DFF');
    cy.get(colorBlocks).first().should('have.attr', 'aria-label').and('include', '#165DFF');
    cy.contains('button', 'Accept').click();
    cy.get(addColor).click();
    cy.get(colorBlocks).first().should('have.attr', 'aria-label').and('include', '#00B42A');
  });

  it('renders a seeded recent color and stores additions when uncontrolled', () => {
    cy.visit('/color-picker-controls.html?root&hidden&no-provider-swatches&seeded');
    cy.get(colorBlocks)
      .should('have.length', 1)
      .and('have.attr', 'aria-label')
      .and('include', '#165DFF');
    cy.get('.sd-color-picker-colors-action').click();
    cy.get(colorBlocks)
      .should('have.length', 2)
      .first()
      .should('have.attr', 'aria-label')
      .and('include', '#FF0000');
  });

  it('edits an uncontrolled draft, commits its format and opens the popup', () => {
    cy.visit('/color-picker-controls.html?root');
    cy.get('.sd-color-picker-trigger-input input').clear().type('#00ff00').blur();
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#00FF00');
    cy.get('[data-testid="events"]').should('contain.text', 'change:#00FF00:input');
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-color-picker-color-block').should('have.length', 1).click();
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#0000FF');
    cy.get('.sd-color-picker-trigger-input input')
      .click()
      .should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-color-picker-panel').should('not.exist');
    cy.get('.sd-color-picker-trigger-input input')
      .click()
      .should('have.attr', 'aria-expanded', 'true');
  });
  it('clears with value, clear and change notifications in order', () => {
    cy.visit('/color-picker-controls.html?root');
    cy.get('.sd-color-picker-trigger-input input').focus();
    cy.get('.sd-color-picker-trigger-input .sd-input-clear-btn').click();
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '');
    cy.get('[data-testid="events"]').should('contain.text', 'value:|clear|change::clear');
  });
  it('rejects controlled changes until the parent accepts and reflects external values', () => {
    cy.visit('/color-picker-controls.html?root&controlled');
    cy.get('.sd-color-picker-trigger-input input').clear().type('#00ff00').blur();
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#FF0000');
    cy.contains('button', 'Accept').click();
    cy.get('.sd-color-picker-trigger-input input').clear().type('#00ff00').blur();
    cy.get('[data-testid="value"]').should('have.text', '#00FF00');
    cy.contains('button', 'External green').click();
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#00FF00');
  });
  it('reports an initially open popup to the input', () => {
    cy.visit('/color-picker-controls.html?root&open');
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'aria-expanded', 'true');
  });
  it('keeps controlled popup requests collapsed until accepted and updates custom context', () => {
    cy.visit('/color-picker-controls.html?root&popup');
    cy.get('.sd-color-picker-trigger-input input').click();
    cy.get('[data-testid="events"]').should('contain.text', 'popup:true:');
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'aria-expanded', 'false');
    cy.contains('button', 'Custom trigger').click();
    cy.get('[data-testid="custom-trigger"]').should('contain.text', '|false');
    cy.contains('button', 'External popup').click();
    cy.get('[data-testid="custom-trigger"]').should('contain.text', '|true');
    cy.get('.sd-color-picker-panel').should('be.visible');
  });
  it('shows the readonly message without opening the picker', () => {
    cy.visit('/color-picker-controls.html?root');
    cy.contains('button', 'Readonly').click();
    cy.get('.sd-color-picker-trigger-input input').click().should('have.attr', 'readonly');
    cy.get('.sd-tooltip-content').should('contain.text', 'Locked color');
    cy.get('.sd-color-picker-panel').should('not.exist');
  });
  it('disables the inline panel while readonly and preserves root attributes', () => {
    cy.visit('/color-picker-controls.html?root&hidden');
    cy.get('#picker').should('have.class', 'sd-color-picker-panel');
    cy.get('.sd-color-picker-trigger-input').should('not.exist');
    cy.contains('button', 'Readonly').click();
    cy.get('.sd-color-picker-format-input input').should('be.disabled');
    cy.get('.sd-color-picker-color-block').should('be.disabled');
  });
});

describe('React ColorPicker formats and controlled boundaries', () => {
  const cases: Array<[string, string[]]> = [
    ['HEX', ['0000FF']],
    ['HEX8', ['0000FFFF', '100%']],
    ['RGB', ['0', '0', '255']],
    ['RGBA', ['0', '0', '255', '100%']],
    ['HSL', ['240', '100%', '50%']],
    ['HSLA', ['240', '100%', '50%', '100%']],
    ['HSV', ['240', '100%', '100%']],
    ['HSVA', ['240', '100%', '100%', '100%']],
    ['CMYK', ['100%', '100%', '0%', '0%']],
    ['CSS', ['rgb(0, 0, 255)']],
  ];
  const formatInputs = () => cy.get('.sd-color-picker-format-input input', { timeout: 15000 });
  for (const [format, values] of cases) {
    it(`updates ${format} fields after external changes without emitting change`, () => {
      cy.visit(`/color-picker-controls.html?formats&format=${format}`);
      cy.contains('button', 'External blue').click();
      cy.get<HTMLInputElement>('.sd-color-picker-format-input input').should(($inputs) => {
        expect(Array.from($inputs, (input) => input.value)).to.deep.equal(values);
      });
      cy.get('[data-testid="changes"]').should('have.text', '0');
    });
  }
  for (const value of ['hsl(240, 100%, 50%)', 'hsv(240, 100%, 100%)', 'cmyk(100%, 100%, 0%, 0%)']) {
    it(`commits ${value} through the trigger`, () => {
      cy.visit('/color-picker-controls.html?formats&trigger');
      cy.get('.sd-color-picker-trigger-input input').clear().type(`${value}{enter}`);
      cy.get('[data-testid="value"]').should('have.text', '#0000FF');
      cy.get('.sd-color-picker-trigger-input input').should('have.value', '#0000FF');
    });
  }
  it('submits a format field with Enter exactly once', () => {
    cy.visit('/color-picker-controls.html?formats&format=RGB');
    formatInputs().first().should('have.value', '255');
    formatInputs().first().clear().type('128{enter}');
    cy.get('[data-testid="value"]').should('have.text', 'rgb(128, 0, 0)');
    cy.get('[data-testid="changes"]').should('have.text', '1');
  });
  it('applies a separate HEX8 alpha field', () => {
    cy.visit('/color-picker-controls.html?formats&format=HEX8&alpha');
    formatInputs().eq(1).should('have.value', '100%');
    formatInputs().eq(1).clear().type('50%{enter}');
    cy.get('[data-testid="value"]').should('have.text', '#FF000080');
    cy.get('.sd-color-picker-format-input input').first().should('have.value', 'FF000080');
  });
  it('uses embedded alpha when editing HEX8', () => {
    cy.visit('/color-picker-controls.html?formats&format=HEX8&alpha');
    formatInputs().first().should('have.value', 'FF0000FF');
    formatInputs().first().clear().type('0000FF80{enter}');
    cy.get('[data-testid="value"]').should('have.text', '#0000FF80');
    cy.get('.sd-color-picker-format-input input').eq(1).should('have.value', '50%');
  });
  it('waits for parent acceptance before retaining an added gradient stop', () => {
    cy.visit('/color-picker-controls.html?formats&gradient&reject');
    cy.get('.sd-color-picker-gradient-bar').click('center');
    cy.get('[data-testid="requested"]').should('contain.text', '50%');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.contains('button', 'Accept requested').click();
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
  });
  it('commits a typed angle while preserving both stop colors and positions', () => {
    cy.visit('/color-picker-controls.html?formats&gradient');
    cy.get('.sd-color-picker-gradient-degree input').clear().type('180{enter}');
    cy.get('[data-testid="value"]').should(
      'have.text',
      'linear-gradient(180deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)',
    );
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
  });
  it('retains two stops when pointer and keyboard insertion are disabled', () => {
    cy.visit('/color-picker-controls.html?formats&gradient&two-stops');
    cy.get('.sd-color-picker-gradient-bar').click('center').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.get('[data-testid="changes"]').should('have.text', '0');
  });
  it('restores panel channels after a rejected swatch and accepts the later parent value', () => {
    cy.visit('/color-picker-controls.html?formats&format=RGB&reject');
    cy.get('.sd-color-picker-color-block').click();
    cy.get('[data-testid="requested"]').should('have.text', 'rgb(0, 0, 255)');
    cy.get('.sd-color-picker-format-input input').first().should('have.value', '255');
    cy.contains('button', 'Accept requested').click();
    cy.get('.sd-color-picker-format-input input').first().should('have.value', '0');
    cy.get('.sd-color-picker-format-input input').last().should('have.value', '255');
  });
});

export {};
