/** @jsxImportSource react */
import { Button, Tooltip } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:relative sd:w-110 sd:h-70'}>
        <Tooltip content={'这是一条文字提示'} position={'tl'}>
          <Button className={'sd:absolute sd:top-0 sd:left-17.5 sd:w-25'}>{'左上'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'top'}>
          <Button className={'sd:absolute sd:top-0 sd:left-45 sd:w-25'}>{'上方'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'tr'}>
          <Button className={'sd:absolute sd:top-0 sd:left-72.5 sd:w-25'}>{'右上'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'bl'}>
          <Button className={'sd:absolute sd:top-60 sd:left-17.5 sd:w-25'}>{'左下'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'bottom'}>
          <Button className={'sd:absolute sd:top-60 sd:left-45 sd:w-25'}>{'下方'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'br'}>
          <Button className={'sd:absolute sd:top-60 sd:left-72.5 sd:w-25'}>{'右下'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'lt'}>
          <Button className={'sd:absolute sd:top-15 sd:left-2.5 sd:w-25'}>{'左上'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'left'}>
          <Button className={'sd:absolute sd:top-30 sd:left-2.5 sd:w-25'}>{'左侧'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'lb'}>
          <Button className={'sd:absolute sd:top-45 sd:left-2.5 sd:w-25'}>{'左下'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'rt'}>
          <Button className={'sd:absolute sd:top-15 sd:left-87.5 sd:w-25'}>{'右上'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'right'}>
          <Button className={'sd:absolute sd:top-30 sd:left-87.5 sd:w-25'}>{'右侧'}</Button>
        </Tooltip>
        <Tooltip content={'这是一条文字提示'} position={'rb'}>
          <Button className={'sd:absolute sd:top-45 sd:left-87.5 sd:w-25'}>{'右下'}</Button>
        </Tooltip>
      </div>
    </>
  );
}
