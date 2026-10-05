import { defineComponent, h } from 'vue';

import VoiceGlow, { useVoiceMicrophone, type UseVoiceMicrophoneResult } from '../index';

describe('VoiceGlow robustness', () => {
  it('reports AudioContext initialization failures through the microphone result', () => {
    let mic: UseVoiceMicrophoneResult;
    const reason = new Error('AudioContext unavailable');
    cy.window().then((win) => {
      cy.stub(win, 'AudioContext').throws(reason);
      cy.mount(
        defineComponent({
          setup() {
            mic = useVoiceMicrophone();
            return () => h('div', mic.state.value);
          },
        }),
      );
    });
    cy.then(async () => {
      let caught: unknown;
      let result: MediaStream | null | undefined;
      try {
        result = await mic.start();
      } catch (error) {
        caught = error;
      }
      expect(caught).to.equal(undefined);
      expect(result).to.equal(null);
      expect(mic.state.value).to.equal('error');
      expect(mic.error.value).to.equal(reason);
    });
  });

  it('drives a distortion filter added after mounting', () => {
    cy.mount(VoiceGlow, {
      props: {
        distortion: 0,
        level: 0.8,
        theme: 'dark',
        style: { width: '350px', height: '120px' },
      },
    });
    cy.get('feDisplacementMap').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ distortion: 0.6 }));
    cy.get('feDisplacementMap').should(($elements) => {
      expect(($elements[0] as SVGFEDisplacementMapElement).scale.baseVal).to.be.greaterThan(0);
    });
  });

  it('holds the level source while paused and samples it again on resume', () => {
    const getLevel = cy.stub().returns(0.7);
    cy.mount(VoiceGlow, { props: { level: getLevel, paused: true } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('level')).to.have.length.greaterThan(0);
      expect(getLevel.callCount).to.equal(0);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ paused: false }));
    cy.then(() => cy.wrap(getLevel).should('have.been.called'));
  });

  it('removes its stylesheet and stops level callbacks when unmounted', () => {
    const onLevel = cy.stub();
    let id: string;
    let callCount: number;
    cy.mount(VoiceGlow, { props: { onLevel } });
    cy.get('.sd-voice-glow').then(($element) => {
      id = $element.attr('data-voice-beam')!;
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('level')).to.have.length.greaterThan(0);
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.unmount();
      callCount = onLevel.callCount;
    });
    cy.wait(70);
    cy.then(() => {
      expect(onLevel.callCount).to.equal(callCount);
    });
    cy.get('style').should(($elements) => {
      expect(
        Array.from($elements).some((el) => el.textContent?.includes(`[data-voice-beam="${id}"]`)),
      ).to.equal(false);
    });
  });
});
