import { defineComponent, ref } from 'vue';

import Carousel from '../index';

const Item = Carousel.Item;
const mountCarousel = (props: Record<string, unknown> = {}) =>
  cy.mount(Carousel, {
    props,
    global: { components: { Item } },
    slots: { default: '<Item v-for="i in 3" :key="i">Slide {{ i }}</Item>' },
    attrs: { style: 'width: 600px; height: 300px' },
  });

describe('Carousel lifecycle boundaries', () => {
  it('leaves arrow keys inside a slide input to the input', () => {
    cy.mount(Carousel, {
      global: { components: { Item } },
      slots: { default: '<Item><input value="text" /></Item><Item>Second</Item>' },
      attrs: { style: 'width:600px;height:300px' },
    });
    cy.get('input').focus().trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-carousel-item-current input').should('exist');
    cy.get('@vue').then(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('does not emit invalid navigation for an empty carousel', () => {
    cy.mount(Carousel, { attrs: { style: 'width:600px;height:300px' } });
    cy.get('.sd-carousel').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').then(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('stops autoplay after unmount', () => {
    cy.clock();
    const change = cy.spy().as('change');
    mountCarousel({ autoPlay: { interval: 100 }, moveSpeed: 0, onChange: change });
    cy.tick(100);
    cy.get('@change').should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.tick(1000);
    cy.get('@change').should('have.been.calledOnce');
  });

  it('reports the displayed controlled slide as the previous slide', () => {
    mountCarousel({ current: 3 });
    cy.get('.sd-carousel-arrow-right').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.deep.equal([[1, 3, true]]);
    });
  });

  it('keeps a visible slide after removing the active last item', () => {
    cy.mount(
      defineComponent({
        components: { Carousel, Item },
        setup: () => ({ count: ref(3) }),
        template:
          '<button @click="count--">Remove</button><Carousel :default-current="3" style="width:600px;height:300px"><Item v-for="i in count" :key="i">Slide {{ i }}</Item></Carousel>',
      }),
    );
    cy.get('.sd-carousel-item-current').should('have.text', 'Slide 3');
    cy.contains('button', 'Remove').click();
    cy.get('[aria-roledescription="slide"]').should('have.length', 2);
    cy.get('.sd-carousel-item-current').should('have.length', 1);
    cy.contains('button', 'Remove').click();
    cy.get('.sd-carousel-item-current').should('have.text', 'Slide 1');
  });

  it('wraps a deeply negative current to an existing slide', () => {
    mountCarousel({ current: -7 });
    cy.get('.sd-carousel-item-current').should('have.text', 'Slide 2');
  });

  it('resumes autoplay when hover-to-pause is disabled while hovered', () => {
    cy.clock();
    mountCarousel({ autoPlay: { interval: 100, hoverToPause: true }, moveSpeed: 0 });
    cy.get('.sd-carousel').trigger('mouseenter');
    cy.tick(200);
    cy.get('.sd-carousel-item-current').should('have.text', 'Slide 1');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ autoPlay: { interval: 100, hoverToPause: false } }),
    );
    cy.tick(100);
    cy.get('.sd-carousel-item-current').should('have.text', 'Slide 2');
  });
});
