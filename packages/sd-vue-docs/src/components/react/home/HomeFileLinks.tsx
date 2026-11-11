/** @jsxImportSource react */

import {
  Button,
  FilePreviewer,
  Link,
  MarkdownRender,
  Space,
  Trigger,
  type FilePreviewerType,
} from '@sdata/web-react';
import { IconClose } from '@sdata/web-react/icon';
import { useEffect, useState, type CSSProperties } from 'react';

import '../../home/HomeFileLinks.scss';

export default function HomeFileLinks({
  source,
  type,
  onRemove,
}: {
  source: File | { name: string; url: string };
  type: FilePreviewerType | 'markdown';
  onRemove?: () => void;
}) {
  const [url, setUrl] = useState('url' in source ? source.url : '');
  const [content, setContent] = useState('');
  const [dimensions, setDimensions] = useState<CSSProperties>();
  useEffect(() => {
    let active = true;
    const local = 'url' in source ? undefined : URL.createObjectURL(source);
    setUrl('url' in source ? source.url : local!);
    setContent('');
    setDimensions(undefined);
    if (type === 'markdown' && 'text' in source) {
      void source
        .text()
        .then((value) => {
          if (active) setContent(value);
        })
        .catch(() => {
          if (active) setContent('文件读取失败，请重新选择。');
        });
    }
    return () => {
      active = false;
      if (local) URL.revokeObjectURL(local);
    };
  }, [source, type]);
  return (
    <Space className="home-file-links" size={0}>
      <Trigger
        trigger={['hover', 'focus']}
        position="top"
        autoFitPosition
        autoFitPopupSize
        autoFitTransformOrigin
        animationName="slide-dynamic-origin"
        unmountOnClose
        content={
          <div
            className={`home-file-links__preview home-file-links__preview--${type}`}
            style={dimensions}
          >
            {type === 'markdown' ? (
              <div className="home-file-links__markdown">
                <MarkdownRender content={content} final />
              </div>
            ) : (
              url && (
                <FilePreviewer
                  imageProps={{
                    onLoad: (event) => {
                      const image = event.target as HTMLImageElement;
                      setDimensions({
                        '--preview-width': `${image.naturalWidth}px`,
                        '--preview-ratio': image.naturalWidth / image.naturalHeight,
                      } as CSSProperties);
                    },
                    preview: false,
                  }}
                  mediaProps={{ autoPlay: true, muted: true, playsInline: true }}
                  src={url}
                  type={type}
                  title={type === 'pdf' ? source.name : undefined}
                  fullscreen={false}
                />
              )
            )}
          </div>
        }
      >
        <Link href={url} target="_blank" title={source.name}>
          {source.name}
        </Link>
      </Trigger>
      <Button
        type="text"
        size="mini"
        shape="circle"
        aria-label={`移除 ${source.name}`}
        onClick={onRemove}
      >
        <IconClose />
      </Button>
    </Space>
  );
}
