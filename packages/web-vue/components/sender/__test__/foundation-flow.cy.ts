import { h, ref } from 'vue';

import Sender, { type SenderRef, type SenderSkill, type SenderSlotConfig } from '../index';

describe('Sender shared foundation flow', () => {
  it('keeps an unrelated input focused with stable slot/skill props and synchronizes a new skill', () => {
    const skill = ref<SenderSkill>({ value: 'one', title: 'One' });
    const revision = ref(0);
    const config: SenderSlotConfig[] = [{ type: 'text', value: 'Draft' }];
    cy.mount({
      setup: () => () =>
        h('section', [
          h('input', { class: 'other-editor' }),
          h('output', { class: 'revision' }, String(revision.value)),
          h(Sender, { slotConfig: config, skill: skill.value }),
        ]),
    });
    cy.get('.sd-sender-skill-tag').should('contain.text', 'One');
    cy.get('.other-editor').type('outside');
    cy.then(() => {
      revision.value++;
    });
    cy.get('.other-editor').should('be.focused').and('have.value', 'outside');
    cy.then(() => {
      skill.value = { value: 'two', title: 'Two' };
    });
    cy.get('.sd-sender-skill-tag').should('contain.text', 'Two');
    cy.get('.sd-sender-input-slot-content').should('be.focused').and('contain.text', 'Draft');
  });

  it('retains native selection replacement and immediate model publication through the instance API', () => {
    const sender = ref<SenderRef>();
    const changes: string[] = [];
    cy.mount({
      setup: () => () =>
        h(Sender, {
          ref: sender,
          defaultValue: 'ab<>cd',
          onChange: (value: string) => changes.push(value),
        }),
    });
    cy.get('textarea').then(($textarea) => {
      $textarea[0].focus();
      $textarea[0].setSelectionRange(4, 4);
    });
    cy.then(() => {
      sender.value!.insert('X', 'cursor', '<>', true);
      expect(sender.value!.getValue().value).to.equal('abXcd');
      expect(changes).to.deep.equal(['abXcd']);
    });
    cy.get('textarea')
      .should('have.value', 'abXcd')
      .and('be.focused')
      .should(($textarea) => {
        expect($textarea[0].selectionStart).to.equal(3);
        expect($textarea[0].selectionEnd).to.equal(3);
      });
    cy.then(() => sender.value!.focus({ cursor: 'all' }));
    cy.get('textarea').should(($textarea) => {
      expect($textarea[0].selectionStart).to.equal(0);
      expect($textarea[0].selectionEnd).to.equal(5);
    });
  });
});
