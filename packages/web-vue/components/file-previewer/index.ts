import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _FilePreviewer from './file-previewer.vue';

const FilePreviewer = Object.assign(_FilePreviewer, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _FilePreviewer.name, _FilePreviewer);
  },
});

export type FilePreviewerInstance = InstanceType<typeof _FilePreviewer>;
export type {
  FilePreviewerContentSlotProps,
  FilePreviewerImageProps,
  FilePreviewerImageSlotProps,
  FilePreviewerMediaProps,
  FilePreviewerMediaSkin,
  FilePreviewerMediaSlotProps,
  FilePreviewerPdfProps,
  FilePreviewerPdfRotation,
  FilePreviewerPdfSlotProps,
  FilePreviewerProps,
  FilePreviewerStatus,
  FilePreviewerType,
} from './types';

export default FilePreviewer;
