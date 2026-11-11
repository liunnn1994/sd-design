/** @jsxImportSource react */
import { Avatar, List, ListItem, ListItemMeta } from '@sdata/web-react';
import { IconHeart, IconMessage, IconStar } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const names = ['苏格拉底', '巴尔扎克', '柏拉图'];
  const avatarSrc = [
    '//picsum.photos/1000/1000',
    '//picsum.photos/1000/1000',
    '//picsum.photos/1000/1000',
  ];
  const imageSrc = [
    '//picsum.photos/1200/840',
    '//picsum.photos/1200/840',
    '//picsum.photos/1200/840',
  ];
  const dataSource = Array.from({ length: 15 }, (_, index) => {
    return {
      index: index,
      avatar: avatarSrc[index % avatarSrc.length],
      title: names[index % names.length],
      description:
        '示例科技有限公司专注于数据分析与应用开发，通过统一的设计语言和组件，帮助团队构建高效、易用的产品。',
      imageSrc: imageSrc[index % imageSrc.length],
    };
  });
  const [paginationProps, setPaginationProps] = useState({
    defaultPageSize: 3,
    total: dataSource.length,
  });

  return (
    <>
      <List
        data-v-491e38ea=""
        className={'list-demo-action-layout'}
        bordered={false}
        data={dataSource}
        paginationProps={paginationProps}
        renderItem={({ item }) => (
          <>
            <ListItem
              data-v-491e38ea=""
              className={'list-demo-item'}
              actionLayout={'vertical'}
              actions={
                <>
                  <span data-v-491e38ea="">
                    <IconHeart data-v-491e38ea="" />
                    {'83'}
                  </span>
                  <span data-v-491e38ea="">
                    <IconStar data-v-491e38ea="" />
                    {formatValue(item.index)}
                  </span>
                  <span data-v-491e38ea="">
                    <IconMessage data-v-491e38ea="" />
                    {'回复'}
                  </span>
                </>
              }
              extra={
                <>
                  <div data-v-491e38ea="" className={'image-area'}>
                    <img data-v-491e38ea="" alt={'sd-design'} src={item.imageSrc} />
                  </div>
                </>
              }
            >
              <ListItemMeta
                data-v-491e38ea=""
                title={item.title}
                description={item.description}
                avatar={
                  <>
                    <Avatar data-v-491e38ea="" shape={'square'}>
                      <img data-v-491e38ea="" alt={'头像'} src={item.avatar} />
                    </Avatar>
                  </>
                }
              />
            </ListItem>
          </>
        )}
      />
      <style>
        {
          '\n.list-demo-action-layout .image-area[data-v-491e38ea] {\n    width: 183px;\n    height: 119px;\n    overflow: hidden;\n    border-radius: 2px;\n}\n.list-demo-action-layout .list-demo-item[data-v-491e38ea] {\n    padding: 20px 0;\n    border-bottom: 1px solid var(--color-fill-3);\n}\n.list-demo-action-layout .image-area img[data-v-491e38ea] {\n    width: 100%;\n}\n.list-demo-action-layout .sd-list-item-action .sd-icon[data-v-491e38ea] {\n    margin: 0 4px;\n}\n'
        }
      </style>
    </>
  );
}
