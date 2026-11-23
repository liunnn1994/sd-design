import type { SenderRef } from '../../src/sender/index.js';
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const metrics = () => cy.window().its('senderMetrics');
describe('React Sender', () => {
  it('edits without losing characters, submits once, inserts and clears', () => {
    cy.visit('/sender.html');
    cy.get('textarea').should('have.value', 'Initial').clear().type('Message{enter}');
    metrics().its('submits').should('deep.equal', ['Message']);
    cy.get('textarea').should('have.value', 'Message');
    control('Insert');
    cy.get('textarea').should('have.value', 'MessageAdded');
    control('Read');
    cy.get('output').should('contain.text', 'MessageAdded');
    control('Footer clear');
    cy.get('textarea').should('have.value', '');
    cy.get('button[aria-label="Send"]').should('be.disabled');
  });
  it('handles controlled models, explicit undefined, shift-enter and loading cancellation', () => {
    cy.visit('/sender.html?controlled&shift');
    cy.get('textarea').clear().type('Hello{enter}world');
    metrics().its('submits').should('have.length', 0);
    cy.get('textarea').type('{shift+enter}');
    metrics().its('submits').should('deep.equal', ['Hello\nworld']);
    control('Toggle loading');
    cy.get('button[aria-label="Stop generating"]').click();
    metrics().its('cancels').should('equal', 1);
    cy.visit('/sender.html?frozen');
    cy.get('textarea').should('have.value', '').type('Ignored').should('have.value', '');
  });
  it('preserves readonly values, disabled actions and focuses content whitespace', () => {
    cy.visit('/sender.html');
    cy.get('.sd-sender-main').invoke('css', 'transition', 'none');
    cy.get('.sd-sender-content').click(8, 8);
    cy.get('textarea').should('be.focused');
    cy.get('.sd-sender-main').should(($main) => {
      expect($main.css('box-shadow')).to.contain('0px 4px 20px 0px');
      expect($main.css('border-top-color')).to.equal('rgba(22, 93, 255, 0.6)');
    });
    control('Toggle readonly');
    cy.get('textarea').should('have.attr', 'readonly');
    control('Toggle disabled');
    cy.get('textarea').should('be.disabled');
    cy.get('.sd-sender-actions-list button').should('be.disabled');
  });
  it('renders structured input and custom slots, keeps edits through config changes and removes skills', () => {
    cy.visit('/sender.html?slots');
    cy.get('.sd-sender-input-slot-content').should('have.attr', 'contenteditable', 'true');
    cy.get('input[placeholder="Name"]').should('have.value', 'Ada').clear().type('Grace');
    cy.get('input[aria-label="Custom"]').clear().type('Changed');
    control('Extend config');
    cy.get('input[placeholder="Name"]').should('have.value', 'Grace');
    cy.get('input[aria-label="Custom"]').should('have.value', 'Changed');
    control('Read');
    cy.get('output').should('contain.text', '[Grace]').and('contain.text', 'Changed');
    control('Insert slot');
    cy.get('.sd-tag').should('contain.text', 'Runtime');
    control('Remove custom');
    cy.get('input[aria-label="Custom"]').should('not.exist');
    cy.get('.sd-sender-skill-tag-close').click();
    control('Read');
    cy.get('output').should('not.contain.text', 'search');
  });
  it('controls Header lifecycle and Switch state without submitting', () => {
    cy.visit('/sender.html');
    cy.get('.sd-sender-header').should('not.exist');
    control('Toggle header');
    cy.get('.sd-sender-header').should('be.visible').and('contain.text', 'Header content');
    cy.get('button[aria-label="Close panel"]').click();
    cy.get('.sd-sender-header').should('not.exist');
    control('Disabled');
    cy.get('.sd-sender-switch').first().should('have.class', 'sd-sender-switch-checked');
    cy.get('.sd-sender-switch').first().contains('button', 'Enabled').click();
    cy.get('.sd-sender-switch').first().should('not.have.class', 'sd-sender-switch-checked');
    cy.visit('/sender.html?force');
    cy.get('.sd-sender-header').should('exist').and('not.be.visible');
    control('Toggle header');
    cy.get('.sd-sender-header').should('be.visible');
    control('Toggle header');
    cy.get('.sd-sender-header').should('exist').and('not.be.visible');
  });
  it('restarts recorder after StrictMode cleanup and tears down disabled speech', () => {
    cy.visit('/sender.html?speech');
    cy.get('.sd-sender-actions-list-presets button').first().should('not.be.disabled').click();
    metrics().its('opens').should('equal', 1);
    cy.get('.sd-sender-actions-btn-recording-icon').should('exist');
    cy.get('.sd-sender-actions-list-presets button').first().click();
    metrics().its('stops').should('equal', 1);
    cy.get('.sd-sender-actions-list-presets button').first().click();
    control('Toggle speech');
    cy.get('.sd-sender-actions-btn-recording-icon').should('not.exist');
    metrics().its('closes').should('be.greaterThan', 0);
    metrics().its('errors').should('deep.equal', []);
  });
  it('reopens Header during a close transition and completes the next close', () => {
    cy.visit('/sender.html');
    const header = () => cy.get('.sd-sender-header');
    control('Toggle header');
    header().should('have.prop', 'style').its('height').should('equal', 'auto');
    header().invoke('css', 'transition-duration', '1s').as('openHeader', { type: 'static' });
    control('Toggle header');
    header().should('have.class', 'sd-sender-header-motion-leave-active');
    control('Toggle header');
    cy.get('@openHeader').should(($header) => {
      expect($header[0].isConnected).to.equal(true);
      expect($header[0].style.height).to.equal('auto');
      expect($header[0].getBoundingClientRect().height).to.be.greaterThan(40);
    });
    header().invoke('css', 'transition-duration', '');
    control('Toggle header');
    header().should('not.exist');
    control('Toggle header');
    header().should('be.visible');
  });
  it('reports microphone permission denial in the localized speech action and callback', () => {
    cy.visit('/sender.html?speech=real', {
      onBeforeLoad(win) {
        const getUserMedia = cy.stub(win.navigator.mediaDevices, 'getUserMedia');
        getUserMedia.rejects(new win.DOMException('Permission denied', 'NotAllowedError'));
        getUserMedia.as('getUserMedia');
      },
    });
    cy.get('button[aria-label="Start voice input"]').click();
    cy.get('@getUserMedia').should('have.been.calledOnce');
    cy.get(
      'button[aria-label="Microphone permission denied. Please allow it in browser settings."]',
    ).should('be.disabled');
    metrics()
      .its('errors')
      .should((errors) => {
        expect(errors).to.have.length(1);
        const [error] = errors;
        expect(error).to.include({ isUserNotAllow: true });
        expect(error.message).to.be.a('string');
        expect(error.message.length).to.be.greaterThan(0);
      });
    metrics().its('stops').should('equal', 0);
  });
  it('tracks speech activity from a browser audio stream and accepts custom VoiceGlow props', () => {
    let context: AudioContext;
    let gain: GainNode;
    cy.visit('/sender.html?speech=stream&custom-glow', {
      onBeforeLoad(win) {
        context = new win.AudioContext();
        const destination = context.createMediaStreamDestination();
        const tone = context.createOscillator();
        gain = context.createGain();
        gain.gain.value = 0;
        tone.connect(gain).connect(destination);
        tone.start();
        Object.assign(win, { senderTestStream: destination.stream });
      },
    });
    const glow = () => cy.get('.sd-sender-voice-glow');
    glow().should('have.attr', 'data-voice-type', 'pill');
    glow().should('have.css', '--voice-strength', '0.6');
    cy.get('button[aria-label="Start voice input"]').click();
    cy.then(() => context.resume());
    cy.get('button[aria-label="Stop voice input"]').should('exist');
    glow().should('not.have.attr', 'data-active');
    cy.then(() => {
      gain.gain.value = 0.5;
    });
    glow().should('have.attr', 'data-active');
    cy.then(() => {
      gain.gain.value = 0;
    });
    glow().should('not.have.attr', 'data-active');
    cy.get('button[aria-label="Stop voice input"]').click();
    metrics().its('stops').should('equal', 1);
    cy.then(() => context.close());
  });
  it('preserves native composing/modifier keys, key interception and file paste callbacks', () => {
    cy.visit('/sender.html');
    cy.get('textarea')
      .trigger('keydown', { key: 'Enter', isComposing: true })
      .trigger('keydown', { key: 'Enter', ctrlKey: true })
      .trigger('keydown', { key: 'Enter', altKey: true });
    metrics().its('submits').should('deep.equal', []);
    cy.get('textarea').then(($input) => {
      const data = new DataTransfer();
      data.items.add(new File(['content'], 'test.txt', { type: 'text/plain' }));
      $input[0].dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: data }));
    });
    metrics().its('pastes').should('equal', 1);
    metrics().its('files').should('equal', 1);
    cy.visit('/sender.html?intercept');
    cy.get('textarea').type('{enter}');
    metrics().its('submits').should('deep.equal', []);
  });
  it('focuses named slots and preserves readonly custom nodes and skill removal', () => {
    cy.visit('/sender.html?slots');
    cy.get('input[placeholder="Name"]').should('have.value', 'Ada');
    cy.window().then((window) => {
      const sender = (window as unknown as { readSender(): SenderRef }).readSender();
      expect(sender.inputElement).to.equal(window.document.querySelector('[contenteditable]'));
      sender.focus({ cursor: 'slot', key: 'name' });
    });
    cy.get('input[placeholder="Name"]').should('be.focused');
    control('Toggle readonly');
    cy.get('input[aria-label="Custom"]').should('have.attr', 'readonly');
    control('Remove custom');
    cy.get('input[aria-label="Custom"]').should('exist');
    cy.get('.sd-sender-skill-tag-close').click();
    control('Read');
    cy.get('output').should('contain.text', 'search');
    control('Toggle readonly');
    cy.get('.sd-sender-skill-tag-close').click();
    control('Read');
    cy.get('output').should('not.contain.text', 'search');
  });

  it('accepts external controlled updates and edits again after control is released', () => {
    cy.visit('/sender.html?controlled');
    control('Write external text');
    cy.get('textarea').should('have.value', 'External text');
    control('Release control');
    cy.get('textarea').clear().type('Local{enter}').should('have.value', 'Local');
    metrics().its('submits').should('deep.equal', ['Local']);
  });

  it('replaces a native textarea selection through the imperative API', () => {
    cy.visit('/sender.html');
    cy.get('textarea')
      .focus()
      .then(($field) => {
        const field = $field[0] as HTMLTextAreaElement;
        field.setSelectionRange(1, 4);
        const win = field.ownerDocument.defaultView as unknown as { readSender(): SenderRef };
        const sender = win.readSender();
        expect(sender.nativeElement).to.equal(field.closest('.sd-sender'));
        expect(sender.inputElement).to.equal(field);
        sender.insert('X', 'cursor');
        expect(sender.getValue().value).to.equal('IXial');
      });
    cy.get('textarea').should('have.value', 'IXial');
    metrics().its('changes').should('deep.equal', ['IXial']);
  });

  it('inserts an editor line break only while rich text is editable', () => {
    cy.visit('/sender.html?text-slot&shift');
    const editor = () => cy.get('.sd-rich-text-editor-content');
    const sender = () =>
      cy.window().then((win) => (win as unknown as { readSender(): SenderRef }).readSender());
    editor().click('right').type('{enter}');
    sender().then((instance) => expect(instance.getValue().value).to.equal('Keep this content\n'));
    cy.get('.sd-rich-text-editor-paragraph').should('have.length', 1);
    control('Toggle readonly');
    editor().trigger('keydown', { key: 'Enter' });
    sender().then((instance) => expect(instance.getValue().value).to.equal('Keep this content\n'));
    control('Toggle readonly');
    control('Toggle disabled');
    editor().trigger('keydown', { key: 'Enter' });
    sender().then((instance) => expect(instance.getValue().value).to.equal('Keep this content\n'));
    metrics().its('submits').should('deep.equal', []);
  });

  it('assembles structured slots and submits only once from a nested input', () => {
    cy.visit('/sender.html?all-slots');
    cy.get('.sd-sender-skill-tag').should('contain.text', 'Search');
    cy.get('.sd-rich-text-editor-component-select').should('contain.text', 'Paris');
    cy.get('[data-rich-text-component-key="when"] input').should('have.value', 'today');
    cy.get('.sd-rich-text-editor-component-tag').should('contain.text', 'Detail');
    cy.get('[data-rich-text-component-key="query"] input')
      .should('have.value', 'weather')
      .type('{enter}');
    metrics().its('submits').should('deep.equal', ['Find Paris weather [today] details']);
    metrics()
      .its('submittedSlots')
      .should('deep.equal', [
        { types: ['text', 'select', 'text', 'input', 'content', 'tag'], skill: 'search' },
      ]);
  });

  for (const [name, key] of [
    ['Enter', '{enter}'],
    ['Space', ' '],
  ]) {
    it(`removes a skill with ${name} without submitting`, () => {
      cy.visit('/sender.html?slots');
      cy.get('[role="button"][aria-label="Remove skill"]').focus().type(key);
      cy.get('.sd-sender-skill-tag').should('not.exist');
      cy.get('input[placeholder="Name"]').should('have.value', 'Ada');
      metrics().its('submits').should('deep.equal', []);
    });
  }

  it('recalculates the structured editor row bounds when the input line height grows', () => {
    cy.visit('/sender.html?slots&resize');
    cy.get('.sd-rich-text-editor-content')
      .should('have.css', 'min-height', '40px')
      .and('have.css', 'max-height', '80px');
    control('Increase line height');
    cy.get('.sd-rich-text-editor-content')
      .should('have.css', 'min-height', '60px')
      .and('have.css', 'max-height', '120px');
  });

  it('keeps custom footer clear usable with hidden actions and honors readonly and disabled states', () => {
    cy.visit('/sender.html');
    control('Toggle actions');
    cy.get('.sd-sender-actions-list').should('not.exist');
    control('Footer clear');
    cy.get('textarea').should('have.value', '').type('Ready');
    control('Toggle readonly');
    cy.get('textarea').should('have.attr', 'readonly');
    cy.get('textarea').trigger('keydown', { key: 'x' });
    cy.contains('[role="tooltip"]', 'Read only').should('be.visible');
    cy.get('textarea').should('have.value', 'Ready');
    control('Toggle disabled');
    cy.get('textarea').should('be.disabled').trigger('keydown', { key: 'Enter', force: true });
    metrics().its('submits').should('be.empty');
  });
});
