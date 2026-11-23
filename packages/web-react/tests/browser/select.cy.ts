import { moveMouseAway } from '../../../web-core/tests/browser/hover-intent';

describe('React Select', () => {
  beforeEach(() => cy.visit('/select.html'));

  it('rebinds the real popup anchor when Select switches between single and multiple views', () => {
    cy.get('[data-testid="select-switch-mode"]').click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
    cy.contains('button', 'Select switch mode').click();
    cy.get('[data-testid="select-switch-mode"]')
      .should('have.class', 'sd-select-view-multiple')
      .click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-switch-mode"] .sd-select-view-tag').should('have.length', 2);
    cy.contains('button', 'Select switch mode').click();
    cy.get('[data-testid="select-switch-mode"]')
      .should('have.class', 'sd-select-view-single')
      .click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
  });

  it('anchors Select popups to the actual view when CSS classes supply its width', () => {
    cy.get('[data-testid="select-class-width"]').should('have.css', 'width', '180px').click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
  });

  it('removes background, border and shadow in both single and multiple mode', () => {
    const select = '[data-testid="select-switch-mode"]';
    const assertBorderless = (mode: 'single' | 'multiple') =>
      cy
        .get(select)
        .should('have.class', `sd-select-view-${mode}`)
        .and('have.class', 'sd-select-view-borderless')
        .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
        .and('have.css', 'border-top-width', '0px')
        .and('have.css', 'box-shadow', 'none');

    cy.get(select).should('not.have.class', 'sd-select-view-borderless');
    cy.contains('button', 'Toggle select border').click();
    assertBorderless('single');
    cy.contains('button', 'Select switch mode').click();
    assertBorderless('multiple');
    cy.contains('button', 'Toggle select border').click();
    cy.get(select).should('not.have.class', 'sd-select-view-borderless');
  });

  it('exposes collapsed and expanded comboboxes and selected and disabled listbox options', () => {
    const single = '[data-testid="select-single"]';
    const multiple = '[data-testid="select-multiple"]';
    const listbox = '.sd-select-dropdown:visible [role="listbox"]';
    for (const select of [single, multiple]) {
      cy.get(`${select} input[role="combobox"]`).should('have.attr', 'aria-expanded', 'false');
      cy.get(`${select} input[role="combobox"]`).should('have.attr', 'aria-autocomplete', 'list');
      cy.get(select).click();
      cy.get(`${select} input[role="combobox"]`).should('have.attr', 'aria-expanded', 'true');
      cy.get(listbox).should('have.length', 1);
      cy.contains(`${listbox} [role="option"]`, 'Zero').should(
        'have.attr',
        'aria-selected',
        'false',
      );
      cy.contains(`${listbox} [role="option"]`, 'Locked').should(
        'have.attr',
        'aria-disabled',
        'true',
      );
      cy.contains(
        `${listbox} [role="option"]`,
        select === single ? 'Empty choice' : 'Locked',
      ).should('have.attr', 'aria-selected', 'true');
      cy.press(Cypress.Keyboard.Keys.ESC);
      cy.get(`${select} input[role="combobox"]`).should('have.attr', 'aria-expanded', 'false');
      cy.get(listbox).should('not.exist');
    }
  });

  it('ignores composing Enter and restores a refused controlled search draft', () => {
    cy.get('[data-testid="select-create"] input').type('Composed');
    cy.get('[data-testid="select-create"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: true,
    });
    cy.get('[data-testid="select-create"] .sd-select-view-tag').should('not.exist');
    cy.get('[data-testid="select-create"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: false,
    });
    cy.get('[data-testid="select-create"] .sd-select-view-tag').should('contain.text', 'Composed');
    cy.get('[data-testid="select-create"] input').type('{esc}');
    cy.get('[data-testid="select-rejected"]').click();
    cy.get('[data-testid="select-rejected"] input').type('query').should('have.value', '');
    cy.get('[data-testid="select-rejected"] input').type('{esc}');
    cy.get('[data-testid="select-rejected"] .sd-select-view-value').should('contain.text', 'Zero');
  });

  it('supports controlled show aliases and custom trigger state without duplicate callbacks', () => {
    cy.get('[data-testid="select-custom"]').should('have.text', 'Chosen Alpha / false').click();
    cy.get('[data-testid="select-custom"]').should('have.text', 'Chosen Alpha / true');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-custom"]').should('have.text', 'Chosen Beta / false');
    cy.get('[data-testid="select-events"]').should(
      'have.text',
      'custom-popup:true|custom-popup:false',
    );
  });

  it('honors local search opt-out and initial inactive navigation with boolean values', () => {
    cy.get('[data-testid="select-no-search"]').click();
    cy.get('[data-testid="select-no-search"] input')
      .should('have.prop', 'readOnly', true)
      .should('have.attr', 'aria-autocomplete', 'none')
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="select-events"]').should('not.contain.text', 'no-search:');
    cy.get('[data-testid="select-no-search"] input')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="select-events"]').should('contain.text', 'no-search:false');
    cy.get('[data-testid="select-no-search"] .sd-select-view-value').should(
      'contain.text',
      'False',
    );
  });

  it('composes scrollbar attributes and publishes reach-bottom before dropdown scroll', () => {
    cy.get('[data-testid="select-scroll"]').click();
    cy.get('.sd-select-dropdown:visible .custom-select-scroll').should(
      'have.css',
      'max-height',
      '90px',
    );
    cy.get('.sd-select-dropdown:visible [data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.get('[data-testid="select-events"]').should(
      'contain.text',
      'custom-scroll|reached|scrolled',
    );
  });

  it('keeps the keyboard-active option visible and referenced by the combobox', () => {
    const input = () => cy.get('[data-testid="select-scroll"] input[role="combobox"]');
    const active = () => cy.get('.sd-select-dropdown:visible .sd-select-option-active');
    moveMouseAway();
    input().focus();
    cy.press(Cypress.Keyboard.Keys.ENTER);
    input().should('have.attr', 'aria-expanded', 'true');
    active().should('have.length', 1).and('contain.text', 'Choice 0');
    input().type('{uparrow}');
    active().should('have.length', 1).and('contain.text', 'Choice 39').and('be.visible');
    active()
      .invoke('attr', 'id')
      .then((id) => {
        expect(id).to.be.a('string');
        input().should('have.attr', 'aria-activedescendant', id);
      });
    cy.get('.sd-select-dropdown:visible [data-overlayscrollbars-viewport]').should(($viewport) => {
      expect($viewport.scrollTop()).to.be.greaterThan(0);
    });
    cy.press(Cypress.Keyboard.Keys.ENTER);
    input().should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="select-scroll"] .sd-select-view-value').should(
      'contain.text',
      'Choice 39',
    );
  });

  it('updates the label of a replacement fallback object with the same value key', () => {
    const label = () => cy.get('[data-testid="select-parent-fallback"] .sd-select-view-value');
    label().should('contain.text', 'Original fallback');
    cy.contains('button', 'Replace Select fallback object').click();
    label().should('contain.text', 'Updated fallback').and('not.contain.text', 'Original fallback');
  });

  it('updates header and footer regions in place and removes the dropdown after closing', () => {
    cy.visit('/select.html?regions');
    const popup = () => cy.get('.sd-select-dropdown:visible');
    popup().should('not.have.class', 'sd-select-dropdown-has-header');
    popup().should('not.have.class', 'sd-select-dropdown-has-footer');
    popup().then(([$popup]) => {
      cy.contains('button', /^Toggle Select regions$/).click();
      popup().should(([$next]) => expect($next).to.equal($popup));
    });
    popup().should('have.class', 'sd-select-dropdown-has-header');
    popup().should('have.class', 'sd-select-dropdown-has-footer');
    popup().find('.sd-select-dropdown-header').should('have.text', 'Live header');
    popup().find('.sd-select-dropdown-footer').should('have.text', 'Live footer');
    popup().find('[role="option"]').should('contain.text', 'Retained choice');
    cy.contains('button', 'Toggle Select regions popup').click();
    cy.contains('.sd-select-dropdown', 'Live header').should('not.exist');
  });

  it('fits the selection trigger to its label and resizes the popup after changing the selected label', () => {
    cy.get('[data-testid="select-fit"]')
      .should(($el) => expect($el[0].getBoundingClientRect().width).to.be.lessThan(300))
      .invoke('width')
      .then((width) => {
        cy.get('[data-testid="select-fit"]').click();
        cy.contains(
          '.sd-select-dropdown:visible [role="option"]',
          'A much longer option label',
        ).click();
        cy.get('[data-testid="select-fit"]').should(($el) =>
          expect($el[0].getBoundingClientRect().width).to.be.greaterThan(width!),
        );
        cy.get('[data-testid="select-fit"]').then(($el) => {
          const expectedWidth = $el[0].getBoundingClientRect().width;
          cy.get('[data-testid="select-fit"]').click();
          cy.get('.sd-select-dropdown:visible').should(($popup) =>
            expect($popup[0].getBoundingClientRect().width).to.be.closeTo(expectedWidth, 1),
          );
        });
      });
  });

  it('opens on Enter without changing the value and commits the active option on a second Enter', () => {
    const input = '[data-testid="select-single"] input';
    cy.contains('button', 'Select focus').click();
    cy.get(input).should('be.focused').and('have.attr', 'aria-expanded', 'false');
    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.get(input).should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-testid="select-events"]').should('have.text', 'popup:true');
    cy.press(Cypress.Keyboard.Keys.DOWN);
    cy.contains('.sd-select-dropdown:visible [role="option"].sd-select-option-active', 'Zero')
      .invoke('attr', 'id')
      .then((id) => cy.get(input).should('have.attr', 'aria-activedescendant', id));
    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.get('[data-testid="select-value"]').should('have.text', '0');
    cy.get(input).should('have.attr', 'aria-expanded', 'false');
  });

  it('closes on Escape exactly once without changing the selected value', () => {
    const input = '[data-testid="select-single"] input';
    cy.get('[data-testid="select-single"]').click();
    cy.get(input).should('have.attr', 'aria-expanded', 'true');
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.get(input).should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-select-dropdown:visible').should('not.exist');
    cy.get('[data-testid="select-events"]').should('have.text', 'popup:true|popup:false');
    cy.get('[data-testid="select-value"]').should('have.text', '""');
  });

  it('selects typed zero values by keyboard, publishes ordered events and clears to undefined', () => {
    cy.contains('button', 'Select focus').click();
    cy.get('[data-testid="select-single"] input')
      .should('be.focused')
      .click()
      .should('have.attr', 'aria-expanded', 'true')
      .type('{downarrow}{enter}');
    cy.get('[data-testid="select-value"]').should('have.text', '0');
    cy.get('[data-testid="select-events"]').should('contain.text', 'value:0|change:0');
    cy.get('[data-testid="select-single"] input').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="select-single"]').trigger('mouseover');
    cy.get('[data-testid="select-single"] input').focus();
    cy.get('[data-testid="select-single"] .sd-select-view-clear-btn').click();
    cy.get('[data-testid="select-value"]').should('have.text', '');
    cy.get('[data-testid="select-events"]')
      .should('contain.text', 'value:undefined|change:undefined')
      .should('contain.text', 'clear');
    cy.get('[data-testid="select-single"] input').should('have.attr', 'aria-expanded', 'false');
  });

  it('keeps locked multi selections, enforces limits and emits tag removal', () => {
    cy.get('[data-testid="select-multiple"] input').click();
    cy.get(
      '.sd-select-dropdown:visible .sd-select-group > ul[role="presentation"] > li[role="option"]',
    ).should('have.length', 2);
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Zero').click();
    cy.get('[data-testid="select-multiple-value"]').should('have.text', '["locked",0]');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Alpha').click();
    cy.get('[data-testid="select-events"]').should('contain.text', 'limit:a');
    cy.get('[data-testid="select-multiple"] .sd-select-view-tag .sd-tag-close-btn').click();
    cy.get('[data-testid="select-multiple-value"]').should('have.text', '["locked"]');
    cy.get('[data-testid="select-events"]').should('contain.text', 'remove:0');
    cy.get('[data-testid="select-multiple"] input').focus();
    cy.get('[data-testid="select-multiple"] .sd-select-view-clear-btn').click();
    cy.get('[data-testid="select-multiple-value"]').should('have.text', '["locked"]');
  });

  it('rejects controlled writes and creates searched values with cancellable debouncing', () => {
    cy.get('[data-testid="select-rejected"]').click();
    cy.get('[data-testid="select-rejected"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-rejected"] .sd-select-view-value').should('contain.text', 'Zero');
    cy.get('[data-testid="select-events"]').should('contain.text', 'rejected:"b"');
    cy.get('[data-testid="select-create"] input').type('New entry');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'New entry').click();
    cy.get('[data-testid="select-events"]').should('contain.text', 'created:["New entry"]');
    cy.get('[data-testid="select-create"] .sd-select-view-tag').should('contain.text', 'New entry');
    cy.get('[data-testid="select-create"] input').should('have.value', '');
    cy.get('[data-testid="select-events"]').should('contain.text', 'search:New entry');
    cy.clock();
    cy.get('[data-testid="select-create"] input').type('cancelled');
    cy.contains('button', 'Select mount create').click();
    cy.tick(200);
    cy.get('[data-testid="select-events"]').should('not.contain.text', 'search:cancelled');
  });

  it('retains search labels, resolves readonly tips and updates object field mappings', () => {
    cy.get('[data-testid="select-retain"]').click();
    cy.get('[data-testid="select-retain"] input').type('Bet');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-retain"] input').should('have.value', 'Beta');
    cy.get('[data-testid="select-readonly"]').click();
    cy.get('[data-testid="select-readonly"] input');
    cy.contains('.sd-tooltip-content', 'Selection locked').should('be.visible');
    cy.get('[data-testid="select-readonly"] input').should('have.attr', 'aria-expanded', 'false');
    cy.contains('button', 'Select readonly').click();
    cy.get('[data-testid="select-readonly"]').click();
    cy.get('[data-testid="select-readonly"] input')
      .should('have.attr', 'aria-expanded', 'true')
      .type('{esc}');
    cy.get('[data-testid="select-objects"] .sd-select-view-value').should(
      'contain.text',
      'Selected Object two',
    );
    cy.contains('button', 'Select fields').click();
    cy.get('[data-testid="select-objects"] .sd-select-view-value').should(
      'contain.text',
      'Selected Updated two',
    );
    cy.get('[data-testid="select-objects"]').click();
    cy.get('[data-testid="select-objects"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Updated three').click();
    cy.get('[data-testid="select-object-value"]').should('have.text', '{"id":3}');
  });

  it('opens virtual selections at the active row and inherits loading and empty renderers', () => {
    cy.get('[data-testid="select-virtual"]').click();
    cy.get('[data-testid="select-virtual"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Choice 400')
      .should('be.visible')
      .should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-select-dropdown:visible [role="option"]').should('have.length.lessThan', 500);
    cy.get('[data-testid="select-virtual"] input').type('{downarrow}{enter}');
    cy.get('[data-testid="select-virtual"] .sd-select-view-value').should(
      'contain.text',
      'Choice 401',
    );
    cy.contains('button', 'Select loading').click();
    cy.get('[data-testid="select-virtual"]').click();
    cy.get('[data-testid="select-virtual"] input');
    cy.contains('.sd-select-dropdown:visible', 'Provider loading').should('be.visible');
    cy.get('[data-testid="select-virtual"] input').type('{esc}');
    cy.get('[data-testid="select-provider-empty"]').click();
    cy.get('[data-testid="select-provider-empty"] input');
    cy.contains('.sd-select-dropdown:visible', 'Empty for select').should('be.visible');
    cy.contains('.sd-select-dropdown:visible', 'Empty header').should('be.visible');
    cy.contains('.sd-select-dropdown:visible', 'Empty footer').should('be.visible');
    cy.get('.sd-select-dropdown:visible .sd-virtual-list').should('not.exist');
  });

  it('validates Select FormItem after value changes and clears the error on selection', () => {
    cy.get('[data-testid="select-form"] input').focus().blur();
    cy.contains('[data-testid="select-fixture"] [role="alert"]', 'Choose one').should('be.visible');
    cy.get('[data-testid="select-form"]').click();
    cy.get('[data-testid="select-form"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Form A').click();
    cy.get('[data-testid="select-form"]').should('not.have.class', 'sd-select-view-error');
  });

  it('blocks click and keyboard selection in a controlled popup until Form and readonly allow it', () => {
    const input = () => cy.get('[data-testid="select-form-guard"] input');
    const option = () => cy.contains('.sd-select-dropdown:visible [role="option"]', 'Guard B');
    cy.contains('button', 'Select readonly').click();
    cy.contains('button', 'Toggle guarded popup').click();
    option().should('be.visible');
    cy.contains('button', 'Toggle Select Form disabled').click();
    input().should('be.disabled');
    option().click();
    cy.get('[data-testid="select-events"]').should('not.contain.text', 'guard:');
    cy.contains('button', 'Toggle Select Form disabled').click();
    input().should('not.be.disabled');
    cy.contains('button', 'Select readonly').click();
    option().trigger('mouseenter').click();
    input().trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'Enter', force: true });
    cy.get('[data-testid="select-events"]').should('not.contain.text', 'guard:');
    cy.contains('button', 'Select readonly').click();
    option().click();
    cy.get('[data-testid="select-events"]').should('have.text', 'guard:"Guard B"');
  });

  it('loads asynchronous search results without filtering server matches by label', () => {
    let finishSearch: () => void;
    cy.intercept('/select-search*', { body: [] });
    cy.intercept(
      { pathname: '/select-search', query: { q: 'remote' } },
      (request) =>
        new Cypress.Promise<void>((resolve) => {
          finishSearch = () => {
            request.reply({ body: [{ value: 51, label: 'Server result' }] });
            resolve();
          };
        }),
    ).as('search');
    const input = () => cy.get('[data-testid="select-remote"] input');
    input().type('remote');
    cy.contains('.sd-select-dropdown:visible', 'Loading matches').should('be.visible');
    cy.wrap(null).should(() => expect(finishSearch).to.be.a('function'));
    cy.then(() => finishSearch());
    cy.wait('@search');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Server result').should(
      'be.visible',
    );
    input().type('{enter}');
    cy.get('[data-testid="select-remote"] .sd-select-view-value').should(
      'contain.text',
      'Server result',
    );
    cy.get('[data-testid="select-events"]').should('contain.text', 'remote:51');
    input().should('have.attr', 'aria-expanded', 'false');
  });

  it('filters grouped options by raw values and retains the custom empty regions', () => {
    const input = () => cy.get('[data-testid="select-group-filter"] input[role="combobox"]');
    const popup = () => cy.get('[role="listbox"]:visible');
    input().click().type('b');
    popup()
      .find('[role="group"]')
      .should('have.length', 1)
      .and('have.attr', 'aria-label', 'English');
    popup().find('[role="option"] strong').should('have.text', 'Choice Bravo');
    input().type('{downArrow}');
    popup()
      .find('[role="option"]')
      .invoke('attr', 'id')
      .then((id) => {
        expect(id).to.match(/\S/);
        input().should('have.attr', 'aria-activedescendant', id);
      });
    input().clear().type('missing');
    cy.get('[role="listbox"]:visible [role="option"]').should('not.exist');
    cy.contains('.sd-select-dropdown:visible', 'Choice list header').should('be.visible');
    cy.contains('.sd-select-dropdown:visible', 'No matching value').should('be.visible');
    cy.contains('.sd-select-dropdown:visible', 'Choice list footer').should('be.visible');
  });

  it('updates custom selected tags and the overflow counter after removal', () => {
    const selection = () => cy.get('[data-testid="select-tag-overflow"]');
    selection().find('strong').should('contain.text', 'Selected Alpha');
    selection().find('.sd-select-view-tag-counter').should('have.text', '+2');
    selection().find('.sd-tag-close-btn').click();
    selection().find('strong').should('contain.text', 'Selected Beta');
    selection().find('.sd-select-view-tag-counter').should('have.text', '+1');
    cy.get('[data-testid="select-events"]').should('contain.text', 'overflow:["b",0]');
  });
});
