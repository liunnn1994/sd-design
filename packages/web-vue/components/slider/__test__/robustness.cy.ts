import { h, reactive } from 'vue';

import Form from '../../form';
import Slider from '../index';
import SliderButton from '../slider-button.vue';

describe('Slider robustness', () => {
  it('validates the updated form value after keyboard changes', () => {
    cy.mount({
      setup() {
        const model = reactive({ amount: 20 });
        return () =>
          h(
            Form,
            { model },
            {
              default: () =>
                h(
                  Form.Item,
                  {
                    field: 'amount',
                    rules: { type: 'number', min: 10, message: 'Amount too low' },
                    validateTrigger: 'change',
                  },
                  {
                    default: () =>
                      h(Slider, {
                        'modelValue': model.amount,
                        'step': 10,
                        'onUpdate:modelValue': (value) => {
                          model.amount = Number(value);
                        },
                      }),
                  },
                ),
            },
          );
      },
    });
    const handle = '[role="slider"]';
    cy.get(handle).focus().type('{home}');
    cy.get(handle).should('have.attr', 'aria-valuenow', '0');
    cy.contains('.sd-form-item-message', 'Amount too low').should('be.visible');
    cy.get(handle).type('{end}');
    cy.get(handle).should('have.attr', 'aria-valuenow', '100');
    cy.get('.sd-form-item-message').should('not.exist');
  });

  it('steps repeatedly from the displayed controlled value when updates are rejected', () => {
    const change = cy.spy().as('change');
    cy.mount(Slider, { props: { modelValue: 20, step: 10, onChange: change } });
    cy.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    cy.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@change').should((spy) => {
      expect(spy.getCalls().map((call) => call.args[0])).to.deep.equal([30, 30]);
    });
    cy.get('[role="slider"]').should('have.attr', 'aria-valuenow', '20');
  });

  it('keeps the other controlled range endpoint when a previous update was rejected', () => {
    const change = cy.spy().as('change');
    cy.mount(Slider, { props: { range: true, modelValue: [20, 60], step: 10, onChange: change } });
    cy.get('[role="slider"]').first().trigger('keydown', { key: 'ArrowRight' });
    cy.get('[role="slider"]').last().trigger('keydown', { key: 'ArrowRight' });
    cy.get('@change').should((spy) => {
      expect(spy.getCalls().map((call) => call.args[0])).to.deep.equal([
        [30, 60],
        [20, 70],
      ]);
    });
  });

  it('keeps the decimal keyboard range boundary exact', () => {
    const change = cy.spy().as('change');
    cy.mount(Slider, {
      props: { range: true, defaultValue: [0, 0.3], min: 0, max: 1, step: 0.2, onChange: change },
    });
    cy.get('[role="slider"]').first().trigger('keydown', { key: 'End' });
    cy.get('@change').should('have.been.calledOnceWith', [0.1, 0.3]);
  });

  it('stops an active drag when disabled', () => {
    const change = cy.spy().as('change');
    cy.mount(Slider, { props: { defaultValue: 20, onChange: change } });
    cy.get('[role="slider"]').trigger('pointerdown', {
      isPrimary: true,
      eventConstructor: 'PointerEvent',
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: true }));
    cy.get('.sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.get('[role="slider"]').then(([handle]) =>
        handle.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.left + rect.width * 0.8,
            clientY: rect.top,
          }),
        ),
      );
    });
    cy.get('@change').should('not.have.been.called');
    cy.get('[role="slider"]').should('have.attr', 'aria-valuenow', '20');
  });

  it('cleans up a cancelled touch gesture', () => {
    const change = cy.spy().as('change');
    cy.mount(Slider, { props: { defaultValue: 20, onChange: change } });
    cy.get('[role="slider"]')
      .trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        pointerType: 'touch',
      })
      .trigger('pointercancel', { eventConstructor: 'PointerEvent', pointerType: 'touch' });
    cy.get('.sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.get('[role="slider"]').then(([handle]) =>
        handle.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.left + rect.width * 0.8,
            clientY: rect.top,
          }),
        ),
      );
    });
    cy.get('@change').should('not.have.been.called');
  });

  it('honours an explicit handle tooltip position', () => {
    cy.mount(SliderButton, { props: { min: 0, max: 100, value: 20, tooltipPosition: 'bottom' } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Tooltip' }).props('position')).to.equal('bottom');
    });
  });
});
