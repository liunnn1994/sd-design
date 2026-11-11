import type { DeclarationList } from 'css-tree';
import type { CSSProperties } from 'react';

import parseStyle from 'css-tree/parser';

const propertyNames: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
  'tabindex': 'tabIndex',
  'readonly': 'readOnly',
  'colspan': 'colSpan',
  'rowspan': 'rowSpan',
  'maxlength': 'maxLength',
  'minlength': 'minLength',
  'contenteditable': 'contentEditable',
  'autofocus': 'autoFocus',
  'srcset': 'srcSet',
  'crossorigin': 'crossOrigin',
  'spellcheck': 'spellCheck',
  'enctype': 'encType',
  'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv',
  'datetime': 'dateTime',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'allowfullscreen': 'allowFullScreen',
  'formaction': 'formAction',
  'formmethod': 'formMethod',
  'formenctype': 'formEncType',
  'formtarget': 'formTarget',
  'novalidate': 'noValidate',
  'formnovalidate': 'formNoValidate',
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'autoplay': 'autoPlay',
  'playsinline': 'playsInline',
  'itemscope': 'itemScope',
  'itemtype': 'itemType',
  'itemprop': 'itemProp',
  'itemid': 'itemID',
  'itemref': 'itemRef',
  'ismap': 'isMap',
  'nomodule': 'noModule',
  'disablepictureinpicture': 'disablePictureInPicture',
  'disableremoteplayback': 'disableRemotePlayback',
};
const booleanAttrs = new Set(
  'allowfullscreen async autofocus autoplay checked controls default defer disabled disablepictureinpicture disableremoteplayback formnovalidate hidden inert ismap itemscope loop multiple muted nomodule novalidate open playsinline readonly required reversed scoped seamless selected'.split(
    ' ',
  ),
);
const reserved = new Set(['key', 'ref', 'children', 'dangerouslysetinnerhtml', 'innerhtml']);

export function getMarkdownHtmlStyle(source = '') {
  const declarations = new Map<string, { value: string; important: boolean }>();
  const ast = parseStyle(source, {
    context: 'declarationList',
    parseValue: false,
  }) as DeclarationList;
  for (const declaration of ast.children) {
    if (declaration.type !== 'Declaration' || declaration.value.type !== 'Raw') continue;
    const property = declaration.property.startsWith('--')
      ? declaration.property
      : declaration.property.toLowerCase();
    const important = Boolean(declaration.important);
    if (declarations.get(property)?.important && !important) continue;
    declarations.set(property, {
      value: declaration.value.value || (property.startsWith('--') ? ' ' : ''),
      important,
    });
  }
  const style = Object.fromEntries(
    [...declarations].map(([name, { value, important }]) => [
      name.startsWith('--')
        ? name
        : name
            .replace(/^-ms-/, 'ms-')
            .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      `${value}${important ? ' !important' : ''}`,
    ]),
  ) as CSSProperties;
  return {
    style,
    apply(element: HTMLElement | null) {
      // React's style assignment drops !important; set priorities after the DOM commit.
      for (const [name, { value, important }] of declarations)
        element?.style.setProperty(name, value, important ? 'important' : '');
    },
  };
}

export function normalizeMarkdownHtmlAttrs(attrs: Record<string, string | boolean>) {
  return Object.fromEntries(
    Object.entries(attrs)
      .filter(([name]) => !/^on/i.test(name) && !reserved.has(name.toLowerCase()))
      .map(([name, value]) => {
        if (name === 'style')
          return ['style', getMarkdownHtmlStyle(typeof value === 'string' ? value : '').style];
        return [
          typeof propertyNames[name] === 'string' ? propertyNames[name] : name,
          booleanAttrs.has(name) &&
          typeof value !== 'boolean' &&
          !(name === 'hidden' && value === 'until-found')
            ? true
            : value,
        ];
      }),
  ) as Record<string, unknown> & { className?: string; style?: CSSProperties };
}
