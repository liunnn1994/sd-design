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
    cy.get('.sd-sender-content').click(8, 8);
    cy.get('textarea').should('be.focused');
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
});
