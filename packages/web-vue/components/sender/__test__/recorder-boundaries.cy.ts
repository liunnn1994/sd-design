import { h } from 'vue';

import Sender, { RecorderCore, type SenderActionContext, type SenderRef } from '../index';

describe('Sender recorder boundaries', () => {
  beforeEach(() => {
    cy.stub(RecorderCore, 'Support').returns(true);
    cy.stub(RecorderCore.prototype, 'open').callsFake((success: () => void) => success());
    cy.stub(RecorderCore.prototype, 'start');
    cy.stub(RecorderCore.prototype, 'close');
  });

  for (const outcome of ['success', 'error']) {
    it(`ignores an old stop ${outcome} after a new recording starts`, () => {
      let complete: () => void;
      cy.stub(RecorderCore.prototype, 'stop').callsFake((success, error) => {
        complete =
          outcome === 'success'
            ? () => success(new Blob(['audio']), 100, 'audio/pcm')
            : () => error('Old error');
      });
      const end = cy.spy().as('end');
      const error = cy.spy().as('error');
      cy.mount(Sender, {
        props: { allowSpeech: true, voiceGlow: false, onSpeechEnd: end, onSpeechError: error },
      });
      cy.get('button[aria-label="开始语音输入"]').click();
      cy.get('button[aria-label="停止语音输入"]').click();
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ allowSpeech: false }));
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ allowSpeech: true }));
      cy.get('button[aria-label="开始语音输入"]').click();
      cy.get('@vue').then(({ wrapper }) => {
        const sender = wrapper.vm as SenderRef;
        const current = sender.recorder;
        expect(sender.recording).to.equal(true);
        complete();
        expect(sender.recorder).to.equal(current);
        expect(sender.recording).to.equal(true);
      });
      cy.get('@end').should('not.have.been.called');
      cy.get('@error').should('not.have.been.called');
    });
  }

  it('preserves the native onProcess asynchronous return value', () => {
    const process = cy.spy(() => true);
    cy.mount(Sender, {
      props: { allowSpeech: { type: 'pcm', onProcess: process }, voiceGlow: false },
    });
    cy.get('button[aria-label="开始语音输入"]').click();
    cy.get('@vue').then(({ wrapper }) => {
      const sender = wrapper.vm as SenderRef;
      const current = sender.recorder!;
      const buffers: Int16Array[] = [];
      expect(current.set.onProcess!.call(current, buffers, 50, 100, 48000, 0, () => {})).to.equal(
        true,
      );
      expect(process.callCount).to.equal(1);
    });
  });

  it('blocks a disabled sender speech action exposed to a custom suffix', () => {
    let speech: SenderActionContext['speech'];
    cy.mount(Sender, {
      props: { allowSpeech: true, disabled: true, voiceGlow: false },
      slots: {
        suffix: ({ actions }: { actions: SenderActionContext }) => {
          speech = actions.speech;
          return h('span', 'Actions');
        },
      },
    });
    cy.then(() => speech());
    cy.get('@vue').then(({ wrapper }) =>
      expect((wrapper.vm as SenderRef).recording).to.equal(false),
    );
  });
});
