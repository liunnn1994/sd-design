describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

  it('inherits avatar group shape and size and updates stacking and RTL overlap', () => {
    cy.get('[data-testid="avatar-group"] > .sd-avatar')
      .should('have.length', 3)
      .each(($avatar) => {
        expect($avatar).to.have.class('sd-avatar-square');
        expect($avatar[0].style.width).to.eq('32px');
      });
    cy.get('[data-testid="avatar-group"] > .sd-avatar')
      .eq(1)
      .should('have.css', 'margin-left', '-8px')
      .and('have.css', 'z-index', '3');
    cy.contains('button', '切换头像层级').click();
    cy.get('[data-testid="avatar-group"] > .sd-avatar').eq(1).should('have.css', 'z-index', '2');
    cy.contains('button', '切换头像 RTL').click();
    cy.get('[data-testid="avatar-group"]').should('have.class', 'sd-avatar-group-rtl');
    cy.get('[data-testid="avatar-group"] > .sd-avatar')
      .eq(1)
      .should('have.css', 'margin-right', '-8px')
      .and('have.css', 'margin-left', '0px');
  });

  it('shows overflow avatars in a popover and removes the overflow trigger when limits change', () => {
    cy.get('[data-testid="avatar-group"] .sd-avatar-group-max-count-avatar')
      .should('contain.text', '+2')
      .click();
    cy.get('.sd-avatar-group-popover > .sd-avatar').should('have.length', 2);
    cy.get('.sd-avatar-group-popover').should('contain.text', 'C').and('contain.text', 'D');
    cy.get('.sd-avatar-group-popover > .sd-avatar')
      .eq(1)
      .should(($avatar) =>
        expect(parseFloat(getComputedStyle($avatar[0]).marginLeft)).to.be.greaterThan(0),
      );
    cy.contains('button', '切换头像数量限制').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-group-max-count-avatar').should('not.exist');
    cy.get('[data-testid="avatar-group"] > .sd-avatar').should('have.length', 4);
    cy.get('.sd-avatar-group-popover').should('not.exist');
  });

  it('applies group font scaling preferences to child avatars', () => {
    cy.get('[data-testid="avatar-group"] .sd-avatar-text')
      .first()
      .should(($text) => expect($text[0].style.transform).to.eq(''));
    cy.contains('button', '启用组字体缩放').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-text')
      .first()
      .should(($text) => expect($text[0].style.transform).to.contain('scale('));
    cy.contains('button', '启用组字体缩放').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-text')
      .first()
      .should(($text) => expect($text[0].style.transform).to.eq(''));
  });

  it('renders interactive popover content and switches between custom and native scrolling', () => {
    cy.get('[data-testid="popover-trigger"]').click();
    cy.get('[data-testid="popover-trigger"]')
      .should('have.attr', 'aria-haspopup', 'true')
      .and('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-popover-title strong').should('have.text', '弹出标题');
    cy.get('.sd-popover .sd-scrollbar-type-track .os-scrollbar-vertical').should('exist');
    cy.contains('button', '弹层内计数').click();
    cy.get('[data-testid="popover-count"]').should('have.text', '1');
    cy.contains('button', '切换弹层滚动').click();
    cy.get('.sd-popover .sd-scrollbar').should('not.exist');
    cy.get('.sd-popover-content').should('contain.text', '弹层内计数');
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-popover').should('not.exist');
  });

  it('waits for controlled popover writeback and initializes default visibility on mount', () => {
    cy.contains('button', '拒绝打开 Popover').click();
    cy.get('[data-testid="popover-requests"]').should('have.text', '1');
    cy.contains('.sd-popover-content', '受控内容').should('not.exist');
    cy.contains('button', '挂载默认打开').click();
    cy.contains('.sd-popover-content', '默认打开内容').should('be.visible');
    cy.contains('button', '挂载默认打开').click();
    cy.contains('.sd-popover-content', '默认打开内容').should('not.exist');
  });

  it('keeps parent popovers open while interacting with nested portals', () => {
    let scrollY = 0;
    // The shared page's initial menu expansion changes document height and scroll anchoring.
    cy.get('[data-testid="menu-basic"], [data-testid="menu-dynamic"]')
      .find('.sd-menu-inline-content')
      .filter(':visible')
      .should('have.length', 2)
      .should(($contents) => {
        $contents.each((_, element) => {
          expect(element.style.height).to.equal('');
        });
      });
    cy.contains('button', '打开父 Popover').click({ scrollBehavior: 'center' });
    cy.window()
      .its('scrollY')
      .then((value) => {
        scrollY = value;
      });
    cy.contains('button', '打开子 Popover').should('be.visible').click({ scrollBehavior: false });
    cy.contains('.sd-popover-content', '嵌套 Popover 内容')
      .should('be.visible')
      .click({ scrollBehavior: false });
    cy.window()
      .its('scrollY')
      .should((value) => expect(value).to.equal(scrollY));
    cy.get('.sd-popover').should('have.length', 2);
    cy.contains('button', '打开父 Popover').click();
    cy.get('.sd-popover').should('not.exist');
  });

  it('preserves keyed wrap item elements when the expanded list is reordered', () => {
    cy.contains('button', '展开所有项目').click();
    cy.get('[data-testid="wrap"] [data-part="item"]')
      .should('have.length', 12)
      .first()
      .then(($first) => {
        const first = $first[0];
        cy.contains('button', '反转项目顺序').click();
        cy.get('[data-testid="wrap"] [data-part="item"]')
          .last()
          .should(($last) => {
            expect($last[0]).to.eq(first);
            expect($last.text()).to.eq('Item 1');
          });
      });
  });

  it('fits whole wrap items, reports hidden items and expands through ref controls', () => {
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="wrap"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49),
    );
    cy.get('[data-testid="wrap"] [data-part="item"]:visible')
      .its('length')
      .then((count) => {
        cy.get('[data-testid="wrap"] [data-part="after"]').should(
          'have.text',
          `还有 ${12 - count} 项`,
        );
      });
    cy.contains('button', '展开所有项目').click();
    cy.get('[data-testid="wrap"] [data-part="item"]:visible').should('have.length', 12);
    cy.contains('button', '折叠项目').click();
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="wrap"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49),
    );
  });

  it('recomputes wrap item counts for a wider container and a replacement list', () => {
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="wrap"]').should(($root) => {
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49);
      expect($root.find('[data-part="item"]:visible')).to.have.length(5);
    });
    cy.contains('button', '改变项目宽度').click();
    cy.get('[data-testid="wrap"]').should('have.css', 'width', '460px');
    cy.get('[data-testid="wrap"] [data-part="item"]:visible').should('have.length', 12);
    cy.contains('button', '改变项目数量').click();
    cy.get('[data-testid="wrap"] [data-part="item"]:visible').should('have.length', 2);
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'false');
    cy.get('[data-testid="wrap"] [data-part="after"]').should('have.text', '还有 0 项');
  });

  it('keeps controlled wrap expansion unchanged until the parent writes back', () => {
    cy.contains('button', '拒绝展开').click();
    cy.get('[data-testid="wrap-requests"]').should('have.text', '1');
    cy.get('[data-testid="wrap-controlled"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49),
    );
    cy.get('[data-testid="wrap-controlled"] [data-part="item"]:visible').should(($items) =>
      expect($items.length).to.be.lessThan(12),
    );
  });

  it('clamps inline filename bodies while preserving affixes through resize and source replacement', () => {
    cy.get('[data-testid="inline-split"] [data-part="start"]').should('have.text', '/docs/');
    cy.get('[data-testid="inline-split"] [data-part="end"]').should('have.text', '.pdf');
    cy.get('[data-testid="inline-split"] [data-part="body"]')
      .should('have.attr', 'aria-hidden', 'true')
      .and('contain.text', '…');
    cy.get('[data-testid="inline-split"] [data-part="body"]')
      .invoke('text')
      .then((initial) => {
        cy.contains('button', '切换文本宽度').click();
        cy.get('[data-testid="inline-split"] [data-part="body"]').should(($body) =>
          expect($body.text().length).to.be.greaterThan(initial.length),
        );
      });
    cy.contains('button', '切换纯文本').click();
    cy.get('[data-testid="inline-split"] [data-part="body"]')
      .should('have.text', 'Short')
      .and('not.have.attr', 'aria-hidden');
    cy.get('[data-testid="inline-native"] [data-part="body"]').should(
      'have.css',
      'text-overflow',
      'ellipsis',
    );
  });

  it('measures plain line limits and resets when source text changes', () => {
    cy.get('[data-testid="line-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="line-native"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(41),
    );
    cy.contains('button', '展开纯文本').click();
    cy.get('[data-testid="line-native"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(80),
    );
    cy.contains('button', '收起纯文本').click();
    cy.get('[data-testid="line-clamped"]').should('have.text', 'true');
    cy.contains('button', '切换纯文本').click();
    cy.get('[data-testid="line-native"] [data-part="body"]').should('have.text', 'Short');
    cy.get('[data-testid="line-clamped"]').should('have.text', 'false');
  });

  it('preserves accessible source text while truncating the middle and expanding affix controls', () => {
    cy.get('[data-testid="line-middle"] [aria-hidden="true"]')
      .should('contain.text', '[cut]')
      .and('contain.text', 'START')
      .and('contain.text', 'END');
    cy.get('[data-testid="line-middle"] [data-part="body"] > span:not([aria-hidden])').should(
      'contain.text',
      'unicode families.',
    );
    cy.contains('button', '展开中部').click();
    cy.get('[data-testid="line-middle"] [aria-hidden="true"]').should('not.exist');
    cy.get('[data-testid="line-middle"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(80),
    );
    cy.contains('button', '折叠中部').click();
    cy.get('[data-testid="line-middle"] [aria-hidden="true"]').should('contain.text', '[cut]');
  });

  it('recomputes start truncation on resize and honors a height-only limit', () => {
    cy.get('[data-testid="line-height"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(41),
    );
    cy.get('[data-testid="line-start"] [aria-hidden="true"]')
      .should('contain.text', '[cut]')
      .and('contain.text', 'END')
      .and('not.contain.text', 'START')
      .invoke('text')
      .then((initial) => {
        cy.contains('button', '切换文本宽度').click();
        cy.get('[data-testid="line-start"] [aria-hidden="true"]').should(($text) =>
          expect($text.text().length).to.be.greaterThan(initial.length),
        );
      });
  });

  it('forwards button focus to ellipsis and preserves explicit tooltip precedence', () => {
    cy.get('[data-testid="ellipsis-button"]').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '按钮长文本在键盘聚焦时显示省略提示');
    cy.get('[data-testid="ellipsis-button"]').should('have.focus').blur();
    cy.get('[data-testid="override-button"]').focus();
    cy.get('[role="tooltip"]')
      .should('have.length', 1)
      .and('contain.text', '完整按钮提示')
      .and('not.contain.text', '不应出现的省略提示');
  });

  it('preserves Chinese spacing after activating the button measurement', () => {
    cy.get('[data-testid="spaced-button"]').focus();
    cy.get('[data-testid="spaced-button"] [data-ellipsis-measure]').should('exist');
    cy.get('[data-testid="normal-link"]').click();
    cy.get('[data-testid="spaced-button"]').should('have.class', 'sd-btn-two-chinese-chars');
  });

  it('supports tag custom tooltips with and without ellipsis and expands multiline text', () => {
    cy.get('[data-testid="custom-tag"] .sd-tag-text').trigger('mouseover');
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', '标签自定义提示');
    cy.get('[data-testid="custom-tag"] .sd-tag-text').trigger('mouseout');
    cy.get('[data-testid="plain-tag"] .sd-tag-text').trigger('mouseover');
    cy.get('[role="tooltip"]').should('contain.text', '无省略提示');
    cy.get('[data-testid="plain-tag"] .sd-tag-text').trigger('mouseout');
    cy.get('[data-testid="disabled-tooltip-tag"] .sd-tag-text').trigger('mouseover');
    cy.get('[role="tooltip"]').should('not.exist');
    cy.get('[data-testid="multiline-tag"]').should('have.class', 'sd-tag-ellipsis-line-clamp');
    cy.get('[data-testid="multiline-tag"] .sd-ellipsis').click();
    cy.get('[data-testid="multiline-tag"] .sd-ellipsis').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
  });

  it('blocks disabled and loading link actions and retains icon and overflow hints', () => {
    cy.get('[data-testid="disabled-link"]').should('not.have.attr', 'href');
    cy.get('[data-testid="disabled-link"]').click();
    cy.get('[data-testid="loading-link"]').click();
    cy.location('hash').should('eq', '');
    cy.get('[data-testid="link-clicks"]').should('have.text', '0');
    cy.get('[data-testid="normal-link"]').click();
    cy.location('hash').should('eq', '#allowed');
    cy.get('[data-testid="link-clicks"]').should('have.text', '1');
    cy.get('[data-testid="icon-link"]')
      .should('have.class', 'sd-link-icon-only')
      .find('.sd-link-icon > span')
      .trigger('mouseover');
    cy.get('[role="tooltip"]').should('contain.text', '图标说明');
    cy.get('[data-testid="icon-link"] .sd-link-icon > span').trigger('mouseout');
    cy.get('[data-testid="ellipsis-link"] .sd-link-content').trigger('mouseover');
    cy.get('[role="tooltip"]').should('contain.text', '链接长文本内容在悬浮时完整显示');
  });

  it('activates lazy ellipsis on hover and replays its initial interaction', () => {
    cy.get('[data-testid="lazy-hover"] [data-ellipsis-measure]').should('not.exist');
    cy.get('[data-testid="lazy-hover"]').trigger('mouseover');
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '延迟激活的省略提示包含完整文本内容');
  });

  it('expands lazy ellipsis on its first click', () => {
    cy.get('[data-testid="lazy-click"]').click();
    cy.get('[data-testid="lazy-clicks"]').should('have.text', '1');
    cy.get('[data-testid="lazy-click"]').should('have.attr', 'aria-expanded', 'true');
  });

  it('forwards external focus without moving focus away from the native control', () => {
    cy.contains('button', '转交焦点提示').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '外部控件聚焦时显示完整省略内容');
    cy.contains('button', '转交焦点提示').should('have.focus').blur();
    cy.get('[role="tooltip"]').should('not.exist');
  });

  it('omits empty render-function affixes', () => {
    cy.get('[data-testid="empty-affix"] [data-part="before"]').should('not.exist');
    cy.get('[data-testid="empty-affix"] [data-part="after"]').should('not.exist');
  });

  it('keeps Ellipsis triggerRef and triggerElement on the current native root', () => {
    cy.visit('/?ellipsis-ref-alias');
    cy.contains('button', '读取省略引用').click();
    cy.get('[data-testid="ellipsis-ref-status"]').should('have.text', 'true:SPAN');
    cy.contains('button', '切换省略容器').click();
    cy.contains('button', '读取省略引用').click();
    cy.get('[data-testid="ellipsis-ref-status"]').should('have.text', 'true:DIV');
  });

  it('measures ellipsis, exposes native titles and expands through keyboard interaction', () => {
    cy.get('[data-testid="native-ellipsis"]').should(
      'have.attr',
      'title',
      '关闭气泡时应使用原生标题提示完整内容',
    );
    cy.get('[data-testid="single-ellipsis"]').should('have.attr', 'role', 'button').focus();
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', '这是很长的富文本省略内容');
    cy.get('[data-testid="single-ellipsis"]').trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="single-ellipsis"]').should('have.attr', 'aria-expanded', 'true');
    cy.get('[role="tooltip"]').should('not.exist');
    cy.get('[data-testid="single-ellipsis"]').trigger('keydown', { key: ' ' });
    cy.get('[data-testid="single-ellipsis"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="multi-ellipsis"]')
      .should('have.attr', 'role', 'button')
      .should(($root) => expect($root[0].getBoundingClientRect().height).to.be.at.most(41));
    cy.get('[data-testid="multi-ellipsis"]').click();
    cy.get('[data-testid="multi-ellipsis"]')
      .should('have.attr', 'aria-expanded', 'true')
      .should(($root) => expect($root[0].getBoundingClientRect().height).to.be.greaterThan(60));
  });

  it('keeps unsafe rich probe content unmodified instead of cloning active form controls', () => {
    cy.get('[data-testid="rich-unsafe-clamp"]').should('not.contain.text', '[more]');
    cy.get('[data-testid="rich-unsafe-clamp"] button[type="submit"]')
      .should('have.length', 1)
      .and('have.text', '保留原始按钮');
  });

  it('measures rich text, expands through its ref and recomputes after content replacement', () => {
    cy.get('[data-testid="rich-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="rich-clamp"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(41),
    );
    cy.contains('button', '展开富文本').click();
    cy.get('[data-testid="rich-clamp"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(60),
    );
    cy.contains('button', '收起富文本').click();
    cy.get('[data-testid="rich-clamped"]').should('have.text', 'true');
    cy.contains('button', '改变富文本').click();
    cy.get('[data-testid="rich-clamp"] em').should('have.text', 'Short');
    cy.get('[data-testid="rich-clamped"]').should('have.text', 'false');
  });

  it('preserves rich affix controls during custom-ellipsis measurement and controlled expansion', () => {
    cy.get('[data-testid="rich-custom-clamp"]').should('contain.text', '[more]');
    cy.contains('button', '展开自定义').click();
    cy.get('[data-testid="rich-custom-clamp"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(60),
    );
    cy.contains('button', '收起自定义').click();
    cy.get('[data-testid="rich-custom-clamp"]').should('contain.text', '[more]');
  });

  it('supports button tooltips and gives custom tooltip content precedence', () => {
    cy.contains('button', '带提示按钮').focus();
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', '按钮提示内容');
    cy.contains('button', '带提示按钮').blur();
    cy.contains('button', '自定义提示按钮').focus();
    cy.get('[role="tooltip"]')
      .should('contain.text', '覆盖提示内容')
      .and('not.contain.text', '原始提示');
  });

  it('scrolls through the shared scrollbar API and preserves React child updates', () => {
    cy.get('[data-testid="scrollbar"] .os-scrollbar-vertical').should('exist');
    cy.contains('button', '滚动到 80').click();
    cy.get('[data-testid="scrollbar"] [data-overlayscrollbars-viewport]').should(($viewport) =>
      expect($viewport[0].scrollTop).to.eq(80),
    );
    cy.get('[data-testid="scroll-events"]').should(($output) =>
      expect(Number($output.text())).to.be.greaterThan(0),
    );
    cy.contains('button', '改变滚动内容').click();
    cy.get('[data-testid="scrollbar"] p').should('have.length', 2);
    cy.contains('button', '改变滚动内容').click();
    cy.get('[data-testid="scrollbar"] p').should('have.length', 10);
    cy.contains('button', '切换滚动条类型').click();
    cy.get('[data-testid="scrollbar"] .sd-scrollbar-theme-track').should('exist');
  });

  it('connects tooltip descriptions and allows interaction when content overflows', () => {
    cy.contains('button', '普通提示').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '普通提示内容')
      .and('have.class', 'sd-tooltip-mouse-through');
    cy.contains('button', '普通提示').should('have.attr', 'aria-describedby');
    cy.contains('button', '普通提示').blur();
    cy.get('[role="tooltip"]').should('not.exist');
    cy.contains('button', '溢出提示').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '溢出提示内容')
      .and('not.have.class', 'sd-tooltip-mouse-through');
    cy.contains('button', '溢出提示').blur();
    cy.contains('button', '锁定提示').focus();
    cy.contains('受控拒绝提示').should('not.exist');
  });

  it('finishes popup enter and leave animations before firing lifecycle callbacks', () => {
    cy.contains('button', '动画弹层').click();
    cy.contains('动画弹层内容').should('be.visible');
    cy.get('[data-testid="trigger-animation-events"]').should('have.text', 'S');
    cy.contains('button', '动画弹层').click();
    cy.get('[data-testid="trigger-animation-events"]').should('have.text', 'SH');
    cy.contains('动画弹层内容').should('not.exist');
  });

  it('opens context menus at the pointer and dismisses on an outside context menu', () => {
    cy.contains('button', '右键弹层').trigger('contextmenu', { clientX: 400, clientY: 200 });
    cy.contains('.sd-trigger-popup', '右键弹层内容')
      .should('be.visible')
      .should(($popup) => {
        const rect = $popup[0].getBoundingClientRect();
        expect(Math.abs(rect.top - 200)).to.be.lessThan(1);
        expect(Math.abs(rect.left + rect.width / 2 - 400)).to.be.lessThan(1);
      });
    cy.document().then((document) =>
      document.body.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, clientX: 2, clientY: 2 }),
      ),
    );
    cy.contains('右键弹层内容').should('not.exist');
  });

  it('opens click triggers, connects ARIA and closes on Escape or outside click', () => {
    cy.contains('button', '点击弹层').click();
    cy.get('.sd-trigger-popup[role="dialog"]')
      .should('be.visible')
      .and('contain.text', '点击弹层内容');
    cy.contains('button', '点击弹层')
      .should('have.attr', 'aria-expanded', 'true')
      .invoke('attr', 'aria-controls')
      .then((id) => cy.get(`[id="${id}"]`).should('have.attr', 'role', 'dialog'));
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-trigger-popup[role="dialog"]').should('not.exist');
    cy.contains('button', '点击弹层').click();
    cy.get('body').click(1, 1);
    cy.get('.sd-trigger-popup[role="dialog"]').should('not.exist');
  });

  it('waits for controlled popup writeback and keeps nested portal clicks inside the parent', () => {
    cy.contains('button', '锁定弹层').click();
    cy.contains('拒绝写回内容').should('not.exist');
    cy.get('[data-testid="trigger-requests"]').should('have.text', '1');
    cy.contains('button', '受控弹层').click();
    cy.contains('受控弹层内容').should('be.visible');
    cy.contains('button', '外层弹层').click();
    cy.contains('button', '内层弹层').click();
    cy.contains('嵌套弹层内容').click();
    cy.contains('button', '内层弹层').should('be.visible');
    cy.contains('嵌套弹层内容').should('be.visible');
    cy.get('body').click(1, 1);
    cy.contains('嵌套弹层内容').should('not.exist');
  });

  it('honors delayed hover and immediate focus transitions', () => {
    cy.clock();
    cy.contains('button', '悬浮弹层').trigger('mouseover');
    cy.tick(99);
    cy.contains('悬浮弹层内容').should('not.exist');
    cy.tick(1);
    cy.contains('悬浮弹层内容').should('be.visible');
    cy.contains('button', '悬浮弹层').trigger('mouseout');
    cy.tick(100);
    cy.contains('悬浮弹层内容').should('not.exist');
    cy.contains('button', '悬浮弹层').focus();
    cy.contains('悬浮弹层内容').should('be.visible');
    cy.contains('button', '悬浮弹层').blur();
    cy.contains('悬浮弹层内容').should('not.exist');
  });

  it('flips the shared floating placement at the viewport boundary', () => {
    cy.get('[data-testid="floating-reference"]')
      .invoke('css', { position: 'fixed', bottom: '2px', right: '2px' })
      .click();
    cy.get('[data-testid="floating-popup"]')
      .should('have.attr', 'data-placement', 'top')
      .should(($popup) => {
        const rect = $popup[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(8);
        expect(rect.right).to.be.at.most($popup[0].ownerDocument.documentElement.clientWidth - 8);
        expect($popup[0].style.getPropertyValue('--sd-trigger-available-height')).to.match(/px$/);
      });
  });

  it('positions floating content and updates its alignment after reference resize', () => {
    cy.get('[data-testid="floating-reference"]').click();
    cy.get('[data-testid="floating-popup"]')
      .should('be.visible')
      .should('have.attr', 'data-placement', 'bottom');
    const aligned = () =>
      cy.get('[data-testid="floating-popup"]').should(($popup) => {
        const popup = $popup[0].getBoundingClientRect();
        const reference = $popup[0].ownerDocument
          .querySelector('[data-testid="floating-reference"]')!
          .getBoundingClientRect();
        expect(Math.abs(popup.top - reference.bottom - 10)).to.be.lessThan(1);
        expect(
          Math.abs(popup.left + popup.width / 2 - reference.left - reference.width / 2),
        ).to.be.lessThan(1);
      });
    aligned();
    cy.contains('button', '改变锚点宽度').click();
    aligned();
    cy.get('[data-testid="floating-reference"]').click();
    cy.get('[data-testid="floating-popup"]').should('not.exist');
  });

  it('updates badge counts and dots while preserving the status indicator', () => {
    cy.get('[data-testid="count-badge"] .sd-badge-status-success').should('exist');
    cy.get('[data-testid="count-badge"] [role="img"]').should('have.attr', 'aria-label', '9');
    cy.contains('button', '增加数值').click();
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="count-badge"] [role="img"]').should('have.attr', 'aria-label', '10+');
    cy.get('[data-testid="dot-badge"] [role="status"]').should('have.attr', 'aria-label', '11');
  });

  it('synchronizes changed number-flow group members and leaves unchanged members idle', () => {
    cy.get('[data-testid="group-first"]').should('have.class', 'sd-number-flow-animated');
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="number-group"]').should(($group) => {
      expect($group.find('.sd-number-flow-animating')).to.have.length(2);
      expect($group.find('[data-testid="group-unchanged"]')).not.to.have.class(
        'sd-number-flow-animating',
      );
    });
    cy.get('[data-testid="group-first"]').should('have.attr', 'aria-label', '10');
    cy.get('[data-testid="group-second"]').should('have.attr', 'aria-label', '20');
    cy.get('[data-testid="number-group"] .sd-number-flow-animating').should('not.exist');
  });

  it('cancels the prior number-flow completion timer when a new value arrives', () => {
    cy.get('[data-testid="number-flow"]').should('have.class', 'sd-number-flow-animated');
    cy.clock();
    cy.contains('button', '增加数值').click();
    cy.tick(100);
    cy.contains('button', '增加数值').click();
    cy.tick(51);
    cy.get('[data-testid="number-events"]').should('have.text', 'SS');
    cy.get('[data-testid="number-flow"]')
      .should('have.attr', 'aria-label', '11')
      .should('have.class', 'sd-number-flow-animating');
    cy.tick(100);
    cy.get('[data-testid="number-events"]').should('have.text', 'SSF');
  });

  it('animates changed digits and finishes without animating disabled instances', () => {
    cy.get('[data-testid="number-flow"]').should('have.class', 'sd-number-flow-animated');
    cy.clock();
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="number-flow"]')
      .should('have.attr', 'aria-label', '10')
      .should('have.class', 'sd-number-flow-animating');
    cy.get('[data-testid="number-flow"] .sd-number-flow-digit-value').should(
      'have.length.greaterThan',
      2,
    );
    cy.get('[data-testid="static-number-flow"]')
      .should('have.attr', 'aria-label', '10')
      .should('not.have.class', 'sd-number-flow-animating');
    cy.tick(151);
    cy.get('[data-testid="number-flow"]').should('not.have.class', 'sd-number-flow-animating');
    cy.get('[data-testid="number-events"]').should('have.text', 'SF');
    cy.get('[data-testid="number-flow"] .sd-number-flow-digit-value').should('have.length', 2);
  });
});

export {};
