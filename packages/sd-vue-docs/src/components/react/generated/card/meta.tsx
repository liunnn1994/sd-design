/** @jsxImportSource react */
import { Card, CardMeta } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Card
        hoverable={true}
        className={'sd:w-90'}
        cover={
          <>
            <div className={'sd:h-51 sd:overflow-hidden'}>
              <img
                className={'sd:w-full sd:-translate-y-5'}
                alt={'甜点'}
                src={'https://picsum.photos/1260/840'}
              />
            </div>
          </>
        }
      >
        <CardMeta
          title={'卡片标题'}
          description={
            <>
              {' 卡片内容 '}
              <br />
              {' 卡片内容 '}
            </>
          }
        />
      </Card>
    </>
  );
}
