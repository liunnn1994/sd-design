import { defineComponent, h, reactive, ref } from 'vue';

import type { Key2TreeNode, TreeNodeKey } from '../../tree/interface';

import useCheckedState from '../../tree/hooks/use-checked-state';
import { useTeleportContainer } from '../use-teleport-container';
import { useTrigger } from '../use-trigger';

describe('Tree and popup state foundation adapters', () => {
  it('keeps default selection, controlled shadow, strict half keys and release clearing', () => {
    cy.mount(
      defineComponent({
        setup() {
          const props = reactive({
            defaultCheckedKeys: ['default'],
            checkedKeys: undefined as TreeNodeKey[] | undefined,
            halfCheckedKeys: undefined as TreeNodeKey[] | undefined,
            key2TreeNode: new Map() as Key2TreeNode,
            checkStrictly: true,
            onlyCheckLeaf: false,
          });
          const api = useCheckedState(props);
          return () =>
            h('div', [
              h(
                'output',
                { id: 'tree-state-report' },
                `${api.checkedKeys.value.join(',')}|${api.indeterminateKeys.value.join(',')}`,
              ),
              h(
                'button',
                {
                  id: 'tree-state-local',
                  onClick: () => api.setCheckedState(['pending'], ['half']),
                },
                'Local',
              ),
              h(
                'button',
                {
                  id: 'tree-state-half',
                  onClick: () => {
                    props.halfCheckedKeys = [];
                  },
                },
                'Empty half override',
              ),
              h(
                'button',
                {
                  id: 'tree-state-control',
                  onClick: () => {
                    props.checkedKeys = ['held'];
                  },
                },
                'Control',
              ),
              h(
                'button',
                {
                  id: 'tree-state-release',
                  onClick: () => {
                    props.checkedKeys = undefined;
                    props.halfCheckedKeys = undefined;
                  },
                },
                'Release',
              ),
            ]);
        },
      }),
    );
    cy.get('#tree-state-report').should('have.text', 'default|');
    cy.get('#tree-state-local').click();
    cy.get('#tree-state-report').should('have.text', 'pending|half');
    cy.get('#tree-state-half').click();
    cy.get('#tree-state-report').should('have.text', 'pending|');
    cy.get('#tree-state-control').click();
    cy.get('#tree-state-report').should('have.text', 'held|');
    cy.get('#tree-state-local').click();
    cy.get('#tree-state-report').should('have.text', 'held|');
    cy.get('#tree-state-release').click();
    cy.get('#tree-state-report').should('have.text', '|');
  });
  it('retains four ordered alias events, public-model rejection and local synchronization on release', () => {
    cy.mount(
      defineComponent({
        setup() {
          const popupVisible = ref<boolean | undefined>(false),
            show = ref<boolean | undefined>(true),
            events = ref<string[]>([]);
          const api = useTrigger({
            popupVisible,
            show,
            defaultShow: ref(true),
            emit: (name, value) => {
              events.value.push(`${name}:${value}`);
            },
          });
          return () =>
            h('div', [
              h('output', { id: 'popup-state-report' }, String(api.computedPopupVisible.value)),
              h('output', { id: 'popup-state-events' }, events.value.join('|')),
              h(
                'button',
                { id: 'popup-state-request', onClick: () => api.handlePopupVisibleChange(true) },
                'Request',
              ),
              h(
                'button',
                {
                  id: 'popup-state-release-primary',
                  onClick: () => {
                    popupVisible.value = undefined;
                  },
                },
                'Release primary',
              ),
              h(
                'button',
                {
                  id: 'popup-state-hide',
                  onClick: () => {
                    show.value = false;
                  },
                },
                'External hide',
              ),
              h(
                'button',
                {
                  id: 'popup-state-release-all',
                  onClick: () => {
                    show.value = undefined;
                  },
                },
                'Release aliases',
              ),
            ]);
        },
      }),
    );
    cy.get('#popup-state-report').should('have.text', 'false');
    cy.get('#popup-state-request').click();
    cy.get('#popup-state-report').should('have.text', 'false');
    cy.get('#popup-state-events').should(
      'have.text',
      'update:popupVisible:true|popupVisibleChange:true|update:show:true|showChange:true',
    );
    cy.get('#popup-state-release-primary').click();
    cy.get('#popup-state-report').should('have.text', 'true');
    cy.get('#popup-state-hide').click();
    cy.get('#popup-state-report').should('have.text', 'false');
    cy.get('#popup-state-release-all').click();
    cy.get('#popup-state-report').should('have.text', 'false');
    cy.get('#popup-state-request').click();
    cy.get('#popup-state-report').should('have.text', 'true');
  });
  it('resolves mounted containers, defers hidden changes and follows the current visible target', () => {
    cy.mount(
      defineComponent({
        setup() {
          const popupContainer = ref<string | HTMLElement | null | undefined>(
              '#missing-hook-container',
            ),
            visible = ref(false);
          const api = useTeleportContainer({ popupContainer, visible });
          return () =>
            h('div', [
              h('div', { id: 'hook-portal-a' }),
              h('div', { id: 'hook-portal-b' }),
              h(
                'output',
                { id: 'teleport-state-report' },
                `${api.teleportContainer.value}|${api.containerRef.value === document.body ? 'body' : api.containerRef.value?.id}`,
              ),
              h(
                'button',
                {
                  id: 'teleport-state-target-a',
                  onClick: () => {
                    popupContainer.value = '#hook-portal-a';
                  },
                },
                'Target A',
              ),
              h(
                'button',
                {
                  id: 'teleport-state-target-b',
                  onClick: () => {
                    popupContainer.value = '#hook-portal-b';
                  },
                },
                'Target B',
              ),
              h(
                'button',
                {
                  id: 'teleport-state-toggle',
                  onClick: () => {
                    visible.value = !visible.value;
                  },
                },
                'Toggle visibility',
              ),
            ]);
        },
      }),
    );
    cy.get('#teleport-state-report').should('have.text', 'body|body');
    cy.get('#teleport-state-target-a').click();
    cy.get('#teleport-state-report').should('have.text', 'body|body');
    cy.get('#teleport-state-toggle').click();
    cy.get('#teleport-state-report').should('have.text', '#hook-portal-a|hook-portal-a');
    cy.get('#teleport-state-toggle').click();
    cy.get('#teleport-state-target-b').click();
    cy.get('#teleport-state-report').should('have.text', '#hook-portal-a|hook-portal-a');
    cy.get('#teleport-state-toggle').click();
    cy.get('#teleport-state-report').should('have.text', '#hook-portal-b|hook-portal-b');
  });
});
