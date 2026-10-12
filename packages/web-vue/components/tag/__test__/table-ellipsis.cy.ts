import { h } from 'vue';

import Table from '../../table';
import Tag from '../index';

const longText = '表格中需要省略的长标签内容'.repeat(10);

describe('Tag ellipsis in Table', () => {
  for (const performant of [false, true]) {
    for (const columnEllipsis of [false, true]) {
      it(`truncates within the cell (performant=${performant}, column ellipsis=${columnEllipsis})`, () => {
        cy.mount(Table, {
          props: {
            style: { width: '320px' },
            pagination: false,
            data: [
              { key: '1', label: longText },
              { key: '2', label: '短标签' },
            ],
            columns: [
              {
                title: '标签',
                dataIndex: 'label',
                width: 160,
                ellipsis: columnEllipsis,
                render: ({ record }) =>
                  h(
                    Tag,
                    {
                      closable: true,
                      ellipsisPerformant: performant,
                      ellipsisTooltip: { popupDelay: 0, popupAnimation: false },
                    },
                    { default: () => record.label, icon: () => h('span', '★') },
                  ),
              },
              { title: '其他列', dataIndex: 'key', width: 160 },
            ],
          },
        });

        cy.get('.sd-tag')
          .first()
          .should(($tag) => {
            const tag = $tag[0];
            const cell = tag.closest('.sd-table-td-content')!;
            expect(tag.getBoundingClientRect().width).to.be.at.most(cell.clientWidth);
          });
        cy.get('.sd-tag-text')
          .first()
          .should(($text) => {
            expect($text[0].scrollWidth).to.be.greaterThan($text[0].clientWidth);
            expect($text.css('text-overflow')).to.equal('ellipsis');
          });
        cy.get('.sd-tag-close-btn')
          .first()
          .should(($close) => {
            const tag = $close[0].closest('.sd-tag')!.getBoundingClientRect();
            expect($close[0].getBoundingClientRect().right).to.be.at.most(tag.right);
          });
        cy.get('.sd-tag-text').first().trigger('mouseenter');
        cy.get('[role="tooltip"]').should('be.visible').and('contain.text', longText);
        cy.get('.sd-tag')
          .last()
          .should(($tag) => {
            expect($tag[0].getBoundingClientRect().width).to.be.lessThan(
              $tag[0].closest('.sd-table-td-content')!.clientWidth,
            );
          });
        cy.get('.sd-tag-close-btn').first().click();
        cy.get('.sd-tag').should('have.length', 1);
      });
    }
  }
});
