import type { UnknownRecord } from 'type-fest';

import BasicCrudTable, { type BasicCrudTableInstance } from '..';

describe('BasicCrudTable request parameter identity', () => {
  it('reuses cached parameters until dependencies change and preserves explicit request objects', () => {
    const requests: UnknownRecord[] = [];
    cy.mount(BasicCrudTable, {
      props: {
        columns: [],
        fetchTableOnMounted: false,
        toolbarModel: { term: 'first' },
        fetchTableApi: (params: UnknownRecord) => {
          requests.push(params);
          return [];
        },
      },
    });
    cy.get('@vue').then(async ({ wrapper }) => {
      const crud = wrapper.vm as BasicCrudTableInstance;
      await crud.fetchTableData();
      requests[0].consumerMarker = true;
      await crud.fetchTableData();
      expect(requests[1]).to.equal(requests[0]);
      expect(requests[1].consumerMarker).to.equal(true);

      await wrapper.setProps({ toolbarModel: { term: 'second' } });
      await crud.fetchTableData();
      expect(requests[2]).not.to.equal(requests[0]);
      expect(requests[2]).to.deep.equal({ current: 1, pageSize: 10, term: 'second' });

      const explicit = { current: 9 };
      await crud.fetchTableData(explicit);
      expect(requests[3]).to.equal(explicit);
    });
  });
});
