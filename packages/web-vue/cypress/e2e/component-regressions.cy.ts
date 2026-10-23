describe('Documentation component regressions', () => {
  it('keeps KvList row edits and its JSON model synchronized', () => {
    cy.visit('/components/kv-list/');
    cy.get('.sd-kv-list', { timeout: 15000 }).first().as('kvList');
    cy.get('@kvList').find('.sd-kv-list-value input').first().type('-review');
    cy.get('@kvList').parent().find('pre').should('contain.text', 'cn-north-review');
    cy.get('@kvList').find('.sd-kv-list-key input').first().should('have.value', 'region');
  });

  it('restores the PanelGroup demo size after canceling a drag', () => {
    cy.visit('/components/panel-group/');
    cy.get('.single-panel-demo > .sd-panel-group > .sd-panel', { timeout: 15000 })
      .as('widthPanel')
      .should('have.css', 'width', '500px');
    cy.get('@widthPanel')
      .children('.sd-panel-separator-edge')
      .find('.sd-panel-separator-grip')
      .then(($grip) => {
        const rect = $grip[0].getBoundingClientRect();
        const point = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          pointerId: 1,
          button: 0,
        };
        cy.wrap($grip).trigger('pointerdown', point);
        cy.wrap($grip).trigger('pointermove', { ...point, clientX: point.clientX - 60 });
        cy.get('@widthPanel').should('have.css', 'width', '440px');
        cy.wrap($grip).trigger('pointercancel', point);
      });
    cy.get('@widthPanel').should('have.css', 'width', '500px');
  });

  it('switches the ThemeProvider demo mode without changing the page mode', () => {
    cy.visit('/components/theme-provider/');
    cy.get('.theme-provider-demo', { timeout: 15000 }).first().as('themeDemo');
    cy.get('body')
      .invoke('attr', 'sd-theme')
      .then((pageMode) => {
        for (const mode of ['light', 'dark']) {
          cy.get('@themeDemo')
            .contains('.sd-radio-button', mode === 'light' ? 'Light' : 'Dark')
            .click();
          cy.get('@themeDemo').find('.sd-theme-provider').should('have.attr', 'sd-theme', mode);
          cy.get('body').should(($body) => expect($body.attr('sd-theme')).to.equal(pageMode));
        }
      });
  });
  it('clears a canceled Calendar touch drag without creating an event', () => {
    cy.visit('/components/calendar/');
    cy.get('.sd-calendar', { timeout: 15000 }).first().as('calendar');
    cy.get('@calendar')
      .find('.sd-calendar__event')
      .its('length')
      .then((initialCount) => {
        cy.clock(undefined, ['setTimeout', 'clearTimeout']);
        cy.get('@calendar')
          .find('.sd-calendar__cell')
          .first()
          .then(($cell) => {
            const rect = $cell[0].getBoundingClientRect();
            cy.wrap($cell).trigger('touchstart', {
              force: true,
              touches: [{ target: $cell[0], clientX: rect.left + 20, clientY: rect.top + 40 }],
            });
            cy.tick(500);
            cy.document().trigger('touchmove', {
              touches: [{ target: $cell[0], clientX: rect.left + 20, clientY: rect.top + 120 }],
            });
          });
        cy.get('@calendar').should('have.class', 'sd-calendar--dragging-cell');
        cy.document().trigger('touchcancel');
        cy.tick(1200);
        cy.get('@calendar').should('not.have.class', 'sd-calendar--dragging-cell');
        cy.get('@calendar').find('.sd-calendar__event').should('have.length', initialCount);
        cy.get('@calendar')
          .find('.sd-calendar__title')
          .invoke('text')
          .then((title) => {
            cy.get('@calendar').find('.sd-calendar__nav--next').click();
            cy.get('@calendar').find('.sd-calendar__title').should('not.have.text', title);
          });
      });
  });

  it('keeps the Affix button fixed while the documentation page scrolls', () => {
    cy.visit('/components/affix/');
    cy.contains('button', 'Affix Top', { timeout: 15000 })
      .should('be.visible')
      .then(($button) => {
        const top = $button[0].getBoundingClientRect().top;
        cy.window().then((win) => win.scrollBy(0, top + 100));
      });
    cy.contains('button', 'Affix Top')
      .parent()
      .should('have.class', 'sd-affix')
      .and('have.css', 'position', 'fixed')
      .and('have.css', 'top', '0px');
    cy.window().then((win) => win.scrollTo(0, 0));
    cy.contains('button', 'Affix Top').parent().should('not.have.class', 'sd-affix');
  });

  it('constrains scrollbar demo height', () => {
    cy.visit('/components/scrollbar/');
    cy.get('.sd-scrollbar-container', { timeout: 15000 })
      .first()
      .should('have.css', 'height', '200px');
    cy.get('.os-scrollbar-vertical').first().should('be.visible');
  });
  it('constrains verification code width', () => {
    cy.visit('/components/verification-code/');
    cy.get('.sd-verification-code').first().should('have.css', 'width', '300px');
  });
  it('loads an editable cropper image', () => {
    cy.visit('/components/cropper/');
    cy.get('cropper-canvas').first().should('be.visible');
    cy.get('cropper-image')
      .first()
      .shadow()
      .find('img')
      .should(($img) => {
        expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      });
    cy.get('cropper-selection').first().should('be.visible');
  });
  it('renders gradient stops with valid colors', () => {
    cy.visit('/components/progress/');
    cy.contains('h3, h2', '渐变进度条').scrollIntoView();
    cy.get('linearGradient stop')
      .should('have.length.at.least', 2)
      .each(($stop) => {
        expect(getComputedStyle($stop[0]).stopColor).not.to.equal('rgb(0, 0, 0)');
      });
  });
  it('keeps the light VoiceGlow card light', () => {
    cy.visit('/components/voice-glow/');
    cy.get('.voice-glow-card-light').should('have.css', 'background-color', 'rgb(255, 255, 255)');
  });
  for (const [label, selector] of [
    ['预览视频', '.sd-file-previewer-video-player'],
    ['预览音频', '.sd-file-previewer-audio-player'],
    ['预览 PDF', '.sd-file-previewer-pdf-canvas'],
  ]) {
    it(`loads ${label}`, () => {
      cy.visit('/components/file-previewer/');
      cy.contains('h2, h3', '视频、音频和 PDF').scrollIntoView();
      cy.contains('button', label, { timeout: 15000 }).click();
      cy.get(selector, { timeout: 30000 }).should('be.visible');
      cy.get('.sd-file-previewer-error').should('not.exist');
    });
  }
  it('keeps nested layouts vertical and the fixed header visible while scrolling', () => {
    cy.visit('/components/layout/');
    cy.get('.layout-basic-item')
      .should('have.length', 4)
      .each(($item, index) => {
        expect(getComputedStyle($item[0]).flexDirection).to.equal(index === 3 ? 'row' : 'column');
      });
    cy.contains('h2, h3', '固定布局').scrollIntoView();
    cy.get('.layout-fixed-demo')
      .should('have.css', 'height', '360px')
      .then(($layout) => {
        const header = $layout.find('.header')[0];
        const top = header.getBoundingClientRect().top;
        cy.wrap($layout).scrollTo(0, 160);
        cy.get('.layout-fixed-demo .header').should(($header) =>
          expect($header[0].getBoundingClientRect().top).to.be.closeTo(top, 1),
        );
      });
  });
  it('gives InputTag status examples enough width', () => {
    cy.visit('/components/input-tag/');
    cy.contains('h2, h3', '输入框状态').scrollIntoView();
    cy.get('.sd-input-tag-disabled').should('have.css', 'width', '320px');
  });
  for (const component of ['popconfirm', 'tooltip', 'popover']) {
    it(`aligns the ${component} position examples`, () => {
      cy.visit(`/components/${component}/`);
      cy.contains('h2, h3', component === 'tooltip' ? '位置' : '弹出位置').scrollIntoView();
      cy.contains('button', /^TOP$/)
        .should('be.visible')
        .then(($top) => {
          const y = $top[0].getBoundingClientRect().top;
          cy.contains('button', /^TL$/).should(($left) =>
            expect($left[0].getBoundingClientRect().top).to.equal(y),
          );
          cy.contains('button', /^TR$/).should(($right) =>
            expect($right[0].getBoundingClientRect().top).to.equal(y),
          );
        });
    });
  }
  for (const component of ['checkbox', 'radio']) {
    it(`shows the selected ${component} card style`, () => {
      cy.visit(`/components/${component}/`);
      cy.contains(
        'h2, h3',
        component === 'checkbox' ? '自定义复选框' : '自定义单选框',
      ).scrollIntoView();
      cy.get(`.custom-${component}-card`).last().click();
      cy.get(`.custom-${component}-card-checked`)
        .should('exist')
        .and('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    });
  }
  it('gives Trigger content an opaque background', () => {
    cy.visit('/components/trigger/');
    cy.contains('h2, h3', '基本用法').scrollIntoView();
    cy.contains('span', 'Hover Me')
      .closest('.sd-space')
      .within(() => {
        cy.contains('button', 'Click Me').click();
      });
    cy.get('.sd-trigger-popup .demo-basic')
      .filter(':visible')
      .should('be.visible')
      .and('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
  });
  it('shows a sender and submits the selected switches', () => {
    cy.visit('/components/sender/');
    cy.contains('h2, h3', '功能开关').scrollIntoView();
    cy.get('textarea[placeholder="输入问题，选择回答模式"]', { timeout: 20000 })
      .should('be.visible')
      .parents('.sd-sender')
      .first()
      .within(() => {
        cy.contains('快速回答').click();
        cy.contains('联网搜索').click();
        cy.get('button').filter('[aria-label="发送"]').click();
      });
    cy.contains('.sd-alert', '深度思考 · 联网搜索').should('be.visible');
  });
});
