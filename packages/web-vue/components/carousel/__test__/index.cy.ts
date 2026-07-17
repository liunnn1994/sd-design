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
    cy.get('.sd-carousel-arrow-left').should('have.attr', 'aria-label', 'Previous slide');
    cy.get('.sd-carousel-arrow-right').should('have.attr', 'aria-label', 'Next slide');
    // 方向键切换（聚焦到 carousel 区域）
    cy.get('.sd-carousel').trigger('keydown', { key: 'ArrowRight' });
    activeIndicator(1);
  });
});
