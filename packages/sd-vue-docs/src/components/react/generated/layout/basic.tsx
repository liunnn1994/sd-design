/** @jsxImportSource react */
import { Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutSider } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-43bbd04d="" className={'layout-basic-demo'}>
        <Layout data-v-43bbd04d="" className={'layout-basic-item'}>
          <LayoutHeader data-v-43bbd04d="">{'页头'}</LayoutHeader>
          <LayoutContent data-v-43bbd04d="">{'内容'}</LayoutContent>
          <LayoutFooter data-v-43bbd04d="">{'页脚'}</LayoutFooter>
        </Layout>
        <Layout data-v-43bbd04d="" className={'layout-basic-item'}>
          <LayoutHeader data-v-43bbd04d="">{'页头'}</LayoutHeader>
          <Layout data-v-43bbd04d="">
            <LayoutSider data-v-43bbd04d="" width={'25%'}>
              {'侧边栏'}
            </LayoutSider>
            <LayoutContent data-v-43bbd04d="">{'内容'}</LayoutContent>
          </Layout>
          <LayoutFooter data-v-43bbd04d="">{'页脚'}</LayoutFooter>
        </Layout>
        <Layout data-v-43bbd04d="" className={'layout-basic-item'}>
          <LayoutHeader data-v-43bbd04d="">{'页头'}</LayoutHeader>
          <Layout data-v-43bbd04d="">
            <LayoutContent data-v-43bbd04d="">{'内容'}</LayoutContent>
            <LayoutSider data-v-43bbd04d="" width={'25%'}>
              {'侧边栏'}
            </LayoutSider>
          </Layout>
          <LayoutFooter data-v-43bbd04d="">{'页脚'}</LayoutFooter>
        </Layout>
        <Layout data-v-43bbd04d="" className={'layout-basic-item'}>
          <LayoutSider data-v-43bbd04d="" width={'25%'}>
            {'侧边栏'}
          </LayoutSider>
          <Layout data-v-43bbd04d="">
            <LayoutHeader data-v-43bbd04d="">{'页头'}</LayoutHeader>
            <LayoutContent data-v-43bbd04d="">{'内容'}</LayoutContent>
            <LayoutFooter data-v-43bbd04d="">{'页脚'}</LayoutFooter>
          </Layout>
        </Layout>
      </div>
      <style>
        {
          '\n.layout-basic-demo[data-v-43bbd04d] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 16px;\n}\n.layout-basic-item[data-v-43bbd04d] {\n    width: calc(50% - 8px);\n    max-width: calc(50% - 8px);\n    overflow: hidden;\n    border-radius: 8px;\n}\n.layout-basic-item[data-v-43bbd04d] .sd-layout-header {\n    height: 64px;\n    padding-inline: 48px;\n    line-height: 64px;\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.layout-basic-item[data-v-43bbd04d] .sd-layout-content {\n    min-height: 120px;\n    line-height: 120px;\n    color: #fff;\n    text-align: center;\n    background: #0958d9;\n}\n.layout-basic-item[data-v-43bbd04d] .sd-layout-sider {\n    line-height: 120px;\n    color: #fff;\n    text-align: center;\n    background: #1677ff;\n}\n.layout-basic-item[data-v-43bbd04d] .sd-layout-footer {\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n'
        }
      </style>
    </>
  );
}
