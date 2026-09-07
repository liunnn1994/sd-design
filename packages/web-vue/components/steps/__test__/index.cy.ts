import Steps from '../index';

describe('Steps', () => {
  it('emits change on step click', () => {
    cy.mount(Steps, {
      props: { changeable: true },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.findAllComponents({ name: 'Step' })[1].trigger('click');
    });
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted<[number]>('change');
      expect(emitted).to.not.equal(undefined);
      expect(emitted![0][0]).to.equal(2);
    });
  });

  it('assigns the correct stepNumber to nested steps', () => {
    cy.mount(Steps, {
      props: { changeable: true },
      slots: {
        default:
          '<div><sd-step>Step1</sd-step></div>' +
          '<div><sd-step>Step2</sd-step></div>' +
          '<div><sd-step>Step3</sd-step></div>',
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const steps = wrapper.findAllComponents({ name: 'Step' });
      const stepNumber = (i: number) =>
        (steps[i].vm as { $: { setupState: { stepNumber: number } } }).$.setupState.stepNumber;
      expect(stepNumber(0)).to.equal(1);
      expect(stepNumber(1)).to.equal(2);
      expect(stepNumber(2)).to.equal(3);
    });
  });

  it('exposes list/listitem roles, aria-current on the active step, and keyboard activation', () => {
    cy.mount(Steps, {
      props: { changeable: true, current: 2 },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps').should('have.attr', 'role', 'list');
    cy.get('.sd-steps-item').should('have.attr', 'role', 'listitem');
    // 当前步骤（第2步）aria-current=step
    cy.get('.sd-steps-item').eq(1).should('have.attr', 'aria-current', 'step');
    // 可点击时 tabindex=0，Enter 触发 change
    cy.get('.sd-steps-item').eq(2).should('have.attr', 'tabindex', '0');
    cy.get('.sd-steps-item').eq(2).trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted<[number]>('change');
      expect(emitted).to.not.equal(undefined);
      expect(emitted![0][0]).to.equal(3);
    });
  });

  it('emits update:current alongside change for v-model support', () => {
    cy.mount(Steps, {
      props: { changeable: true },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      const updateCurrent = wrapper.emitted<[number]>('update:current');
      const change = wrapper.emitted<[number]>('change');
      expect(updateCurrent).to.not.equal(undefined);
      expect(updateCurrent![0][0]).to.equal(2);
      expect(change).to.not.equal(undefined);
      expect(change![0][0]).to.equal(2);
    });
  });

  it('does not emit change and does not set tabindex when changeable is false', () => {
    cy.mount(Steps, {
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(1).should('not.have.attr', 'tabindex');
    cy.get('.sd-steps-item').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
      expect(wrapper.emitted('update:current')).to.equal(undefined);
    });
  });

  it('ignores clicks and keyboard activation on disabled steps', () => {
    cy.mount(Steps, {
      props: { changeable: true },
      slots: {
        default:
          '<sd-step>Step1</sd-step><sd-step disabled>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(1).should('have.class', 'sd-steps-item-disabled');
    cy.get('.sd-steps-item').eq(1).should('not.have.attr', 'tabindex');
    cy.get('.sd-steps-item').eq(1).click();
    cy.get('.sd-steps-item').eq(1).trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('marks steps before current as finish, the current as process, and after as wait', () => {
    cy.mount(Steps, {
      props: { current: 2 },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(0).should('have.class', 'sd-steps-item-finish');
    cy.get('.sd-steps-item').eq(0).find('.sd-icon-check').should('exist');
    cy.get('.sd-steps-item').eq(1).should('have.class', 'sd-steps-item-process');
    cy.get('.sd-steps-item').eq(1).should('have.class', 'sd-steps-item-active');
    cy.get('.sd-steps-item').eq(2).should('have.class', 'sd-steps-item-wait');
  });

  it('renders custom error status and flags the previous step with next-error', () => {
    cy.mount(Steps, {
      slots: {
        default:
          '<sd-step>Step1</sd-step><sd-step status="error">Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(1).should('have.class', 'sd-steps-item-error');
    cy.get('.sd-steps-item').eq(1).find('.sd-icon-close').should('exist');
    // 前一步展示 next-error 态
    cy.get('.sd-steps-item').eq(0).should('have.class', 'sd-steps-item-next-error');
  });

  it('falls back to defaultCurrent when the current prop is absent', () => {
    cy.mount(Steps, {
      props: { defaultCurrent: 2 },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(1).should('have.attr', 'aria-current', 'step');
    cy.get('.sd-steps-item').eq(0).should('have.class', 'sd-steps-item-finish');
  });

  it('activates a step with the Space key as well', () => {
    cy.mount(Steps, {
      props: { changeable: true },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step><sd-step>Step3</sd-step>',
      },
    });
    cy.get('.sd-steps-item').eq(2).trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted<[number]>('change');
      expect(emitted).to.not.equal(undefined);
      expect(emitted![0][0]).to.equal(3);
    });
  });

  it('forces horizontal direction for navigation and arrow types', () => {
    cy.mount(Steps, {
      props: { type: 'navigation', direction: 'vertical' },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step>',
      },
    });
    cy.get('.sd-steps').should('have.class', 'sd-steps-horizontal');
    cy.get('.sd-steps').should('not.have.class', 'sd-steps-vertical');

    cy.mount(Steps, {
      props: { type: 'arrow', direction: 'vertical' },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step>',
      },
    });
    cy.get('.sd-steps').should('have.class', 'sd-steps-horizontal');
    cy.get('.sd-steps').should('not.have.class', 'sd-steps-vertical');
  });

  it('renders tails in vertical mode and hides them when line-less', () => {
    cy.mount(Steps, {
      props: { direction: 'vertical' },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step>',
      },
    });
    cy.get('.sd-steps-item-tail').should('exist');
    cy.get('.sd-steps').should('have.class', 'sd-steps-vertical');

    cy.mount(Steps, {
      props: { direction: 'vertical', lineLess: true },
      slots: {
        default: '<sd-step>Step1</sd-step><sd-step>Step2</sd-step>',
      },
    });
    cy.get('.sd-steps').should('have.class', 'sd-steps-line-less');
    cy.get('.sd-steps-item-tail').should('not.exist');
  });
});
