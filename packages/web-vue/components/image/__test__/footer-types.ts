import type { FilePreviewerImageProps } from '../../file-previewer/types';
import type { ImageProps } from '../interface';

const image = { hideFooter: 'never' } satisfies Partial<ImageProps>;
const preview = { hideFooter: 'never' } satisfies FilePreviewerImageProps;

void image;
void preview;
