/** @jsxImportSource react */
import type { CarouselIndicatorPosition, CarouselIndicatorType } from '@sdata/web-react';

import { Carousel, CarouselItem, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [images, setImages] = useState([
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
  ]);
  const [indicatorType, setIndicatorType] = useState<CarouselIndicatorType>('dot');
  const [indicatorPosition, setIndicatorPosition] = useState<CarouselIndicatorPosition>('bottom');
  function updateType(type: string | number | boolean) {
    setIndicatorType(type as CarouselIndicatorType);
  }
  function updatePosition(position: string | number | boolean) {
    setIndicatorPosition(position as CarouselIndicatorPosition);
  }

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          type={'button'}
          onChange={updateType}
          className={'sd:mb-2.5'}
          value={indicatorType}
        >
          <Radio value={'dot'}>{'圆点'}</Radio>
          <Radio value={'line'}>{'线形'}</Radio>
          <Radio value={'slider'}>{'滑条'}</Radio>
        </RadioGroup>
        <RadioGroup
          type={'button'}
          onChange={updatePosition}
          className={'sd:mb-5'}
          value={indicatorPosition}
        >
          <Radio value={'left'}>{'左侧'}</Radio>
          <Radio value={'right'}>{'右侧'}</Radio>
          <Radio value={'top'}>{'上方'}</Radio>
          <Radio value={'bottom'}>{'下方'}</Radio>
          <Radio value={'outer'}>{'外侧'}</Radio>
        </RadioGroup>
        <Carousel
          indicatorType={indicatorType}
          indicatorPosition={indicatorPosition}
          showArrow={'never'}
          className={'sd:w-150 sd:h-60'}
        >
          {images.map((image) => (
            <CarouselItem>
              <img src={image} alt={'走马灯'} className={'sd:w-full'} />
            </CarouselItem>
          ))}
        </Carousel>
      </Space>
    </>
  );
}
