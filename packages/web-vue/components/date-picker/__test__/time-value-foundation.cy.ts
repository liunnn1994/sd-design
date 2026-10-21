import { defineComponent, h, reactive } from 'vue';

import { dayjs } from '../../_utils/date';
import useRangeTimePickerValue from '../hooks/use-range-time-picker-value';
import useTimePickerValue from '../hooks/use-time-picker-value';

describe('DatePicker time value foundation adapters', () => {
  it('keeps selected identity, ignores undefined updates and resolves live defaults only on reset', () => {
    cy.mount(
      defineComponent({
        setup() {
          const selected = dayjs('2024-01-02 03:04:05');
          const props = reactive({
            selectedValue: selected as typeof selected | undefined,
            timePickerProps: { defaultValue: '06:07:08', format: 'HH:mm:ss' },
          });
          const [value, set, reset] = useTimePickerValue(props);
          return () =>
            h('div', [
              h('output', { id: 'native-time-value' }, value.value.format('HH:mm:ss')),
              h(
                'button',
                {
                  id: 'native-time-clear',
                  onClick: () => {
                    props.selectedValue = undefined;
                    set(undefined);
                  },
                },
                'Clear selected',
              ),
              h(
                'button',
                { id: 'native-time-set', onClick: () => set(dayjs('2024-01-02 09:10:11')) },
                'Set draft',
              ),
              h(
                'button',
                {
                  id: 'native-time-default',
                  onClick: () => {
                    props.timePickerProps.defaultValue = '12:13:14';
                  },
                },
                'Change default',
              ),
              h('button', { id: 'native-time-reset', onClick: reset }, 'Reset'),
            ]);
        },
      }),
    );
    cy.get('#native-time-value').should('have.text', '03:04:05');
    cy.get('#native-time-clear').click();
    cy.get('#native-time-value').should('have.text', '03:04:05');
    cy.get('#native-time-set').click();
    cy.get('#native-time-value').should('have.text', '09:10:11');
    cy.get('#native-time-default').click();
    cy.get('#native-time-value').should('have.text', '09:10:11');
    cy.get('#native-time-reset').click();
    cy.get('#native-time-value').should('have.text', '12:13:14');
  });

  it('splits range defaults, updates defined sides and resets selected/default sides independently', () => {
    cy.mount(
      defineComponent({
        setup() {
          const chosen = dayjs('2024-01-02 15:16:17');
          const props = reactive({
            selectedValue: undefined as Array<typeof chosen | undefined> | undefined,
            timePickerProps: { defaultValue: ['01:02:03', '04:05:06'], format: 'HH:mm:ss' },
          });
          const [values, set, reset] = useRangeTimePickerValue(props);
          return () =>
            h('div', [
              h(
                'output',
                { id: 'native-range-time-value' },
                values.value.map((value) => value.format('HH:mm:ss')).join('|'),
              ),
              h(
                'button',
                {
                  id: 'native-range-time-set',
                  onClick: () => set([undefined, dayjs('2024-01-02 09:10:11')]),
                },
                'Set right',
              ),
              h(
                'button',
                {
                  id: 'native-range-time-select',
                  onClick: () => {
                    props.selectedValue = [chosen, undefined];
                  },
                },
                'Select left',
              ),
              h(
                'button',
                {
                  id: 'native-range-time-default',
                  onClick: () => {
                    props.timePickerProps.defaultValue = ['11:12:13', '18:19:20'];
                  },
                },
                'Change defaults',
              ),
              h('button', { id: 'native-range-time-reset', onClick: reset }, 'Reset'),
            ]);
        },
      }),
    );
    cy.get('#native-range-time-value').should('have.text', '01:02:03|04:05:06');
    cy.get('#native-range-time-set').click();
    cy.get('#native-range-time-value').should('have.text', '01:02:03|09:10:11');
    cy.get('#native-range-time-select').click();
    cy.get('#native-range-time-value').should('have.text', '15:16:17|09:10:11');
    cy.get('#native-range-time-default').click();
    cy.get('#native-range-time-reset').click();
    cy.get('#native-range-time-value').should('have.text', '15:16:17|18:19:20');
  });
});
