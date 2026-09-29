import { defineComponent, h } from 'vue';

import { useVoiceMicrophone } from '../index';

const MicrophoneDemo = defineComponent({
  setup() {
    const mic = useVoiceMicrophone();
    return () =>
      h('div', [
        h('span', { 'data-cy': 'state' }, mic.state.value),
        h('button', { onClick: mic.start }, '开始'),
        h('button', { onClick: mic.stop }, '停止'),
      ]);
  },
});

it('requests and releases a microphone stream from a user action', () => {
  cy.window().then((win) => {
    const context = new win.AudioContext();
    const oscillator = context.createOscillator();
    const destination = context.createMediaStreamDestination();
    oscillator.connect(destination);
    oscillator.start();
    cy.stub(win.navigator.mediaDevices, 'getUserMedia')
      .resolves(destination.stream)
      .as('getUserMedia');
    cy.mount(MicrophoneDemo);
    cy.contains('button', '开始').click();
    cy.get('[data-cy="state"]').should('have.text', 'live');
    cy.get('@getUserMedia').should('have.been.calledOnce');
    cy.contains('button', '停止').click();
    cy.get('[data-cy="state"]').should('have.text', 'idle');
    cy.then(async () => {
      oscillator.stop();
      await context.close();
    });
  });
});
