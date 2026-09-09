import { defineComponent, h, reactive } from 'vue';

import Input from '../../input';
import Form from '../index';

describe('Form async submission lifecycle', () => {
  const mountForm = () => {
    let finish: (message?: string) => void;
    const submit = cy.spy().as('submitted');
    const success = cy.spy().as('success');
    const failure = cy.spy().as('failure');
    cy.mount(
      defineComponent({
        setup() {
          const model = reactive({ profile: { name: 'Original' } });
          return () =>
            h(
              Form,
              { model, onSubmit: submit, onSubmitSuccess: success, onSubmitFailed: failure },
              {
                default: () => [
                  h(
                    Form.Item,
                    {
                      field: 'profile.name',
                      validateTrigger: [],
                      rules: {
                        validator: (_value: string, report: (message?: string) => void) =>
                          new Promise<void>((resolve) => {
                            finish = (message) => {
                              if (message) report(message);
                              resolve();
                            };
                          }),
                      },
                    },
                    {
                      default: () =>
                        h(Input, {
                          'modelValue': model.profile.name,
                          'onUpdate:modelValue': (value: string) => {
                            model.profile.name = value;
                          },
                        }),
                    },
                  ),
                  h('button', { type: 'submit' }, 'Submit'),
                ],
              },
            );
        },
      }),
    );
    return (message?: string) => finish(message);
  };

  for (const outcome of ['success', 'failure'] as const) {
    it(`returns the submitted values after ${outcome} even if the user continues editing`, () => {
      const finish = mountForm();
      cy.contains('button', 'Submit').click();
      cy.get('input').clear().type('Changed while validating');
      cy.then(() => finish(outcome === 'failure' ? 'Rejected' : undefined));
      cy.get('@submitted').should('have.been.calledOnce');
      cy.get('@submitted').then((spy) => {
        const [data, event] = (spy as unknown as Sinon.SinonSpy).firstCall.args;
        expect(data.values).to.deep.equal({ profile: { name: 'Original' } });
        expect(event.type).to.equal('submit');
        if (outcome === 'failure') expect(data.errors['profile.name'].value).to.equal('Original');
        else expect(data.errors).to.equal(undefined);
      });
      cy.get(`@${outcome}`).should('have.been.calledOnce');
      cy.get(`@${outcome}`).then((spy) => {
        const [data] = (spy as unknown as Sinon.SinonSpy).firstCall.args;
        expect(outcome === 'success' ? data : data.values).to.deep.equal({
          profile: { name: 'Original' },
        });
      });
      cy.get('input').should('have.value', 'Changed while validating');
    });
  }

  it('does not emit submission events after unmount', () => {
    const finish = mountForm();
    cy.contains('button', 'Submit').click();
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => finish());
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('@submitted').should('not.have.been.called');
    cy.get('@success').should('not.have.been.called');
  });
});
