import VoiceGlow from '../index';

describe('VoiceGlow', () => {
  it('renders the slot and installs its own stylesheet', () => {
    cy.mount(VoiceGlow, { slots: { default: '<div class="glow-content">内容</div>' } });
    cy.get('.sd-voice-glow').should('have.attr', 'data-active');
    cy.get('.glow-content').should('have.text', '内容');
    cy.get('[data-voice-beam-bloom]').should('exist');
    cy.get('.sd-voice-glow')
      .invoke('attr', 'data-voice-beam')
      .then((id) => {
        cy.get('style')
          .filter(
            (_, element) => element.textContent?.includes(`[data-voice-beam="${id}"]`) ?? false,
          )
          .should('exist');
      });
  });

  it('respects active, theme, preset, and processing props', () => {
    cy.mount(VoiceGlow, {
      props: { active: false, type: 'pill', theme: 'dark', processing: true },
    });
    cy.get('.sd-voice-glow').should('not.have.attr', 'data-active');
    cy.get('.sd-voice-glow')
      .should('have.attr', 'data-voice-type', 'pill')
      .and('have.attr', 'data-processing');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ active: true, processing: false })),
    );
    cy.get('.sd-voice-glow').should('have.attr', 'data-active');
    cy.get('.sd-voice-glow').should('not.have.attr', 'data-processing');
  });

  it('reacts to manual level changes', () => {
    cy.mount(VoiceGlow, { props: { level: 0.8, idle: 0 } });
    cy.get('.sd-voice-glow').should(($element) => {
      const id = $element.attr('data-voice-beam');
      expect(Number($element[0].style.getPropertyValue(`--vb-glow-${id}`))).to.be.greaterThan(0);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ level: 0 })));
    cy.get('.sd-voice-glow').should('exist');
  });

  it('analyses a live audio stream', () => {
    cy.window().then(async (win) => {
      const context = new win.AudioContext();
      const oscillator = context.createOscillator();
      const destination = context.createMediaStreamDestination();
      oscillator.connect(destination);
      oscillator.start();
      if (context.state === 'suspended') await context.resume();

      cy.mount(VoiceGlow, { props: { stream: destination.stream, idle: 0 } });
      cy.get('.sd-voice-glow').should('have.attr', 'data-listening');
      cy.get('.sd-voice-glow').should(($element) => {
        const id = $element.attr('data-voice-beam');
        expect(Number($element[0].style.getPropertyValue(`--vb-level-${id}`))).to.be.greaterThan(0);
      });
      cy.then(async () => {
        oscillator.stop();
        await context.close();
      });
    });
  });

  it('emits lifecycle events after its own fade animations', () => {
    cy.mount(VoiceGlow);
    cy.get('.sd-voice-glow').then(($element) => {
      const id = $element.attr('data-voice-beam');
      $element[0].dispatchEvent(
        new AnimationEvent('animationend', {
          animationName: `vb-fade-in-${id}`,
        }),
      );
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('activate')).to.have.length(1);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ active: false })));
    cy.get('.sd-voice-glow').should('have.attr', 'data-fading');
    cy.get('.sd-voice-glow').then(($element) => {
      const id = $element.attr('data-voice-beam');
      $element[0].dispatchEvent(
        new AnimationEvent('animationend', {
          animationName: `vb-fade-out-${id}`,
        }),
      );
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('deactivate')).to.have.length(1);
    });
  });
});
