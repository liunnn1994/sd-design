import type { ComponentRef as ReactComponentRef } from 'react';

import {
  createAvatarFoundation,
  getAvatarTriggerIconStyle,
} from '@sdata/web-core/avatar/foundation';
import { useContext, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { AvatarProps } from './types.js';

import { ImageCloseIcon } from '../_shared/image-close-icon.js';
import { LoadingIcon } from '../_shared/loading-icon.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { AvatarGroupContext } from './context.js';
import { AvatarGroup } from './group.js';
export type { AvatarProps } from './types.js';

function AvatarView({
  shape = 'circle',
  imageUrl,
  size,
  autoFixFontSize = true,
  triggerType = 'button',
  triggerIconStyle,
  objectFit,
  triggerIcon,
  error,
  onLoad,
  onError,
  children,
  className,
  style,
  ref,
  ...attrs
}: AvatarProps) {
  const prefix = usePrefix('avatar');
  const { rtl } = useConfig();
  const group = useContext(AvatarGroupContext);
  const item = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLSpanElement>(null);
  const [imageState, setImageState] = useState({ url: imageUrl, hasError: false, isLoaded: false });
  const hasError = imageState.url === imageUrl && imageState.hasError;
  const isLoaded = imageState.url === imageUrl && imageState.isLoaded;
  const [isImage, setIsImage] = useState(false);
  useImperativeHandle(ref, () => item.current!, []);
  const foundation = createAvatarFoundation(
    {
      props: { shape, size, autoFixFontSize, imageUrl },
      group,
      get itemElement() {
        return item.current ?? undefined;
      },
      get wrapperElement() {
        return wrapper.current ?? undefined;
      },
      get mergedSize() {
        return foundation.getMergedSize();
      },
      get mergedAutoFixFontSize() {
        return foundation.getMergedAutoFixFontSize();
      },
      isImage,
      index: group?.index ?? -1,
      rtl: !!rtl,
      get hasError() {
        return hasError;
      },
      set hasError(value) {
        setImageState((state) => ({
          url: imageUrl,
          isLoaded: state.url === imageUrl && state.isLoaded,
          hasError: value,
        }));
      },
      get isLoaded() {
        return isLoaded;
      },
      set isLoaded(value) {
        setImageState((state) => ({
          url: imageUrl,
          hasError: state.url === imageUrl && state.hasError,
          isLoaded: value,
        }));
      },
    },
    {
      afterRender: (task) => task(),
      click: () => {},
      load: () => onLoad?.(),
      error: () => onError?.(),
    },
  );
  const latest = useRef(foundation);
  latest.current = foundation;
  useLayoutEffect(() => {
    const tag = wrapper.current?.firstElementChild?.tagName;
    setIsImage(tag === 'IMG' || tag === 'PICTURE');
    foundation.autoFixFontSizeHandler();
  });
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => latest.current.handleResize());
    if (wrapper.current) observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      {...attrs}
      ref={item}
      style={{ ...foundation.getOuterStyle(), ...style }}
      className={[
        prefix,
        `${prefix}-${foundation.getMergedShape()}`,
        triggerIcon != null && `${prefix}-with-trigger-icon`,
        rtl && `${prefix}-rtl`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span ref={wrapper} className={`${prefix}-${isImage || imageUrl ? 'image' : 'text'}`}>
        {imageUrl ? (
          <>
            {hasError ? (
              (error ?? (
                <div className={`${prefix}-image-icon`} aria-hidden="true">
                  <ImageCloseIcon />
                </div>
              ))
            ) : (
              <>
                {!isLoaded &&
                  (children ?? (
                    <div className={`${prefix}-image-icon`} aria-hidden="true">
                      <LoadingIcon />
                    </div>
                  ))}
                <img
                  src={imageUrl}
                  style={{ objectFit }}
                  alt="avatar"
                  onLoad={foundation.handleImgLoad}
                  onError={foundation.handleImgError}
                />
              </>
            )}
          </>
        ) : (
          children
        )}
      </span>
      {triggerIcon != null && (
        <div
          className={`${prefix}-trigger-icon-${triggerType}`}
          style={getAvatarTriggerIconStyle({
            triggerType,
            inlineStyle: { ...style },
            triggerIconStyle: { ...triggerIconStyle },
          })}
        >
          {triggerIcon}
        </div>
      )}
    </div>
  );
}

export const Avatar = Object.assign(AvatarView, { Group: AvatarGroup });
export default Avatar;
export { AvatarGroup } from './group.js';
export type { AvatarGroupProps } from './group.js';

export type AvatarInstance = ReactComponentRef<typeof Avatar>;
export type AvatarGroupInstance = ReactComponentRef<typeof AvatarGroup>;
