/** @jsxImportSource react */
import { Layout, LayoutContent, LayoutFooter, LayoutHeader } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Layout data-v-fefa5039="" className={'layout-top-demo'}>
        <LayoutHeader data-v-fefa5039="">{'页头'}</LayoutHeader>
        <LayoutContent data-v-fefa5039="">{'内容'}</LayoutContent>
        <LayoutFooter data-v-fefa5039="">{'页脚'}</LayoutFooter>
      </Layout>
      <style>
        {
          '\n.layout-top-demo[data-v-fefa5039] {\n    border-radius: 8px;\n    overflow: hidden;\n}\n.layout-top-demo[data-v-fefa5039] .sd-layout-header {\n    height: 64px;\n    padding-inline: 48px;\n    line-height: 64px;\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.layout-top-demo[data-v-fefa5039] .sd-layout-content {\n    min-height: 120px;\n    line-height: 120px;\n    color: #fff;\n    text-align: center;\n    background: #0958d9;\n}\n.layout-top-demo[data-v-fefa5039] .sd-layout-footer {\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n'
        }
      </style>
    </>
  );
}
