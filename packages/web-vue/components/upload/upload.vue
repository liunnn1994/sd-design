<template>
  <DefineUploadButton v-slot="{ rootAttrs }">
    <span
      v-if="props.tip && props.listType !== 'picture-card' && !props.draggable"
      v-bind="rootAttrs"
    >
      <UploadButton v-bind="uploadButtonProps">
        <slot name="upload-button" />
      </UploadButton>
      <div :class="`${prefixCls}-tip`">{{ props.tip }}</div>
    </span>
    <UploadButton v-else v-bind="getUploadButtonProps(rootAttrs)">
      <slot name="upload-button" />
    </UploadButton>
  </DefineUploadButton>

  <ReuseUploadButton v-if="!props.showFileList && props.showUploadButton" :root-attrs="attrs" />
  <div v-else-if="props.showFileList" v-bind="wrapperAttrs">
    <ImagePreviewGroup
      v-if="props.imagePreview && imageList.length > 0"
      :src-list="imageList"
      :visible="imagePreviewVisible"
      :current="imagePreviewCurrent"
      @change="handleImagePreviewChange"
      @visible-change="handleImagePreviewVisibleChange"
    />
    <ReuseUploadButton v-if="props.listType !== 'picture-card' && props.showUploadButton" />
    <UploadList :file-list="innerFileList" :list-type="props.listType">
      <template #upload-button><ReuseUploadButton /></template>
      <template v-if="$slots['upload-item']" #upload-item="slotProps">
        <slot name="upload-item" v-bind="slotProps" />
      </template>
    </UploadList>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    provide,
    reactive,
    ref,
    toRefs,
    useAttrs,
    useSlots,
    watch,
    type PropType,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { CustomIcon, FileItem, ListType, RequestOption, UploadRequest } from './interfaces';

  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { isBoolean, isFunction, isObject } from '../_utils/is';
  import { ImagePreviewGroup } from '../image';
  import { uploadInjectionKey } from './context';
  import UploadButton from './upload-button.vue';
  import UploadList from './upload-list.vue';
  import { isImage, uploadRequest } from './utils';

  defineOptions({ name: 'Upload', inheritAttrs: false });

  const props = defineProps({
    fileList: { type: Array as PropType<FileItem[]>, default: undefined },
    defaultFileList: { type: Array as PropType<FileItem[]>, default: () => [] },
    accept: String,
    action: String,
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    directory: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    tip: String,
    headers: Object as PropType<Record<string, string>>,
    data: [Object, Function] as PropType<
      Record<string, string | Blob> | ((fileItem: FileItem) => Record<string, string | Blob>)
    >,
    name: [String, Function] as PropType<string | ((fileItem: FileItem) => string)>,
    withCredentials: { type: Boolean, default: false },
    customRequest: Function as PropType<(option: RequestOption) => UploadRequest>,
    limit: { type: Number, default: 0 },
    autoUpload: { type: Boolean, default: true },
    showFileList: { type: Boolean, default: true },
    showRemoveButton: { type: Boolean, default: true },
    showStartButton: { type: Boolean, default: true },
    showRetryButton: { type: Boolean, default: true },
    showCancelButton: { type: Boolean, default: true },
    showUploadButton: {
      type: [Boolean, Object] as PropType<boolean | { showOnExceedLimit: boolean }>,
      default: true,
    },
    showPreviewButton: { type: Boolean, default: true },
    download: { type: Boolean, default: false },
    showLink: { type: Boolean, default: true },
    imageLoading: String as PropType<'eager' | 'lazy'>,
    listType: { type: String as PropType<ListType>, default: 'text' },
    responseUrlKey: [String, Function] as PropType<string | ((fileItem: FileItem) => string)>,
    customIcon: Object as PropType<CustomIcon>,
    imagePreview: { type: Boolean, default: false },
    onBeforeUpload: Function as PropType<(file: File) => boolean | Promise<boolean | File>>,
    onBeforeRemove: Function as PropType<(fileItem: FileItem) => Promise<boolean>>,
    onButtonClick: Function as PropType<(event: Event) => Promise<FileList> | void>,
  });

  const emit = defineEmits({
    'update:fileList': (_fileList: FileItem[]) => true,
    'exceedLimit': (_fileList: FileItem[], _files: File[]) => true,
    'change': (_fileList: FileItem[], _fileItem: FileItem) => true,
    'progress': (_fileItem: FileItem, _event?: ProgressEvent) => true,
    'preview': (_fileItem: FileItem) => true,
    'success': (_fileItem: FileItem) => true,
    'error': (_fileItem: FileItem) => true,
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const {
    disabled,
    listType,
    customIcon,
    showStartButton,
    showRetryButton,
    showCancelButton,
    showRemoveButton,
    showPreviewButton,
    imageLoading,
    download,
    showLink,
  } = toRefs(props);
  const prefixCls = getPrefixCls('upload');
  const { mergedDisabled, eventHandlers } = useFormItem({ disabled });
  const innerFileList = ref<FileItem[]>([]);
  const fileMap = new Map<string, FileItem>();
  const requestMap = new Map<string, UploadRequest>();
  const [DefineUploadButton, ReuseUploadButton] = createReusableTemplate<{
    rootAttrs?: Record<string, unknown>;
  }>();
  const isMax = computed(() => props.limit > 0 && innerFileList.value.length >= props.limit);

  const checkFileList = (fileList?: FileItem[]) => {
    fileMap.clear();
    const nextFileList = fileList?.map((data, index) => {
      const status = data.status ?? 'done';
      const fileItem = reactive({
        ...data,
        uid: data.uid ?? `${Date.now()}${index}`,
        status,
        percent: data.percent ?? (['error', 'init'].includes(status) ? 0 : 1),
      });
      fileMap.set(fileItem.uid, fileItem);
      return fileItem;
    });
    innerFileList.value = nextFileList ?? [];
  };
  checkFileList(props.defaultFileList);
  watch(
    () => props.fileList,
    (fileList) => {
      if (fileList) checkFileList(fileList);
    },
    { immediate: true, deep: true },
  );

  const updateFileList = (file: FileItem) => {
    emit('update:fileList', innerFileList.value);
    emit('change', innerFileList.value, file);
    eventHandlers.value?.onChange?.();
  };
  const updateFile = (id: string, file: File) => {
    for (const item of innerFileList.value) {
      if (item.uid === id) {
        item.file = file;
        updateFileList(item);
        break;
      }
    }
  };
  const uploadFile = (fileItem: FileItem) => {
    const handleProgress = (percent: number, event?: ProgressEvent) => {
      const file = fileMap.get(fileItem.uid);
      if (!file) return;
      file.status = 'uploading';
      file.percent = percent;
      emit('progress', file, event);
      updateFileList(file);
    };
    const handleSuccess = (response: unknown) => {
      const file = fileMap.get(fileItem.uid);
      if (!file) return;
      file.status = 'done';
      file.percent = 1;
      file.response = response;
      if (props.responseUrlKey) {
        if (isFunction(props.responseUrlKey)) {
          file.url = props.responseUrlKey(file);
        } else if (isObject(response) && response[props.responseUrlKey]) {
          file.url = String(response[props.responseUrlKey]);
        }
      }
      requestMap.delete(file.uid);
      emit('success', file);
      updateFileList(file);
    };
    const handleError = (response: unknown) => {
      const file = fileMap.get(fileItem.uid);
      if (!file) return;
      file.status = 'error';
      file.percent = 0;
      file.response = response;
      requestMap.delete(file.uid);
      emit('error', file);
      updateFileList(file);
    };
    const option: RequestOption = {
      fileItem,
      action: props.action,
      name: props.name,
      data: props.data,
      headers: props.headers,
      withCredentials: props.withCredentials,
      onProgress: handleProgress,
      onSuccess: handleSuccess,
      onError: handleError,
    };
    fileItem.status = 'uploading';
    fileItem.percent = 0;
    const request = isFunction(props.customRequest)
      ? props.customRequest(option)
      : uploadRequest(option);
    requestMap.set(fileItem.uid, request);
    updateFileList(fileItem);
  };
  const abort = (fileItem: FileItem) => {
    const request = requestMap.get(fileItem.uid);
    if (!request) return;
    request.abort?.();
    requestMap.delete(fileItem.uid);
    const file = fileMap.get(fileItem.uid);
    if (file) {
      file.status = 'error';
      file.percent = 0;
      updateFileList(file);
    }
  };
  const submit = (fileItem?: FileItem) => {
    if (fileItem) {
      const file = fileMap.get(fileItem.uid);
      if (file) uploadFile(file);
      return;
    }
    for (const item of innerFileList.value) {
      if (item.status === 'init') uploadFile(item);
    }
  };
  const initUpload = (file: File, index: number) => {
    const uid = `${Date.now()}-${index}`;
    const fileItem: FileItem = reactive({
      uid,
      file,
      url: isImage(file) ? URL.createObjectURL(file) : undefined,
      name: file.name,
      status: 'init',
      percent: 0,
    });
    fileMap.set(uid, fileItem);
    innerFileList.value = [...innerFileList.value, fileItem];
    updateFileList(fileItem);
    if (props.autoUpload) uploadFile(fileItem);
  };
  const uploadFiles = (files: File[]) => {
    if (props.limit > 0 && innerFileList.value.length + files.length > props.limit) {
      emit('exceedLimit', innerFileList.value, files);
      return;
    }
    files.forEach((file, index) => {
      if (isFunction(props.onBeforeUpload)) {
        Promise.resolve(props.onBeforeUpload(file))
          .then((result: boolean | File) => {
            if (result) initUpload(isBoolean(result) ? file : result, index);
          })
          .catch((error) => {
            // oxlint-disable-next-line no-console
            console.error(error);
          });
      } else {
        initUpload(file, index);
      }
    });
  };
  const removeFile = (fileItem: FileItem) => {
    innerFileList.value = innerFileList.value.filter((item) => item.uid !== fileItem.uid);
    updateFileList(fileItem);
  };
  const handleRemove = (fileItem: FileItem) => {
    if (isFunction(props.onBeforeRemove)) {
      Promise.resolve(props.onBeforeRemove(fileItem))
        .then((result) => {
          if (result) removeFile(fileItem);
        })
        .catch((error) => {
          // oxlint-disable-next-line no-console
          console.error(error);
        });
    } else {
      removeFile(fileItem);
    }
  };

  const imagePreviewVisible = ref(false);
  const imagePreviewCurrent = ref(0);
  const imageList = computed(() =>
    innerFileList.value.filter((item) => Boolean(item.url)).map((item) => item.url as string),
  );
  const handlePreview = (fileItem: FileItem) => {
    if (props.imagePreview && fileItem.url) {
      const current = imageList.value.indexOf(fileItem.url);
      if (current > -1) {
        imagePreviewCurrent.value = current;
        imagePreviewVisible.value = true;
      }
    }
    emit('preview', fileItem);
  };
  const handleImagePreviewChange = (current: number) => {
    imagePreviewCurrent.value = current;
  };
  const handleImagePreviewVisibleChange = (visible: boolean) => {
    imagePreviewVisible.value = visible;
  };

  provide(
    uploadInjectionKey,
    reactive({
      disabled: mergedDisabled,
      listType,
      iconCls: `${prefixCls}-icon`,
      showRemoveButton,
      showStartButton,
      showRetryButton,
      showCancelButton,
      showPreviewButton,
      showLink,
      imageLoading,
      download,
      customIcon,
      slots,
      onUpload: uploadFile,
      onAbort: abort,
      onRemove: handleRemove,
      onPreview: handlePreview,
    }),
  );

  const mergedAccept = computed(() => {
    if (props.accept) return props.accept;
    return props.listType === 'picture' || props.listType === 'picture-card'
      ? 'image/*'
      : undefined;
  });
  const hideUploadButton = computed(
    () =>
      !props.showUploadButton ||
      (isMax.value &&
        !(isObject(props.showUploadButton) && props.showUploadButton.showOnExceedLimit)),
  );
  const uploadButtonProps = computed(() => ({
    disabled: mergedDisabled.value,
    draggable: props.draggable,
    listType: props.listType,
    uploadFiles,
    multiple: props.multiple,
    directory: props.directory,
    tip: props.tip,
    hide: hideUploadButton.value,
    accept: mergedAccept.value,
    onButtonClick: props.onButtonClick,
  }));
  const getUploadButtonProps = (rootAttrs?: Record<string, unknown>) => ({
    ...uploadButtonProps.value,
    ...rootAttrs,
  });
  const wrapperAttrs = computed(() => ({
    ...attrs,
    class: [attrs.class, `${prefixCls}-wrapper`, `${prefixCls}-wrapper-type-${props.listType}`],
  }));

  defineExpose({ submit, abort, updateFile, upload: uploadFiles });
</script>
