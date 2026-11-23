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

it('updates microphone state when a track ends and releases the replacement on stop', () => {
  cy.window().then((win) => {
    const context = new win.AudioContext();
    const oscillator = context.createOscillator();
    const destination = context.createMediaStreamDestination();
    const replacement = context.createMediaStreamDestination();
    oscillator.connect(destination);
    oscillator.start();
    const request = cy.stub(win.navigator.mediaDevices, 'getUserMedia').as('getUserMedia');
    request.onFirstCall().resolves(destination.stream);
    request.onSecondCall().resolves(replacement.stream);
    cy.mount(MicrophoneDemo);
    cy.contains('button', '开始').click();
    cy.get('[data-cy="state"]').should('have.text', 'live');
    cy.get('@getUserMedia').should('have.been.calledOnce');
    cy.then(() => {
      const track = destination.stream.getAudioTracks()[0];
      track.stop();
      track.dispatchEvent(new win.Event('ended'));
    });
    cy.get('[data-cy="state"]').should('have.text', 'idle');
    cy.contains('button', '开始').click();
    cy.get('[data-cy="state"]').should('have.text', 'live');
    cy.get('@getUserMedia').should('have.been.calledTwice');
    cy.contains('button', '停止').click();
    cy.get('[data-cy="state"]').should('have.text', 'idle');
    cy.wrap(replacement.stream.getAudioTracks()[0]).its('readyState').should('eq', 'ended');
    cy.then(async () => {
      oscillator.stop();
      await context.close();
    });
  });
});
