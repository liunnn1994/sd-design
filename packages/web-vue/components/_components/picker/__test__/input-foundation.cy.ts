import { dayjs } from '../../../_utils/date';
import PickerInputRange from '../input-range.vue';
import PickerInput from '../input.vue';

describe('Picker input foundation adapters', () => {
  it('preserves explicit empty drafts, formatting and placeholder/fallback sizing', () => {
    cy.mount(PickerInput, {
      props: {
        value: dayjs('2024-02-29'),
        format: 'YYYY/MM/DD',
        fitWidth: true,
        placeholder: 'Choose date',
      },
    });
    cy.get('input').should('have.value', '2024/02/29');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ inputValue: '' }));
    cy.get('input').should('have.value', '').and('have.attr', 'placeholder', 'Choose date');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        inputValue: undefined,
        format: (value: ReturnType<typeof dayjs>) => value.format('MM-DD'),
      }),
    );
    cy.get('input').should('have.value', '02-29');
    cy.get('.sd-picker-input').should((element) =>
      expect(element[0].getBoundingClientRect().width).to.be.greaterThan(0),
    );
  });

  it('keeps an empty range draft array authoritative, then releases to both dates', () => {
    cy.mount(PickerInputRange, {
      props: {
        value: [dayjs('2024-01-02'), dayjs('2024-03-04')],
        format: 'YYYY/MM/DD',
        inputValue: [],
      },
    });
    cy.get('input').eq(0).should('have.value', '');
    cy.get('input').eq(1).should('have.value', '');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ inputValue: ['draft'] }));
    cy.get('input').eq(0).should('have.value', 'draft');
    cy.get('input').eq(1).should('have.value', '');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ inputValue: undefined }));
    cy.get('input').eq(0).should('have.value', '2024/01/02');
    cy.get('input').eq(1).should('have.value', '2024/03/04');
  });

  it('keeps range focus requests controlled, ordered and separate from active input decoration', () => {
    const events: unknown[][] = [];
    cy.mount(PickerInputRange, {
      props: {
        'format': 'YYYY/MM/DD',
        'focusedIndex': 0,
        'onFocusedIndexChange': (index: number) => events.push(['change', index]),
        'onUpdate:focusedIndex': (index: number) => events.push(['update', index]),
      },
    });
    cy.get('input').eq(1).click();
    cy.then(() =>
      expect(events).to.deep.equal([
        ['change', 1],
        ['update', 1],
      ]),
    );
    cy.get('.sd-picker-input').eq(0).should('have.class', 'sd-picker-input-active');
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as unknown as { focus(): void }).focus());
    cy.get('input').eq(0).should('have.focus');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ focusedIndex: 1 }));
    cy.get('.sd-picker-input').eq(1).should('have.class', 'sd-picker-input-active');
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as unknown as { focus(): void }).focus());
    cy.get('input').eq(1).should('have.focus');
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as unknown as { blur(): void }).blur());
    cy.get('input').eq(1).should('not.have.focus');
  });

  it('keeps disabled-side native focus guards and range Tab/input event handling', () => {
    let changes = 0;
    cy.mount(PickerInputRange, {
      props: {
        format: 'YYYY/MM/DD',
        disabled: [true, false],
        focusedIndex: 1,
        onChange: () => changes++,
      },
    });
    cy.get('input').eq(0).should('be.disabled');
    cy.get('input').eq(1).should('not.be.disabled').focus().type('draft');
    cy.then(() => expect(changes).to.equal(5));
    cy.get('@vue').then(({ wrapper }) =>
      (wrapper.vm as unknown as { focus(index: number): void }).focus(0),
    );
    cy.get('input')
      .eq(1)
      .should('have.focus')
      .then((input) => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        input[0].dispatchEvent(event);
        expect(event.defaultPrevented).to.equal(true);
      });
  });
});
