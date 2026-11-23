describe('VoiceGlow React', () => {
  const root = '[data-testid="voice-main"]';
  const level = (element: HTMLElement) =>
    Number(element.style.getPropertyValue(`--vb-level-${element.getAttribute('data-voice-beam')}`));
  const style = () =>
    cy
      .get(root)
      .then((element) =>
        cy
          .get('style')
          .filter(
            (_, sheet) =>
              sheet.textContent?.includes(
                `[data-voice-beam="${element.attr('data-voice-beam')}"]`,
              ) ?? false,
          ),
      );
  const twoFrames = (node: HTMLElement) =>
    new Promise<void>((resolve) => {
      const win = node.ownerDocument.defaultView!;
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
    });
  beforeEach(() => {
    cy.visit('/voice-glow.html');
    cy.get(root).scrollIntoView();
  });
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  it('preserves content, injects one style and emits real fade lifecycle events', () => {
    style().should('have.length', 1).and('contain.text', 'border-radius: 12px');
    cy.contains('button', 'Voice child action').focus().should('have.focus');
    cy.get(root).should('not.have.attr', 'data-active');
    cy.contains('button', 'Voice active').click();
    cy.get('[data-testid="voice-events"]').should('have.text', 'activate');
    cy.contains('button', 'Voice active').click();
    cy.get('[data-testid="voice-events"]').should('have.text', 'activate|deactivate');
    cy.get(root).should('not.have.attr', 'data-active');
    cy.get(root).should('not.have.attr', 'data-fading');
    cy.contains('button', 'Voice ref').click();
    cy.get('[data-testid="voice-ref"]').should('have.text', 'DIV');
  });
  it('filters descendant and pseudo events before exact root animation names', () => {
    cy.get(root).then((element) => {
      const name = `vb-fade-in-${element.attr('data-voice-beam')}`;
      element
        .find('button')[0]
        .dispatchEvent(new AnimationEvent('animationend', { bubbles: true, animationName: name }));
      element[0].dispatchEvent(
        new AnimationEvent('animationend', {
          bubbles: true,
          animationName: name,
          pseudoElement: '::before',
        }),
      );
      element[0].dispatchEvent(
        new AnimationEvent('animationend', { bubbles: true, animationName: 'foreign' }),
      );
    });
    cy.get('[data-testid="voice-events"]').should('have.text', '');
  });
  it('smooths numeric and getter levels and draws real Canvas band pixels', () => {
    cy.contains('button', 'Voice active').click();
    cy.get(root).should((element) => expect(level(element[0])).to.be.greaterThan(0.5));
    cy.get<HTMLCanvasElement>(`${root} [data-voice-beam-band]`).should((canvas) => {
      const node = canvas[0];
      expect(node.width).to.be.greaterThan(0);
      expect(
        node
          .getContext('2d')!
          .getImageData(0, 0, node.width, node.height)
          .data.some((value) => value > 0),
      ).to.eq(true);
    });
    cy.contains('button', 'Voice silent').click();
    cy.get(root).should((element) => expect(level(element[0])).to.be.lessThan(0.1));
    cy.contains('button', 'Voice getter').click();
    cy.get(root).should((element) => expect(level(element[0])).to.be.greaterThan(0.4));
    cy.contains('button', 'Voice getter silent').click();
    cy.get(root).should((element) => expect(level(element[0])).to.be.lessThan(0.1));
  });
  it('does not sample a paused getter and resumes without replacing the element', () => {
    cy.contains('button', 'Voice getter').click();
    cy.contains('button', 'Voice pause').click();
    cy.contains('button', 'Voice active').click();
    cy.get(root).should('have.attr', 'data-paused');
    cy.get('[data-testid="voice-samples"]').should('have.text', '0');
    cy.contains('button', 'Voice pause').click();
    cy.get('[data-testid="voice-samples"]').should((element) =>
      expect(Number(element.text())).to.be.greaterThan(0),
    );
    cy.get(root).should((element) => expect(level(element[0])).to.be.greaterThan(0.4));
    cy.contains('button', 'Voice pause').click();
    cy.get('[data-testid="voice-samples"]').then(async (output) => {
      const count = output.text();
      await twoFrames(output[0]);
      expect(output.text()).to.eq(count);
    });
  });
  it('updates presets, custom geometry, distortion and processing after mounting', () => {
    cy.contains('button', 'Voice active').click();
    cy.get(`${root} feDisplacementMap`).should('not.exist');
    cy.contains('button', 'Voice distortion').click();
    cy.get<SVGFEDisplacementMapElement>(`${root} feDisplacementMap`).should((nodes) =>
      expect(nodes[0].scale.baseVal).to.be.greaterThan(0),
    );
    cy.get('[aria-label="Voice preset"]').select('pill');
    cy.get(root).should('have.attr', 'data-voice-type', 'pill');
    cy.get('[aria-label="Voice preset"]').select('mobile');
    cy.get(root).should('have.attr', 'data-voice-type', 'mobile');
    cy.contains('button', 'Voice tuning').click();
    cy.get(root).should('have.css', '--voice-strength', '0.3').and('have.css', '--voice-test', '7');
    style().should('contain.text', 'border-radius: 0px');
    cy.get(`${root} [data-voice-beam-core]`).should('exist');
    cy.contains('button', 'Voice processing').click();
    cy.get(root).should('have.attr', 'data-processing');
    cy.contains('button', 'Voice processing').click();
    cy.get(root).should('not.have.attr', 'data-processing');
  });
  it('reacts to system theme and reduced motion without dropping the audio level', () => {
    cy.contains('button', 'Voice active').click();
    cy.contains('button', 'Voice distortion').click();
    cy.get('[aria-label="Voice theme"]').select('auto');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: {
          features: [
            { name: 'prefers-color-scheme', value: 'light' },
            { name: 'prefers-reduced-motion', value: 'reduce' },
          ],
        },
      }),
    );
    cy.get(root).should((element) => {
      expect(element[0].style.getPropertyValue('--voice-strength')).to.eq('0.8');
      const id = element.attr('data-voice-beam');
      expect(element[0].style.getPropertyValue(`--vb-hue-${id}`)).to.eq('0.00deg');
    });
    cy.get<SVGFEDisplacementMapElement>(`${root} feDisplacementMap`).should((nodes) =>
      expect(nodes[0].scale.baseVal).to.eq(0),
    );
    cy.get(root).should((element) => expect(level(element[0])).to.be.greaterThan(0.5));
    cy.get('[aria-label="Voice theme"]').select('dark');
    cy.get(root).should('have.css', '--voice-strength', '1');
  });
  it('analyses a synthetic MediaStream in preference to a silent manual level', () => {
    cy.contains('button', 'Voice silent').click();
    cy.contains('button', 'Voice synthetic audio').click();
    cy.contains('button', 'Voice active').click();
    cy.get(root).should('have.attr', 'data-listening');
    cy.get(root).should((element) => expect(level(element[0])).to.be.greaterThan(0.3));
    cy.contains('button', 'Voice stop audio').click();
    cy.get(root).should('not.have.attr', 'data-listening');
    cy.get(root).should((element) => expect(level(element[0])).to.be.lessThan(0.1));
  });
  it('removes its style, native ref and frame callbacks when unmounted', () => {
    cy.contains('button', 'Voice active').click();
    cy.get(root).should((element) => expect(level(element[0])).to.be.greaterThan(0.3));
    cy.get(root).then((element) => {
      const id = element.attr('data-voice-beam');
      cy.contains('button', 'Voice mount').click();
      cy.get('style').should((sheets) =>
        expect(
          Array.from(sheets).some((sheet) =>
            sheet.textContent?.includes(`[data-voice-beam="${id}"]`),
          ),
        ).to.eq(false),
      );
    });
    cy.get('[data-testid="voice-meter"]').then(async (output) => {
      const value = output.text();
      await twoFrames(output[0]);
      expect(output.text()).to.eq(value);
    });
    cy.contains('button', 'Voice ref').click();
    cy.get('[data-testid="voice-ref"]').should('have.text', 'null');
    cy.contains('button', 'Voice mount').click();
    style().should('have.length', 1);
  });
  it('adds the halo canvas when Canvas filter is unavailable', () => {
    cy.visit('/voice-glow.html', {
      onBeforeLoad(win) {
        Object.defineProperty(win.CanvasRenderingContext2D.prototype, 'filter', {
          configurable: true,
          get: () => undefined,
          set() {},
        });
      },
    });
    cy.get(root).scrollIntoView();
    cy.contains('button', 'Voice active').click();
    cy.get<HTMLCanvasElement>(`${root} [data-voice-beam-band-halo]`).should((canvas) =>
      expect(canvas[0].width).to.be.greaterThan(0),
    );
  });
});

