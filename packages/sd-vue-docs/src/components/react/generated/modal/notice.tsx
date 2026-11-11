/** @jsxImportSource react */
import { Modal } from '@sdata/web-react';
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  const handleClickInfo = () => {
    Modal.info({
      title: '提示通知',
      content: '这是一条信息说明，用于告知相关变更或操作。',
    });
  };
  const handleClickSuccess = () => {
    Modal.success({
      title: '成功通知',
      content: '这是一条成功通知',
    });
  };
  const handleClickWarning = () => {
    Modal.warning({
      title: '警告通知',
      content: '这是一条警告说明，提示您关注可能存在的问题。',
    });
  };
  const handleClickError = () => {
    Modal.error({
      title: '错误通知',
      content: '这是一条错误说明，提示操作存在危险或可能造成不良影响。',
    });
  };

  return (
    <>
      <Space>
        <Button onClick={handleClickInfo}>{'信息'}</Button>
        <Button onClick={handleClickSuccess} status={'success'}>
          {'成功'}
        </Button>
        <Button onClick={handleClickWarning} status={'warning'}>
          {'警告'}
        </Button>
        <Button onClick={handleClickError} status={'danger'}>
          {'错误'}
        </Button>
      </Space>
    </>
  );
}
