import { defineComponent, h, ref } from 'vue';

import { isReadonlyModificationKey, useReadonlyTip } from '../use-readonly-tip';

const mountHarness = (readonly: boolean, disabled: boolean, duration = 200) => {
  cy.mount(
    defineComponent({
      setup() {
        const { tipVisible, show } = useReadonlyTip(ref(readonly), ref(disabled), { duration });
        return { tipVisible, show };
      },
      render() {
        return h('div', { 'data-tip': this.tipVisible ? 'on' : 'off' });
      },
    }),
  );
};

const callShow = () =>
  cy.get('@vue').then(({ wrapper }) => {
    (wrapper.vm as any).show();
  });

describe('isReadonlyModificationKey', () => {
  it('treats printable chars, Backspace, Delete, paste and cut as modifications', () => {
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'a' }))).to.equal(true);
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Z' }))).to.equal(true);
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Backspace' }))).to.equal(
      true,
    );
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Delete' }))).to.equal(
      true,
    );
    expect(
      isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true })),
    ).to.equal(true);
    expect(
      isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'x', metaKey: true })),
    ).to.equal(true);
  });

  it('does not treat navigation, Enter, or copy/select-all as modifications', () => {
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))).to.equal(
      false,
    );
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Home' }))).to.equal(
      false,
    );
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Tab' }))).to.equal(false);
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Enter' }))).to.equal(
      false,
    );
    expect(
      isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })),
    ).to.equal(false);
    expect(
      isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true })),
    ).to.equal(false);
    expect(isReadonlyModificationKey(new KeyboardEvent('keydown', { key: 'Shift' }))).to.equal(
      false,
    );
  });
});

describe('useReadonlyTip', () => {
  it('shows the tip and auto-hides after the duration', () => {
    cy.clock();
    mountHarness(true, false, 200);
    cy.get('[data-tip="off"]').should('exist');
    callShow();
    cy.get('[data-tip="on"]').should('exist');
    cy.tick(150);
    cy.get('[data-tip="on"]').should('exist');
    cy.tick(100);
    cy.get('[data-tip="off"]').should('exist');
  });

  it('resets the hide timer on each show()', () => {
    cy.clock();
    mountHarness(true, false, 200);
    callShow();
    cy.tick(150);
    callShow(); // reset
    cy.tick(150); // 300ms since first show, 150ms since reset -> still visible
    cy.get('[data-tip="on"]').should('exist');
    cy.tick(100); // 250ms since reset -> hidden
    cy.get('[data-tip="off"]').should('exist');
  });

  it('does not show when not readonly or when disabled', () => {
    mountHarness(false, false);
    callShow();
    cy.get('[data-tip="off"]').should('exist');

    mountHarness(true, true);
    callShow();
    cy.get('[data-tip="off"]').should('exist');
  });
});
