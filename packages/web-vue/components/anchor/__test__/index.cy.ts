import Anchor from '../index';

describe('Anchor', () => {
  // URL hash 和窗口滚动会在同一 spec 文件的测试间残留，先复位保证确定性
  beforeEach(() => {
    cy.window().then((win) => {
      win.scrollTo(0, 0);
      win.location.hash = '';
    });
  });

  const twoLinks =
    '<sd-anchor-link href="#anchor1">Anchor1</sd-anchor-link>' +
    '<sd-anchor-link href="#anchor2">Anchor2</sd-anchor-link>';

  it('should emit change & select on link click', () => {
    cy.mount(Anchor, { slots: { default: twoLinks } });
    cy.get('a').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['#anchor1']);
      expect(wrapper.emitted('select')?.[0]).to.deep.equal(['#anchor1', '#anchor1']);
    });
  });

  it('exposes navigation role and aria-current on the active link', () => {
    cy.mount(Anchor, { slots: { default: twoLinks } });
    cy.get('.sd-anchor').should('have.attr', 'role', 'navigation');
    cy.get('a').first().click();
    // 点击后该链接成为当前锚点 → aria-current=location
    cy.get('a').first().should('have.attr', 'aria-current', 'location');
  });

  it('updates the page hash on link click by default', () => {
    cy.mount(Anchor, { slots: { default: twoLinks } });
    cy.get('a').eq(1).click();
    cy.location('hash').should('equal', '#anchor2');
    // 前一个活动链接失去 aria-current
    cy.get('a')
      .first()
      .should(($a) => {
        expect($a.attr('aria-current')).to.equal(undefined);
      });
  });

  it('does not update the page hash when changeHash is false', () => {
    cy.mount(Anchor, {
      props: { changeHash: false },
      slots: { default: twoLinks },
    });
    cy.get('a').first().click();
    cy.location('hash').should('equal', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal(['#anchor1', '#anchor1']);
    });
    cy.get('.sd-anchor-link-item').first().should('have.class', 'sd-anchor-link-active');
  });

  it('moves the line slider under the active link', () => {
    cy.mount(Anchor, { slots: { default: twoLinks } });
    cy.get('a').eq(1).click();
    cy.get('.sd-anchor-link-item')
      .eq(1)
      .then(($li) => {
        cy.get('.sd-anchor-line-slider').should(($slider) => {
          expect($slider[0].style.top).to.equal(`${$li[0].offsetTop}px`);
        });
      });
  });

  it('renders line-less mode without the line slider', () => {
    cy.mount(Anchor, {
      props: { lineLess: true },
      slots: { default: twoLinks },
    });
    cy.get('.sd-anchor-line-less').should('exist');
    cy.get('.sd-anchor-line-slider').should('not.exist');
  });

  it('applies the horizontal class when direction is horizontal', () => {
    cy.mount(Anchor, {
      props: { direction: 'horizontal' },
      slots: { default: twoLinks },
    });
    cy.get('.sd-anchor-horizontal').should('exist');
  });

  it('uses the default slot to override the link title', () => {
    cy.mount(Anchor, {
      slots: {
        default:
          '<sd-anchor-link href="#anchor1" title="Fallback">' +
          '<span class="cy-custom-text">Custom Text</span></sd-anchor-link>',
      },
    });
    cy.get('.cy-custom-text').should('have.text', 'Custom Text');
    cy.get('a').first().should('not.contain', 'Fallback');
  });

  it('renders nested links via the sublist slot and selects them on click', () => {
    cy.mount(Anchor, {
      slots: {
        default:
          '<sd-anchor-link href="#anchor1" title="Anchor1">' +
          '<template #sublist>' +
          '<sd-anchor-link href="#anchor1-1" title="Anchor1-1" />' +
          '</template></sd-anchor-link>',
      },
    });
    cy.get('.sd-anchor-sublist').should('exist');
    cy.get('.sd-anchor-sublist a').should('have.text', 'Anchor1-1');
    cy.get('.sd-anchor-sublist a').click();
    cy.get('@vue').should(({ wrapper }) => {
      const selectEvents = wrapper.emitted('select') ?? [];
      expect(selectEvents[selectEvents.length - 1]?.[0]).to.equal('#anchor1-1');
    });
    cy.get('.sd-anchor-sublist .sd-anchor-link-item').should('have.class', 'sd-anchor-link-active');
  });

  it('emits select with an undefined hash for a link without href', () => {
    cy.mount(Anchor, {
      slots: { default: '<sd-anchor-link title="NoHref"></sd-anchor-link>' },
    });
    cy.get('a').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([undefined, '']);
    });
  });

  // ---- 滚动行为 ----

  // 三个 section：0 / 300 / 1200（文档坐标），总高 1500px，默认视口 660px
  const scrollTemplate = (anchorAttrs = '') => `
    <div>
      <section id="cy-s1" style="height: 300px;"></section>
      <section id="cy-s2" style="height: 900px;"></section>
      <section id="cy-s3" style="height: 300px;"></section>
      <sd-anchor${anchorAttrs}>
        <sd-anchor-link href="#cy-s1" title="s1" />
        <sd-anchor-link href="#cy-s2" title="s2" />
        <sd-anchor-link href="#cy-s3" title="s3" />
      </sd-anchor>
    </div>
  `;

  it('tracks window scrolling and updates the active link', () => {
    cy.mount({ template: scrollTemplate(' :target-offset="150"') });
    // 程序化滚动在无焦点窗口不触发 scroll 事件，手动派发以驱动检测；
    // change 事件仅在点击时发出，滚动更新只反映在激活样式上
    cy.window().then((win) => {
      win.dispatchEvent(new win.Event('scroll'));
    });
    // 挂载时无 hash → 第一个 section 进入检测区
    cy.get('.sd-anchor-link-item').eq(0).should('have.class', 'sd-anchor-link-active');
    cy.window().then((win) => {
      win.scrollTo(0, 250);
      win.dispatchEvent(new win.Event('scroll'));
    });
    // 250px 时 s2 顶部（50px）落入 targetOffset 检测区 → s2 激活
    cy.get('.sd-anchor-link-item').eq(1).should('have.class', 'sd-anchor-link-active');
    cy.get('a[href="#cy-s2"]').should('have.attr', 'aria-current', 'location');
  });

  it('tracks scrolling within a custom scroll container', () => {
    cy.mount({
      template: `
        <div>
          <div class="cy-box" style="height: 200px; overflow: auto;">
            <div id="cy-c1" style="height: 300px;"></div>
            <div id="cy-c2" style="height: 300px;"></div>
            <div id="cy-c3" style="height: 300px;"></div>
          </div>
          <sd-anchor :scroll-container="'.cy-box'" :target-offset="100">
            <sd-anchor-link href="#cy-c1" title="c1" />
            <sd-anchor-link href="#cy-c2" title="c2" />
            <sd-anchor-link href="#cy-c3" title="c3" />
          </sd-anchor>
        </div>
      `,
    });
    cy.get('.cy-box').then(($box) => {
      $box[0].dispatchEvent(new Event('scroll'));
    });
    cy.get('.sd-anchor-link-item').eq(0).should('have.class', 'sd-anchor-link-active');
    cy.get('.cy-box').then(($box) => {
      $box[0].scrollTop = 250;
      $box[0].dispatchEvent(new Event('scroll'));
    });
    // 容器滚 250px 后 c2 顶部距容器顶 50px，落入 targetOffset=100 检测区
    cy.get('.sd-anchor-link-item').eq(1).should('have.class', 'sd-anchor-link-active');
  });

  it('clicking a link smooth-scrolls the window to the target section', () => {
    cy.mount({ template: scrollTemplate() });
    let s2DocTop = 0;
    cy.document().then((doc) => {
      const el = doc.getElementById('cy-s2');
      if (el) {
        s2DocTop = el.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0);
      }
    });
    cy.get('a[href="#cy-s2"]').click();
    // 平滑滚动 300ms + rAF 余量；should 会自动重试
    cy.wait(500);
    cy.window().should((win) => {
      expect(win.scrollY).to.be.closeTo(s2DocTop, 2);
    });
  });

  it('numeric boundary offsets the scroll target of a click', () => {
    cy.mount({ template: scrollTemplate(' :boundary="100"') });
    let s2DocTop = 0;
    cy.document().then((doc) => {
      const el = doc.getElementById('cy-s2');
      if (el) {
        s2DocTop = el.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0);
      }
    });
    cy.get('a[href="#cy-s2"]').click();
    // 数值 boundary 视为滚动偏移：目标位置 = section 顶部 - boundary
    cy.wait(500);
    cy.window().should((win) => {
      expect(win.scrollY).to.be.closeTo(s2DocTop - 100, 2);
    });
  });

  it('activates the link matching the initial location hash on mount', () => {
    cy.window().then((win) => {
      win.location.hash = '#cy-s2';
    });
    cy.mount({ template: scrollTemplate() });
    cy.window().then((win) => {
      win.dispatchEvent(new win.Event('scroll'));
    });
    cy.get('.sd-anchor-link-item').eq(1).should('have.class', 'sd-anchor-link-active');
  });
});
