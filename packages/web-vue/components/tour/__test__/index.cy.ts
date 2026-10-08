import { defineComponent, h, onMounted, shallowRef } from 'vue';

import { driver } from 'driver.js';

import type { TourExpose, TourProps, TourStep } from '../types';

import Tour from '../index';

const steps: TourStep[] = [
  { element: '#tour-step-a', popover: { title: '步骤一', description: '内容一' } },
  { element: '#tour-step-b', popover: { title: '步骤二', description: '内容二' } },
];
const slots = {
  default: '<div><button id="tour-step-a">A</button><button id="tour-step-b">B</button></div>',
};

function instance(run: (tour: TourExpose) => void) {
  cy.get('@vue').then(({ wrapper }) => run(wrapper.vm as TourExpose));
}

function mountTour(props: TourProps = {}) {
  cy.mount(Tour, { props: { steps, ...props }, slots });
}

describe('Tour driver.js wrapper', () => {
  it('preserves upstream defaults and exposes every native method', () => {
    mountTour();
    cy.get('.driver-popover').should('not.exist');
    instance((tour) => {
      expect(tour.getConfig()).to.deep.equal(driver({ steps }).getConfig());
      expect(tour.isActive()).to.equal(false);
      expect(tour.getNextStep).to.be.a('function');
      expect(tour.setSteps).to.be.a('function');
      expect(tour.drive()).to.equal(undefined);
      expect(tour.getActiveIndex()).to.equal(0);
    });
    cy.get('.driver-popover-title').should('have.text', '步骤一');
    cy.get('.driver-popover-next-btn').should('contain.text', 'Next').click();
    cy.get('.driver-popover-title').should('have.text', '步骤二');
    cy.get('.driver-popover-prev-btn').click();
    cy.get('.driver-popover-title').should('have.text', '步骤一');
    cy.get('.driver-popover-close-btn').click();
    cy.get('.driver-popover').should('not.exist');
  });

  it('passes native hooks and popover DOM through without adding navigation', () => {
    const onNextClick = cy.spy().as('next');
    const onPopoverRender: TourProps['onPopoverRender'] = (popover, { driver, index }) => {
      expect(index).to.equal(driver.getActiveIndex());
      expect(popover.nextButton).to.be.instanceOf(HTMLButtonElement);
      popover.description.innerHTML = '<strong>原生内容</strong>';
    };
    mountTour({
      animate: false,
      onNextClick,
      onPopoverRender,
      nextBtnText: '继续',
      showProgress: true,
    });
    instance((tour) => tour.drive());
    cy.get('.driver-popover-description strong').should('have.text', '原生内容');
    cy.get('.driver-popover-next-btn').should('have.text', '继续').click();
    cy.get('@next')
      .should('have.been.calledOnce')
      .then((spy) => {
        const options = spy.firstCall.args[2];
        expect(options.index).to.equal(0);
        expect(options.driver.getActiveIndex()).to.equal(0);
        expect(options).not.to.have.property('controller');
        options.driver.moveNext();
      });
    cy.get('.driver-popover-title').should('have.text', '步骤二');
    instance((tour) => tour.destroy());
  });

  it('passes done and destroy hooks with their original semantics', () => {
    mountTour({
      animate: false,
      onDoneClick: cy.spy().as('done'),
      onDestroyStarted: cy.spy().as('destroyStarted'),
    });
    instance((tour) => tour.drive(1));
    cy.get('.driver-popover-next-btn').click();
    cy.get('@done').should('have.been.calledOnce');
    cy.get('.driver-popover').should('exist');
    cy.get('.driver-popover-close-btn').click();
    cy.get('@destroyStarted').should('have.been.calledOnce');
    cy.get('.driver-popover').should('exist');
    instance((tour) => tour.destroy());
    cy.get('.driver-popover').should('not.exist');
  });

  it('updates native configuration from reactive props and preserves explicit false', () => {
    mountTour({
      animate: false,
      allowClose: false,
      showProgress: false,
      duration: 100,
      allowScroll: false,
    });
    instance((tour) => {
      expect(tour.getConfig()).to.include({
        animate: false,
        allowClose: false,
        duration: 100,
        allowScroll: false,
      });
      tour.drive();
    });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        steps: [{ popover: { title: '更新后' } }],
        allowClose: true,
        showProgress: true,
      }),
    );
    instance((tour) => {
      expect(tour.getConfig()).to.include({ allowClose: true, showProgress: true });
      tour.drive();
    });
    cy.get('.driver-popover-title').should('have.text', '更新后');
    instance((tour) => tour.destroy());
  });

  it('supports native highlight, step-level options and setSteps', () => {
    mountTour({ animate: false });
    instance((tour) =>
      tour.highlight({
        element: () => document.querySelector('#tour-step-a')!,
        popover: { title: '高亮', showButtons: ['close'], closeBtnLabel: '关闭导览' },
      }),
    );
    cy.get('.driver-popover-title').should('have.text', '高亮');
    cy.get('.driver-popover-close-btn').should('have.attr', 'aria-label', '关闭导览');
    instance((tour) => {
      tour.destroy();
      tour.setSteps([{ popover: { title: '居中步骤' } }]);
      tour.drive();
      expect(tour.isLastStep()).to.equal(true);
    });
    cy.get('.driver-popover-title').should('have.text', '居中步骤');
    instance((tour) => tour.destroy());
  });

  it('cleans up active DOM and listeners on unmount even with a destroy override', () => {
    const visible = shallowRef(true);
    const onDestroyed = cy.spy().as('destroyed');
    cy.mount(
      defineComponent({
        setup() {
          const tour = shallowRef<TourExpose>();
          onMounted(() => tour.value?.drive());
          return () =>
            visible.value
              ? h(
                  Tour,
                  { ref: tour, steps, animate: false, onDestroyStarted: () => {}, onDestroyed },
                  () => h('button', { id: 'tour-step-a' }, 'A'),
                )
              : null;
        },
      }),
    );
    cy.get('.driver-popover').should('exist');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('.driver-popover, .driver-overlay').should('not.exist');
    cy.get('body').should('not.have.class', 'driver-active');
    cy.get('@destroyed').should('have.been.calledOnce');
  });
});
