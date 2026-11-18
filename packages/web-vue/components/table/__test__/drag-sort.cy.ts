import { h, ref } from 'vue';

import VirtualDragDemo from '../../../../sd-vue-docs/src/components/generated/table/virtual-drag.vue';
import { startDrag, moveDrag } from '../../../cypress/support/drag-sort';
import Table from '../table.vue';

const columns = [{ title: 'Name', dataIndex: 'name' }];
const rows = (count: number) =>
  Array.from({ length: count }, (_, key) => ({ key, name: `Row ${key}` }));

describe('Table controlled drag sorting', () => {
  it('reorders a scrolled virtual window and can scroll again after committing', () => {
    const data = ref(rows(200));
    const change = cy.spy().as('change');
    cy.mount(() =>
      h(Table, {
        columns,
        data: data.value,
        pagination: false,
        draggable: {},
        virtualListProps: { height: 240, itemSize: 40, fixedSize: true },
        onChange: (_page, extra, all) => {
          change(_page, extra, all);
          data.value = all.map((row) => row.raw ?? row) as typeof data.value;
        },
      }),
    );
    cy.get('.sd-virtual-list-scroller').scrollTo(0, 2000);
    cy.get('[data-table-drag-path="[51]"]').should('be.visible');
    const cell = '[data-table-drag-path="[51]"] .sd-table-drag-handle';
    cy.get(cell).should('have.css', 'cursor', 'grab').find('svg').should('not.exist');
    cy.window().then((win) => {
      cy.spy(win.Element.prototype, 'animate').as('rowAnimation');
    });
    startDrag(cell);
    const target = '[data-table-drag-path="[53]"] .sd-table-td-content';
    moveDrag(target, 0.5, false);
    cy.get(target).should('have.css', 'cursor', 'grabbing');
    moveDrag(target);
    cy.get(target).should('not.have.css', 'cursor', 'grabbing');
    cy.get('@change').should('have.been.calledOnce');
    cy.get('@rowAnimation').should('have.been.called');
    cy.then(() => {
      expect(
        change.firstCall.args[0].map((row: { key: number }) => row.key).slice(50, 55),
      ).to.deep.equal([50, 52, 53, 51, 54]);
      expect(change.firstCall.args[1].dragTarget.key).to.equal(51);
    });
    cy.get('.sd-virtual-list-scroller').scrollTo('bottom');
    cy.contains('.sd-table-tr', 'Row 199').should('be.visible');
    cy.get('.sd-virtual-list-scroller').scrollTo('top');
    cy.contains('.sd-table-tr', 'Row 0').should('be.visible');
  });

  it('animates the expanded detail when its main row moves', () => {
    const data = ref(rows(3));
    cy.mount(() =>
      h(Table, {
        columns,
        data: data.value,
        draggable: {},
        pagination: false,
        expandable: { defaultExpandedRowKeys: [0], expandedRowRender: () => 'Details 0' },
        onChange: (_page, _extra, all) => {
          data.value = all.map((row) => row.raw ?? row) as typeof data.value;
        },
      }),
    );
    const detail = '.sd-table-tr-expand .sd-table-td';
    cy.get(detail).should('contain.text', 'Details 0');
    cy.window().then((win) => {
      const animation = cy.spy(win.Element.prototype, 'animate');
      startDrag('[data-table-drag-path="[0]"] .sd-table-drag-handle');
      moveDrag('[data-table-drag-path="[2]"]');
      cy.get('[data-table-drag-path="[2]"]').should('contain.text', 'Row 0');
      cy.wrap(animation).should(() => {
        expect(
          animation.thisValues.some((element) => element.closest('.sd-table-tr-expand')),
        ).to.equal(true);
      });
      cy.get(detail).should('contain.text', 'Details 0');
    });
  });

  it('ends on the first browser mouse release without another click', () => {
    const change = cy.spy().as('releaseChange');
    cy.mount(Table, {
      props: { columns, data: rows(3), pagination: false, draggable: {}, onChange: change },
    });
    function mouseAt(selector: string, type: string, buttons: number) {
      return cy
        .get(selector)
        .first()
        .then(($element) => {
          const rect = $element[0].getBoundingClientRect();
          let x = rect.left + rect.width / 2;
          let y = rect.top + rect.height / 2;
          let view = $element[0].ownerDocument.defaultView!;
          while (view !== view.top) {
            const frame = (view.frameElement ??
              Array.from(view.parent.document.querySelectorAll('iframe')).find(
                (iframe) => iframe.contentWindow === view,
              )) as HTMLElement;
            const bounds = frame.getBoundingClientRect();
            x = bounds.left + (x * bounds.width) / frame.offsetWidth;
            y = bounds.top + (y * bounds.height) / frame.offsetHeight;
            view = view.parent;
          }
          return Cypress.automation('remote:debugger:protocol', {
            command: 'Input.dispatchMouseEvent',
            params: {
              type,
              x,
              y,
              button: type === 'mouseMoved' ? 'none' : 'left',
              buttons,
              clickCount: 1,
            },
          });
        });
    }
    mouseAt('[data-table-drag-path="[0]"] .sd-table-drag-handle', 'mousePressed', 1);
    mouseAt('[data-table-drag-path="[1]"] .sd-table-drag-handle', 'mouseMoved', 1);
    cy.get('.sortable-fallback').should('exist');
    mouseAt('[data-table-drag-path="[2]"] .sd-table-drag-handle', 'mouseMoved', 1);
    mouseAt('[data-table-drag-path="[2]"] .sd-table-drag-handle', 'mouseReleased', 0);
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('@releaseChange').should('have.been.calledOnce');
    mouseAt('[data-table-drag-path="[1]"] .sd-table-drag-handle', 'mouseMoved', 0);
    cy.get('.sortable-fallback').should('not.exist');
    cy.get('@releaseChange').should('have.been.calledOnce');
  });

  it('keeps the source identity when virtual scrolling recycles it during a drag', () => {
    const change = cy.spy().as('change');
    cy.mount(Table, {
      props: {
        columns,
        data: rows(200),
        pagination: false,
        draggable: {},
        virtualListProps: { height: 240, itemSize: 40, fixedSize: true },
        onChange: change,
      },
    });
    startDrag('[data-table-drag-path="[1]"] .sd-table-drag-handle');
    cy.get('.sd-virtual-list-scroller').scrollTo(0, 2000);
    cy.get('[data-table-drag-path="[51]"]').should('be.visible');
    cy.get('.sd-table-body [data-table-drag-path="[1]"]').should('not.exist');
    moveDrag('[data-table-drag-path="[51]"]', 0.5, false);
    // Exercise Sortable's fallback polling while the original row is detached.
    cy.wait(100);
    moveDrag('[data-table-drag-path="[51]"]');
    cy.get('@change').should('have.been.calledOnce');
    cy.then(() => {
      expect(change.firstCall.args[0][51].key).to.equal(1);
      expect(change.firstCall.args[0]).to.have.length(200);
    });
  });

  it('inserts before the third virtual row when released in its upper half', () => {
    cy.mount(VirtualDragDemo);
    const first = '[data-table-drag-path="[0]"] .sd-table-drag-handle';
    const third = '[data-table-drag-path="[2]"]';
    cy.get(first).find('svg').should('be.visible');
    startDrag(first);
    moveDrag(third, 0.15, false);
    cy.get(third)
      .should('have.class', 'sd-table-tr-drop-target')
      .and('not.have.attr', 'data-table-drop-after');
    moveDrag(third, 0.15);
    cy.get('[data-table-drag-path="[0]"]').should('contain.text', '记录 2');
    cy.get('[data-table-drag-path="[1]"]').should('contain.text', '记录 1');
    cy.get(third).should('contain.text', '记录 3');
  });

  it('cancels with Escape and rejects a drop outside the table', () => {
    cy.mount(Table, { props: { columns, data: rows(3), pagination: false, draggable: {} } });
    startDrag('.sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[2]"]', 0.5, false);
    cy.document().trigger('keydown', { key: 'Escape' });
    moveDrag('[data-table-drag-path="[2]"]');
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('change')).to.equal(undefined));
    startDrag('.sd-table-drag-handle');
    cy.document().trigger('mouseup', { eventConstructor: 'MouseEvent', clientX: 0, clientY: 0 });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('change')).to.equal(undefined));
  });

  it('only reorders siblings and excludes expanded content', () => {
    cy.mount(Table, {
      props: {
        columns,
        pagination: false,
        draggable: {},
        defaultExpandAllRows: true,
        data: [
          {
            key: 'p',
            name: 'Parent',
            children: [
              { key: 'a', name: 'A' },
              { key: 'b', name: 'B' },
            ],
          },
          { key: 'q', name: 'Other' },
        ],
      },
    });
    startDrag('[data-table-drag-path="[0,0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[1]"]');
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('change')).to.equal(undefined));
    startDrag('[data-table-drag-path="[0,0]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[0,1]"]');
    cy.get('@vue').should(({ wrapper }) => {
      const page = wrapper.emitted('change')?.[0]?.[0];
      expect(page[0].children.map((row: { key: string }) => row.key)).to.deep.equal(['b', 'a']);
    });
  });
  it('commits the documentation demo order through its change handler', () => {
    cy.mount(VirtualDragDemo);
    startDrag('[data-table-drag-path="[1]"] .sd-table-drag-handle');
    moveDrag('[data-table-drag-path="[3]"]');
    cy.get('[data-table-drag-path="[3]"]').should('contain.text', '记录 2');
    cy.get('[data-table-drag-path="[1]"]').should('contain.text', '记录 3');
  });

  it('removes the floating clone when unmounted during a drag', () => {
    cy.mount(Table, { props: { columns, data: rows(3), pagination: false, draggable: {} } });
    startDrag('.sd-table-drag-handle');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('.sortable-fallback').should('not.exist');
    cy.document().trigger('click');
  });
  for (const ending of ['drop', 'escape', 'unmount']) {
    it(`prevents text selection and bubbling, restoring selection after ${ending}`, () => {
      const pointerdown = cy.spy().as('parentPointerdown');
      cy.mount(() =>
        h('section', { onPointerdown: pointerdown }, [
          h('p', { id: 'drag-selection-text' }, 'Selectable text'),
          h(Table, { columns, data: rows(3), pagination: false, draggable: {} }),
        ]),
      );
      let previousUserSelect = '';
      cy.document().then((doc) => {
        previousUserSelect = doc.body.style.getPropertyValue('user-select');
        const range = doc.createRange();
        range.selectNodeContents(doc.querySelector('#drag-selection-text')!);
        doc.getSelection()?.addRange(range);
      });
      startDrag('.sd-table-drag-handle');
      cy.get('@parentPointerdown').should('not.have.been.called');
      cy.document().then((doc) => {
        expect(doc.getSelection()?.toString()).to.equal('');
        expect(doc.body.style.getPropertyValue('user-select')).to.equal('none');
        const event = new Event('selectstart', { bubbles: true, cancelable: true });
        expect(doc.querySelector('#drag-selection-text')!.dispatchEvent(event)).to.equal(false);
      });
      if (ending === 'unmount') {
        cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
        cy.document().trigger('click');
      } else {
        if (ending === 'escape') cy.document().trigger('keydown', { key: 'Escape' });
        moveDrag('[data-table-drag-path="[2]"]');
      }
      cy.document().then((doc) => {
        expect(doc.body.style.getPropertyValue('user-select')).to.equal(previousUserSelect);
        const event = new Event('selectstart', { bubbles: true, cancelable: true });
        expect(doc.body.dispatchEvent(event)).to.equal(true);
      });
    });
  }
});
