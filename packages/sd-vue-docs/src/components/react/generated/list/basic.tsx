/** @jsxImportSource react */
import { List, ListItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <List header={<>{' 列表标题 '}</>}>
        <ListItem>{'示例科技有限公司'}</ListItem>
        <ListItem>{'示例科技研发中心'}</ListItem>
        <ListItem>{'示例数据有限公司'}</ListItem>
        <ListItem>{'示例云服务有限公司'}</ListItem>
        <ListItem>{'示例科技北京分公司'}</ListItem>
      </List>
    </>
  );
}
