import type { IconBaseProps } from './types.js';

export function getIconStyle({ size, rotate }: IconBaseProps) {
  const style: { 'fontSize'?: string; 'transform'?: string; '--icon-rotate'?: string } = {};
  if (size !== undefined) style.fontSize = typeof size === 'number' ? `${size}px` : size;
  if (rotate) {
    style.transform = `rotate(${rotate}deg)`;
    style['--icon-rotate'] = `${rotate}deg`;
  }
  return style;
}

const scriptUrls = new WeakMap<Document, Set<string>>();

export function loadIconFontScript(
  src: string | undefined,
  owner: Document | undefined = typeof document === 'undefined' ? undefined : document,
) {
  if (!owner || !src?.length) return;
  let cache = scriptUrls.get(owner);
  if (!cache) {
    cache = new Set();
    scriptUrls.set(owner, cache);
  }
  if (cache.has(src)) return;
  const script = owner.createElement('script');
  script.setAttribute('src', src);
  script.setAttribute('data-namespace', src);
  script.addEventListener(
    'error',
    () => {
      cache.delete(src);
      script.remove();
    },
    { once: true },
  );
  cache.add(src);
  owner.body.appendChild(script);
}
