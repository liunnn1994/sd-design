import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _TypographyParagraph from './paragraph';
import _TypographyText from './text';
import _TypographyTitle from './title';
import _Typography from './typography.vue';

export type { EllipsisConfig } from './interface';

const Typography = Object.assign(_Typography, {
  Paragraph: _TypographyParagraph,
  Title: _TypographyTitle,
  Text: _TypographyText,
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Typography.name, _Typography);
    app.component(componentPrefix + _TypographyParagraph.name, _TypographyParagraph);
    app.component(componentPrefix + _TypographyTitle.name, _TypographyTitle);
    app.component(componentPrefix + _TypographyText.name, _TypographyText);
  },
});

export type TypographyInstance = InstanceType<typeof _Typography>;
export type TypographyParagraphInstance = InstanceType<typeof _TypographyParagraph>;
export type TypographyTitleInstance = InstanceType<typeof _TypographyTitle>;
export type TypographyTextInstance = InstanceType<typeof _TypographyText>;

export {
  _TypographyParagraph as TypographyParagraph,
  _TypographyTitle as TypographyTitle,
  _TypographyText as TypographyText,
};

export default Typography;
