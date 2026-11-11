import type { PreviewGroupContext, PreviewImage } from '@sdata/web-core/image/types';

import { createImagePreviewGroup, getPreviewSourceMap } from '@sdata/web-core/image/group';
import { useRef, useState } from 'react';

import type { ImagePreviewGroupProps } from './types.js';

import { ImageGroupContext } from './context.js';
import { ImagePreview } from './preview.js';

export function ImagePreviewGroup({
  srcList,
  current,
  defaultCurrent = 0,
  infinite = false,
  visible: controlled,
  defaultVisible = false,
  onChange,
  onCurrentChange,
  onVisibleChange,
  actions,
  children,
  ...props
}: ImagePreviewGroupProps) {
  const [innerVisible, setVisible] = useState(defaultVisible);
  const [innerCurrent, setCurrent] = useState(defaultCurrent);
  const [registered] = useState(() => new Map<number, PreviewImage>());
  const [, changed] = useState(0);
  const visible = controlled ?? innerVisible;
  const index = current ?? innerCurrent;
  const images = Array.isArray(srcList) ? getPreviewSourceMap(srcList) : registered;
  const ids = [...images.keys()];
  const live = useRef({
    srcList,
    current,
    controlled,
    infinite,
    visible,
    index,
    images,
    ids,
    onChange,
    onCurrentChange,
    onVisibleChange,
  });
  live.current = {
    srcList,
    current,
    controlled,
    infinite,
    visible,
    index,
    images,
    ids,
    onChange,
    onCurrentChange,
    onVisibleChange,
  };
  const [foundation] = useState(() =>
    createImagePreviewGroup({
      get sources() {
        return live.current.srcList;
      },
      registered,
      get images() {
        return live.current.images;
      },
      get ids() {
        return live.current.ids;
      },
      get index() {
        return live.current.index;
      },
      get visible() {
        return live.current.visible;
      },
      get infinite() {
        return live.current.infinite;
      },
      setVisible(value) {
        if (live.current.controlled === undefined) live.current.visible = value;
        setVisible(value);
      },
      onVisibleChange(value) {
        live.current.onVisibleChange?.(value);
      },
      setIndex(value) {
        if (live.current.current === undefined) live.current.index = value;
        setCurrent(value);
      },
      onIndexChange(value) {
        live.current.onChange?.(value);
        live.current.onCurrentChange?.(value);
      },
    }),
  );
  const [context] = useState<PreviewGroupContext>(() => ({
    preview: foundation.preview,
    registerImageUrl(id, url, canPreview) {
      const previous = registered.get(id);
      const remove = foundation.register(id, url, canPreview);
      if (!previous || previous.url !== url || previous.canPreview !== canPreview)
        changed((value) => value + 1);
      return () => {
        remove();
        changed((value) => value + 1);
      };
    },
  }));
  const url = images.get(ids[index])?.url;
  const groupArrowProps = {
    onPrev:
      foundation.prev() === undefined
        ? undefined
        : () => {
            const previous = foundation.prev();
            if (previous !== undefined) foundation.index(previous);
          },
    onNext:
      foundation.next() === undefined
        ? undefined
        : () => {
            const next = foundation.next();
            if (next !== undefined) foundation.index(next);
          },
  };
  return (
    <ImageGroupContext.Provider value={context}>
      {children}
      <ImagePreview
        {...props}
        inGroup
        src={url}
        visible={visible}
        onClose={foundation.close}
        groupArrowProps={groupArrowProps}
        actions={typeof actions === 'function' ? actions({ url }) : actions}
      />
    </ImageGroupContext.Provider>
  );
}
