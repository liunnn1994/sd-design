describe('React Tree shared data adapter', () => {
  const read = () =>
    cy
      .get('[data-testid="nodes"]')
      .invoke('text')
      .then((text) => JSON.parse(text));
  beforeEach(() => cy.visit('/tree-data.html'));
  it('builds flattened nodes, preserves numeric zero keys and indexes actual nodes', () => {
    read().then((nodes) => {
      expect(nodes).to.have.length(4);
      expect(nodes[0].key).to.equal(0);
      expect(nodes[1]).to.include({ key: 'leaf', parent: 0, level: 1, leaf: true });
      expect(nodes[1].parents).to.deep.equal([0]);
    });
    cy.get('[data-testid="identity"]').should('have.text', 'true');
  });
  it('retains unique generated keys for repeated raw objects across rerenders', () => {
    read().then((before) => {
      expect(before[2].key).not.to.equal(before[3].key);
      cy.contains('button', 'Rerender').click();
      read().then((after) =>
        expect(after.map((node: { key: unknown }) => node.key)).to.deep.equal(
          before.map((node: { key: unknown }) => node.key),
        ),
      );
      cy.contains('button', 'Remove sibling').click();
      read().then((after) => {
        expect(after).to.have.length(3);
        expect(after[2].key).to.equal(before[2].key);
      });
    });
  });
  it('recomputes callback flags, lazy leaf state and line geometry', () => {
    cy.contains('button', /^Enable$/).click();
    read().then((nodes) => {
      expect(nodes[0]).to.include({
        selectable: false,
        checkable: false,
        block: true,
        line: true,
        draggable: true,
      });
      expect(nodes[1]).to.include({ selectable: true, checkable: true });
      expect(nodes[1].lineless).to.deep.equal([false]);
    });
    cy.contains('button', /^Lazy$/).click();
    read().then((nodes) => expect(nodes[1]).to.include({ leaf: false, selectable: false }));
  });
  it('maps fields and removes obsolete indexed nodes when data changes', () => {
    cy.contains('button', 'Replace').click();
    read().then((nodes) => {
      expect(nodes).to.have.length(1);
      expect(nodes[0].key).to.equal('replacement');
    });
    cy.contains('button', 'Empty').click();
    read().should('deep.equal', []);
    cy.contains('button', 'Map fields').click();
    read().then((nodes) => {
      expect(nodes[0]).to.include({ key: 0, title: 'Mapped' });
      expect(nodes[1]).to.include({ key: 'child', title: 'Child', disabled: true, parent: 0 });
    });
    cy.get('[data-testid="identity"]').should('have.text', 'true');
  });
  it('reflects raw node mutations on a parent rerender without changing generated keys', () => {
    read().then((before) => {
      cy.contains('button', 'Mutate title').click();
      read().then((after) => {
        expect(after[2].title).to.equal('Changed');
        expect(after[2].key).to.equal(before[2].key);
      });
    });
  });
});
