describe('React menu', () => {
  beforeEach(() => cy.visit('/menu.html'));

  it('keeps public menu ref fields current across selection and root replacement', () => {
    const read = (expected: Record<string, unknown>) => {
      cy.contains('button', 'Read menu refs').click();
      cy.get('[data-testid="menu-ref-status"]')
        .invoke('text')
        .then((value) => {
          expect(JSON.parse(value)).to.include(expected);
        });
    };
    read({
      itemConnected: true,
      itemMatches: true,
      selected: false,
      level: 1,
      click: 'function',
      subConnected: true,
      subKey: 'first',
      childSelected: true,
      title: 'Menu First',
      nativeAttribute: 'menu-ref-sub',
      popup: false,
      modeConnected: true,
    });
    cy.get('[data-testid="menu-ref-status"]')
      .invoke('text')
      .then((value) => {
        expect(JSON.parse(value).itemKeys).to.include('nested');
        expect(JSON.parse(value).subKeys).to.deep.equal([]);
      });
    cy.contains('button', 'Click menu ref').click();
    cy.get('[data-testid="menu-item-events"]').should('have.text', '1');
    cy.contains('button', 'Activate menu ref').click();
    cy.get('[data-testid="menu-item-events"]').should('have.text', '2');
    read({ selected: true, childSelected: false });
    cy.get('[data-testid="menu-ref-status"]')
      .invoke('text')
      .then((value) => {
        expect(JSON.parse(value).contextSelected).to.deep.equal(['home']);
      });
    cy.get('[data-testid="menu-basic"] .sd-menu-collapse-button').click();
    read({ itemConnected: true, itemMatches: true, selected: true, subConnected: true });
    cy.contains('button', 'Toggle menu mode').click();
    read({ popup: true, modeConnected: true });
    cy.contains('button', 'Toggle menu mode').click();
    read({ popup: false, modeConnected: true });
  });

  it('scrolls the initially selected menu leaf after automatic expansion in StrictMode', () => {
    cy.contains('button', 'Mount selected menu').click();
    cy.contains(
      '[data-testid="menu-initial-scroll"] .sd-menu-inline-header',
      'Initial Branch',
    ).should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-testid="menu-initial-scroll"] .sd-menu-inner').should(($el) => {
      expect($el[0].scrollTop).to.be.greaterThan(0);
      const viewport = $el[0].getBoundingClientRect();
      const item = $el[0].querySelector('[aria-current="page"]')!.getBoundingClientRect();
      expect(item.top).to.be.at.least(viewport.top - 1);
      expect(item.bottom).to.be.at.most(viewport.bottom + 1);
    });
  });

  it('opens selected menu ancestors, changes accordion branches and activates items by keyboard', () => {
    cy.get('[data-testid="menu-basic"], [data-testid="menu-dynamic"]')
      .find('.sd-menu-inline-content')
      .filter(':visible')
      .should('have.length', 2)
      .should(($contents) => {
        $contents.each((_, element) => {
          expect(element.style.height).to.equal('');
        });
      });
    cy.get('[data-testid="menu-basic"]').within(() => {
      cy.contains('.sd-menu-inline-header', 'Menu First').should(
        'have.attr',
        'aria-expanded',
        'true',
      );
      cy.contains('[role="menuitem"]', 'Menu Home')
        .focus()
        .type('{enter}')
        .should('have.attr', 'aria-current', 'page');
      cy.contains('[role="menuitem"]', 'Menu Disabled')
        .click()
        .should('not.have.attr', 'aria-current');
      cy.contains('[role="menuitem"]', 'Menu Disabled').should('not.have.attr', 'tabindex');
      cy.contains('.sd-menu-inline-header', 'Menu Second')
        .click()
        .should('have.attr', 'aria-expanded', 'true');
      cy.contains('.sd-menu-inline-header', 'Menu First').should(
        'have.attr',
        'aria-expanded',
        'false',
      );
      cy.contains('.sd-menu-item', 'Menu Other').should('be.visible').click();
      cy.contains('[role="menuitem"]', 'Menu Home').focus().type('{downarrow}');
      cy.focused().should('contain.text', 'Menu First');
    });
    cy.get('[data-testid="menu-item-events"]').should('have.text', '1');
    cy.get('[data-testid="menu-selection"]').should('have.text', 'other');
  });

  it('keeps controlled menu selection and expansion unchanged until writeback', () => {
    cy.contains('[data-testid="menu-controlled"] .sd-menu-item', 'Controlled Menu Item')
      .click()
      .should('not.have.attr', 'aria-current');
    cy.get('[data-testid="menu-requests"]').should('have.text', 'select:controlled-item');
    cy.contains('.sd-menu-inline-header', 'Controlled Menu Branch')
      .click()
      .should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="menu-requests"]').should('have.text', 'open:controlled');
    cy.contains('button', 'Allow menu writeback').click();
    cy.contains('[data-testid="menu-controlled"] .sd-menu-item', 'Controlled Menu Item').should(
      'have.attr',
      'aria-current',
      'page',
    );
    cy.contains('.sd-menu-inline-header', 'Controlled Menu Branch').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
  });

  it('selects nested popup menu items and closes every popup ancestor', () => {
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Popup Menu Branch').click();
    cy.get('[data-testid="menu-selection"]').should('have.text', 'popup');
    cy.contains('.sd-trigger-menu-pop-header', 'Popup Menu Inner').should('be.visible').click();
    cy.contains('.sd-trigger-menu-item', 'Popup Menu Leaf')
      .should('be.visible')
      .focus()
      .type('{downarrow}');
    cy.focused().should('contain.text', 'Popup Menu Leaf').type('{enter}');
    cy.get('[data-testid="menu-selection"]').should('have.text', 'popup-leaf');
    cy.contains('.sd-trigger-menu-item', 'Popup Menu Leaf').should('not.be.visible');
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Popup Menu Branch').should(
      'have.class',
      'sd-menu-selected',
    );
    cy.contains('button', 'Toggle menu mode').click();
    cy.get('[data-testid="menu-popup"]').should('have.class', 'sd-menu-pop');
  });

  it('moves horizontal overflow items into a popup and restores their original keys on resize', () => {
    cy.get('[data-testid="menu-horizontal"] [role="menubar"]').should('exist');
    cy.contains('[data-testid="menu-horizontal"] .sd-menu-item', 'Horizontal Alpha').should(
      'have.attr',
      'aria-current',
      'page',
    );
    cy.get('[data-testid="menu-horizontal"] .sd-menu-overflow-sub-menu')
      .should('be.visible')
      .click();
    cy.contains('.sd-trigger-menu-item', 'Horizontal Delta').should('be.visible').click();
    cy.get('[data-testid="menu-selection"]').should('have.text', 'horizontal-d');
    cy.contains('button', 'Resize horizontal menu').click();
    cy.get('[data-testid="menu-horizontal"] .sd-menu-overflow-sub-menu').should('not.exist');
    cy.contains('[data-testid="menu-horizontal"] .sd-menu-item', 'Horizontal Delta').should(
      'have.attr',
      'aria-current',
      'page',
    );
    cy.contains('[data-testid="menu-horizontal"] .sd-menu-item', 'Horizontal Alpha')
      .focus()
      .type('{rightarrow}');
    cy.focused().should('contain.text', 'Horizontal Beta');
    cy.focused().type('{home}');
    cy.focused().should('contain.text', 'Horizontal Alpha').type('{end}');
    cy.focused().should('contain.text', 'Horizontal Delta');
  });

  it('recalculates horizontal overflow after an item grows and restores selection when it shrinks', () => {
    const overflow = '[data-testid="menu-content-width"] .sd-menu-overflow-sub-menu';
    cy.get(overflow).should('not.exist');
    cy.contains('button', 'Resize growing menu item').click();
    cy.get(overflow).should('be.visible').click();
    cy.contains('.sd-trigger-menu-item', /^B$/).should('be.visible').click();
    cy.get('[data-testid="menu-selection"]').should('have.text', 'remaining');
    cy.contains('button', 'Resize growing menu item').click();
    cy.get(overflow).should('not.exist');
    cy.contains('[data-testid="menu-content-width"] [role="menuitem"]', /^B$/).should(
      'have.attr',
      'aria-current',
      'page',
    );
  });

  it('opens dynamically registered submenus and scrolls a selected item into view', () => {
    cy.contains('[data-testid="menu-dynamic"] .sd-menu-inline-header', 'Existing Branch').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
    cy.contains('button', 'Toggle late menu').click();
    cy.contains('[data-testid="menu-dynamic"] .sd-menu-inline-header', 'Late Branch').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
    cy.get('[data-testid="menu-scroll"] .sd-menu-inner').should(($el) => {
      expect($el[0].scrollTop).to.be.greaterThan(0);
      const viewport = $el[0].getBoundingClientRect();
      const item = $el[0].querySelector('[aria-current="page"]')!.getBoundingClientRect();
      expect(item.top).to.be.at.least(viewport.top - 1);
      expect(item.bottom).to.be.at.most(viewport.bottom + 1);
    });
    cy.contains('button', 'Toggle late menu').click();
    cy.contains('[data-testid="menu-dynamic"] .sd-menu-inline-header', 'Late Branch').should(
      'not.exist',
    );
  });

  it('resets popup visibility when a submenu changes between inline and popup modes', () => {
    cy.contains('[data-testid="menu-popup"] .sd-menu-inline-header', 'Mode Menu Branch').click();
    cy.contains('[data-testid="menu-popup"] .sd-menu-item', 'Mode Menu Leaf').should('be.visible');
    cy.contains('button', 'Toggle menu mode').click();
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Mode Menu Branch').click();
    cy.contains('.sd-trigger-menu-item', 'Mode Menu Leaf').should('be.visible');
    cy.contains('button', 'Toggle menu mode').click();
    cy.contains('button', 'Toggle menu mode').click();
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Mode Menu Branch').should(
      'have.attr',
      'aria-expanded',
      'false',
    );
    cy.contains('.sd-trigger-menu-item', 'Mode Menu Leaf').should('not.be.visible');
  });

  it('inherits sider rail width and theme and responds to breakpoints and collapse buttons', () => {
    cy.get('[data-testid="menu-sider"]')
      .should('have.class', 'sd-menu-dark')
      .and('have.class', 'sd-menu-collapsed')
      .and('have.css', 'width', '80px');
    cy.contains('button', 'Toggle menu rail').click();
    cy.get('[data-testid="menu-sider"]')
      .should('not.have.class', 'sd-menu-collapsed')
      .and('have.css', 'width', '260px');
    cy.get('[data-testid="menu-basic"] .sd-menu-collapse-button').click();
    cy.get('[data-testid="menu-basic"]').should('have.class', 'sd-menu-collapsed');
    cy.viewport(600, 800);
    cy.get('[data-testid="menu-responsive"]').should('have.class', 'sd-menu-collapsed');
    cy.get('[data-testid="menu-requests"]').should('have.text', 'responsive:true');
    cy.viewport(1000, 800);
    cy.get('[data-testid="menu-responsive"]').should('not.have.class', 'sd-menu-collapsed');
  });

  it('refreshes menu ancestors for dynamic grandchildren and isolates nested roots', () => {
    const root = '[data-collector="root"]';
    const tree = (key: string, children: unknown[]) =>
      JSON.stringify([{ key, children: [{ key: 'nested', children }] }]);
    cy.get(root).should('have.text', tree('branch', [{ key: 'leaf' }]));
    cy.get('[data-collector="isolated"]').should('have.text', '[{"key":"independent"}]');
    cy.contains('button', 'Toggle collected leaf').click();
    cy.get(root).should('have.text', tree('branch', []));
    cy.contains('button', 'Toggle collected leaf').click();
    cy.get(root).should('have.text', tree('branch', [{ key: 'leaf' }]));
    cy.contains('button', 'Rename collected branch').click();
    cy.get(root).should('have.text', tree('renamed', [{ key: 'leaf' }]));
  });

  it('removes and remounts popup menu collectors without duplicate registration', () => {
    const root = '[data-collector="root"]';
    cy.contains('button', 'Toggle collected branch').click();
    cy.get(root).should('have.text', '[]');
    cy.contains('button', 'Toggle collected branch').click();
    cy.get(root).should(
      'have.text',
      '[{"key":"branch","children":[{"key":"nested","children":[{"key":"leaf"}]}]}]',
    );
    cy.contains('button', 'Toggle collected branch').click();
    cy.get(root).should('have.text', '[]');
  });

  it('reports submenus added after popup registration to the root', () => {
    cy.contains('button', 'Toggle late submenu').click();
    cy.get('[data-collector="root"]').should(
      'have.text',
      '[{"key":"branch","children":[{"key":"nested","children":[{"key":"leaf"}]},{"key":"late","children":[{"key":"late-leaf"}]}]}]',
    );
    cy.contains('button', 'Toggle late submenu').click();
    cy.get('[data-collector="root"]').should(
      'have.text',
      '[{"key":"branch","children":[{"key":"nested","children":[{"key":"leaf"}]}]}]',
    );
  });
});