describe('VoiceGlow microphone hook', () => {
  it('requests with explicit constraints, reuses its stream and stops owned tracks', () => {
    cy.visit('/voice-glow.html');
    cy.window().then((win) => {
      const context = new win.AudioContext();
      const destination = context.createMediaStreamDestination();
      cy.stub(win.navigator.mediaDevices, 'getUserMedia')
        .as('micRequest')
        .resolves(destination.stream);
      cy.contains('button', 'Voice mic mount').click();
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'idle');
      cy.contains('button', 'Voice mic start').click();
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'live');
      cy.contains('button', 'Voice mic start').click();
      cy.get('@micRequest')
        .should('have.been.calledOnce')
        .and('have.been.calledWithMatch', {
          audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
        });
      cy.contains('button', 'Voice mic stop').click();
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'idle');
      cy.wrap(destination.stream.getTracks()[0]).its('readyState').should('eq', 'ended');
      cy.then(() => context.close());
    });
  });
  it('autostarts only the surviving StrictMode connection and releases tracks on unmount', () => {
    cy.visit('/voice-glow.html');
    cy.window().then((win) => {
      const context = new win.AudioContext();
      const destination = context.createMediaStreamDestination();
      cy.stub(win.navigator.mediaDevices, 'getUserMedia')
        .as('micAuto')
        .resolves(destination.stream);
      cy.contains('button', 'Voice mic auto').click();
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'live');
      cy.get('@micAuto').should('have.been.calledOnce');
      cy.contains('button', 'Voice mic mount').click();
      cy.get('[data-testid="voice-mic"]').should('not.exist');
      cy.wrap(destination.stream.getTracks()[0]).its('readyState').should('eq', 'ended');
      cy.then(() => context.close());
    });
  });
  it('discards a stream returned after stop and does not overwrite idle state', () => {
    cy.visit('/voice-glow.html');
    cy.window().then((win) => {
      const context = new win.AudioContext();
      const destination = context.createMediaStreamDestination();
      let finish: (stream: MediaStream) => void;
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').callsFake(
        () =>
          new Promise<MediaStream>((resolve) => {
            finish = resolve;
          }),
      );
      cy.contains('button', 'Voice mic mount').click();
      cy.contains('button', 'Voice mic start').click();
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'requesting');
      cy.contains('button', 'Voice mic stop').click();
      cy.then(() => finish(destination.stream));
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'idle');
      cy.get('[data-testid="voice-mic-stream"]').should('have.text', '');
      cy.wrap(destination.stream.getTracks()[0]).its('readyState').should('eq', 'ended');
      cy.then(() => context.close());
    });
  });
  it('publishes denied errors and unsupported environments without throwing', () => {
    cy.visit('/voice-glow.html', {
      onBeforeLoad(win) {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(
          new win.DOMException('No microphone permission', 'NotAllowedError'),
        );
      },
    });
    cy.contains('button', 'Voice mic mount').click();
    cy.contains('button', 'Voice mic start').click();
    cy.get('[data-testid="voice-mic-state"]').should('have.text', 'denied');
    cy.get('[data-testid="voice-mic-error"]').should('have.text', 'No microphone permission');
    cy.contains('button', 'Voice mic stop').click();
    cy.get('[data-testid="voice-mic-state"]').should('have.text', 'idle');
    cy.get('[data-testid="voice-mic-error"]').should('have.text', 'No microphone permission');
    cy.visit('/voice-glow.html', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'mediaDevices', {
          configurable: true,
          value: undefined,
        });
      },
    });
    cy.contains('button', 'Voice mic mount').click();
    cy.get('[data-testid="voice-mic-supported"]').should('have.text', 'false');
    cy.contains('button', 'Voice mic start').click();
    cy.get('[data-testid="voice-mic-state"]').should('have.text', 'unsupported');
  });
  it('clears the ended stream while ignoring ended events from an earlier stream', () => {
    cy.visit('/voice-glow.html');
    cy.window().then((win) => {
      const context = new win.AudioContext();
      const first = context.createMediaStreamDestination().stream;
      const second = context.createMediaStreamDestination().stream;
      const request = cy.stub(win.navigator.mediaDevices, 'getUserMedia').as('micRequest');
      request.onFirstCall().resolves(first);
      request.onSecondCall().resolves(second);
      cy.contains('button', 'Voice mic mount').click();
      cy.contains('button', 'Voice mic start').click();
      cy.get('[data-testid="voice-mic-stream"]').should('have.text', first.id);
      cy.contains('button', 'Voice mic stop').click();
      cy.contains('button', 'Voice mic start').click();
      cy.get('[data-testid="voice-mic-stream"]').should('have.text', second.id);
      cy.then(() => first.getAudioTracks()[0].dispatchEvent(new win.Event('ended')));
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'live');
      cy.get('[data-testid="voice-mic-stream"]').should('have.text', second.id);
      cy.then(() => {
        const track = second.getAudioTracks()[0];
        track.stop();
        track.dispatchEvent(new win.Event('ended'));
      });
      cy.get('[data-testid="voice-mic-state"]').should('have.text', 'idle');
      cy.get('[data-testid="voice-mic-stream"]').should('be.empty');
      cy.get('@micRequest').should('have.been.calledTwice');
      cy.then(() => context.close());
    });
  });

  it('handles AudioContext initialization failure as an error result', () => {
    cy.visit('/voice-glow.html', {
      onBeforeLoad(win) {
        cy.stub(win, 'AudioContext').throws(new win.Error('Audio initialization failed'));
      },
    });
    cy.contains('button', 'Voice mic mount').click();
    cy.contains('button', 'Voice mic start').click();
    cy.get('[data-testid="voice-mic-state"]').should('have.text', 'error');
    cy.get('[data-testid="voice-mic-error"]').should('have.text', 'Audio initialization failed');
  });
});

export {};
