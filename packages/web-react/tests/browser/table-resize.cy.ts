describe('React Table column resize', () => {
  beforeEach(() => cy.visit('/table-resize.html'));
  const move = (offset: number) =>
    cy.get('.sd-table-th').then(($th) => {
      cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
        handle.dispatchEvent(
          new PointerEvent('pointermove', { clientX: $th[0]!.getBoundingClientRect().x + offset }),
        );
      });
    });
  it('uses real header geometry, enforces minimum width and releases the drag on pointerup', () => {
    cy.get('.sd-table-column-handle')
      .as('resizeHandle', { type: 'static' })
      .trigger('pointerdown', { isPrimary: true, eventConstructor: 'PointerEvent', clientX: 160 });
    cy.get('.sd-table-th').should('have.class', 'sd-table-th-resizing');
    move(230);
    cy.get('.sd-table-th').should('have.css', 'width', '230px');
    move(10);
    cy.get('.sd-table-th').should('have.css', 'width', '40px');
    cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
      handle.dispatchEvent(new PointerEvent('pointerup'));
    });
    cy.get('.sd-table-th').should('not.have.class', 'sd-table-th-resizing');
    move(300);
    cy.get('output').should('have.text', '230,40');
  });
  it('captures a native mouse pointer after it leaves the resize handle', () => {
    cy.get('.sd-table-column-handle').then(async ([handle]) => {
      const capture = cy.spy();
      const release = cy.spy();
      const move = cy.spy();
      handle.addEventListener('gotpointercapture', capture, { once: true });
      handle.addEventListener('lostpointercapture', release, { once: true });
      handle.addEventListener('pointermove', move, { once: true });
      const rect = handle.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y = rect.top + rect.height / 2;
      let dx = 80;
      let dy = 50;
      let view: Window = handle.ownerDocument.defaultView!;
      while (view !== view.top) {
        const frame = (view.frameElement ??
          Array.from(view.parent.document.querySelectorAll('iframe')).find(
            (iframe) => iframe.contentWindow === view,
          )) as HTMLElement;
        const bounds = frame.getBoundingClientRect();
        const scaleX = bounds.width / frame.offsetWidth;
        const scaleY = bounds.height / frame.offsetHeight;
        x = bounds.left + x * scaleX;
        y = bounds.top + y * scaleY;
        dx *= scaleX;
        dy *= scaleY;
        view = view.parent;
      }
      const mouse = (type: string, x: number, y: number) =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchMouseEvent',
          params: {
            type,
            x,
            y,
            button: 'left',
            buttons: type === 'mouseReleased' ? 0 : 1,
            clickCount: type === 'mouseMoved' ? 0 : 1,
          },
        });
      await mouse('mousePressed', x, y);
      try {
        await mouse('mouseMoved', x + dx, y + dy);
        expect(capture).to.have.been.calledOnce;
        expect(move).to.have.been.calledOnce;
      } finally {
        await mouse('mouseReleased', x + dx, y + dy);
      }
      expect(release).to.have.been.calledOnce;
    });
    cy.get('.sd-table-th').should('not.have.class', 'sd-table-th-resizing');
    cy.get('output').should(($output) => expect(Number($output.text())).to.be.greaterThan(200));
  });
  it('releases handle listeners when a drag is interrupted by a context menu', () => {
    cy.get('.sd-table-column-handle')
      .as('resizeHandle', { type: 'static' })
      .trigger('pointerdown', { isPrimary: true, eventConstructor: 'PointerEvent' });
    move(200);
    cy.get('.sd-table-column-handle').trigger('contextmenu');
    move(250);
    cy.get('output').should('have.text', '200');
    cy.get('.sd-table-th').should('not.have.class', 'sd-table-th-resizing');
  });
  it('disposes a pending drag when its header unmounts and can start a fresh drag after remount', () => {
    cy.get('.sd-table-column-handle')
      .as('resizeHandle', { type: 'static' })
      .trigger('pointerdown', { isPrimary: true, eventConstructor: 'PointerEvent' });
    move(200);
    cy.contains('button', 'Toggle header').trigger('click');
    cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
      handle.dispatchEvent(new PointerEvent('pointermove', { clientX: 300 }));
    });
    cy.get('output').should('have.text', '200');
    cy.contains('button', 'Toggle header').click();
    cy.get('.sd-table-th').should('have.css', 'width', '160px');
    cy.get('.sd-table-column-handle')
      .as('resizeHandle', { type: 'static' })
      .trigger('pointerdown', { isPrimary: true, eventConstructor: 'PointerEvent' });
    move(220);
    cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
      handle.dispatchEvent(new PointerEvent('pointerup'));
    });
    cy.get('output').should('have.text', '200,220');
  });
});
