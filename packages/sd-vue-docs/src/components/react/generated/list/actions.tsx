/** @jsxImportSource react */
import { Avatar, List, ListItem, ListItemMeta } from '@sdata/web-react';
import { IconDelete, IconEdit } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <List>
        {Array.from({ length: 4 }, (_, index) => index + 1).map((idx) => (
          <ListItem
            key={idx}
            actions={
              <>
                <IconEdit />
                <IconDelete />
              </>
            }
          >
            <ListItemMeta
              title={'示例科技有限公司'}
              description={'示例科技有限公司致力于提供便捷的数据服务。'}
              avatar={
                <>
                  <Avatar shape={'square'}>
                    <img alt={'头像'} src={'https://picsum.photos/1000/1000'} />
                  </Avatar>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}
