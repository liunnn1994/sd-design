/** @jsxImportSource react */
import { Button, ButtonGroup, Space } from '@sdata/web-react';
import {
  IconDown,
  IconHeartFill,
  IconLeft,
  IconMore,
  IconRight,
  IconStarFill,
  IconThumbUpFill,
} from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <ButtonGroup>
          <Button>{'发布'}</Button>
          <Button
            icon={
              <>
                <IconDown />
              </>
            }
          />
        </ButtonGroup>
        <ButtonGroup>
          <Button>{'发布'}</Button>
          <Button
            icon={
              <>
                <IconMore />
              </>
            }
          />
        </ButtonGroup>
        <ButtonGroup>
          <Button type={'primary'}>
            <IconLeft />
            {' 上一步 '}
          </Button>
          <Button type={'primary'}>
            {' 下一步 '}
            <IconRight />
          </Button>
        </ButtonGroup>
        <Space size={'large'}>
          <ButtonGroup type={'primary'}>
            <Button>{' 复制 '}</Button>
            <Button>{' 剪切 '}</Button>
            <Button>{' 查找 '}</Button>
          </ButtonGroup>
          <ButtonGroup type={'primary'} status={'warning'}>
            <Button
              icon={
                <>
                  <IconHeartFill />
                </>
              }
            />
            <Button
              icon={
                <>
                  <IconStarFill />
                </>
              }
            />
            <Button
              icon={
                <>
                  <IconThumbUpFill />
                </>
              }
            />
          </ButtonGroup>
          <ButtonGroup size={'small'} disabled={true}>
            <Button>{' 上一项 '}</Button>
            <Button>{' 下一项 '}</Button>
          </ButtonGroup>
        </Space>
      </Space>
    </>
  );
}
