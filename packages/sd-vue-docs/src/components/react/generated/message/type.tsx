/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button, Space } from '@sdata/web-react';
import { IconExclamationCircleFill } from '@sdata/web-react/icon';
import { createElement } from 'react';

export default function Example() {
  const renderIcon = () => createElement(IconExclamationCircleFill, null);
  const handleInfo = () => Message.info('这是一条提示消息！');
  const handleSuccess = () => Message.success('操作成功！');
  const handleWarning = () => Message.warning('请注意检查操作内容！');
  const handleError = () => Message.error('这是一条错误消息！');
  const handleNormal = () => Message.normal('这是一条普通消息！');
  const handleNormalWithIcon = () =>
    Message.normal({ content: '这是一条普通消息！', icon: renderIcon });
  const handleLoading = () => Message.loading('正在加载，请稍候…');

  return (
    <>
      <div>
        <Space>
          <Button onClick={handleInfo}>{'提示消息'}</Button>
          <Button onClick={handleSuccess} status={'success'}>
            {'成功消息 '}
          </Button>
          <Button onClick={handleWarning} status={'warning'}>
            {'警告消息 '}
          </Button>
          <Button onClick={handleError} status={'danger'}>
            {'错误消息'}
          </Button>
        </Space>
      </div>
      <div className={'sd:mt-5'}>
        <Space>
          <Button onClick={handleNormal}>{'普通消息'}</Button>
          <Button onClick={handleNormalWithIcon}>{'带图标的普通消息 '}</Button>
          <Button onClick={handleLoading} type={'primary'}>
            {'加载消息 '}
          </Button>
        </Space>
      </div>
    </>
  );
}
