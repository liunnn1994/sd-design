import { useEffect, useRef, useState } from 'react';

import {
  Button,
  ConfigProvider,
  Carousel,
  CarouselItem,
  type CarouselRef,
  type CarouselAutoPlayConfig,
  type CarouselIndicatorType,
} from '../../src/index';

function WrappedSlide({
  value,
  nested,
  nestedPrefix,
}: {
  value: number;
  nested: boolean;
  nestedPrefix: string;
}) {
  return (
    <CarouselItem data-slide={value} style={{ background: '#dce8ff' }}>
      <span>Slide {value}</span>
      <input aria-label={`Carousel input ${value}`} defaultValue="Editable" />
      {nested && value === 1 && (
        <ConfigProvider prefixCls={nestedPrefix}>
          <Carousel data-testid="carousel-nested" moveSpeed={0} style={{ width: 220, height: 90 }}>
            <CarouselItem>Nested A</CarouselItem>
            <CarouselItem>Nested B</CarouselItem>
          </Carousel>
        </ConfigProvider>
      )}
    </CarouselItem>
  );
}
export function CarouselFixture() {
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState([1, 2, 3]);
  const [current, setCurrent] = useState<number>();
  const [autoPlay, setAutoPlay] = useState<false | CarouselAutoPlayConfig>(false);
  const [speed, setSpeed] = useState(100);
  const [vertical, setVertical] = useState(false);
  const [hover, setHover] = useState(false);
  const [animation, setAnimation] = useState<'slide' | 'fade' | 'card'>('slide');
  const [indicator, setIndicator] = useState<CarouselIndicatorType>('dot');
  const [mounted, setMounted] = useState(true);
  const [nestedPrefix, setNestedPrefix] = useState('sd');
  const [nested, setNested] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const carousel = useRef<CarouselRef>(null);
  const log = (value: string) => setEvents((old) => [...old, value]);
  useEffect(() => {
    const action = (event: Event) => {
      const type = (event as CustomEvent<string>).detail;
      if (type === 'autoplay') {
        setAutoPlay({ interval: 100 });
        setSpeed(200);
      }
      if (type === 'pause-test') {
        setAutoPlay({ interval: 100 });
        setSpeed(0);
      }
      if (type === 'hover-off') setAutoPlay({ interval: 100, hoverToPause: false });
      if (type === 'unmount') setMounted(false);
      if (type === 'empty') setValues([]);
    };
    window.addEventListener('carousel-action', action);
    setReady(true);
    return () => window.removeEventListener('carousel-action', action);
  }, []);
  return (
    <section data-testid="carousel-fixture">
      <Button onClick={() => setCurrent(3)}>Carousel controlled third</Button>
      <Button onClick={() => setCurrent(-7)}>Carousel negative current</Button>
      <Button onClick={() => setCurrent(undefined)}>Carousel release</Button>
      <Button onClick={() => carousel.current?.goTo(0)}>Carousel go zero</Button>
      <Button onClick={() => carousel.current?.next()}>Carousel ref next</Button>
      <Button onClick={() => carousel.current?.prev()}>Carousel ref previous</Button>
      <Button onClick={() => setVertical((old) => !old)}>Carousel direction</Button>
      <Button onClick={() => setHover((old) => !old)}>Carousel hover</Button>
      <Button
        onClick={() =>
          setAnimation((old) => (old === 'slide' ? 'fade' : old === 'fade' ? 'card' : 'slide'))
        }
      >
        Carousel animation
      </Button>
      <Button
        onClick={() =>
          setIndicator((old) =>
            old === 'dot' ? 'line' : old === 'line' ? 'slider' : old === 'slider' ? 'never' : 'dot',
          )
        }
      >
        Carousel indicator
      </Button>
      <Button onClick={() => setValues((old) => old.slice(0, -1))}>Carousel remove</Button>
      <Button onClick={() => setValues((old) => [...old, old.length + 1])}>Carousel add</Button>
      <Button onClick={() => setValues((old) => [...old].reverse())}>Carousel reverse</Button>
      <Button onClick={() => setNested((old) => !old)}>Carousel nested</Button>
      <Button onClick={() => setNestedPrefix((old) => (old === 'sd' ? 'custom' : 'sd'))}>
        Carousel nested prefix
      </Button>
      {mounted && (
        <Carousel
          data-testid="carousel-main"
          data-hovered={hovered}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          data-ready={ready}
          data-auto-interval={autoPlay ? autoPlay.interval : 0}
          data-hover-pause={autoPlay ? String(autoPlay.hoverToPause ?? true) : 'false'}
          ref={carousel}
          current={current}
          autoPlay={autoPlay}
          moveSpeed={speed}
          direction={vertical ? 'vertical' : 'horizontal'}
          animationName={animation}
          indicatorType={indicator}
          indicatorPosition={vertical ? 'right' : 'bottom'}
          trigger={hover ? 'hover' : 'click'}
          showArrow={hover ? 'hover' : 'always'}
          arrowClass="custom-carousel-arrows"
          indicatorClass="custom-carousel-indicators"
          transitionTimingFunction="linear"
          style={{ width: 480, height: 220 }}
          onCurrentChange={(value) => log(`update:${value}`)}
          onChange={(value, previous, manual) => log(`change:${value}:${previous}:${manual}`)}
        >
          {values.map((value) => (
            <WrappedSlide key={value} value={value} nested={nested} nestedPrefix={nestedPrefix} />
          ))}
        </Carousel>
      )}
      <output data-testid="carousel-events">{events.join('|')}</output>
    </section>
  );
}
