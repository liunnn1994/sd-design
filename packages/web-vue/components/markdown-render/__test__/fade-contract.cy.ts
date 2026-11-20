import { defineComponent, h, ref } from 'vue';

import MarkdownRender from '..';
import { provideMarkdownComponents } from '../context';

const frames = new Map<number, FrameRequestCallback>();
let nextFrameId = 0;
const animations: Array<{ duration: string; timing: string }> = [];
const captureAnimation = (event: AnimationEvent) => {
  const element = event.target as Element;
  if (!element.matches('.text-node-stream-delta')) return;
  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  animations.push({ duration: style.animationDuration, timing: style.animationTimingFunction });
};
const advance = () =>
  cy.then(() => {
    for (let step = 0; step < 2; step++) {
      const current = [...frames.values()];
      frames.clear();
      current.forEach((callback) => callback(performance.now()));
    }
  });
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const mountFade = (
  options: {
    final?: boolean;
    fade?: boolean;
    custom?: boolean;
    fragment?: boolean;
    code?: boolean;
    defaults?: boolean;
  } = {},
) =>
  cy.mount(
    {
      setup() {
        const content = ref(options.code ? '```txt\nCode\n```' : 'First');
        const fade = ref(options.fade ?? true);
        const final = ref(options.final ?? false);
        const alternate = ref(false);
        const Initial = defineComponent(
          () => () => h('div', { 'data-widget': 'initial' }, 'Initial widget'),
        );
        const Replacement = defineComponent(
          () => () => h('section', { 'data-widget': 'replacement' }, 'Replacement widget'),
        );
        provideMarkdownComponents(
          {
            fixture_enter: defineComponent(() => () => h(alternate.value ? Replacement : Initial)),
          },
          () => undefined,
        );
        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => {
                  content.value += '\n\nSecond block';
                },
              },
              'Append block',
            ),
            h(
              'button',
              {
                onClick: () => {
                  content.value += ' delta';
                },
              },
              'Append text',
            ),
            h(
              'button',
              {
                onClick: () => {
                  content.value += ' final';
                  final.value = true;
                },
              },
              'Finish stream',
            ),
            h(
              'button',
              {
                onClick: () => {
                  fade.value = !fade.value;
                },
              },
              'Toggle fade',
            ),
            h(
              'button',
              {
                onClick: () => {
                  alternate.value = !alternate.value;
                },
              },
              'Replace component',
            ),
            h(MarkdownRender, {
              content: content.value,
              nodes: options.custom ? [{ type: 'fixture_enter', raw: '' }] : undefined,
              fade: fade.value,
              final: final.value,
              renderAsFragment: options.fragment,
              smoothStreaming: false,
              batchRendering: false,
              deferNodesUntilVisible: false,
              nodeVirtual: false,
              renderCodeBlocksAsPre: true,
              style: options.defaults ? undefined : { '--fade-duration': '1s' },
            }),
          ]);
      },
    },
    { global: { stubs: { transition: false } } },
  );
