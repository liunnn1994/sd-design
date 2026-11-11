/** @jsxImportSource react */
import { Button, Popover } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:relative sd:w-110 sd:h-70'}>
        <Popover
          position={'tl'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-0 sd:left-17.5 sd:w-25'}>{'左上'}</Button>
        </Popover>
        <Popover
          position={'top'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-0 sd:left-45 sd:w-25'}>{'上方'}</Button>
        </Popover>
        <Popover
          position={'tr'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-0 sd:left-72.5 sd:w-25'}>{'右上'}</Button>
        </Popover>
        <Popover
          position={'bl'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-60 sd:left-17.5 sd:w-25'}>{'左下'}</Button>
        </Popover>
        <Popover
          position={'bottom'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-60 sd:left-45 sd:w-25'}>{'下方'}</Button>
        </Popover>
        <Popover
          position={'br'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-60 sd:left-72.5 sd:w-25'}>{'右下'}</Button>
        </Popover>
        <Popover
          position={'lt'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-15 sd:left-2.5 sd:w-25'}>{'左上'}</Button>
        </Popover>
        <Popover
          position={'left'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-30 sd:left-2.5 sd:w-25'}>{'左侧'}</Button>
        </Popover>
        <Popover
          position={'lb'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-45 sd:left-2.5 sd:w-25'}>{'左下'}</Button>
        </Popover>
        <Popover
          position={'rt'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-15 sd:left-87.5 sd:w-25'}>{'右上'}</Button>
        </Popover>
        <Popover
          position={'right'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-30 sd:left-87.5 sd:w-25'}>{'右侧'}</Button>
        </Popover>
        <Popover
          position={'rb'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button className={'sd:absolute sd:top-45 sd:left-87.5 sd:w-25'}>{'右下'}</Button>
        </Popover>
      </div>
    </>
  );
}
