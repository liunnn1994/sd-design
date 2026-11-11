/** @jsxImportSource react */
import { Carousel, CarouselItem } from '@sdata/web-react';

export default function Example() {
  const images = [
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
    'https://picsum.photos/1200/480',
  ];
  const handleChange = (value: number) => {
    console.log(value);
  };

  return (
    <>
      <Carousel className={'sd:w-150 sd:h-60'} defaultCurrent={2} onChange={handleChange}>
        {images.map((image) => (
          <CarouselItem>
            <img src={image} className={'sd:w-full'} />
          </CarouselItem>
        ))}
      </Carousel>
    </>
  );
}
