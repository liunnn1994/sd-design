/** @jsxImportSource react */
import { Space, Tag } from '@sdata/web-react';
import { IconFacebook, IconGithub, IconGitlab, IconTwitter } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space>
        <Tag
          color={'gray'}
          icon={
            <>
              <IconGithub />
            </>
          }
        >
          {' Github '}
        </Tag>
        <Tag
          color={'orangered'}
          icon={
            <>
              <IconGitlab />
            </>
          }
        >
          {' Gitlab '}
        </Tag>
        <Tag
          color={'blue'}
          icon={
            <>
              <IconTwitter />
            </>
          }
        >
          {' Twitter '}
        </Tag>
        <Tag
          color={'sdblue'}
          icon={
            <>
              <IconFacebook />
            </>
          }
        >
          {' Facebook '}
        </Tag>
      </Space>
    </>
  );
}
