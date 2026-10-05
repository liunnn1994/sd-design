import type { UploadInstance } from '../index';

export const synchronousFileTransformation: UploadInstance['$props'] = {
  onBeforeUpload: (file) => new File([file], 'transformed.txt', { type: file.type }),
};
