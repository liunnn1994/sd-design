/** @jsxImportSource react */
import { Carousel, CarouselItem } from '@sdata/web-react';

export default function Example() {
  const images = [
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
  ];

  return (
    <>
      <Carousel
        autoPlay={true}
        animationName={'card'}
        showArrow={'never'}
        indicatorPosition={'outer'}
        className={'sd:w-full sd:h-60'}
      >
        {images.map((image) => (
          <CarouselItem className={'sd:w-[60%]'}>
            <img src={image} className={'sd:w-full'} />
          </CarouselItem>
        ))}
      </Carousel>
    </>
  );
}
