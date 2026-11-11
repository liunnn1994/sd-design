import { Avatar, Card, CardMeta, TypographyText } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconThumbUp, IconShareInternal, IconMore } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Card
        data-v-44c88414=""
        className={'sd:w-90'}
        actions={
          <>
            <span data-v-44c88414="" className={'icon-hover'}>
              <IconThumbUp data-v-44c88414="" />
            </span>
            <span data-v-44c88414="" className={'icon-hover'}>
              <IconShareInternal data-v-44c88414="" />
            </span>
            <span data-v-44c88414="" className={'icon-hover'}>
              <IconMore data-v-44c88414="" />
            </span>
          </>
        }
        cover={
          <>
            <div data-v-44c88414="" className={'sd:h-51 sd:overflow-hidden'}>
              <img
                data-v-44c88414=""
                className={'sd:w-full sd:-translate-y-5'}
                alt={'甜点'}
                src={'https://picsum.photos/1260/840'}
              />
            </div>
          </>
        }
      >
        <CardMeta
          data-v-44c88414=""
          title={'卡片标题'}
          description={'这里是描述内容'}
          avatar={
            <>
              <div data-v-44c88414="" className={'sd:flex sd:items-center sd:text-[#1d2129]'}>
                <Avatar data-v-44c88414="" size={24} className={'sd:mr-2'}>
                  {' A '}
                </Avatar>
                <TypographyText data-v-44c88414="">{'用户名'}</TypographyText>
              </div>
            </>
          }
        />
      </Card>
      <style>
        {
          '\n.icon-hover[data-v-44c88414] {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 24px;\n    height: 24px;\n    border-radius: 50%;\n    transition: all 0.1s;\n}\n.icon-hover[data-v-44c88414]:hover {\n    background-color: rgb(var(--gray-2));\n}\n'
        }
      </style>
    </>
  );
}