describe('Markdown node enter fade contracts', () => {
  beforeEach(() => {
    frames.clear();
    animations.length = 0;
    cy.window().then((window) => {
      window.document.addEventListener('animationstart', captureAnimation);
      cy.stub(window, 'requestAnimationFrame').callsFake((callback: FrameRequestCallback) => {
        frames.set(++nextFrameId, callback);
        return nextFrameId;
      });
      cy.stub(window, 'cancelAnimationFrame').callsFake((id: number) => {
        frames.delete(id);
      });
    });
  });
  afterEach(() =>
    cy
      .document()
      .then((document) => document.removeEventListener('animationstart', captureAnimation)),
  );
  it('applies appearance to the content root and only enters newly mounted later blocks', () => {
    mountFade();
    cy.get('transition-stub').should('not.exist');
    cy.get('.node-content > p')
      .should('have.class', 'fade-enter-from')
      .and('have.css', 'opacity', '0');
    advance();
    cy.get('.node-content > p').should('have.class', 'fade-enter-to');
    cy.get('.fade-enter-active').should('not.exist');
    control('Append block');
    cy.get('.node-slot').first().find('.fade-enter-active').should('not.exist');
    cy.get('.node-slot').last().find('p').should('have.class', 'fade-enter-from');
    advance();
    cy.get('.fade-enter-active').should('not.exist');
  });
  for (const options of [{ final: true }, { fade: false }, { fragment: true }, { code: true }]) {
    it(`skips ordinary appearance for ${JSON.stringify(options)}`, () => {
      mountFade(options);
      cy.contains(options.code ? 'pre' : 'p', options.code ? 'Code' : 'First').should('exist');
      cy.get('.fade-enter-active, .fade-enter-from, .fade-enter-to').should('not.exist');
    });
  }
  it('finishes an already running enter when fade is subsequently disabled', () => {
    mountFade();
    cy.get('.node-content > p').should('have.class', 'fade-enter-active');
    control('Toggle fade');
    cy.get('.node-content > p').should('have.class', 'fade-enter-active');
    advance();
    cy.get('.node-content > p').should('have.class', 'fade-enter-to');
    cy.get('.fade-enter-active').should('not.exist');
  });
  it('replaces a custom component root without fading after the stream has completed', () => {
    mountFade({ final: true, custom: true });
    cy.get('[data-widget="initial"]').should('not.have.class', 'fade-enter-active');
    control('Replace component');
    cy.get('[data-widget="replacement"]').should('have.text', 'Replacement widget');
    advance();
    cy.get('.fade-enter-active, .fade-enter-from, .fade-enter-to').should('not.exist');
  });
  it('queues appends and retains finished delta DOM while that delta is selected', () => {
    mountFade();
    control('Append text');
    let selected: Node;
    cy.get('.text-node-stream-delta').then(($delta) => {
      const delta = $delta[0];
      delta.style.animationDuration = '10s';
      selected = delta.firstChild!;
      const document = delta.ownerDocument;
      const range = document.createRange();
      range.selectNodeContents(delta);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
      delta.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
    });
    advance();
    cy.contains('button', /^Append text$/).then(($button) => $button[0].click());
    // Allow the native click's update to commit before asserting the selection freeze.
    cy.wait(100);
    cy.get('.text-node').should('have.text', 'First delta');
    cy.then(() => expect(selected.isConnected).to.equal(true));
    cy.document().then((document) => {
      document.getSelection()!.removeAllRanges();
      document.dispatchEvent(new Event('selectionchange'));
    });
    cy.get('.text-node').should('have.text', 'First delta delta');
  });
  it('keeps an existing delta running when another block is appended', () => {
    mountFade();
    control('Append text');
    let delta: HTMLElement;
    cy.get('.text-node-stream-delta').then(($delta) => {
      delta = $delta[0];
      delta.style.animationDuration = '10s';
    });
    control('Append block');
    cy.wait(100);
    cy.get('.text-node-stream-delta').should(($delta) => {
      expect($delta[0]).to.equal(delta);
      expect($delta.text().trim()).to.equal('delta');
    });
    cy.get('.text-node').first().should('have.text', 'First delta');
  });
  it('preserves a settled text selection when the final update appends text', () => {
    mountFade();
    let selected: Node;
    cy.get('.text-node').then(($text) => {
      selected = $text[0].firstChild!.firstChild!;
      const document = selected.ownerDocument!;
      const range = document.createRange();
      range.selectNodeContents(selected);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
    });
    cy.contains('button', /^Finish stream$/).then(($button) => $button[0].click());
    cy.get('.text-node').should('have.text', 'First final');
    cy.get('.text-node-stream-delta').should('not.exist');
    cy.then(() => {
      expect(selected.isConnected).to.equal(true);
      expect(selected.ownerDocument!.getSelection()!.toString()).to.equal('First');
    });
  });
  it('keeps selected settled append nodes and compacts them after selection is released', () => {
    mountFade();
    const appendAndFinish = () => {
      cy.contains('button', /^Append text$/).then(($button) => $button[0].click());
      cy.get('.text-node-stream-delta').then(($deltas) => {
        for (const delta of $deltas) {
          delta.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
        }
      });
      // Upstream batches animationend cleanup in requestAnimationFrame.
      advance();
      cy.get('.text-node-stream-delta').should('not.exist');
    };
    appendAndFinish();
    let selected: Node;
    cy.get('.text-node').then(($text) => {
      const extra = $text[0].children[1];
      selected = extra.firstChild!;
      const document = extra.ownerDocument;
      const range = document.createRange();
      range.setStart(selected, 0);
      range.setEnd(extra, extra.childNodes.length);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
    });
    for (let index = 0; index < 5; index++) appendAndFinish();
    cy.get('.text-node').should(($text) => {
      expect($text[0].children[1].childNodes.length).to.be.greaterThan(4);
      expect(selected.isConnected).to.equal(true);
      expect(selected.ownerDocument!.getSelection()!.toString()).to.equal(' delta');
    });
    cy.document().then((document) => document.getSelection()!.removeAllRanges());
    appendAndFinish();
    cy.get('.text-node').should(($text) => {
      expect($text[0].children[1].childNodes.length).to.be.at.most(4);
      expect($text).to.have.text(`First${' delta'.repeat(7)}`);
    });
  });
  it('uses the upstream default duration and easing for streamed text', () => {
    mountFade({ defaults: true });
    cy.get('.node-content p').should('have.text', 'First');
    control('Append text');
    cy.wrap(animations).should('deep.include', {
      duration: '0.7s',
      timing: 'cubic-bezier(0.37, 0.55, 0.86, 0.88)',
    });
  });

  it('settles an in-flight text fade when the stream ends', () => {
    mountFade();
    control('Append text');
    cy.contains('.text-node-stream-delta', 'delta').should('exist');
    control('Finish stream');
    cy.get('.text-node-stream-delta, .fade-enter-active').should('not.exist');
    cy.get('.text-node').should('have.text', 'First delta final');
  });
});
