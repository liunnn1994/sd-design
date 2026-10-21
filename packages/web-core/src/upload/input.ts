import { isFunction, isPromise } from '../_utils/is.js';
import { getFiles, loopDirectory } from './utils.js';

export interface UploadInputOptions {
  disabled: boolean;
  directory: boolean;
  accept?: string;
  multiple: boolean;
  uploadFiles(files: File[]): void;
  onButtonClick?: (event: Event) => Promise<FileList> | void;
}
export interface UploadInputAdapter {
  readonly options: UploadInputOptions;
  getDragging(): boolean;
  setDragging(value: boolean): void;
  getDragEnterCount(): number;
  setDragEnterCount(value: number): void;
  clickInput(): void;
}
export function createUploadInput(adapter: UploadInputAdapter) {
  function setDragEnterCount(type: 'subtract' | 'add' | 'reset') {
    if (type === 'subtract') {
      adapter.setDragEnterCount(adapter.getDragEnterCount() - 1);
    } else if (type === 'add') {
      adapter.setDragEnterCount(adapter.getDragEnterCount() + 1);
    } else {
      adapter.setDragEnterCount(0);
    }
  }

  function handleClick(event: Event) {
    if (adapter.options.disabled) return;
    if (isFunction(adapter.options.onButtonClick)) {
      const result = adapter.options.onButtonClick(event);
      if (isPromise<FileList>(result)) {
        result.then((files) => {
          adapter.options.uploadFiles(getFiles(files));
        });
        return;
      }
    }
    adapter.clickInput();
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      adapter.options.uploadFiles(getFiles(target.files));
    }

    target.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    adapter.setDragging(false);
    setDragEnterCount('reset');
    if (adapter.options.disabled) {
      return;
    }

    if (adapter.options.directory && event.dataTransfer?.items) {
      loopDirectory(event.dataTransfer.items, adapter.options.accept, (files) => {
        adapter.options.uploadFiles(files);
      });
    } else {
      const files = getFiles(event.dataTransfer?.files, adapter.options.accept);
      adapter.options.uploadFiles(adapter.options.multiple ? files : files.slice(0, 1));
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    setDragEnterCount('subtract');
    if (adapter.getDragEnterCount() === 0) {
      adapter.setDragging(false);
      setDragEnterCount('reset');
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!adapter.options.disabled && !adapter.getDragging()) {
      adapter.setDragging(true);
    }
  }
  return {
    setDragEnterCount,
    handleClick,
    handleInputChange,
    handleDrop,
    handleDragLeave,
    handleDragOver,
  };
}
