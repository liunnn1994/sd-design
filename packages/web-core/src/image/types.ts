export type ImageLoadStatus = 'beforeLoad' | 'loading' | 'error' | 'loaded';
export interface PreviewImage {
  url: string;
  canPreview: boolean;
}
export type PreviewGroupContext = Readonly<{
  registerImageUrl: (id: number, url: string, canPreview: boolean) => () => void;
  preview: (imageId: number) => void;
}>;
