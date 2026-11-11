/** @jsxImportSource react */
import { List, ListItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <List gridProps={{ gutter: 0, span: 6 }} bordered={false}>
        <ListItem>
          <List header={<>{'平台'}</>}>
            <ListItem>{'iOS'}</ListItem>
            <ListItem>{'Android'}</ListItem>
            <ListItem>{'Web'}</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List header={<>{'框架'}</>}>
            <ListItem>{'Angular'}</ListItem>
            <ListItem>{'Vue'}</ListItem>
            <ListItem>{'React'}</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List header={<>{'语言'}</>}>
            <ListItem>{'C++'}</ListItem>
            <ListItem>{'JavaScript'}</ListItem>
            <ListItem>{'Python'}</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List header={<>{'组件'}</>}>
            <ListItem>{'按钮'}</ListItem>
            <ListItem>{'面包屑'}</ListItem>
            <ListItem>{'穿梭框'}</ListItem>
          </List>
        </ListItem>
      </List>
    </>
  );
}
