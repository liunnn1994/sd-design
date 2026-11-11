/** @jsxImportSource react */
import { Space, TypographyText } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={10}>
        <TypographyText>{' SD Design '}</TypographyText>
        <TypographyText type={'secondary'}>{' 次要 '}</TypographyText>
        <TypographyText type={'primary'}>{' 主要 '}</TypographyText>
        <TypographyText type={'success'}>{' 成功 '}</TypographyText>
        <TypographyText type={'warning'}>{' 警告 '}</TypographyText>
        <TypographyText type={'danger'}>{' 危险 '}</TypographyText>
        <TypographyText bold={true}>{' 加粗 '}</TypographyText>
        <TypographyText disabled={true}>{' 禁用 '}</TypographyText>
        <TypographyText mark={true}>{' 标记 '}</TypographyText>
        <TypographyText underline={true}>{' 下划线 '}</TypographyText>
        <TypographyText delete={true}>{' 删除线 '}</TypographyText>
        <TypographyText code={true}>{' 代码片段 '}</TypographyText>
      </Space>
    </>
  );
}
