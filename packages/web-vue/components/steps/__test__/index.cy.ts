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
});
