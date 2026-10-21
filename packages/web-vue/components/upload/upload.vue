<template>
  <UploadButtonRenderer v-if="!props.showFileList && props.showUploadButton" :root-attrs="attrs" />
  <div v-else-if="props.showFileList" v-bind="wrapperAttrs">
    <ImagePreviewGroup
      v-if="props.imagePreview && imageList.length > 0"
      :src-list="imageList"
      :visible="imagePreviewVisible"
      :current="imagePreviewCurrent"
      @change="handleImagePreviewChange"
      @visible-change="handleImagePreviewVisibleChange"
    />
    <UploadButtonRenderer v-if="props.listType !== 'picture-card' && props.showUploadButton" />
    <UploadList :file-list="innerFileList" :list-type="props.listType">
      <template #upload-button><UploadButtonRenderer /></template>
      <template v-if="$slots['upload-item']" #upload-item="slotProps">
        <slot name="upload-item" v-bind="slotProps" />
      </template>
    </UploadList>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    defineComponent,
    h,
    onBeforeUnmount,
    onBeforeUpdate,
    provide,
    reactive,
    ref,
    shallowRef,
    toRefs,
    useAttrs,
    useSlots,
    watch,
    type PropType,
  } from 'vue';

  import {
    getUploadAccept,
    isUploadLimitReached,
    isUploadButtonHidden,
    getUploadPreviewUrls,
    previewUploadFile,
  } from '@sdata/web-core/upload/files';
  import { createUploadFoundation } from '@sdata/web-core/upload/foundation';

  import type { CustomIcon, FileItem, ListType, RequestOption, UploadRequest } from './interfaces';

  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { ImagePreviewGroup } from '../image';
  import { uploadInjectionKey } from './context';
  import UploadButton from './upload-button.vue';
  import UploadList from './upload-list.vue';

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
    /**
     * @zh 跨标签页上传互斥标识；相同标识同时只允许一个文件上传
     * @en Cross-tab upload lock key; only one file per key may upload at a time
     */
    lockKey: [String, Function] as PropType<string | ((fileItem: FileItem) => string | undefined)>,
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
    onBeforeUpload: Function as PropType<(file: File) => boolean | File | Promise<boolean | File>>,
    onBeforeRemove: Function as PropType<(fileItem: FileItem) => Promise<boolean>>,
    onButtonClick: Function as PropType<(event: Event) => Promise<FileList> | void>,
  });

  const emit = defineEmits<{
    'update:fileList': [_fileList: FileItem[]];
    /**
     * @zh 超出数量限制时触发
     * @en Trigger when the file limit is exceeded
     */
    'exceedLimit': [_fileList: FileItem[], _files: File[]];
    /**
     * @zh 文件列表或状态变化时触发
     * @en Trigger when the file list or a file status changes
     */
    'change': [_fileList: FileItem[], _fileItem: FileItem];
    /**
     * @zh 上传进度变化时触发
     * @en Trigger when upload progress changes
     */
    'progress': [_fileItem: FileItem, _event?: ProgressEvent];
    /**
     * @zh 点击预览时触发
     * @en Trigger when a file is previewed
     */
    'preview': [_fileItem: FileItem];
    /**
     * @zh 上传成功时触发
     * @en Trigger when an upload succeeds
     */
    'success': [_fileItem: FileItem];
    /**
     * @zh 上传失败时触发
     * @en Trigger when an upload fails
     */
    'error': [_fileItem: FileItem];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const contextSlots = shallowRef({ ...slots });
  onBeforeUpdate(() => {
    contextSlots.value = { ...slots };
  });
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
  const foundation = createUploadFoundation({
    options: props,
    getFileList: () => innerFileList.value,
    setFileList: (files) => {
      innerFileList.value = files;
    },
    createFileItem: (file) => reactive(file),
    getDisabled: () => mergedDisabled.value,
    onUpdateList: (files) => emit('update:fileList', files),
    onChange: (files, file) => emit('change', files, file),
    onExceed: (files, selected) => emit('exceedLimit', files, selected),
    onProgress: (file, event) => emit('progress', file, event),
    onSuccess: (file) => emit('success', file),
    onError: (file) => emit('error', file),
    onFormChange: () => eventHandlers.value?.onChange?.(),
  });
  const { uploadFile, abort, submit, updateFile, uploadFiles, handleRemove } = foundation;
  watch(
    () => innerFileList.value.map((file) => file.url),
    (urls) => foundation.releasePreviewUrls(new Set(urls)),
  );
  onBeforeUnmount(foundation.dispose);
  const isMax = computed(() => isUploadLimitReached(props.limit, innerFileList.value.length));
  foundation.checkFileList(props.defaultFileList);
  watch(
    () => props.fileList,
    (files) => {
      if (files) foundation.checkFileList(files);
    },
    { immediate: true, deep: true },
  );

  const imagePreviewVisible = ref(false);
  const imagePreviewCurrent = ref(0);
  const imageList = computed(() => getUploadPreviewUrls(innerFileList.value));
  const handleImagePreviewChange = (current: number) => {
    imagePreviewCurrent.value = current;
  };
  const handleImagePreviewVisibleChange = (visible: boolean) => {
    imagePreviewVisible.value = visible;
  };
  const previewAdapter = {
    get enabled() {
      return props.imagePreview;
    },
    get urls() {
      return imageList.value;
    },
    setCurrent: handleImagePreviewChange,
    setVisible: handleImagePreviewVisibleChange,
    onPreview: (fileItem: FileItem) => emit('preview', fileItem),
  };
  const handlePreview = (fileItem: FileItem) => previewUploadFile(fileItem, previewAdapter);

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
      slots: contextSlots,
      onUpload: (fileItem: FileItem) => {
        if (!mergedDisabled.value) uploadFile(fileItem);
      },
      onAbort: (fileItem: FileItem) => {
        if (!mergedDisabled.value) abort(fileItem);
      },
      onRemove: handleRemove,
      onPreview: handlePreview,
    }),
  );

  const mergedAccept = computed(() => getUploadAccept(props.accept, props.listType));
  const hideUploadButton = computed(() =>
    isUploadButtonHidden(props.showUploadButton, isMax.value),
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
  const UploadButtonRenderer = defineComponent({
    name: 'UploadButtonRenderer',
    inheritAttrs: false,
    props: {
      rootAttrs: Object as PropType<Record<string, unknown>>,
    },
    setup(renderProps) {
      const renderButton = (rootAttrs?: Record<string, unknown>) =>
        h(
          UploadButton,
          { ...uploadButtonProps.value, ...rootAttrs },
          contextSlots.value['upload-button']
            ? { default: contextSlots.value['upload-button'] }
            : undefined,
        );

      return () => {
        if (props.tip && props.listType !== 'picture-card' && !props.draggable) {
          return h('span', renderProps.rootAttrs, [
            renderButton(),
            h('div', { class: `${prefixCls}-tip` }, props.tip),
          ]);
        }
        return renderButton(renderProps.rootAttrs);
      };
    },
  });
  const wrapperAttrs = computed(() => ({
    ...attrs,
    class: [attrs.class, `${prefixCls}-wrapper`, `${prefixCls}-wrapper-type-${props.listType}`],
  }));

  defineExpose({ submit, abort, updateFile, upload: uploadFiles });
</script>
