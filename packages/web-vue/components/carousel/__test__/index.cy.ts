import Carousel from '../index';

const { Item } = Carousel;

const ITEMS = '<item v-for="it in 5" :key="it"><img/></item>';

const mountCarousel = (props: Record<string, unknown>) =>
  cy.mount(Carousel, {
    global: { components: { Item } },
    slots: { default: ITEMS },
    props,
    attrs: { style: 'width: 600px; height: 300px' },
  });

const activeIndicator = (index: number) =>
  cy
    .get('.sd-carousel-indicator-item')
    .eq(index)
    .should('have.class', 'sd-carousel-indicator-item-active');

describe('Carousel', () => {
  it('current prop sets the active indicator', () => {
    mountCarousel({ current: 3, autoPlay: false });
    activeIndicator(2);
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ current: 2 })));
    activeIndicator(1);
  });

  it('autoPlay advances the active item', () => {
    cy.clock();
    mountCarousel({ autoPlay: { interval: 50 } });
    cy.tick(10);
    activeIndicator(0);
    cy.tick(60);
    activeIndicator(1);
  });

  it('clicking the arrow switches the carousel', () => {
    mountCarousel({ autoPlay: false });
    activeIndicator(0);
    cy.get('.sd-carousel-arrow-right').click();
    activeIndicator(1);
  });

  it('clicking an indicator switches the carousel', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-indicator-item').eq(2).click({ force: true });
    activeIndicator(2);
  });

  it('is responsive to children change', () => {
    cy.mount({
      components: { Item, Carousel },
      props: { childrenCount: { type: Number } },
      template:
        '<carousel><item v-for="it in childrenCount" :key="it"><img class="carousel-item-image"/></item></carousel>',
      propsData: undefined,
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ childrenCount: 5 })));
    cy.get('.carousel-item-image').should('have.length', 5);
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ childrenCount: 1 })));
    cy.get('.carousel-item-image').should('have.length', 1);
  });

  it('hover pauses autoplay', () => {
    cy.clock();
    mountCarousel({ autoPlay: { hoverToPause: true, interval: 50 } });
    cy.get('.sd-carousel').trigger('mouseenter');
    cy.tick(100);
    activeIndicator(0);
  });

  it('slider indicator type works and emits click', () => {
    mountCarousel({ indicatorType: 'slider' });
    cy.get('.sd-carousel-indicator-slider').should('exist').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('exposes carousel/slide semantics, labeled arrows, and arrow-key nav', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel').should('have.attr', 'role', 'region');
    cy.get('.sd-carousel').should('have.attr', 'aria-roledescription', 'carousel');
    // carousel-item 根无 base class，当前 slide 带 -current
    cy.get('.sd-carousel-item-current').should('have.attr', 'aria-roledescription', 'slide');
    cy.get('.sd-carousel-arrow-left').should('have.attr', 'aria-label', '上一张');
    cy.get('.sd-carousel-arrow-right').should('have.attr', 'aria-label', '下一张');
    // 方向键切换（聚焦到 carousel 区域）
    cy.get('.sd-carousel').trigger('keydown', { key: 'ArrowRight' });
    activeIndicator(1);
  });

  it('defaultCurrent sets the initial active indicator', () => {
    mountCarousel({ defaultCurrent: 3, autoPlay: false });
    activeIndicator(2);
  });

  it('out-of-range current wraps to a valid slide', () => {
    mountCarousel({ current: 7, autoPlay: false });
    activeIndicator(1);
  });

  it('manual navigation emits change [index, prevIndex, isManual] and update:current', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-arrow-right').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.deep.equal([[2, 1, true]]);
      expect(wrapper.emitted('update:current')).to.deep.equal([[2]]);
    });
  });

  it('left arrow wraps from the first to the last slide and marks negative direction', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-arrow-left').click();
    activeIndicator(4);
    cy.get('.sd-carousel-negative').should('exist');
  });

  it('ArrowLeft key navigates backward with wrap', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel').trigger('keydown', { key: 'ArrowLeft' });
    activeIndicator(4);
  });

  it('arrow buttons are keyboard activatable with Enter and Space', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-arrow-right').trigger('keydown', { key: 'Enter' });
    activeIndicator(1);
    // 重新挂载，避免 moveSpeed 动画锁内第二次切换被丢弃
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-arrow-left').trigger('keydown', { key: ' ' });
    activeIndicator(4);
  });

  it('indicator items activate with keyboard Enter', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-indicator-item').eq(3).trigger('keydown', { key: 'Enter' });
    activeIndicator(3);
  });

  it('indicator trigger hover switches slides on mouseover', () => {
    mountCarousel({ autoPlay: false, trigger: 'hover' });
    cy.get('.sd-carousel-indicator-item').eq(2).trigger('mouseover');
    activeIndicator(2);
  });

  it('indicator line type exposes data-index, aria-label and aria-current', () => {
    mountCarousel({ autoPlay: false, indicatorType: 'line' });
    cy.get('.sd-carousel-indicator-item')
      .eq(0)
      .should('have.attr', 'aria-current', 'true')
      .and('have.attr', 'data-index', '0');
    cy.get('.sd-carousel-indicator-item').eq(2).should('have.attr', 'aria-label', '跳转到第 3 张');
  });

  it('indicatorType never renders no indicator', () => {
    mountCarousel({ autoPlay: false, indicatorType: 'never' });
    cy.get('.sd-carousel-indicator').should('not.exist');
  });

  it('showArrow never renders no arrows and hover adds the hover class', () => {
    mountCarousel({ autoPlay: false, showArrow: 'never' });
    cy.get('.sd-carousel-arrow').should('not.exist');
    mountCarousel({ autoPlay: false, showArrow: 'hover' });
    cy.get('.sd-carousel-arrow-hover').should('exist');
  });

  it('indicatorPosition applies position classes on root and wrapper', () => {
    mountCarousel({ autoPlay: false, indicatorPosition: 'top' });
    cy.get('.sd-carousel').should('have.class', 'sd-carousel-indicator-position-top');
    cy.get('.sd-carousel-indicator-wrapper-top').should('exist');
  });

  it('vertical direction renders top/bottom arrows and switches via bottom arrow', () => {
    mountCarousel({ autoPlay: false, direction: 'vertical' });
    cy.get('.sd-carousel-vertical').should('exist');
    cy.get('.sd-carousel-arrow-right').should('not.exist');
    cy.get('.sd-carousel-arrow-bottom').click();
    activeIndicator(1);
  });

  it('animationName applies the fade/card content classes', () => {
    mountCarousel({ autoPlay: false, animationName: 'fade' });
    cy.get('.sd-carousel-fade').should('exist');
    mountCarousel({ autoPlay: false, animationName: 'card' });
    cy.get('.sd-carousel-card').should('exist');
  });

  it('moveSpeed and transitionTimingFunction apply to the slide transition style', () => {
    mountCarousel({ autoPlay: false, moveSpeed: 800, transitionTimingFunction: 'ease-in' });
    cy.get('.sd-carousel-item-current')
      .should('have.css', 'transition-duration', '0.8s')
      .and('have.css', 'animation-duration', '0.8s')
      .and('have.css', 'transition-timing-function', 'ease-in');
  });

  it('marks the adjacent slides with prev/next classes and hides non-current slides', () => {
    mountCarousel({ current: 3, autoPlay: false });
    cy.get('.sd-carousel-item-prev')
      .should('have.length', 1)
      .and('have.attr', 'aria-hidden', 'true');
    cy.get('.sd-carousel-item-next').should('have.length', 1);
    cy.get('.sd-carousel-item-current').should('have.attr', 'aria-hidden', 'false');
  });

  it('arrowClass and indicatorClass pass through to the sub components', () => {
    mountCarousel({ autoPlay: false, arrowClass: 'my-arrow', indicatorClass: 'my-indicator' });
    cy.get('.my-arrow').should('exist');
    cy.get('.my-indicator').should('exist');
  });

  it('clicking the active indicator again emits no change', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-indicator-item').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('ignores rapid clicks during the animation but recovers once the lock clears', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-arrow-right').click();
    cy.get('.sd-carousel-arrow-right').click();
    activeIndicator(1);
    // 锁内第二次点击被忽略：只发一次 change
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    // 锁清除后（moveSpeed 500ms）继续切换，不会死锁
    cy.wait(600);
    cy.get('.sd-carousel-arrow-right').click();
    activeIndicator(2);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(2);
    });
  });

  it('does not re-emit an identical change when controlled current is not written back', () => {
    mountCarousel({ current: 1, autoPlay: false, moveSpeed: 50 });
    cy.get('.sd-carousel-arrow-right').click();
    cy.wait(150);
    cy.get('.sd-carousel-arrow-right').click();
    cy.get('@vue').should(({ wrapper }) => {
      // 受控 current 未回写时第二次点击仍是同一目标 → 不重复 emit 相同 change
      expect(wrapper.emitted('change')).to.deep.equal([[2, 1, true]]);
    });
  });

  it('forward wrap from the last indicator to the first is not marked negative', () => {
    mountCarousel({ autoPlay: false, defaultCurrent: 5 });
    activeIndicator(4);
    cy.get('.sd-carousel-indicator-item').eq(0).click({ force: true });
    activeIndicator(0);
    cy.get('.sd-carousel-negative').should('not.exist');
  });

  it('backward indicator jumps from the first to the last are marked negative', () => {
    mountCarousel({ autoPlay: false });
    cy.get('.sd-carousel-indicator-item').eq(4).click({ force: true });
    activeIndicator(4);
    cy.get('.sd-carousel-negative').should('exist');
  });

  it('exposes prev/next/goTo methods', () => {
    mountCarousel({ autoPlay: false });
    const vm = () =>
      cy.get('@vue').then(
        ({ wrapper }) =>
          wrapper.findComponent({ name: 'Carousel' }).vm as unknown as {
            prev: () => void;
            next: () => void;
            goTo: (index: number) => void;
          },
      );
    vm().then((carousel) => carousel.next());
    activeIndicator(1);
    cy.wait(600);
    vm().then((carousel) => carousel.goTo(4));
    activeIndicator(3);
    cy.wait(600);
    vm().then((carousel) => carousel.prev());
    activeIndicator(2);
  });
});
