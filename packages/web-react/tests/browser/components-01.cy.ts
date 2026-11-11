describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

  const mentionAction = (detail: string) =>
    cy.window().then((win) => win.dispatchEvent(new CustomEvent('mention-action', { detail })));

  it('keeps RichLineClamp DOM and imperative refs separate across root replacement and unmount', () => {
    cy.get('[data-testid="rich-root-ref"]').should('have.prop', 'tagName', 'DIV');
    cy.contains('button', '读取截断引用').click();
    cy.get('[data-testid="rich-root-status"]').should('have.text', 'DIV:function');
    cy.contains('button', '引用展开').click();
    cy.get('[data-testid="rich-root-ref"]').should((element) =>
      expect(element[0].getBoundingClientRect().height).to.be.greaterThan(60),
    );
    cy.contains('button', '替换截断标签').click();
    cy.get('[data-testid="rich-root-ref"]').should('have.prop', 'tagName', 'ARTICLE');
    cy.contains('button', '读取截断引用').click();
    cy.get('[data-testid="rich-root-status"]').should('have.text', 'ARTICLE:function');
    cy.contains('button', '卸载截断引用').click();
    cy.get('[data-testid="rich-root-ref"]').should('not.exist');
    cy.contains('button', '读取截断引用').click();
    cy.get('[data-testid="rich-root-status"]').should('have.text', 'null:undefined');
  });

  it('renders real QrCode canvas pixels and updates multiline values in SVG mode', () => {
    cy.get('[data-testid="qr-main"] canvas')
      .should('have.attr', 'width', '160')
      .and('have.attr', 'role', 'img')
      .and('have.attr', 'aria-label', '二维码:first-value')
      .then((element) => {
        const pixels = (element[0] as HTMLCanvasElement)
          .getContext('2d')!
          .getImageData(0, 0, 160, 160).data;
        expect(pixels.some((value, index) => index % 4 === 3 && value === 255)).to.equal(true);
        expect(pixels.some((value, index) => index % 4 === 0 && value === 11)).to.equal(true);
      });
    cy.contains('button', 'QR type').click();
    cy.get('[data-testid="qr-main"] svg path').should('have.length', 2);
    cy.get('[data-testid="qr-main"] svg path')
      .eq(1)
      .invoke('attr', 'd')
      .as('qrPath', { type: 'static' });
    cy.contains('button', 'QR value').click();
    cy.get('[data-testid="qr-main"] [role="img"]').should(
      'have.attr',
      'aria-label',
      '二维码:second-value\n多行',
    );
    cy.get('@qrPath').then((path) =>
      cy.get('[data-testid="qr-main"] svg path').eq(1).should('not.have.attr', 'd', path),
    );
  });

  it('tracks QrCode ancestor themes, applies explicit options and measures a previously empty root', () => {
    cy.contains('button', 'QR type').click();
    cy.get('[data-testid="qr-main"] svg path').eq(1).should('have.attr', 'stroke', '#0b0b0a');
    cy.contains('button', 'QR theme').click();
    cy.get('[data-testid="qr-main"] svg path').eq(0).should('have.attr', 'fill', '#20201e');
    cy.get('[data-testid="qr-main"] svg path').eq(1).should('have.attr', 'stroke', '#f6f6f6');
    cy.contains('button', 'QR options').click();
    cy.get('[data-testid="qr-main"]')
      .should('have.class', 'sd-qr-code-borderless')
      .and('have.css', 'width', '200px')
      .and('have.css', 'background-color', 'rgb(170, 187, 204)');
    cy.get('[data-testid="qr-main"] svg path').eq(0).should('have.attr', 'fill', '#aabbcc');
    cy.get('[data-testid="qr-main"] svg path').eq(1).should('have.attr', 'stroke', '#112233');
    cy.get('[data-testid="qr-main"] svg')
      .invoke('attr', 'viewBox')
      .then((value) => expect(Number(value!.split(' ')[2])).to.be.greaterThan(35));
    cy.get('[data-testid="qr-empty"]').should('not.exist');
    cy.contains('button', 'QR empty').click();
    cy.get('[data-testid="qr-empty"] svg path').eq(1).should('have.attr', 'stroke', '#f6f6f6');
    cy.contains('button', 'QR empty').click();
    cy.get('[data-testid="qr-empty"]').should('not.exist');
  });

  it('renders QrCode status, locale, refresh and inherited loading props', () => {
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] [role="status"]')
      .should('have.attr', 'aria-live', 'polite')
      .and('contain.text', '二维码已过期');
    cy.get('[data-testid="qr-main"] button').click();
    cy.get('[data-testid="qr-events"]').should('have.text', 'refresh');
    cy.contains('button', 'QR locale').click();
    cy.get('[data-testid="qr-main"] button').should('have.text', 'Refresh');
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] .sd-spin').should('contain.text', 'Inherited QR loading');
    cy.get('[data-testid="qr-main"] .sd-spin-icon').should('have.css', 'font-size', '10px');
    cy.contains('button', 'QR local spin').click();
    cy.get('[data-testid="qr-main"] .sd-spin')
      .should('contain.text', 'Local QR loading')
      .and('not.contain.text', 'Inherited QR loading');
    cy.get('[data-testid="qr-main"] .sd-dot-loading').should('have.css', 'width', '56px');
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] [role="status"]').should('have.text', 'QR code scanned');
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-cover').should('not.exist');
  });

  it('updates QrCode icons, custom status precedence and native refs', () => {
    cy.get('[data-testid="qr-main"] .sd-qr-code-icon').should('not.exist');
    cy.contains('button', 'QR icon').click();
    cy.get('[data-testid="qr-main"] img')
      .should('have.attr', 'alt', 'QR icon')
      .and('have.css', 'width', '24px')
      .and('have.css', 'height', '36px');
    cy.contains('button', 'QR icon').click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-icon')
      .should('have.text', 'Custom icon')
      .find('img')
      .should('not.exist');
    cy.contains('button', 'QR icon').click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-icon').should('not.exist');
    cy.contains('button', /^QR status$/).click();
    cy.contains('button', 'QR custom status').click();
    cy.contains('[data-testid="qr-main"] button', 'Render expired').click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-status').should('not.exist');
    cy.contains('[data-testid="qr-status-slot"] button', 'Slot expired').click();
    cy.contains('button', 'QR ref').click();
    cy.get('[data-testid="qr-events"]').should('have.text', 'refresh|slot-refresh|ref:qr-main');
    cy.contains('button', 'QR mount').click();
    cy.contains('button', 'QR ref').click();
    cy.get('[data-testid="qr-events"]').should('contain.text', 'ref:null');
  });

  it('keeps the newest QrCode SVG when encoding resolves out of order and after unmount', () => {
    cy.contains('button', 'QR defer').click();
    cy.get('[data-testid="qr-pending"]').should('contain.text', 'old');
    cy.contains('button', 'QR newer').click();
    cy.get('[data-testid="qr-pending"]').should('have.text', 'old|new');
    cy.contains('button', 'QR resolve new').click();
    cy.get('[data-testid="qr-main"] svg').should('have.attr', 'data-value', 'new');
    cy.contains('button', 'QR resolve old').click();
    cy.get('[data-testid="qr-main"] svg').should('have.attr', 'data-value', 'new');
    cy.contains('button', 'QR defer').click();
    cy.get('[data-testid="qr-main"] [role="img"]').should('have.attr', 'aria-label', '二维码:old');
    cy.contains('button', 'QR mount').click();
    cy.get('[data-testid="qr-main"]').should('not.exist');
    cy.contains('button', 'QR resolve old').click();
    cy.get('[data-testid="qr-main"]').should('not.exist');
  });

  it('selects SelectableCard through its native checkbox and blocks selection when disabled', () => {
    cy.get('[data-testid="selectable-main"] > input').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-main"] > input').should('be.checked');
    cy.get('[data-testid="selectable-main"]')
      .should('have.attr', 'data-selected', 'true')
      .and('have.class', 'sd-selectable-card--selected');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-main"] > input').should('not.be.checked');
    cy.get('[data-testid="selectable-content"]').click();
    cy.get('[data-testid="selectable-main"] > input').should('be.checked');
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'change:true|change:false|change:true',
    );
    cy.contains('button', 'Selectable disabled').click();
    cy.get('[data-testid="selectable-main"] > input').should('be.disabled');
    cy.get('[data-testid="selectable-content"]').click();
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'change:true|change:false|change:true',
    );
    cy.get('[data-testid="selectable-main"]').should('have.class', 'sd-selectable-card--disabled');
    cy.contains('button', 'Inner action').click();
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'change:true|change:false|change:true|button',
    );
  });

  it('restores rejected SelectableCard changes and reads updated controlled selection', () => {
    cy.get('[data-testid="selectable-rejected"] > input').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-rejected"] > input').should('not.be.checked');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-rejected"] > input').should('not.be.checked');
    cy.get('[data-testid="selectable-events"]').should('have.text', 'rejected:true|rejected:true');
    cy.contains('button', 'Selectable external').click();
    cy.get('[data-testid="selectable-rejected"] > input').should('be.checked').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="selectable-rejected"] > input').should('be.checked');
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'rejected:true|rejected:true|rejected:false',
    );
    cy.get('[data-testid="selectable-rejected"] .sd-selectable-card-title').click();
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'rejected:true|rejected:true|rejected:false|rejected:false',
    );
    cy.get('[data-testid="selectable-rejected"] > input')
      .click({ force: true })
      .should('be.checked');
    cy.get('[data-testid="selectable-events"]').should(
      'have.text',
      'rejected:true|rejected:true|rejected:false|rejected:false|rejected:false',
    );
  });

  it('keeps SelectableCard nested interactive elements independent', () => {
    cy.contains('button', 'Inner action').click();
    cy.contains('a', 'Inner link').click();
    cy.contains('[data-testid="selectable-main"] label', 'Inner label').click();
    cy.get('[data-testid="selectable-inner-check"]').should('be.checked');
    cy.get('[aria-label="Inner select"]').select('two');
    cy.get('[aria-label="Inner textarea"]').click().type(' text');
    cy.contains('[role="button"]', 'Role action').click();
    cy.get('[data-testid="selectable-events"]').should('have.text', 'button|link|role');
    cy.get('[data-testid="selectable-main"] > input').should('not.be.checked');
  });

  it('renders SelectableCard content, zero values, dimensions and reactive variants', () => {
    cy.get('[data-testid="selectable-main"]')
      .should('have.class', 'custom-selectable')
      .and('have.css', 'padding', '8px')
      .and('have.css', 'width', '320px')
      .and('have.css', 'border-radius', '10px');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-title strong').should(
      'have.text',
      'Main title',
    );
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-value').should('have.text', '0');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-figure').should(
      'have.text',
      'Figure',
    );
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-description').should(
      'have.text',
      'Plan details',
    );
    cy.get('[data-testid="selectable-content"]').click();
    cy.contains('button', 'Selectable appearance').click();
    cy.get('[data-testid="selectable-main"]')
      .should('have.class', 'sd-selectable-card--filled')
      .and('have.class', 'sd-selectable-card--color-green')
      .and('have.class', 'sd-selectable-card--size-large')
      .and('have.class', 'sd-selectable-card--align-center')
      .and('have.attr', 'data-variant', 'filled')
      .and('have.css', 'padding', '20px 24px')
      .and('have.css', 'height', '260px');
    cy.get('[data-testid="selectable-main"] .sd-selectable-card-body').should(
      'have.css',
      'flex-direction',
      'row',
    );
  });

  it('forwards SelectableCard refs and prefixes while keeping disabled control explicit', () => {
    cy.contains('button', 'Selectable ref').click();
    cy.get('[data-testid="selectable-events"]').should('have.text', 'ref:selectable-main');
    cy.get('[data-testid="selectable-custom"]').should('have.class', 'custom-selectable-card');
    cy.get('[data-testid="selectable-custom"] .custom-selectable-card-title').should(
      'have.text',
      '0',
    );
    cy.get('[data-testid="selectable-custom"] .custom-selectable-card-description').should(
      'have.text',
      '0',
    );
    cy.get('[data-testid="selectable-custom"] > input')
      .should('not.be.disabled')
      .and('have.attr', 'aria-label', 'Custom prefix plan');
    cy.get('[data-testid="selectable-custom"]').click();
    cy.get('[data-testid="selectable-events"]').should('contain.text', 'custom:true');
    cy.get('[data-testid="selectable-fixture"] > .sd-selectable-card > input').then((elements) => {
      expect(new Set([...elements].map((element) => element.id)).size).to.equal(elements.length);
    });
  });

  it('searches Mention groups, skips disabled candidates and publishes selection in Vue order', () => {
    cy.get('[data-testid="mention-main"] input').type('@');
    cy.get('.sd-mention-dropdown .sd-select-option').should('have.length', 4);
    cy.get('.sd-mention-dropdown .sd-select-option-active').should('have.text', 'Alice');
    cy.get('.sd-mention-dropdown .sd-select-option-disabled').click();
    cy.get('[data-testid="mention-events"]').should('have.text', 'search:@:|update:@|change:@');
    cy.get('[data-testid="mention-main"] input').type('{downarrow}{downarrow}{enter}');
    cy.get('[data-testid="mention-main"] input').should('have.value', '@0');
    cy.get('[data-testid="mention-events"]').should(
      'have.text',
      'search:@:|update:@|change:@|select:0|update:@0|change:@0',
    );
    cy.get('[data-testid="mention-main"] input')
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('filters Mention text and reopens after Escape without opening on plain Enter', () => {
    cy.get('[data-testid="mention-main"] input').type('{enter}');
    cy.get('.sd-mention-dropdown .sd-select-option').should('not.exist');
    cy.get('[data-testid="mention-main"] input').type('@a');
    cy.get('.sd-mention-dropdown .sd-select-option')
      .should('have.length', 1)
      .and('have.text', 'Alice');
    cy.get('[data-testid="mention-main"] input').type('{esc}');
    cy.get('[data-testid="mention-main"] input').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="mention-main"] input').type('l');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    cy.get('[data-testid="mention-main"] input').type(' ');
    cy.get('[data-testid="mention-main"] input').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="mention-main"] input').clear().type('Hello#bo');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Bob').click();
    cy.get('[data-testid="mention-main"] input').should('have.value', 'Hello #Bob');
  });

  it('preserves the latest controlled Mention tail and clears local state on release', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    mentionAction('controlled');
    cy.get('[data-testid="mention-main"] input')
      .should('have.value', '@a old')
      .focus()
      .then((element) => {
        (element[0] as HTMLInputElement).setSelectionRange(2, 2);
      })
      .trigger('input');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('tail');
    cy.get('[data-testid="mention-main"] input').should('have.value', '@a new');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Alice').click();
    cy.get('[data-testid="mention-events"]').should(
      'contain.text',
      'select:Alice|update:@Alice new|change:@Alice new',
    );
    cy.get('[data-testid="mention-main"] input').should('have.value', '@a new');
    mentionAction('release');
    cy.get('[data-testid="mention-main"] input').should('have.value', '');
  });

  it('supports Mention custom filters, multiple-character prefixes and custom separators', () => {
    cy.get('[data-testid="mention-custom-filter"] input').type('::two words');
    cy.get('.sd-mention-dropdown .sd-select-option')
      .should('have.length', 1)
      .and('have.text', 'Second')
      .click();
    cy.get('[data-testid="mention-custom-filter"] input').should('have.value', '::Second');
    mentionAction('split');
    mentionAction('filter');
    cy.get('[data-testid="mention-main"] input').type('x#unknown');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Bob').click();
    cy.get('[data-testid="mention-main"] input').should('have.value', 'x:#Bob');
  });

  it('closes Mention on readonly or disabled changes and follows remote option updates', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    cy.get('[data-testid="mention-main"] input').type('@');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('empty');
    cy.get('[data-testid="mention-main"] input').should('have.attr', 'aria-expanded', 'false');
    mentionAction('reload');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('readonly');
    cy.get('[data-testid="mention-main"] input').should('have.prop', 'readOnly', true);
    cy.get('[data-testid="mention-main"] input')
      .should('have.attr', 'aria-expanded', 'false')
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'select:');
    mentionAction('readonly');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('disabled');
    cy.get('[data-testid="mention-main"] input')
      .should('be.disabled')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('measures Mention textarea on type changes and parent resize while retaining keyboard selection', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    mentionAction('textarea');
    cy.get('[data-testid="mention-main"] textarea').type('Hello\n@');
    cy.get('.sd-mention-measure').should((element) => {
      const field = element[0].parentElement!.querySelector('textarea')!;
      expect(element[0].style.width).to.equal(getComputedStyle(field).width);
      expect(element[0].style.fontSize).to.equal(getComputedStyle(field).fontSize);
    });
    cy.get('[data-testid="mention-main"] textarea')
      .type('{downarrow}{enter}')
      .should('have.value', 'Hello\n@Bob');
    mentionAction('input');
    cy.get('[data-testid="mention-main"] input').should('exist');
    mentionAction('textarea');
    cy.get('[data-testid="mention-main"] textarea').clear().type('@');
    cy.get('[data-testid="mention-main"] textarea').then((element) => {
      element[0].style.width = '240px';
    });
    cy.get('.sd-mention-measure').should('have.css', 'width', '240px');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Alice').click();
    cy.get('[data-testid="mention-main"] textarea').should('have.value', '@Alice');
  });

  it('supports Mention refs, clearing configuration and form validation', () => {
    cy.contains('button', 'Mention focus').click();
    cy.get('[data-testid="mention-main"] input').should('be.focused').type('@');
    cy.get('[data-testid="mention-main"] .sd-input-clear-btn').click();
    cy.get('[data-testid="mention-events"]').should('contain.text', 'update:|change:|clear');
    cy.contains('button', 'Mention blur').click();
    cy.get('[data-testid="mention-main"] input').should('not.be.focused');
    cy.get('[data-testid="mention-config"] .sd-input-clear-btn').should('exist');
    cy.get('[data-testid="mention-no-clear"] .sd-input-clear-btn').should('not.exist');
    cy.get('[data-testid="mention-form"] input').type('@');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Alice').click();
    cy.get('[data-testid="mention-form"] .sd-input-clear-btn').click();
    cy.get('[data-testid="mention-fixture"]').should('contain.text', 'Mention required');
  });

  it('keeps Mention IME Enter uncommitted and selects an empty value with native events', () => {
    cy.get('[data-testid="mention-empty"] input').type('@');
    cy.get('.sd-mention-dropdown .sd-select-option').should('have.text', 'Empty value');
    cy.get('[data-testid="mention-empty"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: true,
    });
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'empty:');
    cy.get('[data-testid="mention-empty"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: false,
    });
    cy.get('[data-testid="mention-events"]')
      .should('contain.text', 'native-input')
      .and('contain.text', 'native-keydown')
      .and('contain.text', 'empty:');
    cy.get('[data-testid="mention-empty"] input')
      .should('have.value', '@')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('suppresses Mention textarea selection while readonly or disabled', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    mentionAction('textarea');
    cy.get('[data-testid="mention-main"] textarea').type('@');
    cy.get('.sd-mention-dropdown').should('be.visible');
    mentionAction('readonly');
    cy.get('[data-testid="mention-main"] textarea')
      .should('have.prop', 'readOnly', true)
      .trigger('keydown', { key: 'Enter' });
    cy.get('.sd-mention-dropdown').should('not.exist');
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'select:');
    mentionAction('readonly');
    cy.get('.sd-mention-dropdown').should('be.visible');
    mentionAction('disabled');
    cy.get('[data-testid="mention-main"] textarea')
      .should('be.disabled')
      .trigger('keydown', { key: 'Enter', force: true });
    cy.get('.sd-mention-dropdown').should('not.exist');
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'select:');
  });

  it('navigates Carousel with arrows and keyboard while publishing 1-based ordered events', () => {
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-ready', 'true');
    cy.clock();
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'aria-roledescription', 'carousel');
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current')
      .should('have.attr', 'data-slide', '1')
      .and('have.attr', 'aria-hidden', 'false');
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow-right').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:true');
    cy.tick(100);
    cy.get('[data-testid="carousel-main"]').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.tick(100);
    cy.get('[aria-label="Carousel input 1"]').focus().trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
  });

  it('keeps controlled Carousel visibility and reports the displayed previous index', () => {
    cy.contains('button', 'Carousel controlled third').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow-right').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:1|change:1:3:true');
    cy.contains('button', 'Carousel negative current').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.contains('button', 'Carousel release').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
  });

  it('normalizes Carousel imperative indexes and follows removal and reordered wrapped items', () => {
    cy.contains('button', 'Carousel go zero').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.contains('button', 'Carousel remove').click();
    cy.get('[data-testid="carousel-main"] [data-carousel-item]').should('have.length', 2);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.contains('button', 'Carousel reverse').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.contains('button', 'Carousel remove').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow').should('not.exist');
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-wrapper').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'empty' })),
    );
    cy.get('[data-testid="carousel-main"] [data-carousel-item]').should('not.exist');
    cy.get('[data-testid="carousel-main"]').trigger('keydown', { key: 'ArrowRight' });
    cy.contains('button', 'Carousel add').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
  });

  it('switches Carousel direction, fade/card styling and keyboard/hover indicators', () => {
    cy.contains('button', 'Carousel direction').click();
    cy.contains('button', 'Carousel animation').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-fade').should(
      'have.class',
      'sd-carousel-vertical',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow-top').should('exist');
    cy.get('[data-testid="carousel-main"] .custom-carousel-indicators').should(
      'have.class',
      'sd-carousel-indicator-right',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-item')
      .eq(2)
      .trigger('keydown', { key: ' ' });
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current')
      .should('have.attr', 'data-slide', '3')
      .and('have.css', 'transition-duration', '0.1s');
    cy.contains('button', 'Carousel animation').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-card').should('exist');
    cy.contains('button', 'Carousel hover').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow').should(
      'have.class',
      'sd-carousel-arrow-hover',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-item').eq(0).trigger('mouseover');
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
  });

  it('selects Carousel slider track positions using the actual delegated current target', () => {
    cy.contains('button', 'Carousel indicator').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-line').should('exist');
    cy.contains('button', 'Carousel indicator').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-slider').click('right');
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-item').then((element) =>
      expect(element[0].getBoundingClientRect().width).to.be.greaterThan(0),
    );
    cy.contains('button', 'Carousel indicator').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-wrapper').should('not.exist');
  });

  it('preserves the Carousel animation lock when autoplay reschedules', () => {
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-ready', 'true');
    cy.clock();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'autoplay' })),
    );
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-auto-interval', '100');
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
    cy.get('[data-testid="carousel-main"]').trigger('keydown', { key: 'ArrowRight' });
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
  });

  it('pauses Carousel on hover, resumes after a policy change and cancels timers on unmount', () => {
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-ready', 'true');
    cy.clock();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'pause-test' })),
    );
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-auto-interval', '100');
    cy.get('[data-testid="carousel-main"]').trigger('mouseover');
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-hovered', 'true');
    cy.tick(500);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'hover-off' })),
    );
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-hover-pause', 'false');
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'unmount' })),
    );
    cy.get('[data-testid="carousel-main"]').should('not.exist');
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
    cy.tick(1000);
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
  });

  it('keeps Carousel indexes local across nested prefix changes and reordering', () => {
    cy.contains('button', /^Carousel nested$/).click();
    cy.contains('button', 'Carousel nested prefix').click();
    cy.get('[data-testid="carousel-nested"]').should('have.class', 'custom-carousel');
    cy.get('[data-testid="carousel-main"] [data-slide="2"]').should(
      'have.attr',
      'aria-label',
      '第 2 张,共 3 张',
    );
    cy.contains('button', 'Carousel ref next').click();
    cy.get('[data-testid="carousel-main"] > .sd-carousel-slide > .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.contains('button', 'Carousel reverse').click();
    cy.get('[data-testid="carousel-main"] [data-slide="3"]').should(
      'have.attr',
      'aria-label',
      '第 1 张,共 3 张',
    );
    cy.contains('button', 'Carousel nested prefix').click();
    cy.get('[data-testid="carousel-nested"]').should('have.class', 'sd-carousel');
    cy.get('[data-testid="carousel-main"] [data-slide="1"]').should(
      'have.attr',
      'aria-label',
      '第 3 张,共 3 张',
    );
  });

  it('isolates Carousel child registration in nested roots', () => {
    cy.contains('button', 'Carousel nested').click();
    cy.get(
      '[data-testid="carousel-main"] > .sd-carousel-indicator-wrapper .sd-carousel-indicator-item',
    ).should('have.length', 3);
    cy.get('[data-testid="carousel-nested"] .sd-carousel-indicator-item').should('have.length', 2);
    cy.get('[data-testid="carousel-nested"] .sd-carousel-arrow-right').click();
    cy.get('[data-testid="carousel-nested"] .sd-carousel-item-current').should(
      'have.text',
      'Nested B',
    );
    cy.get('[data-testid="carousel-main"] > .sd-carousel-slide > .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', '');
  });

  it('merges List loading configuration while keeping the List loading flag authoritative', () => {
    cy.get('[data-testid="list-main"] .sd-list-spin').should('not.have.attr', 'aria-busy');
    cy.contains('button', 'List loading', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-spin-mask').should(
      'contain.text',
      'Inherited list loading',
    );
    cy.contains('button', 'List local spin').click();
    cy.get('[data-testid="list-main"] .sd-spin-mask')
      .should('contain.text', 'Local list loading')
      .and('not.contain.text', 'Inherited list loading');
    cy.contains('button', 'List loading', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-spin-mask').should('not.exist');
    cy.get('[data-testid="list-initial-virtual"] .sd-list-item-content')
      .first()
      .should('have.text', 'Virtual node 0');
  });

  it('paginates List data, derives totals and publishes pagination callbacks in order', () => {
    cy.get('[data-testid="list-main"] .sd-list')
      .should('have.class', 'sd-list-small')
      .and('have.class', 'sd-list-hover');
    cy.get('[data-testid="list-main"] .sd-pagination-total').should('contain.text', '25');
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .should('have.length', 5)
      .first()
      .should('have.text', 'List row 0');
    cy.get('[data-testid="list-main"]').contains('.sd-pagination-item', /^2$/).click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .first()
      .should('have.text', 'List row 5');
    cy.get('[data-testid="list-events"]').should('contain.text', 'pagination:2|page:2');
    cy.get('[data-testid="list-main"] .sd-pagination-options .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^10 /).click();
    cy.get('[data-testid="list-main"] .sd-list-item-content').should('have.length', 10);
    cy.get('[data-testid="list-events"]').should('contain.text', 'size:10');
  });

  it('keeps controlled List pagination until writeback and accepts external page changes', () => {
    cy.contains('button', 'List controlled').click();
    cy.get('[data-testid="list-main"]').contains('.sd-pagination-item', /^2$/).click();
    cy.get('[data-testid="list-main"] [aria-current="page"]').should('have.text', '1');
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .first()
      .should('have.text', 'List row 0');
    cy.contains('button', 'List external page').click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .should('have.length', 5)
      .first()
      .should('have.text', 'List row 20');
    cy.contains('button', 'List controlled').click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .first()
      .should('have.text', 'List row 10');
  });

  it('splits List grid rows at 24 columns, preserves indexes and gives grid priority over virtualization', () => {
    cy.contains('button', 'List grid', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-virtual-list').should('not.exist');
    cy.get('[data-testid="list-main"] .sd-list-row')
      .should('have.length', 7)
      .then((rows) =>
        expect([...rows].map((row) => row.querySelectorAll('.sd-list-col').length)).to.deep.equal([
          4, 4, 4, 4, 4, 4, 1,
        ]),
      );
    cy.get('[data-testid="list-main"] [data-index]').then((items) =>
      expect([...items].map((item) => Number(item.getAttribute('data-index')))).to.deep.equal(
        Array.from({ length: 25 }, (_, index) => index),
      ),
    );
    cy.contains('button', 'List responsive grid').click();
    cy.get('[data-testid="list-main"] .sd-list-row')
      .should('have.length', 1)
      .find('.sd-list-col')
      .should('have.length', 25);
  });

  it('prioritizes List children, refreshes replaced content and renders item meta and actions', () => {
    cy.get('[data-testid="list-main"] .sd-list-item')
      .first()
      .find('.sd-list-item-main > .sd-list-item-action')
      .should('not.exist');
    cy.contains('button', 'List actions layout').click();
    cy.get('[data-testid="list-main"] .sd-list-item')
      .first()
      .find('.sd-list-item-main > .sd-list-item-action li')
      .should('have.length', 2);
    cy.contains('button', 'List meta visibility').click();
    cy.get('[data-testid="list-main"] .sd-list-item-meta').should('not.exist');
    cy.contains('button', 'List meta visibility').click();
    cy.get('[data-testid="list-main"] .sd-list-item-meta').should('have.length', 5);
    cy.contains('button', 'List children').click();
    cy.get('[data-testid="list-main"] .sd-pagination-total').should('contain.text', '6');
    cy.get('[data-testid="list-main"] .sd-list-item-content').first().should('have.text', '0:a');
    cy.get('[data-testid="list-main"]').contains('.sd-pagination-item', /^2$/).click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .should('have.length', 1)
      .and('have.text', '5:f');
  });

  it('renders configured List empty content and replaces it with scroll-loading content', () => {
    cy.contains('button', 'List empty').click();
    cy.get('[data-testid="list-main"]').should('contain.text', 'Empty list');
    cy.contains('button', 'List scroll loading').click();
    cy.get('[data-testid="list-main"]')
      .should('not.contain.text', 'Empty list')
      .and('contain.text', 'Loading more');
    cy.get('[data-testid="list-main"] .sd-list-header').should('have.text', 'List header');
    cy.get('[data-testid="list-main"] .sd-list-footer').should('have.text', 'List footer');
  });

  it('renders bounded virtual List rows and exposes scrollIntoView and its virtual instance', () => {
    cy.contains('button', 'List virtual', { matchCase: true }).click();
    cy.get('[data-testid="list-main"] .sd-list-item').its('length').should('be.lessThan', 40);
    cy.contains('button', 'List scroll 400').click();
    cy.get('[data-testid="list-main"] .sd-list-item-content')
      .contains(/^List row 400$/)
      .should('be.visible');
    cy.get('[data-testid="list-events"]').should('contain.text', 'ref:true');
  });

  it('checks List initial viewport without false bottom events and publishes bottom before scroll', () => {
    cy.get('[data-testid="list-events"]')
      .invoke('text')
      .should((text) => {
        expect(text.split('|').filter((value) => value === 'short-bottom')).to.have.length(1);
        expect(text.split('|')).not.to.include('bottom');
        expect(text.split('|')).not.to.include('virtual-bottom');
      });
    cy.get('[data-testid="list-main"] .sd-list [data-overlayscrollbars-viewport]').scrollTo(
      'bottom',
    );
    cy.get('[data-testid="list-events"]').should('contain.text', 'bottom|scroll');
  });

  for (const kind of ['Modal', 'Drawer'])
    it(`preserves ${kind} content and lifecycle when moving its portal container`, () => {
      cy.contains('button', `Open moving ${kind}`).click();
      cy.get(`[aria-label="Moving ${kind} draft"]`)
        .type(' draft')
        .then((element) => ({ node: element[0] }))
        .as('movingInput', { type: 'static' });
      cy.get(`[data-testid="moving-${kind}-opens"]`).should('have.text', '1');
      cy.get(`#moving-${kind}-a`).should('have.css', 'overflow', 'hidden');
      cy.get(`#moving-${kind}-a .sd-${kind.toLowerCase()}-container`)
        .parent()
        .then((host) => ({ node: host[0] }))
        .as('movingHost', { type: 'static' });
      cy.window().then((win) => win.dispatchEvent(new Event(`move-${kind}`)));
      cy.get(`#moving-${kind}-b input`)
        .should('have.value', 'initial draft')
        .then((element) =>
          cy
            .get('@movingInput')
            .then((saved) => expect(Reflect.get(saved, 'node')).to.equal(element[0])),
        );
      cy.get(`#moving-${kind}-a`).should('have.css', 'overflow', 'auto');
      cy.get(`#moving-${kind}-b`).should('have.css', 'overflow', 'hidden');
      cy.get(`[aria-label="Moving ${kind} draft"]`)
        .should('be.focused')
        .trigger('keydown', { key: 'Escape' });
      cy.get(`#moving-${kind}-b input`).should('not.exist');
      cy.get(`#moving-${kind}-b`).should('have.css', 'overflow', 'auto');
      cy.get(`[data-testid="moving-${kind}-opens"]`).should('have.text', '1');
      cy.window().then((win) =>
        win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'moving-unmount' } })),
      );
      cy.get('@movingHost').should((saved) =>
        expect(Reflect.get(saved, 'node').isConnected).to.equal(false),
      );
    });

  it('ignores a retained Modal hook API after owner unmount without leaking overlays', () => {
    cy.contains('button', 'Open hook modal').click();
    cy.contains('[role="dialog"]', 'Hook modal').should('be.visible');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'hook-unmount' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'late-hook' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
  });

  it('keeps controlled Modal open when updates are rejected and supports default and explicit contexts', () => {
    cy.contains('button', 'Open rejected modal').click();
    cy.get('[data-testid="modal-rejected"] .sd-modal-footer .sd-btn-primary').click();
    cy.get('[data-testid="modal-events"]').should('contain.text', 'rejected:false');
    cy.get('[data-testid="modal-rejected"]').should('be.visible');
    cy.get('[aria-label="Rejected input"]').trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="modal-rejected"]').should('not.be.visible');
    cy.contains('button', 'Open default modal').click();
    cy.contains('[role="dialog"]', 'Default content')
      .should('be.visible')
      .find('.sd-btn-primary')
      .click();
    cy.contains('[role="dialog"]', 'Default content').should('not.exist');
    cy.contains('button', 'Open context modal').click();
    cy.contains('[role="dialog"]', 'Context content').should('have.css', 'width', '310px');
    cy.contains('button', 'Context confirm').click();
    cy.contains('[role="dialog"]', 'Context content').should('not.exist');
  });
});

export {};
