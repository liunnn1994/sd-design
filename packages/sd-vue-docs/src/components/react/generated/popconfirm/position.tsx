/** @jsxImportSource react */
import { Button, Popconfirm } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:relative sd:w-110 sd:h-70'}>
        <Popconfirm content={'这是一个气泡确认框'} position={'tl'}>
          <Button className={'sd:absolute sd:top-0 sd:left-17.5 sd:w-25'}>{'左上'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'top'}>
          <Button className={'sd:absolute sd:top-0 sd:left-45 sd:w-25'}>{'上方'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'tr'}>
          <Button className={'sd:absolute sd:top-0 sd:left-72.5 sd:w-25'}>{'右上'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'bl'}>
          <Button className={'sd:absolute sd:top-60 sd:left-17.5 sd:w-25'}>{'左下'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'bottom'}>
          <Button className={'sd:absolute sd:top-60 sd:left-45 sd:w-25'}>{'下方'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'br'}>
          <Button className={'sd:absolute sd:top-60 sd:left-72.5 sd:w-25'}>{'右下'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'lt'}>
          <Button className={'sd:absolute sd:top-15 sd:left-2.5 sd:w-25'}>{'左上'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'left'}>
          <Button className={'sd:absolute sd:top-30 sd:left-2.5 sd:w-25'}>{'左侧'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'lb'}>
          <Button className={'sd:absolute sd:top-45 sd:left-2.5 sd:w-25'}>{'左下'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'rt'}>
          <Button className={'sd:absolute sd:top-15 sd:left-87.5 sd:w-25'}>{'右上'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'right'}>
          <Button className={'sd:absolute sd:top-30 sd:left-87.5 sd:w-25'}>{'右侧'}</Button>
        </Popconfirm>
        <Popconfirm content={'这是一个气泡确认框'} position={'rb'}>
          <Button className={'sd:absolute sd:top-45 sd:left-87.5 sd:w-25'}>{'右下'}</Button>
        </Popconfirm>
      </div>
    </>
  );
}
