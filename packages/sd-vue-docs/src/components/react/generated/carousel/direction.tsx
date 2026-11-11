/** @jsxImportSource react */
import { Carousel, CarouselItem } from '@sdata/web-react';

export default function Example() {
  const images = [
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
  ];

  return (
    <>
      <Carousel
        className={'sd:w-150 sd:h-60'}
        showArrow={'never'}
        direction={'vertical'}
        indicatorPosition={'right'}
      >
        {images.map((image) => (
          <CarouselItem>
            <img src={image} className={'sd:w-full'} />
          </CarouselItem>
        ))}
      </Carousel>
    </>
  );
}
