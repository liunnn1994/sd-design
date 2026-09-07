import Breadcrumb from '../index';

const BreadcrumbItem = Breadcrumb.Item;

describe('Breadcrumb', () => {
  it('exposes a labeled list (role=list + aria-label) and listitem roles', () => {
    cy.mount(Breadcrumb, {
      global: { components: { BreadcrumbItem } },
      slots: {
        default:
          '<sd-breadcrumb-item>Home</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>List</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>Detail</sd-breadcrumb-item>',
      },
    });
    cy.get('.sd-breadcrumb').should('have.attr', 'role', 'list');
    cy.get('.sd-breadcrumb').should('have.attr', 'aria-label', '面包屑');
    cy.get('.sd-breadcrumb-item').should('have.attr', 'role', 'listitem');
    // 分隔符对 SR 隐藏
    cy.get('.sd-breadcrumb-item-separator').should('have.attr', 'aria-hidden', 'true');
  });

  it('renders routes as cumulative links plus a plain-text last crumb', () => {
    cy.mount(Breadcrumb, {
      props: {
        routes: [
          { label: 'Home', path: 'home' },
          { label: 'List', path: 'list' },
          { label: 'Detail', path: 'detail' },
        ],
      },
    });
    cy.get('.sd-breadcrumb-item').should('have.length', 3);
    cy.get('.sd-breadcrumb-item a')
      .should('have.length', 2)
      .eq(0)
      .should('have.attr', 'href', '#/home');
    cy.get('.sd-breadcrumb-item a').eq(1).should('have.attr', 'href', '#/home/list');
    // 末项为纯文本，不是链接
    cy.get('.sd-breadcrumb-item').eq(2).find('a').should('not.exist');
    cy.get('.sd-breadcrumb-item').eq(2).should('have.text', 'Detail');
    // n 项 → n-1 个分隔符（末项无分隔符）
    cy.get('.sd-breadcrumb-item-separator').should('have.length', 2);
  });

  it('supports customUrl to override link hrefs', () => {
    cy.mount(Breadcrumb, {
      props: {
        routes: [
          { label: 'Home', path: 'home' },
          { label: 'List', path: 'list' },
        ],
        customUrl: (paths: string[]) => `https://example.com/${paths.join('/')}`,
      },
    });
    cy.get('.sd-breadcrumb-item a')
      .should('have.length', 1)
      .eq(0)
      .should('have.attr', 'href', 'https://example.com/home');
  });

  it('renders a dropdown trigger for routes with children and opens it on click', () => {
    cy.mount(Breadcrumb, {
      props: {
        routes: [
          { label: 'Home', path: 'home' },
          {
            label: 'List',
            path: 'list',
            children: [
              { label: 'Child A', path: 'a' },
              { label: 'Child B', path: 'path-b' },
            ],
          },
          { label: 'Detail', path: 'detail' },
        ],
      },
    });
    cy.get('.sd-breadcrumb-item').eq(1).should('have.class', 'sd-breadcrumb-item-with-dropdown');
    cy.get('.sd-breadcrumb-item-dropdown-icon').should('exist');
    cy.get('.sd-breadcrumb-item').eq(1).click();
    cy.get('.sd-dropdown-list').should('contain.text', 'Child A').and('contain.text', 'Child B');
    // 打开后图标高亮
    cy.get('.sd-breadcrumb-item-dropdown-icon').should(
      'have.class',
      'sd-breadcrumb-item-dropdown-icon-active',
    );
    // 点击空白处关闭
    cy.get('body').click();
    cy.get('.sd-breadcrumb-item-dropdown-icon').should(
      'not.have.class',
      'sd-breadcrumb-item-dropdown-icon-active',
    );
  });

  it('applies the separator prop to all item separators', () => {
    cy.mount(Breadcrumb, {
      props: { separator: '/' },
      slots: {
        default:
          '<sd-breadcrumb-item>Home</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>List</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>Detail</sd-breadcrumb-item>',
      },
    });
    cy.get('.sd-breadcrumb-item-separator').should('have.length', 2);
    cy.get('.sd-breadcrumb-item-separator').each(($el) => {
      expect($el.text()).to.equal('/');
    });
  });

  it('lets a BreadcrumbItem separator prop override the breadcrumb separator', () => {
    cy.mount(Breadcrumb, {
      props: { separator: '/' },
      slots: {
        default:
          '<sd-breadcrumb-item>Home</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item separator="-">List</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>Detail</sd-breadcrumb-item>',
      },
    });
    // 项级 separator 覆盖全局
    cy.get('.sd-breadcrumb-item-separator').eq(1).should('have.text', '-');
    // 其余仍用全局
    cy.get('.sd-breadcrumb-item-separator').eq(0).should('have.text', '/');
  });

  it('supports the breadcrumb-level separator slot over prop and default icon', () => {
    cy.mount(Breadcrumb, {
      props: { separator: '/' },
      slots: {
        default:
          '<sd-breadcrumb-item>Home</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>List</sd-breadcrumb-item>',
        separator: '<span class="custom-sep">→</span>',
      },
    });
    cy.get('.sd-breadcrumb-item-separator .custom-sep').should('have.length', 1);
    cy.get('.sd-breadcrumb-item-separator .custom-sep').should('have.text', '→');
  });

  it('supports an item-level separator slot with the highest precedence', () => {
    cy.mount(Breadcrumb, {
      slots: {
        default:
          '<sd-breadcrumb-item>Home</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item separator="-"><template #separator>+</template>List</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>Detail</sd-breadcrumb-item>',
      },
    });
    // 项级 slot 覆盖项级 prop 与默认图标
    cy.get('.sd-breadcrumb-item-separator').eq(1).should('have.text', '+');
    // 无 separator 配置时回退到默认斜线图标（无文本）
    cy.get('.sd-breadcrumb-item-separator').eq(0).should('have.text', '');
  });

  it('collapses middle crumbs behind a more icon when maxCount is exceeded', () => {
    cy.mount(Breadcrumb, {
      props: { maxCount: 2 },
      slots: {
        default:
          '<sd-breadcrumb-item>A</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>B</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>C</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>D</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>E</sd-breadcrumb-item>',
      },
    });
    // 可见：首项 + more 项 + 末项
    cy.get('.sd-breadcrumb-item').should('have.length', 3);
    cy.get('.sd-breadcrumb-item').eq(0).should('have.text', 'A');
    cy.get('.sd-breadcrumb-item')
      .eq(1)
      .should('have.attr', 'aria-label', '更多面包屑项')
      .find('.sd-icon-more')
      .should('exist');
    cy.get('.sd-breadcrumb-item').eq(2).should('have.text', 'E');
    // 被折叠项不渲染
    cy.contains('.sd-breadcrumb-item', 'B').should('not.exist');
    cy.contains('.sd-breadcrumb-item', 'C').should('not.exist');
    cy.contains('.sd-breadcrumb-item', 'D').should('not.exist');
  });

  it('does not collapse when total equals maxCount + 1 (boundary)', () => {
    cy.mount(Breadcrumb, {
      props: { maxCount: 3 },
      slots: {
        default:
          '<sd-breadcrumb-item>A</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>B</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>C</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>D</sd-breadcrumb-item>',
      },
    });
    cy.get('.sd-breadcrumb-item').should('have.length', 4);
    // 无折叠 → 无 more 项的 aria-label
    cy.get('.sd-breadcrumb-item[aria-label]').should('not.exist');
  });

  it('supports the more-icon slot when collapsed', () => {
    cy.mount(Breadcrumb, {
      props: { maxCount: 2 },
      slots: {
        'default':
          '<sd-breadcrumb-item>A</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>B</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>C</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>D</sd-breadcrumb-item>' +
          '<sd-breadcrumb-item>E</sd-breadcrumb-item>',
        'more-icon': '<span class="custom-more">···</span>',
      },
    });
    cy.get('.sd-breadcrumb-item').eq(1).find('.custom-more').should('have.text', '···');
    cy.get('.sd-icon-more').should('not.exist');
  });

  it('supports the item-render slot for routes mode', () => {
    cy.mount(Breadcrumb, {
      props: {
        routes: [
          { label: 'Home', path: 'home' },
          { label: 'List', path: 'list' },
          { label: 'Detail', path: 'detail' },
        ],
      },
      slots: {
        'item-render':
          '<template #item-render="{ route }"><em class="custom-item">{{ route.label }}</em></template>',
      },
    });
    cy.get('.custom-item').should('have.length', 3);
    cy.get('.custom-item').eq(0).should('have.text', 'Home');
    cy.get('.custom-item').eq(2).should('have.text', 'Detail');
    // 自定义渲染覆盖默认的链接/纯文本行为
    cy.get('.sd-breadcrumb-item a').should('not.exist');
  });
});
